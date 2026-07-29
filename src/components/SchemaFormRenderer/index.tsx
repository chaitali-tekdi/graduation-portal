/**
 * SchemaFormRenderer
 *
 * A generic, schema-driven form component. It reads a `FormSection[]` schema and renders
 * the appropriate input widgets, handles field-level validation, conditional visibility,
 * dependency chaining, and password-toggle groups.
 *
 * Usage:
 *   <SchemaFormRenderer
 *     schema={CREATE_USER_FORM_SCHEMA}
 *     values={values}
 *     errors={errors}
 *     onFieldChange={handleChange}
 *     optionsMap={optionsMap}
 *     disabled={isSubmitting}
 *     isMobile={isMobile}
 *     t={t}
 *     firstNameRef={firstNameRef}
 *   />
 */

import React, { useEffect, useRef, useState } from 'react';
import { VStack, HStack, Text, Box, Input, InputField, Pressable, Textarea, TextareaInput } from '@ui';
import { LucideIcon } from '@ui/index';
import Select from '@components/ui/Inputs/Select';
import DatePicker from '@components/ui/Inputs/DatePicker';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import { styles } from '../../screens/UserManagement/Styles';
import { FORM_FIELD_TYPES } from '@constants/CREATE_USER_FORM_SCHEMA';
import type { FormSection, FormField, ValidationRule } from '@constants/CREATE_USER_FORM_SCHEMA';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';
import { theme } from '@config/theme';

// ─── Local FastInputField ─────────────────────────────────────────────────────
// Inlined here to avoid a circular import from the parent screen module.
// Prevents cursor-jumping during fast typing on heavy screens by buffering
// local state while the parent's state update is in flight.
export const FastInputField = React.forwardRef(({ value, defaultValue, onChangeText, ...props }: any, ref: any) => {
  const initialValue = value !== undefined ? value : (defaultValue || '');
  const [localValue, setLocalValue] = useState(initialValue);
  const isTyping = useRef(false);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!isTyping.current && value !== undefined && localValue !== value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (text: string) => {
    setLocalValue(text);
    isTyping.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { isTyping.current = false; }, 500);
    if (onChangeText) onChangeText(text);
  };

  return <InputField ref={ref} {...props} value={localValue} onChangeText={handleChange} />;
});
FastInputField.displayName = 'SFR_FastInputField';


// ─── Local FastTextareaInput ──────────────────────────────────────────────────
const FastTextareaInput = React.forwardRef(({ value, defaultValue, onChangeText, ...props }: any, ref: any) => {
  const initialValue = value !== undefined ? value : (defaultValue || '');
  const [localValue, setLocalValue] = useState(initialValue);
  const isTyping = useRef(false);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!isTyping.current && value !== undefined && localValue !== value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (text: string) => {
    setLocalValue(text);
    isTyping.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { isTyping.current = false; }, 500);
    if (onChangeText) onChangeText(text);
  };

  return <TextareaInput ref={ref} {...props} value={localValue} onChangeText={handleChange} />;
});
FastTextareaInput.displayName = 'SFR_FastTextareaInput';


// ─── Types ────────────────────────────────────────────────────────────────────

export type OptionsMap = Record<string, { value: string; label: string }[]>;

export interface SchemaFormRendererProps {
  schema: FormSection[];
  /** Current field values keyed by field name */
  values: Record<string, string>;
  /** Current field errors keyed by field name */
  errors: Record<string, string>;
  /** Called when any field value changes */
  onFieldChange: (name: string, value: string) => void;
  /** Resolved options for every optionsSource key referenced in the schema */
  optionsMap: OptionsMap;
  /** Global disabled state (e.g. while form is submitting) */
  disabled?: boolean;
  /** When true, renders all fields as plain read-only text instead of inputs */
  mode?: string;
  /** Layout flag — stacks fields vertically on mobile */
  isMobile?: boolean;
  /** Translation function */
  t: (key: string, fallback?: string) => string;
  /** Optional ref forwarded to the first autoFocus field */
  firstNameRef?: React.RefObject<any>;
  /** Overrides styles for standard text/textarea/date inputs */
  inputStyle?: any;
  /** Overrides styles for select dropdown inputs */
  selectStyle?: any;
  /** Overrides default label typography/style props */
  labelStyle?: any;
  /** Set to true to hide the default section header text/icon */
  hideSectionHeaders?: boolean;
}

// ─── Validation Engine ────────────────────────────────────────────────────────

/**
 * Helper to check visibility of a field or row based on schema rules.
 */
function isVisible(
  visibleWhen: { flag?: string; field?: string; value?: string; not?: boolean } | undefined,
  values: Record<string, string>,
  optionsMap: OptionsMap
): boolean {
  if (!visibleWhen) return true;

  // Named flag — for complex logic that can't be expressed as a simple comparison
  if (visibleWhen.flag) {
    if (visibleWhen.flag === 'isSupervisorOrLC') {
      const roleId = values.roleId || '';
      const selectedRole = optionsMap.roles?.find((r: any) => r.value === roleId);
      const roleLabel = (selectedRole?.label || '').toLowerCase();
      return ['supervisor', 'org_admin', 'lc', 'linkage champion', 'tenant_admin'].some(
        (k: string) => roleLabel.includes(k)
      );
    }
    return true;
  }

  // Direct field/value comparison (mirrors the existing disabledWhen pattern)
  if (visibleWhen.field) {
    const fieldVal = (values[visibleWhen.field] ?? '').trim();
    const match = fieldVal === (visibleWhen.value ?? '');
    // `not: true` also requires the field to be non-empty — an unset field
    // trivially "does not equal X" and should not trigger visibility.
    if (visibleWhen.not) return fieldVal !== '' && !match;
    return match;
  }

  return true;
}

const resolveKey = (key: string): string => {
  if (key.includes('.')) {
    return key;
  }
  return `admin.users.createUser.${key}`;
};

/**
 * Runs all validation rules for a single field recursively (supporting group fields).
 * Populates errors object.
 */
function validateField(
  field: FormField,
  values: Record<string, string>,
  optionsMap: OptionsMap,
  errors: Record<string, string>,
  t?: (key: string, fallback?: string) => string
): void {
  if (field.type === FORM_FIELD_TYPES.GROUP && Array.isArray(field.fields)) {
    for (const subField of field.fields) {
      validateField(subField, values, optionsMap, errors, t);
    }
    return;
  }

  if (!field.name) return;

  // Skip invisible fields entirely
  if (!isVisible(field.visibleWhen, values, optionsMap)) {
    return;
  }

  // Skip read-only fields
  if (field.isReadOnly) {
    return;
  }

  const raw = values[field.name] ?? '';
  const val = raw.trim();

  if (!field.validation?.length) return;

  for (const rule of field.validation) {
    const err = applyRule(rule, val, values, t);
    if (err) {
      errors[field.name] = err;
      return; // Return on first rule error for this field
    }
  }
}

function applyRule(
  rule: ValidationRule,
  val: string,
  allValues: Record<string, string>,
  t?: (key: string, fallback?: string) => string
): string | undefined {
  const msg = t && rule.message.key
    ? t(resolveKey(rule.message.key), rule.message.fallback)
    : rule.message.fallback;

  switch (rule.rule) {
    case 'required':
      if (!val) return msg;
      break;

    case 'email': {
      if (!val) break; // let 'required' handle empty
      const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) return msg;
      break;
    }

    case 'minLength': {
      const min = Number(rule.value);
      if (val && val.length < min) return msg;
      break;
    }

    case 'maxLength': {
      const max = Number(rule.value);
      if (val && val.length > max) return msg;
      break;
    }

    case 'pattern': {
      if (!val) break;
      const re = new RegExp(String(rule.value));
      if (!re.test(val)) return msg;
      break;
    }

    case 'matchField': {
      const other = (allValues[String(rule.value)] ?? '').trim();
      if (val && val !== other) return msg;
      if (!val && other) return msg; // confirm is empty but password has value
      break;
    }

    case 'dateNotInFuture': {
      if (!val) break;
      // val is in YYYY-MM-DD (display format); raw storage may be YYYY_MM_DD
      const normalized = val.replace(/_/g, '-');
      const date = new Date(normalized);
      if (!isNaN(date.getTime()) && date > new Date()) return msg;
      break;
    }
  }

  return undefined;
}

/**
 * Run validation for all fields in the schema.
 * Returns a map of fieldName → errorMessage (only for invalid fields).
 * Call this from the parent's submit handler.
 */
export function validateSchema(
  schema: FormSection[],
  values: Record<string, string>,
  optionsMap: OptionsMap,
  t?: (key: string, fallback?: string) => string
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const section of schema) {
    for (const row of section.rows) {
      // Skip hidden rows
      if (!isVisible(row.visibleWhen, values, optionsMap)) continue;

      for (const field of row.fields) {
        validateField(field, values, optionsMap, errors, t);
      }
    }
  }

  return errors;
}

// ─── Field Renderers ──────────────────────────────────────────────────────────

interface FieldRendererProps {
  field: FormField;
  value: string;
  error?: string;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  disabled: boolean;
  optionsMap: OptionsMap;
  values: Record<string, string>;
  t: (key: string, fallback?: string) => string;
  /** Shared visibility state for password toggle groups */
  visibilityGroups: Record<string, boolean>;
  toggleVisibilityGroup: (group: string) => void;
  /** Forwarded ref for the first autoFocus field */
  autoFocusRef?: React.RefObject<any>;
  isNested?: boolean;
  isEditMode?: boolean;
  /** Propagated from SchemaFormRendererProps */
  inputStyle?: any;
  selectStyle?: any;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  error,
  errors,
  onChange,
  disabled,
  optionsMap,
  values,
  t,
  visibilityGroups,
  toggleVisibilityGroup,
  autoFocusRef,
  isNested = false,
  isEditMode = false,
  inputStyle,
  selectStyle,
}) => {
  const activeInputStyle = inputStyle || styles.createUserFormInput;
  const isFieldDisabled = disabled || !!field.disabled || (isEditMode && field.name === 'roleId');

  useEffect(() => {
    if (field.type === FORM_FIELD_TYPES.SELECT) {
      const rawOptions = field.optionsSource ? (optionsMap[field.optionsSource] ?? []) : [];
      if (rawOptions.length > 0) {
        const optionValues = rawOptions.map((o: any) => o.value);
        let nextValue = value;

        if (nextValue && !optionValues.includes(nextValue)) {
          nextValue = '';
        }

        if (!nextValue && field.defaultValue) {
          if (optionValues.includes(field.defaultValue)) {
            nextValue = field.defaultValue;
          } else {
            nextValue = optionValues[0] || '';
          }
        }

        if (nextValue !== value && field.name) {
          onChange(field.name, nextValue);
        }
      }
    }
  }, [field.type, field.name, field.defaultValue, field.optionsSource, optionsMap[field.optionsSource || ''], value, onChange]);

  // ── Group ───────────────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.GROUP) {
    const subFields = field.fields || [];
    if (subFields.length === 0) return null;

    const combinedError = subFields.map(sf => errors[sf.name!]).find(Boolean);

    return (
      <HStack
        {...(activeInputStyle as any)}
        isInvalid={!!combinedError}
        isDisabled={disabled || field.disabled}
        alignItems="center"
        paddingLeft={0}
        height={40}
        width="100%"
      >
        {subFields.map((subField, idx) => (
          <React.Fragment key={subField.name || subField.label.key}>
            {idx > 0 && (
              <Box width={1} bg="$borderColor" height="60%" alignSelf="center" />
            )}
            <FieldRenderer
              field={subField}
              value={subField.name ? (values[subField.name] ?? '') : ''}
              error={subField.name ? errors[subField.name] : undefined}
              errors={errors}
              onChange={onChange}
              disabled={disabled || !!subField.disabled}
              optionsMap={optionsMap}
              values={values}
              t={t}
              visibilityGroups={visibilityGroups}
              toggleVisibilityGroup={toggleVisibilityGroup}
              autoFocusRef={autoFocusRef}
              isNested={true}
              inputStyle={inputStyle}
              selectStyle={selectStyle}
            />
          </React.Fragment>
        ))}
      </HStack>
    );
  }
  // ── Note ────────────────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.NOTE) {
    return (
      <HStack
        space="sm"
        alignItems="flex-start"
        bg="$backgroundLight100"
        p="$3"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
        width="100%"
      >
        <Box mt={2}>
          <LucideIcon name="Info" size={16} color="$primary500" />
        </Box>
        <Text size="sm" color="$textMutedForeground" flex={1}>
          {t(resolveKey(field.label.key), field.label.fallback)}
        </Text>
      </HStack>
    );
  }

  const primaryColor = SUPPORT_PROVIDER_CONFIG.branding.themePrimaryColor || theme.tokens.colors.primary500;

  // ── Pills Selector ──────────────────────────────────────────────────────────
  if (field.type === ('pills' as any) || field.type === ('pillselect' as any)) {
    const rawOptions = field.optionsSource ? (optionsMap[field.optionsSource] ?? []) : [];
    const isPillar = field.name === 'pillar';

    return (
      <HStack space="xs" flexWrap="wrap" gap="$2" width="100%">
        {rawOptions.map((option: any) => {
          const isSelected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(field.name || '', option.value)}
              flex={isPillar ? undefined : 1}
              px={isPillar ? '$10' : undefined}
              py="$2.5"
              minWidth={isPillar ? 150 : undefined}
              borderRadius="$md"
              borderWidth={isPillar ? 1.5 : 1}
              borderColor={isSelected ? primaryColor : '$borderLight300'}
              bg={theme.tokens.colors.backgroundPrimary.light}
              alignItems="center"
              justifyContent="center"
              $hover={{ borderColor: primaryColor }}
              $web-style={{
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <HStack alignItems="center" space="xs">
                {option.icon && (
                  <LucideIcon
                    name={option.icon}
                    size={14}
                    color={isSelected ? primaryColor : theme.tokens.colors.textMuted}
                  />
                )}
                <Text
                  color={isSelected ? primaryColor : '$textDark700'}
                  {...TYPOGRAPHY.caption}
                  fontWeight={isSelected ? '$bold' : '$medium'}
                >
                  {option.label}
                </Text>
              </HStack>
            </Pressable>
          );
        })}
      </HStack>
    );
  }

  // ── Toggle Selector (Recurring Session) ────────────────────────────────────
  if (field.type === ('toggle' as any)) {
    const isSelected = value === 'Yes';
    return (
      <Pressable
        onPress={() => onChange(field.name || '', isSelected ? 'No' : 'Yes')}
        py="$2.5"
        px="$3"
        borderRadius="$md"
        borderWidth={1.5}
        borderColor={isSelected ? primaryColor : '$borderLight300'}
        bg={theme.tokens.colors.backgroundPrimary.light}
        $web-style={{ cursor: 'pointer' }}
      >
        <HStack alignItems="center" space="xs">
          <Box
            width={16}
            height={16}
            borderRadius={8}
            borderWidth={isSelected ? 5 : 1.5}
            borderColor={isSelected ? primaryColor : theme.tokens.colors.textMuted}
            bg={theme.tokens.colors.backgroundPrimary.light}
          />
          <Text
            color={isSelected ? primaryColor : '$textDark700'}
            {...TYPOGRAPHY.caption}
            fontWeight="$medium"
          >
            {isSelected
              ? t('supportProvider.trainingSession.step1.recurringToggle', 'Yes — recurring session')
              : t('supportProvider.trainingSession.step1.recurringToggleNo', 'No — one-off session')}
          </Text>
        </HStack>
      </Pressable>
    );
  }

  const placeholder = field.placeholder?.fallback ?? '';

  // ── Select ──────────────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.SELECT) {
    const rawOptions = field.optionsSource ? (optionsMap[field.optionsSource] ?? []) : [];
    const options = rawOptions.map(o => ({ value: o.value, label: o.label }));

    // Compute disabled-when condition
    let isDisabled = isFieldDisabled;
    if (!isDisabled && field.disabledWhen?.empty) {
      const depVal = (values[field.disabledWhen.field] ?? '').trim();
      if (!depVal) isDisabled = true;
    }

    // Dynamic placeholder when dependency is satisfied
    const activePlaceholder =
      field.placeholderWhenReady && (values[field.dependsOn ?? ''] ?? '').trim()
        ? field.placeholderWhenReady.fallback
        : placeholder;

    return (
      <Box width={isNested ? 95 : '100%'} zIndex={field.zIndex ?? (isNested ? 1000 : 1)}>
        <Select
          {...(isNested ? {} : (selectStyle || styles.createUserFormSelect))}
          options={options}
          value={value}
          onChange={(val: string, _lbl: string) => onChange(field.name || '', val)}
          placeholder={activePlaceholder}
          disabled={isDisabled}
          isReadOnly={field.isReadOnly}
          {...(isNested ? { borderColor: 'transparent', bg: 'transparent' } : {})}
        />
      </Box>
    );
  }

  // ── Date ────────────────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.DATE) {
    // Internal display value: stored as YYYY_MM_DD, displayed as YYYY-MM-DD
    const displayValue = value ? value.replace(/_/g, '-') : '';

    return (
      <Box zIndex={field.zIndex ?? 999}>
        <DatePicker
          {...(activeInputStyle as any)}
          placeholder={placeholder || 'YYYY-MM-DD'}
          value={displayValue}
          onChange={(date: string) => onChange(field.name || '', date.replace(/-/g, '_'))}
          maximumDate={
            field.validation?.some(r => r.rule === 'dateNotInFuture') ? new Date() : undefined
          }
          iconSize={20}
          isDisabled={disabled || field.disabled}
          isReadOnly={field.isReadOnly}
        />
      </Box>
    );
  }

  // ── Password ─────────────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.PASSWORD) {
    const group = field.visibilityToggleGroup ?? field.name ?? '';
    const isVisible = visibilityGroups[group] ?? false;

    return (
      <Box position="relative">
        <Input
          {...(activeInputStyle as any)}
          isInvalid={!!error}
          isDisabled={disabled || field.disabled}
          isReadOnly={field.isReadOnly}
        >
          <FastInputField
            placeholder={placeholder}
            value={value}
            onChangeText={(text: string) => onChange(field.name || '', text)}
            secureTextEntry={!isVisible}
            pr="$12"
          />
        </Input>
        {field.toggleVisibility && (
          <Pressable
            onPress={() => toggleVisibilityGroup(group)}
            disabled={disabled || field.disabled}
            style={styles.resetPasswordEyeIconButton}
          >
            <LucideIcon
              name={isVisible ? 'EyeOff' : 'Eye'}
              size={20}
              color="#6B7280"
            />
          </Pressable>
        )}
      </Box>
    );
  }

  // ── Textarea ────────────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.TEXTAREA) {
    const keyboardType = (field.inputProps?.keyboardType as any) ?? 'default';
    const autoCapitalize = (field.inputProps?.autoCapitalize as any) ?? 'sentences';
    const maxLength = field.inputProps?.maxLength;

    return (
      <Textarea
        {...(activeInputStyle as any)}
        isInvalid={!!error}
        isDisabled={disabled || field.disabled}
        isReadOnly={field.isReadOnly}
      >
        <FastTextareaInput
          ref={field.autoFocus ? autoFocusRef : undefined}
          placeholder={placeholder}
          value={value}
          onChangeText={(text: string) => onChange(field.name || '', text)}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          minHeight={100}
        />
      </Textarea>
    );
  }

  // ── File Upload ─────────────────────────────────────────────────────────────
  if (field.type === ('file' as any)) {
    const fileInputRefLocal = React.useRef<HTMLInputElement | null>(null);
    const handleFileChangeLocal = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        onChange(field.name || '', selectedFile.name);
      }
    };
    const handleUploadClickLocal = () => {
      fileInputRefLocal.current?.click();
    };

    const subLabelText = field.subLabel
      ? (t ? t(resolveKey(field.subLabel.key), field.subLabel.fallback) : field.subLabel.fallback)
      : '';
    const placeholderText = field.placeholder
      ? (t ? t(resolveKey(field.placeholder.key || ''), field.placeholder.fallback) : field.placeholder.fallback)
      : 'Click to upload';

    return (
      <VStack space="xs" width="100%">
        <input
          type="file"
          ref={fileInputRefLocal}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx"
          onChange={handleFileChangeLocal}
        />
        {subLabelText ? (
          <Text color={theme.tokens.colors.textMuted} {...TYPOGRAPHY.caption}>
            {subLabelText}
          </Text>
        ) : null}

        <Pressable
          borderWidth={1}
          borderStyle="dashed"
          borderColor="$borderLight300"
          borderRadius="$lg"
          p="$6"
          alignItems="center"
          justifyContent="center"
          bg="$backgroundLight50"
          $hover={{ bg: '$backgroundLight100', borderColor: primaryColor }}
          $web-style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          onPress={handleUploadClickLocal}
          disabled={disabled || field.disabled}
        >
          <VStack alignItems="center" space="xs">
            <LucideIcon name="Upload" size={28} color={theme.tokens.colors.textMuted} />
            <Text color="$textDark700" {...TYPOGRAPHY.caption} fontWeight="$medium" mt="$1">
              {value || placeholderText}
            </Text>
            <Text color={theme.tokens.colors.textMuted} {...TYPOGRAPHY.caption}>
              {t ? t('supportProvider.trainingSession.step1.maxSize', 'Max 10 MB') : 'Max 10 MB'}
            </Text>
          </VStack>
        </Pressable>
      </VStack>
    );
  }

  // ── Text / Email / Tel ───────────────────────────────────────────────────────
  const keyboardType = (field.inputProps?.keyboardType as any) ?? 'default';
  const autoCapitalize = (field.inputProps?.autoCapitalize as any) ?? 'sentences';
  const maxLength = field.inputProps?.maxLength;

  return (
    <Input
      {...(isNested ? {} : (activeInputStyle as any))}
      isInvalid={!!error}
      isDisabled={isFieldDisabled}
      isReadOnly={field.isReadOnly}
      alignItems={field.icon ? 'center' : undefined}
      {...(isNested ? {
        borderColor: 'transparent',
        bg: 'transparent',
        flex: 1,
        variant: 'outline'
      } : {})}
    >
      {field.icon && (
        <Box pr="$2">
          <LucideIcon name={field.icon as any} size={16} color="$textMutedForeground" />
        </Box>
      )}
      <FastInputField
        ref={field.autoFocus ? autoFocusRef : undefined}
        placeholder={placeholder}
        value={value}
        onChangeText={(text: string) => onChange(field.name || '', text)}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
      />
    </Input>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SchemaFormRenderer: React.FC<SchemaFormRendererProps> = ({
  schema,
  values,
  errors,
  onFieldChange,
  optionsMap,
  disabled = false,
  isMobile = false,
  t,
  mode = "edit",
  firstNameRef,
  inputStyle,
  selectStyle,
  labelStyle,
  hideSectionHeaders = false,
}) => {
  // Track password visibility per group
  const [visibilityGroups, setVisibilityGroups] = useState<Record<string, boolean>>({});

  const toggleVisibilityGroup = (group: string) => {
    setVisibilityGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <VStack space="md" width="100%">
      {schema.map(section => {
        // ── Info Banner section type ─────────────────────────────────────────
        if (section.type === 'infobanner') {
          return (
            <Box
              key={section.id}
              bg={theme.tokens.colors.blue50}
              borderWidth={1}
              borderColor={theme.tokens.colors.blue200}
              borderRadius="$lg"
              p="$4"
            >
              <HStack space="xs" alignItems="center" mb="$2">
                <LucideIcon name={section.icon as any} size={16} color={theme.tokens.colors.blue600} />
                <Text color={theme.tokens.colors.blue800} {...TYPOGRAPHY.caption} fontWeight="$bold">
                  {t(section.title.key, section.title.fallback)}
                </Text>
              </HStack>
              {section.bullets && section.bullets.length > 0 && (
                <VStack space="xs" pl="$5">
                  {section.bullets.map((bullet, i) => (
                    <Text key={i} color={theme.tokens.colors.blue800} {...TYPOGRAPHY.caption}>
                      • {t(bullet.key, bullet.fallback)}
                    </Text>
                  ))}
                </VStack>
              )}
            </Box>
          );
        }

        // ── Normal section ───────────────────────────────────────────────────
        return (
        <VStack key={section.id} space="sm">
          {/* Section header — hidden if hideSectionHeaders is true */}
          {!hideSectionHeaders && (
            <HStack space="xs" alignItems="center">
              <LucideIcon name={section.icon as any} size={16} color="$textMutedForeground" />
              <Text {...TYPOGRAPHY.bodySmall} color="$textMutedForeground" fontWeight="$normal">
                {t(resolveKey(section.title.key), section.title.fallback)}
              </Text>
            </HStack>
          )}

          {/* Section rows */}
          {section.rows.map((row, rowIdx) => {
            // Row-level visibility
            if (!isVisible(row.visibleWhen, values, optionsMap)) {
              return null;
            }

            // Determine which fields in this row are visible
            const visibleFields: FormField[] = [];
            row.fields.forEach(f => {
              if (!isVisible(f.visibleWhen, values, optionsMap)) return;
              if (mode === "preview" && f.type === FORM_FIELD_TYPES.GROUP && f.fields) {
                visibleFields.push(...f.fields);
              } else {
                visibleFields.push(f);
              }
            });

            if (visibleFields.length === 0) return null;

            const isMultiField = visibleFields.length > 1;

            return (
              <HStack
                key={rowIdx}
                space="md"
                flexDirection={isMobile || !isMultiField ? 'column' : 'row'}
              >
                {visibleFields.map(field => {
                  const fieldValue = field.name ? (values[field.name] ?? '') : '';
                  const fieldError = field.name ? errors[field.name] : undefined;

                  // ── viewMode: render as plain text ──
                  if (mode === "preview") {
                    if (field.type === FORM_FIELD_TYPES.NOTE) return null;

                    let displayValue = fieldValue || '-';
                    if (field.optionsSource) {
                      const opts = optionsMap[field.optionsSource] ?? [];
                      displayValue = opts.find(o => o.value === fieldValue)?.label || fieldValue || '-';
                    }
                    displayValue = typeof displayValue === 'string' ? displayValue.replace(/_/g, '-') : String(displayValue ?? '-');

                    return (
                      <VStack key={field.name || field.label.key} space="xs" flex={isMultiField ? 1 : undefined} width={!isMultiField ? '100%' : undefined}>
                        {labelStyle ? (
                          <Text {...labelStyle}>
                            {t(resolveKey(field.label.key), field.label.fallback)}
                          </Text>
                        ) : (
                          <Text {...TYPOGRAPHY.caption} color="$textMutedForeground">
                            {t(resolveKey(field.label.key), field.label.fallback)}
                          </Text>
                        )}
                        <Text {...TYPOGRAPHY.bodySmall} color="$textForeground">
                          {displayValue}
                        </Text>
                      </VStack>
                    );
                  }

                  // ── Normal form mode ──
                  return (
                    <VStack
                      key={field.name || field.label.key}
                      id={field.name || undefined}
                      nativeID={field.name || undefined}
                      space="xs"
                      flex={isMultiField ? 1 : undefined}
                      width={!isMultiField ? '100%' : undefined}
                    >
                      {/* Field label */}
                      {field.type !== FORM_FIELD_TYPES.NOTE && (
                        labelStyle ? (
                          // Custom label style
                          <Text {...labelStyle}>
                            {t(resolveKey(field.label.key), field.label.fallback)}
                            {field.required ? <Text color="$error600"> *</Text> : ''}
                            {field.showOptionalTag ? <Text color={theme.tokens.colors.textMuted} {...TYPOGRAPHY.caption}> (optional)</Text> : ''}
                          </Text>
                        ) : (
                          <Text {...TYPOGRAPHY.caption} color="$textForeground" fontWeight="$bold">
                            {t(resolveKey(field.label.key), field.label.fallback)}
                            {field.required ? ' *' : ''}
                            {field.showOptionalTag ? <Text color={theme.tokens.colors.textMuted} {...TYPOGRAPHY.caption}> (optional)</Text> : ''}
                          </Text>
                        )
                      )}

                      {/* Field input */}
                      <FieldRenderer
                        field={field}
                        value={fieldValue}
                        error={fieldError}
                        errors={errors}
                        onChange={onFieldChange}
                        disabled={disabled}
                        optionsMap={optionsMap}
                        values={values}
                        t={t}
                        visibilityGroups={visibilityGroups}
                        toggleVisibilityGroup={toggleVisibilityGroup}
                        autoFocusRef={firstNameRef}
                        inputStyle={inputStyle}
                        selectStyle={selectStyle}
                      />

                      {/* Field error */}
                      {fieldError ? (
                        <Text color="$error600" fontSize="$xs">
                          {fieldError}
                        </Text>
                      ) : null}
                    </VStack>
                  );
                })}
              </HStack>
            );
          })}
        </VStack>
        );
      })}
    </VStack>
  );
};

export default SchemaFormRenderer;
