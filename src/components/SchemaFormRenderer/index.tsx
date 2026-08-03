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

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
  Input,
  InputField,
  Pressable,
  Textarea,
  TextareaInput,
  Tabs,
  TabsTabList,
  TabsTab,
  TabsTabPanels,
  TabsTabPanel,
  TabsTabTitle,
  Button,
  ButtonText,
  Modal,
  Progress,
  ProgressFilledTrack,
} from '@ui';
import { LucideIcon } from '@ui/index';
import Select from '@components/ui/Inputs/Select';
import DatePicker from '@components/ui/Inputs/DatePicker';
import { openFilePicker } from '../../project-player/components/Task/FileEvidence/file-picker';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import { getSignedUrl, uploadFileToSignedUrl } from '../../services/bulkUploadService';
import { FORM_FIELD_TYPES } from '@constants/CREATE_USER_FORM_SCHEMA';
import type {
  FormSection,
  FormField,
  ValidationRule,
  VisibleIfCondition,
  Hint,
} from '@constants/CREATE_USER_FORM_SCHEMA';
//checkbox card pill
const HoverablePill: React.FC<{
  badgeText: string;
  fieldName: string;
  orgProfileStyles?: any;
}> = ({ badgeText, fieldName, orgProfileStyles }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Defaults
  let bg = '$blue50';
  let borderColor = '$blue600';
  let borderWidth = 1;
  let textColor = '$blue800';

  if (orgProfileStyles) {
    if (fieldName === 'providerType') {
      bg = 'transparent';
      borderColor = '$gray300';
      borderWidth = 1;
      textColor = isHovered ? '$primary500' : '$textSecondary';
    } else if (fieldName === 'province') {
      bg = 'transparent';
      borderColor = 'transparent';
      borderWidth = 0;
      textColor = isHovered ? '$primary500' : '$blue800';
    } else if (fieldName === 'siteCoverage') {
      bg = 'transparent';
      borderColor = '$gray300';
      borderWidth = 1;
      textColor = isHovered ? '$primary500' : '$textPrimary';
    }
  }

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      bg={bg}
      borderColor={borderColor}
      borderWidth={borderWidth}
      borderRadius="$full"
      px="$3"
      py="$1"
      mb="$1"
      $web={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      } as any}
    >
      <Text fontSize="$xs" color={textColor} fontWeight="$medium">
        {badgeText}
      </Text>
    </Pressable>
  );
};

const getCheckboxItemStyle = (fieldName: string, isEdit: boolean, orgStyles: any) => {
  if (!orgStyles) return undefined;
  
  // Use responsive minWidth/flexBasis logic so cards wrap smoothly on mobile screens
  let minWidth: string | number = 200; // default min-width in pixels for mobile friendly wrap
  
  if (fieldName === 'assetTypes') {
    minWidth = '100%';
  } else if (fieldName === 'specificTrainingAreas') {
    minWidth = 240;
  }
  
  return {
    ...orgStyles.orgProfileCheckboxItem,
    flexGrow: 1,
    flexShrink: 1,
    minWidth,
    maxWidth: '100%',
  };
};

const getCheckboxTextStyles = (fieldName: string, isChecked: boolean, orgStyles: any) => {
  if (!orgStyles) return undefined;
  const baseTextProps = isChecked
    ? orgStyles.orgProfileCheckboxCheckedText
    : orgStyles.orgProfileCheckboxText;
  return baseTextProps;
};

// ─── Local FastInputField ─────────────────────────────────────────────────────
// Inlined here to avoid a circular import from the parent screen module.
// Prevents cursor-jumping during fast typing on heavy screens by buffering
// local state while the parent's state update is in flight.
export const FastInputField = React.forwardRef(
  ({ value, defaultValue, onChangeText, ...props }: any, ref: any) => {
    const initialValue = value !== undefined ? value : defaultValue || '';
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
      timeoutRef.current = setTimeout(() => {
        isTyping.current = false;
      }, 500);
    if (onChangeText) onChangeText(text);
  };

    return (
      <InputField
        ref={ref}
        {...props}
        value={localValue}
        onChangeText={handleChange}
      />
    );
  },
);
FastInputField.displayName = 'SFR_FastInputField';

// ─── Local FastTextareaInput ──────────────────────────────────────────────────
const FastTextareaInput = React.forwardRef(
  ({ value, defaultValue, onChangeText, ...props }: any, ref: any) => {
    const initialValue = value !== undefined ? value : defaultValue || '';
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
      timeoutRef.current = setTimeout(() => {
        isTyping.current = false;
      }, 500);
    if (onChangeText) onChangeText(text);
  };

    return (
      <TextareaInput
        ref={ref}
        {...props}
        value={localValue}
        onChangeText={handleChange}
      />
    );
  },
);
FastTextareaInput.displayName = 'SFR_FastTextareaInput';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OptionsMap = Record<string, { value: string; label: string }[]>;

export interface SchemaFormRendererProps {
  schema: FormSection[];
  /** Current field values keyed by field name */
  values?: Record<string, string>;
  /** Current field errors keyed by field name */
  errors?: Record<string, string>;
  /** Called when any field value changes */
  onFieldChange?: (name: string, value: string) => void;
  /** Resolved options for every optionsSource key referenced in the schema */
  optionsMap?: OptionsMap;
  /** Global disabled state (e.g. while form is submitting) */
  disabled?: boolean;
  /** When true, renders all fields as plain read-only text instead of inputs */
  mode?: string;
  /** Translation function */
  t: (key: string, fallback?: string) => string;
  /** Optional ref forwarded to the first autoFocus field */
  firstNameRef?: React.RefObject<any>;
  /**
   * Called after whole-form validation passes when the user clicks Submit.
   * Only relevant for multi-step schemas (root schema made entirely of 2+ `tab` nodes) —
   * single/no-tab schemas keep managing their own submit button externally, unchanged.
   */
  onSubmit?: (values: Record<string, string>) => void | Promise<void>;
  /** Called when the user clicks Save Draft (multi-step schemas only); no validation is run first */
  onSaveDraft?: (values: Record<string, string>) => void | Promise<void>;
  /** Disables the Previous/Continue/Save Draft/Submit footer buttons while a request is in flight */
  isSubmitting?: boolean;
  isMobile?: boolean;
  inputProps?: any;
  selectProps?: any;
  orgProfileStyles?: any;
}

// ─── Validation Engine ────────────────────────────────────────────────────────

/**
 * Helper to check visibility of a field or row based on schema rules.
 */
function isVisible(
  visibleWhen: { flag: string } | undefined,
  values: Record<string, string>,
  optionsMap: OptionsMap,
): boolean {
  if (!visibleWhen?.flag) return true;
  if (visibleWhen.flag === 'isSupervisorOrLC') {
    const roleId = values.roleId || '';
    const selectedRole = optionsMap.roles?.find((r: any) => r.value === roleId);
    const roleLabel = (selectedRole?.label || '').toLowerCase();
    return [
      'supervisor',
      'org_admin',
      'lc',
      'linkage champion',
      'tenant_admin',
    ].some((k: string) => roleLabel.includes(k));
  }
  return true;
}

/**
 * Evaluates a single `visibleIf` condition against the current form values.
 * A missing referenced value is treated as a failed condition (field stays hidden).
 */
function evaluateVisibleIfCondition(
  condition: VisibleIfCondition,
  values: Record<string, string>,
): boolean {
  const raw = values[condition.name];
  if (raw === undefined || raw === null) return false;

  switch (condition.operator) {
    case '===':
      return String(raw) === String(condition.value);
    case '!=':
      return String(raw) !== String(condition.value);
    case '>':
      return Number(raw) > Number(condition.value);
    case '<':
      return Number(raw) < Number(condition.value);
    case '>=':
      return Number(raw) >= Number(condition.value);
    case '<=':
      return Number(raw) <= Number(condition.value);
    default:
      return true;
  }
}

/**
 * A field is visible only when every condition in `visibleIf` evaluates to true (AND logic).
 * Undefined/empty `visibleIf` always passes — this keeps the field opt-in and backward compatible.
 */
function isVisibleIf(
  visibleIf: VisibleIfCondition[] | undefined,
  values: Record<string, string>,
): boolean {
  if (!visibleIf?.length) return true;
  return visibleIf.every(condition =>
    evaluateVisibleIfCondition(condition, values),
  );
}

/** Recursively walks a field (and its group sub-fields) into a flat name → field map. */
function collectFieldFromDef(
  field: FormField,
  acc: Record<string, FormField>,
): void {
  if (field.name) acc[field.name] = field;
  if (field.type === FORM_FIELD_TYPES.GROUP && Array.isArray(field.fields)) {
    field.fields.forEach(subField => collectFieldFromDef(subField, acc));
  }
}

/**
 * Recursively walks the full schema tree (tabs/sections/rows/fields) into a flat
 * name → field-definition map. Used to resolve `view` fields, which display another
 * field's label/value by name.
 */
function collectFieldsByName(
  nodes: FormSection[] | undefined,
  acc: Record<string, FormField> = {},
): Record<string, FormField> {
  nodes?.forEach(node => {
    node.rows?.forEach(row => {
      row.fields?.forEach(field => collectFieldFromDef(field, acc));
    });
    if (node.children) collectFieldsByName(node.children, acc);
  });
  return acc;
}

/**
 * Returns the first validation-rule error message for a field's current value,
 * or undefined when it currently passes (or has no rules). Does not consider
 * visibility/read-only/view-type — callers apply those skip conditions first.
 */
function getFieldError(
  field: FormField,
  values: Record<string, string>,
): string | undefined {
  if (!field.name || !field.validation?.length) return undefined;

  const val = (values[field.name] ?? '').trim();

  for (const rule of field.validation) {
    const err = applyRule(rule, val, values);
    if (err) return err;
  }

  return undefined;
}

/**
 * Runs all validation rules for a single field recursively (supporting group fields).
 * Populates errors object.
 */
function validateField(
  field: FormField,
  values: Record<string, string>,
  optionsMap: OptionsMap,
  errors: Record<string, string>,
): void {
  if (field.type === FORM_FIELD_TYPES.GROUP && Array.isArray(field.fields)) {
    for (const subField of field.fields) {
      validateField(subField, values, optionsMap, errors);
    }
    return;
  }

  if (!field.name) return;

  // Skip invisible fields entirely
  if (!isVisible(field.visibleWhen, values, optionsMap)) {
    return;
  }

  if (!isVisibleIf(field.visibleIf, values)) {
    return;
  }

  // Skip read-only fields
  if (field.isReadOnly || field.type === FORM_FIELD_TYPES.VIEW) {
    return;
  }

  const err = getFieldError(field, values);
  if (err && field.name) {
      errors[field.name] = err;
  }
}

function applyRule(
  rule: ValidationRule,
  val: string,
  allValues: Record<string, string>,
): string | undefined {
  const msg = rule.message.fallback;

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
): Record<string, string> {
  const errors: Record<string, string> = {};
  validateNodes(schema, values, optionsMap, errors);
  return errors;
}

/** Recurses through tabs/sections (via `children`) and their `rows`, validating every field found. */
function validateNodes(
  nodes: FormSection[] | undefined,
  values: Record<string, string>,
  optionsMap: OptionsMap,
  errors: Record<string, string>,
): void {
  nodes?.forEach(node => {
    node.rows?.forEach(row => {
      // Skip hidden rows
      if (!isVisible(row.visibleWhen, values, optionsMap)) return;

      row.fields.forEach(field =>
        validateField(field, values, optionsMap, errors),
      );
    });

    if (node.children) validateNodes(node.children, values, optionsMap, errors);
  });
}

// ─── Validation Issues (multi-step Continue/Submit + validation popup) ────────
//
// Mirrors `validateNodes`/`validateField` above (same skip conditions, same
// `getFieldError`), but additionally records WHERE each invalid field lives
// (which step tab, which section) so the validation popup can group and
// navigate to it, and which root-level tab it belongs to for step navigation.

export interface ValidationIssue {
  fieldName: string;
  fieldLabel: string;
  message: string;
  tabTitle?: string;
  sectionTitle?: string;
  /** Index into the root schema's tab nodes — used to jump back to the right step */
  rootTabIndex?: number;
}

interface ValidationAncestry {
  tabTitle?: string;
  sectionTitle?: string;
  rootTabIndex?: number;
}

function collectFieldIssues(
  field: FormField,
  values: Record<string, string>,
  optionsMap: OptionsMap,
  t: (key: string, fallback?: string) => string,
  ancestry: ValidationAncestry,
  errors: Record<string, string>,
  issues: ValidationIssue[],
  visited: Set<string>,
): void {
  if (field.type === FORM_FIELD_TYPES.GROUP && Array.isArray(field.fields)) {
    field.fields.forEach(subField =>
      collectFieldIssues(
        subField,
        values,
        optionsMap,
        t,
        ancestry,
        errors,
        issues,
        visited,
      ),
    );
    return;
  }

  if (!field.name) return;
  if (!isVisible(field.visibleWhen, values, optionsMap)) return;
  if (!isVisibleIf(field.visibleIf, values)) return;
  if (field.isReadOnly || field.type === FORM_FIELD_TYPES.VIEW) return;

  visited.add(field.name);

  const err = getFieldError(field, values);
  if (!err) return;

  errors[field.name] = err;
  issues.push({
    fieldName: field.name,
    fieldLabel: field.label
      ? t(`admin.users.createUser.${field.label.key}`, field.label.fallback)
      : field.name,
    message: err,
    tabTitle: ancestry.tabTitle,
    sectionTitle: ancestry.sectionTitle,
    rootTabIndex: ancestry.rootTabIndex,
  });
}

/** Recurses through the given nodes, collecting an errors map, a rich issues list, and every field name checked. */
function collectValidationIssues(
  nodes: FormSection[] | undefined,
  values: Record<string, string>,
  optionsMap: OptionsMap,
  t: (key: string, fallback?: string) => string,
  errors: Record<string, string>,
  issues: ValidationIssue[],
  visited: Set<string>,
  ancestry: ValidationAncestry = {},
): void {
  nodes?.forEach(node => {
    let nextAncestry = ancestry;
    if (node.type === 'tab') {
      nextAncestry = {
        ...ancestry,
        tabTitle: nodeTitleText(node, t) ?? node.id,
      };
    } else {
      const title = nodeTitleText(node, t);
      if (title) nextAncestry = { ...ancestry, sectionTitle: title };
    }

    node.rows?.forEach(row => {
      if (!isVisible(row.visibleWhen, values, optionsMap)) return;
      row.fields.forEach(field =>
        collectFieldIssues(
          field,
          values,
          optionsMap,
          t,
          nextAncestry,
          errors,
          issues,
          visited,
        ),
      );
    });

    if (node.children) {
      collectValidationIssues(
        node.children,
        values,
        optionsMap,
        t,
        errors,
        issues,
        visited,
        nextAncestry,
      );
    }
  });
}

/**
 * Validates the given root-level nodes (pass the whole schema for Submit, or a single
 * tab's node for Continue), tagging each issue with its root-level tab index for step
 * navigation. `visited` lists every field name that was checked, valid or not — callers
 * use it to clear stale errors for fields that were re-checked and are now valid.
 */
function collectValidationForRoots(
  rootNodes: FormSection[],
  schema: FormSection[],
  values: Record<string, string>,
  optionsMap: OptionsMap,
  t: (key: string, fallback?: string) => string,
): {
  errors: Record<string, string>;
  issues: ValidationIssue[];
  visited: Set<string>;
} {
  const errors: Record<string, string> = {};
  const issues: ValidationIssue[] = [];
  const visited = new Set<string>();

  rootNodes.forEach(node => {
    const rootTabIndex = schema.indexOf(node);
    const ancestry: ValidationAncestry =
      node.type === 'tab' && rootTabIndex !== -1 ? { rootTabIndex } : {};
    collectValidationIssues(
      [node],
      values,
      optionsMap,
      t,
      errors,
      issues,
      visited,
      ancestry,
    );
  });

  return { errors, issues, visited };
}

// ─── Required-Field Progress (current step / active tab) ──────────────────────
//
// Counts only visible, required, editable fields — mirrors the same skip
// conditions as validation (isVisible/isVisibleIf/isReadOnly/VIEW), so a field
// that wouldn't be validated also doesn't count toward progress.

function countRequiredFieldProgress(
  field: FormField,
  values: Record<string, string>,
  optionsMap: OptionsMap,
  counts: { total: number; completed: number },
): void {
  if (field.type === FORM_FIELD_TYPES.GROUP && Array.isArray(field.fields)) {
    field.fields.forEach(subField =>
      countRequiredFieldProgress(subField, values, optionsMap, counts),
    );
    return;
      }

  if (!field.name || !field.required) return;
  if (!isVisible(field.visibleWhen, values, optionsMap)) return;
  if (!isVisibleIf(field.visibleIf, values)) return;
  if (field.isReadOnly || field.type === FORM_FIELD_TYPES.VIEW) return;

  counts.total += 1;
  if ((values[field.name] ?? '').trim()) counts.completed += 1;
}

/** Recurses through the given nodes — pass the whole schema for whole-form progress. */
function computeRequiredFieldProgress(
  nodes: FormSection[] | undefined,
  values: Record<string, string>,
  optionsMap: OptionsMap,
): { total: number; completed: number } {
  const counts = { total: 0, completed: 0 };

  function visitNodes(list: FormSection[] | undefined) {
    list?.forEach(node => {
      node.rows?.forEach(row => {
        if (!isVisible(row.visibleWhen, values, optionsMap)) return;
        row.fields.forEach(field =>
          countRequiredFieldProgress(field, values, optionsMap, counts),
        );
      });
      if (node.children) visitNodes(node.children);
    });
  }

  visitNodes(nodes);
  return counts;
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
  inputProps?: any;
  selectProps?: any;
  orgProfileStyles?: any;
}

const GroupFieldRenderer: React.FC<{
  field: FormField;
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  disabled: boolean;
  optionsMap: OptionsMap;
  t: (key: string, fallback?: string) => string;
  visibilityGroups: Record<string, boolean>;
  toggleVisibilityGroup: (group: string) => void;
  autoFocusRef?: React.RefObject<any>;
  inputProps?: any;
  selectProps?: any;
}> = ({
  field,
  values,
  errors,
  onChange,
  disabled,
  optionsMap,
  t,
  visibilityGroups,
  toggleVisibilityGroup,
  autoFocusRef,
  inputProps,
  selectProps,
}) => {
  const subFields = field.fields || [];
  const combinedError = subFields.map(sf => errors[sf.name!]).find(Boolean);
  const [isFocused, setIsFocused] = useState(false);

  const isCreateUserForm = inputProps && inputProps.bg === '$blue50';
  const groupStyles = isCreateUserForm
    ? {
        bg: inputProps.bg,
        borderRadius: inputProps.borderRadius,
        borderWidth: inputProps.borderWidth ?? 1,
        borderColor: combinedError
          ? '$red500'
          : isFocused
          ? '$primary500'
          : inputProps.borderColor ?? 'transparent',
        boxShadow: isFocused
          ? '0 0 0 2px rgba(139, 40, 66, 0.2)'
          : inputProps.boxShadow,
        '$web-boxShadow': isFocused
          ? '0 0 0 2px rgba(139, 40, 66, 0.2)'
          : inputProps['$web-boxShadow'],
        px: inputProps.px ?? '$3',
        py: inputProps.py ?? 0,
      }
    : {};

  return (
    <HStack
      alignItems="center"
      height={40}
      width="100%"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...(groupStyles as any)}
    >
      {subFields.map((subField, idx) => (
        <React.Fragment key={subField.name || subField.label.key}>
          {idx > 0 && (
            <Box
              width={1}
              bg="$borderColor"
              height="60%"
              alignSelf="center"
            />
          )}
          <FieldRenderer
            field={subField}
            value={subField.name ? values[subField.name] ?? '' : ''}
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
            inputProps={inputProps}
            selectProps={selectProps}
          />
        </React.Fragment>
      ))}
    </HStack>
  );
};

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
  inputProps,
  selectProps,
  orgProfileStyles,
}) => {
  const isFieldDisabled =
    disabled || !!field.disabled || (isEditMode && field.name === 'roleId');

  useEffect(() => {
    if (
      field.type === FORM_FIELD_TYPES.SELECT ||
      field.type === FORM_FIELD_TYPES.PILLSELECT
    ) {
      const rawOptions = field.optionsSource
        ? optionsMap[field.optionsSource] ?? []
        : [];
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
  }, [
    field.type,
    field.name,
    field.defaultValue,
    field.optionsSource,
    optionsMap[field.optionsSource || ''],
    value,
    onChange,
  ]);

  // ── Group ───────────────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.GROUP) {
    return (
      <GroupFieldRenderer
        field={field}
        values={values}
        errors={errors}
        onChange={onChange}
        disabled={disabled}
        optionsMap={optionsMap}
        t={t}
        visibilityGroups={visibilityGroups}
        toggleVisibilityGroup={toggleVisibilityGroup}
        autoFocusRef={autoFocusRef}
        inputProps={inputProps}
        selectProps={selectProps}
      />
    );
  }
  // ── Checkbox Group ───────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.CHECKBOX_GROUP) {
    // Resolve options: inline schema options OR from optionsMap via optionsSource
    const opts =
      ((field as any).options && (field as any).options.length > 0)
        ? (field as any).options
        : (field.optionsSource ? (optionsMap[field.optionsSource] ?? []) : []);

    // Value is a comma-separated string of selected values
    const selectedSet = new Set(
      (value || '').split(',').map(v => v.trim()).filter(Boolean)
    );

    const toggle = (optValue: string) => {
      if (disabled || field.disabled) return;
      const next = new Set(selectedSet);
      if (next.has(optValue)) next.delete(optValue); else next.add(optValue);
      onChange(field.name || '', Array.from(next).join(', '));
    };

    if (opts.length === 0) {
      // No options available yet — render a plain text input as fallback
      return (
        <Input
          {...(inputProps as any)}
          isInvalid={!!error}
          isDisabled={disabled || field.disabled}
        >
          <FastInputField
            placeholder={field.placeholder?.fallback ?? ''}
            value={value}
            onChangeText={(text: string) => onChange(field.name || '', text)}
          />
        </Input>
      );
    }

    const orgStyles = orgProfileStyles;
    const containerProps = orgStyles?.orgProfileCheckboxContainer ?? { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: '$2' };
    const itemStyle = orgStyles?.orgProfileCheckboxItem ?? { minWidth: '22%', flexShrink: 1 };

    // Check if options have group headers (e.g. Site Coverage or Specific Training Areas)
    const hasGroups = opts.some((o: any) => !!o.group);

    if (hasGroups) {
      const groupedMap: Record<string, any[]> = {};
      opts.forEach((opt: any) => {
        const gName = opt.group || 'OTHER';
        if (!groupedMap[gName]) groupedMap[gName] = [];
        groupedMap[gName].push(opt);
      });

      return (
        <VStack space="sm" width="100%">
          {Object.entries(groupedMap).map(([groupTitle, groupOpts]) => (
            <VStack key={groupTitle} space="xs" width="100%" mb="$1">
              <Text
                fontSize="$xs"
                fontWeight="$bold"
                color="$textMutedForeground"
                textTransform="uppercase"
                letterSpacing={0.5}
                mt="$1"
                mb="$1"
              >
                {groupTitle}
              </Text>
              <Box {...containerProps}>
                {groupOpts.map((opt: any) => {
                  const isChecked = selectedSet.has(opt.value);
                  const cardProps = isChecked
                    ? (orgStyles?.orgProfileCheckboxCheckedCard ?? { bg: '$primary50', borderColor: '$primary700', borderWidth: 1, borderRadius: 10, px: '$3', py: '$2' })
                    : (orgStyles?.orgProfileCheckboxCard ?? { bg: '$white', borderColor: '$borderLight200', borderWidth: 1, borderRadius: 10, px: '$3', py: '$2' });
                  const textProps = getCheckboxTextStyles(field.name || '', isChecked, orgStyles) ?? (isChecked
                    ? (orgStyles?.orgProfileCheckboxCheckedText ?? { fontSize: '$xs', color: '$primary700', fontWeight: '$medium' })
                    : (orgStyles?.orgProfileCheckboxText ?? { fontSize: '$xs', color: '$textForeground', fontWeight: '$normal' }));
                  const boxProps = isChecked
                    ? (orgStyles?.orgProfileCheckboxCheckedBox ?? { width: 16, height: 16, borderRadius: 3, borderWidth: 0, borderColor: 'transparent', bg: '$primary700', alignItems: 'center', justifyContent: 'center' })
                    : (orgStyles?.orgProfileCheckboxBox ?? { width: 16, height: 16, borderRadius: 3, borderWidth: 1, borderColor: '$borderLight300', bg: '$white', alignItems: 'center', justifyContent: 'center' });

                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => toggle(opt.value)}
                      disabled={disabled || field.disabled}
                      style={itemStyle}
                    >
                      <HStack
                        space="sm"
                        alignItems="center"
                        {...cardProps}
                      >
                        <Box {...boxProps}>
                          {isChecked && (
                            <LucideIcon name="Check" size={11} color="white" />
                          )}
                        </Box>
                        <Text
                          {...textProps}
                          flex={1}
                        >
                          {opt.label}
                        </Text>
                      </HStack>
                    </Pressable>
                  );
                })}
              </Box>
            </VStack>
          ))}
        </VStack>
      );
    }

    return (
      <Box {...containerProps}>
        {opts.map((opt: any) => {
          const isChecked = selectedSet.has(opt.value);
          const cardProps = isChecked
            ? (orgStyles?.orgProfileCheckboxCheckedCard ?? { bg: '$primary50', borderColor: '$primary700', borderWidth: 1, borderRadius: 10, px: '$3', py: '$2' })
            : (orgStyles?.orgProfileCheckboxCard ?? { bg: '$white', borderColor: '$borderLight200', borderWidth: 1, borderRadius: 10, px: '$3', py: '$2' });
          const textProps = getCheckboxTextStyles(field.name || '', isChecked, orgStyles) ?? (isChecked
            ? (orgStyles?.orgProfileCheckboxCheckedText ?? { fontSize: '$xs', color: '$primary700', fontWeight: '$medium' })
            : (orgStyles?.orgProfileCheckboxText ?? { fontSize: '$xs', color: '$textForeground', fontWeight: '$normal' }));
          const boxProps = isChecked
            ? (orgStyles?.orgProfileCheckboxCheckedBox ?? { width: 16, height: 16, borderRadius: 3, borderWidth: 0, borderColor: 'transparent', bg: '$primary700', alignItems: 'center', justifyContent: 'center' })
            : (orgStyles?.orgProfileCheckboxBox ?? { width: 16, height: 16, borderRadius: 3, borderWidth: 1, borderColor: '$borderLight300', bg: '$white', alignItems: 'center', justifyContent: 'center' });

          return (
            <Pressable
              key={opt.value}
              onPress={() => toggle(opt.value)}
              disabled={disabled || field.disabled}
              style={itemStyle}
            >
              <HStack
                space="sm"
                alignItems="center"
                {...cardProps}
              >
                <Box {...boxProps}>
                  {isChecked && (
                    <LucideIcon name="Check" size={11} color="white" />
                  )}
                </Box>
                <Text
                  {...textProps}
                  flex={1}
                >
                  {opt.label}
                </Text>
              </HStack>
            </Pressable>
          );
        })}
      </Box>
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
          {t(`admin.users.createUser.${field.label.key}`, field.label.fallback)}
        </Text>
      </HStack>
    );
  }

  const placeholder = field.placeholder?.fallback ?? '';

  // ── Select ──────────────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.SELECT) {
    const rawOptions = field.optionsSource
      ? optionsMap[field.optionsSource] ?? []
      : [];
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
      <Box
        width={isNested ? 95 : '100%'}
        zIndex={field.zIndex ?? (isNested ? 1000 : 1)}
      >
        <Select
          {...(isNested ? {} : selectProps)}
          options={options}
          value={value}
          onChange={(val: string, _lbl: string) =>
            onChange(field.name || '', val)
          }
          placeholder={activePlaceholder}
          disabled={isDisabled}
          isReadOnly={field.isReadOnly}
          {...(isNested
            ? { borderColor: 'transparent', bg: 'transparent' }
            : {})}
        />
      </Box>
    );
  }

  // ── Pill Select (single-select rendered as a row of pill buttons) ────────────
  if (field.type === FORM_FIELD_TYPES.PILLSELECT) {
    const rawOptions = field.optionsSource
      ? optionsMap[field.optionsSource] ?? []
      : [];
    const isDisabled = isFieldDisabled || !!field.isReadOnly;

    return (
      <HStack space="sm" flexWrap="wrap">
        {rawOptions.map(option => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              disabled={isDisabled}
              onPress={() => onChange(field.name || '', option.value)}
            >
              <Box
                px="$3"
                py="$2"
                borderRadius="$full"
                borderWidth={1}
                borderColor={isSelected ? '$primary500' : '$borderColor'}
                bg={isSelected ? '$primary500' : 'transparent'}
                opacity={isDisabled ? 0.5 : 1}
              >
                <Text
                  {...TYPOGRAPHY.bodySmall}
                  color={isSelected ? '$white' : '$textForeground'}
                >
                  {option.label}
                </Text>
              </Box>
            </Pressable>
          );
        })}
      </HStack>
    );
  }

  // ── File Upload ───────────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.FILE) {
    const isDisabled = isFieldDisabled || !!field.isReadOnly;
    const subLabelText = field.subLabel
      ? t(
          `admin.users.createUser.${field.subLabel.key}`,
          field.subLabel.fallback,
        )
      : undefined;

    const handlePick = async () => {
      if (isDisabled) return;
      try {
        const picked = await openFilePicker({ allowMultiSelection: false });
        const fileName = picked?.[0]?.name;
        if (fileName) onChange(field.name || '', fileName);
      } catch {
        // User cancelled the picker — nothing to persist.
      }
    };

    return (
      <VStack space="xs">
        <Pressable onPress={handlePick} disabled={isDisabled}>
          <HStack
            space="sm"
            alignItems="center"
            borderWidth={1}
            borderStyle="dashed"
            borderColor="$borderColor"
            borderRadius="$md"
            p="$3"
            opacity={isDisabled ? 0.5 : 1}
          >
            <LucideIcon name="Upload" size={18} color="$textMutedForeground" />
            <Text
              {...TYPOGRAPHY.bodySmall}
              color={value ? '$textForeground' : '$textMutedForeground'}
            >
              {value ||
                placeholder ||
                t('common.clickToUpload', 'Click to upload')}
            </Text>
          </HStack>
        </Pressable>
        {!!subLabelText && (
          <Text {...TYPOGRAPHY.caption} color="$textMutedForeground">
            {subLabelText}
          </Text>
        )}
      </VStack>
    );
  }

  // ── Date ────────────────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.DATE) {
    // Internal display value: stored as YYYY_MM_DD, displayed as YYYY-MM-DD
    const displayValue = value ? value.replace(/_/g, '-') : '';

    return (
      <Box zIndex={field.zIndex ?? 999}>
        <DatePicker
          {...inputProps}
          placeholder={placeholder || 'YYYY-MM-DD'}
          value={displayValue}
          onChange={(date: string) =>
            onChange(field.name || '', date.replace(/-/g, '_'))
          }
          maximumDate={
            field.validation?.some(r => r.rule === 'dateNotInFuture')
              ? new Date()
              : undefined
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
          {...inputProps}
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
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: [{ translateY: -12 }],
              padding: 4,
              zIndex: 1,
            }}
          >
            <LucideIcon
              name={isVisible ? 'EyeOff' : 'Eye'}
              size={20}
              color="$textSecondary"
            />
          </Pressable>
        )}
      </Box>
    );
  }

  // ── Textarea ────────────────────────────────────────────────────────────────
  if (field.type === FORM_FIELD_TYPES.TEXTAREA) {
    const keyboardType = (field.inputProps?.keyboardType as any) ?? 'default';
    const autoCapitalize =
      (field.inputProps?.autoCapitalize as any) ?? 'sentences';
    const maxLength = field.inputProps?.maxLength;

    return (
      <Textarea
        {...(inputProps as any)}
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
  if (field.type === FORM_FIELD_TYPES.FILE_UPLOAD) {
    const uploadText = field.placeholder?.fallback ?? 'Click to upload PDF / DOC / JPG';
    const uploadedFileName = value ? (value.split('/').pop() || value) : '';
    const [isUploading, setIsUploading] = useState(false);

    const handleFilePick = () => {
      if (disabled || field.disabled || isUploading) return;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
      input.onchange = async (e: any) => {
        const file: File | undefined = e.target?.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
          const signedUrlResponse = await getSignedUrl(file.name);
          if (!signedUrlResponse.result?.signedUrl) {
            throw new Error('Could not get upload URL');
          }
          await uploadFileToSignedUrl(signedUrlResponse.result.signedUrl, file);
          const filePath =
            signedUrlResponse.result.filePath ||
            signedUrlResponse.result.destFilePath ||
            file.name;
          onChange(field.name || '', filePath);
        } catch (err) {
          console.error('File upload error:', err);
        } finally {
          setIsUploading(false);
        }
      };
      input.click();
    };

    return (
      <Pressable
        onPress={handleFilePick}
        disabled={disabled || field.disabled || isUploading}
        width="100%"
      >
        <Box
          width="100%"
          borderWidth={1}
          borderStyle="dashed"
          borderColor="$borderLight300"
          borderRadius="$lg"
          py="$8"
          px="$4"
          alignItems="center"
          justifyContent="center"
          bg="$white"
        >
          <Box mb="$2">
            <LucideIcon
              name={isUploading ? 'LoaderCircle' : 'Upload'}
              size={24}
              color="$textMutedForeground"
            />
          </Box>
          {uploadedFileName ? (
            <Text fontSize="$sm" color="$success600" fontWeight="$medium" textAlign="center">
              {uploadedFileName}
            </Text>
          ) : (
            <Text fontSize="$sm" color="$primary600" fontWeight="$medium" textAlign="center">
              {isUploading ? 'Uploading...' : uploadText}
            </Text>
          )}
          <Text fontSize="$xs" color="$textMutedForeground" mt="$1" textAlign="center">
            Max 10 MB
          </Text>
        </Box>
      </Pressable>
    );
  }

  // ── Text / Email / Tel ───────────────────────────────────────────────────────
  const keyboardType = (field.inputProps?.keyboardType as any) ?? 'default';
  const autoCapitalize =
    (field.inputProps?.autoCapitalize as any) ?? 'sentences';
  const maxLength = field.inputProps?.maxLength;

  return (
    <Input
      {...(isNested ? {} : (inputProps as any))}
      isInvalid={!!error}
      isDisabled={isFieldDisabled}
      isReadOnly={field.isReadOnly}
      alignItems={field.icon ? 'center' : undefined}
      {...(isNested
        ? {
        borderColor: 'transparent',
        bg: 'transparent',
        flex: 1,
            variant: 'outline',
          }
        : {})}
    >
      {field.icon && (
        <Box pr="$2">
          <LucideIcon
            name={field.icon as any}
            size={16}
            color="$textMutedForeground"
          />
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

// ─── Recursive Node Rendering (tabs / sections) ───────────────────────────────
//
// The schema is a tree: any node with `children` recurses to unlimited depth.
// Node types:
//   - "tab"     → rendered with @gluestack-ui/themed Tabs (skipped when it's the only tab)
//   - "section" → rendered with an @ui Card + header, then its rows/children
//   - anything else falls back to the section renderer, so legacy/unknown nodes
//     (including schemas that never set `type`) keep working unmodified.

/** Shared render context threaded down through the recursive node tree. */
interface NodeRenderContext {
  values: Record<string, string>;
  errors: Record<string, string>;
  optionsMap: OptionsMap;
  mode: string;
  t: (key: string, fallback?: string) => string;
  onFieldChange: (name: string, value: string) => void;
  disabled: boolean;
  visibilityGroups: Record<string, boolean>;
  toggleVisibilityGroup: (group: string) => void;
  firstNameRef?: React.RefObject<any>;
  fieldsByName: Record<string, FormField>;
  /** Registers a field's rendered container node, keyed by field name — used to scroll/focus/highlight it from the validation popup */
  registerFieldRef?: (name: string, node: any) => void;
  /** Name of the field to temporarily highlight (set after navigating from the validation popup) */
  highlightedField?: string | null;
  inputProps?: any;
  selectProps?: any;
  orgProfileStyles?: any;
}

function nodeTitleText(
  node: FormSection,
  t: (key: string, fallback?: string) => string,
): string | undefined {
  const titleDef = node.title ?? node.label;
  if (!titleDef) return undefined;
  const key = titleDef.key || '';
  return t(
    key.includes('.')
      ? key
      : `admin.users.createUser.${key}`,
    titleDef.fallback,
  );
}

/** Renders a sibling list of nodes, grouping consecutive `tab` nodes into one Tabs system. */
const RenderNodes: React.FC<{
  nodes?: FormSection[];
  ctx: NodeRenderContext;
}> = ({ nodes, ctx }) => {
  if (!nodes?.length) return null;

  const items: React.ReactNode[] = [];
  let i = 0;
  while (i < nodes.length) {
    const node = nodes[i];

    if (node.type === 'tab') {
      const tabGroup: FormSection[] = [];
      while (i < nodes.length && nodes[i].type === 'tab') {
        tabGroup.push(nodes[i]);
        i += 1;
      }
      items.push(
        <TabGroupRenderer
          key={`tabgroup-${tabGroup[0].id}`}
          tabs={tabGroup}
          ctx={ctx}
        />,
      );
      continue;
    }

    items.push(<SectionNode key={node.id} node={node} ctx={ctx} />);
    i += 1;
  }

  return <>{items}</>;
};

/**
 * Single Tab Rule: one tab renders its children directly, no TabList/navigation chrome.
 * For 2+ tabs, `activeTabId` is local UI state used only to drive active-tab styling
 * (`$primary500` text/icon/bottom-border, per the design system) — gluestack's own
 * internal switching still governs which `TabsTabPanel` is visible; both are set from
 * the same click so they never disagree.
 */
const TabGroupRenderer: React.FC<{
  tabs: FormSection[];
  ctx: NodeRenderContext;
}> = ({ tabs, ctx }) => {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id);

  if (tabs.length <= 1) {
    return <RenderNodes nodes={tabs[0]?.children} ctx={ctx} />;
  }

  return (
    <Tabs value={tabs[0].id} width="100%">
      <TabsTabList
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        flexWrap="wrap"
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          return (
            <TabsTab
              key={tab.id}
              value={tab.id}
              onPress={() => setActiveTabId(tab.id)}
              paddingHorizontal="$6"
              paddingVertical="$3"
              borderBottomWidth={3}
              borderBottomColor={isActive ? '$primary500' : 'transparent'}
              mb={-1}
            >
              <HStack space="xs" alignItems="center">
                {!!tab.icon && (
                  <LucideIcon
                    name={tab.icon as any}
                    size={16}
                    color={isActive ? '$primary500' : '$textMutedForeground'}
                  />
                )}
                <TabsTabTitle
                  {...TYPOGRAPHY.label}
                  color={isActive ? '$primary500' : '$textMutedForeground'}
                >
                  {nodeTitleText(tab, ctx.t) ?? tab.id}
                </TabsTabTitle>
              </HStack>
            </TabsTab>
          );
        })}
      </TabsTabList>
      <TabsTabPanels>
        {tabs.map(tab => {
          const subTitleText = tab.subTitle
            ? ctx.t(
                `admin.users.createUser.${tab.subTitle.key}`,
                tab.subTitle.fallback,
              )
            : undefined;
          return (
            <TabsTabPanel key={tab.id} value={tab.id}>
              <VStack space="md">
                {!!subTitleText && (
                  <Text {...TYPOGRAPHY.caption} color="$textMutedForeground">
                    {subTitleText}
                  </Text>
                )}
                {!!tab.hint && <HintDisplay hint={tab.hint} t={ctx.t} />}
                <RenderNodes nodes={tab.children} ctx={ctx} />
              </VStack>
            </TabsTabPanel>
          );
        })}
      </TabsTabPanels>
    </Tabs>
  );
};

/** Renders a "section" node: an @ui Card header (icon/title/subTitle/hint) plus its rows and children. */
const SectionNode: React.FC<{ node: FormSection; ctx: NodeRenderContext }> = ({
  node,
  ctx,
}) => {
  const titleText = nodeTitleText(node, ctx.t);
  const subTitleKey = node.subTitle?.key || '';
  const subTitleText = node.subTitle
    ? ctx.t(
        subTitleKey.includes('.')
          ? subTitleKey
          : `admin.users.createUser.${subTitleKey}`,
        node.subTitle.fallback,
      )
    : undefined;

  const orgStyles = ctx.orgProfileStyles;
  const sectionIconSize = orgStyles?.orgProfileSectionIcon?.size ?? 16;
  const sectionIconColor = orgStyles?.orgProfileSectionIcon?.color ?? '$textMutedForeground';

  const content = (
    <VStack space="sm">
      {!!titleText && (
        <VStack {...(orgStyles?.orgProfileSectionHeaderContainer ?? { space: 'xs' })}>
          <HStack space="xs" alignItems="center">
            {!!node.icon && (
              <LucideIcon
                name={node.icon as any}
                size={sectionIconSize}
                color={sectionIconColor}
              />
            )}
            <Text
              {...(orgStyles?.orgProfileSectionTitle ?? {
                ...TYPOGRAPHY.bodySmall,
                color: '$textMutedForeground',
                fontWeight: '$normal',
              })}
            >
              {titleText}
            </Text>
          </HStack>
          {!!subTitleText && (
            <Text {...(orgStyles?.orgProfileFieldSubTitle ?? { ...TYPOGRAPHY.caption, color: '$textMutedForeground' })}>
              {subTitleText}
            </Text>
          )}
        </VStack>
      )}

      {!!node.rows?.length && <RenderRow rows={node.rows} {...ctx} />}

      {!!node.children?.length && (
        <RenderNodes nodes={node.children} ctx={ctx} />
      )}

      {!!node.hint && <HintDisplay hint={node.hint} t={ctx.t} />}
    </VStack>
  );

  if (orgStyles?.orgProfileSectionContainer) {
    return (
      <Box {...orgStyles.orgProfileSectionContainer}>
        {content}
      </Box>
    );
  }

  return content;
};

// ─── Multi-Step Navigation (Previous / Continue / Save Draft / Submit) ────────
//
// Engages only when the ENTIRE root schema is made of 2+ `tab` nodes (a genuine
// step wizard). Mixed/single-tab/no-tab schemas fall through to the plain
// recursive rendering above, unchanged — this keeps every existing screen
// (CREATE_USER_FORM_SCHEMA, etc.) byte-for-byte backward compatible.

/**
 * Step indicator built on the same `@gluestack-ui/themed` Tabs primitives as the
 * in-page `TabGroupRenderer` above, so clicking a tab behaves like standard tab
 * navigation. gluestack's `Tabs` has no external-control API (`value` only seeds
 * its internal state once), so the wizard's Previous/Continue buttons remain the
 * source of truth: `key={activeTabId}` forces a remount with the right initial
 * value whenever they change step, while direct clicks call `onSelectStep`
 * (composed alongside gluestack's own internal switch — both fire on a tap, and
 * since we don't render TabsTabPanels here, only our own `onSelectStep` matters).
 */
const StepHeader: React.FC<{
  tabs: FormSection[];
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  t: (key: string, fallback?: string) => string;
}> = ({ tabs, activeStepIndex, onSelectStep, t }) => {
  const activeTabId = tabs[activeStepIndex]?.id;

  return (
    <Tabs
      key={activeTabId}
      value={activeTabId}
      width="100%"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <TabsTabList flexWrap="wrap" borderRadius={0}>
        {tabs.map((tab, index) => {
          const isActive = index === activeStepIndex;
          return (
            <TabsTab
              key={tab.id}
              value={tab.id}
              onPress={() => onSelectStep(index)}
              paddingHorizontal="$6"
              paddingVertical="$3"
              borderBottomWidth={3}
              borderBottomColor={isActive ? '$primary500' : 'transparent'}
              mb={-1}
              borderRadius={0}
            >
              <HStack space="xs" alignItems="center">
                {!!tab.icon && (
                  <LucideIcon
                    name={tab.icon as any}
                    size={16}
                    color={isActive ? '$primary500' : '$textMutedForeground'}
                  />
                )}
                <TabsTabTitle
                  {...TYPOGRAPHY.bodySmall}
                  fontWeight={isActive ? '$medium' : '$normal'}
                  color={isActive ? '$primary500' : '$textMutedForeground'}
                >
                  {nodeTitleText(tab, t) ?? tab.id}
                </TabsTabTitle>
              </HStack>
            </TabsTab>
          );
        })}
      </TabsTabList>
    </Tabs>
  );
};

/** Required-fields-only completion for the active step, via the same gluestack Progress primitives already used elsewhere in the app (e.g. TasksOverviewCard). */
const StepProgress: React.FC<{
  total: number;
  completed: number;
  t: (key: string, fallback?: string) => string;
}> = ({ total, completed, t }) => {
  const percent = total > 0 ? (completed / total) * 100 : 100;
  const displayPercent = Math.round(percent * 10) / 10;

  return (
    <VStack
      space="xs"
      width="100%"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      pb="$3"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <Text {...TYPOGRAPHY.bodySmall} color="$textForeground">
          {t('common.progress', 'Progress')}
        </Text>
        <Text {...TYPOGRAPHY.bodySmall} color="$primary500" fontWeight="$bold">
          {displayPercent}%
        </Text>
      </HStack>
      <Progress value={percent} w="$full" h="$1.5" bg="$progressBarBackground">
        <ProgressFilledTrack bg="$primary500" />
      </Progress>
    </VStack>
  );
};

const StepFooter: React.FC<{
  isFirstStep: boolean;
  isLastStep: boolean;
  disabled?: boolean;
  onPrevious: () => void;
  onContinue: () => void;
  onSaveDraft?: () => void;
  onSubmit: () => void;
  t: (key: string, fallback?: string) => string;
}> = ({
  isFirstStep,
  isLastStep,
  disabled,
  onPrevious,
  onContinue,
  onSaveDraft,
  onSubmit,
  t,
}) => (
  <HStack
    space="sm"
    justifyContent="space-between"
    width="100%"
    flexWrap="wrap"
  >
    <Button
      variant="outline"
      onPress={onPrevious}
      isDisabled={isFirstStep || disabled}
    >
      <ButtonText>{t('common.previous', 'Previous')}</ButtonText>
    </Button>
    <HStack space="sm">
      {!!onSaveDraft && (
        <Button variant="outline" onPress={onSaveDraft} isDisabled={disabled}>
          <ButtonText>{t('common.saveDraft', 'Save Draft')}</ButtonText>
        </Button>
      )}
      {!isLastStep && (
        <Button onPress={onContinue} isDisabled={disabled}>
          <ButtonText>{t('common.continue', 'Continue')}</ButtonText>
        </Button>
      )}
      {isLastStep && (
        <Button onPress={onSubmit} isDisabled={disabled}>
          <ButtonText>{t('common.submit', 'Submit')}</ButtonText>
        </Button>
      )}
    </HStack>
  </HStack>
);

/**
 * Centralized validation popup — lists every invalid field grouped by
 * step (tab) then section, matching the existing inline error text
 * (no custom validation style is introduced). Clicking an item lets the
 * caller navigate to, scroll to, and focus/highlight that field.
 */
const ValidationPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  issues: ValidationIssue[];
  onSelectIssue: (issue: ValidationIssue) => void;
  t: (key: string, fallback?: string) => string;
}> = ({ isOpen, onClose, issues, onSelectIssue, t }) => {
  const groups = useMemo(() => {
    const byTab = new Map<string, Map<string, ValidationIssue[]>>();
    issues.forEach(issue => {
      const tabKey = issue.tabTitle ?? '';
      const sectionKey = issue.sectionTitle ?? '';
      if (!byTab.has(tabKey)) byTab.set(tabKey, new Map());
      const bySection = byTab.get(tabKey)!;
      if (!bySection.has(sectionKey)) bySection.set(sectionKey, []);
      bySection.get(sectionKey)!.push(issue);
    });
    return Array.from(byTab.entries()).map(([tabTitle, bySection]) => ({
      tabTitle,
      sections: Array.from(bySection.entries()).map(
        ([sectionTitle, sectionIssues]) => ({
          sectionTitle,
          issues: sectionIssues,
        }),
      ),
    }));
  }, [issues]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      headerTitle={t('common.validationErrors', 'Validation Errors')}
    >
      <VStack space="md">
        {groups.map(group => (
          <VStack key={group.tabTitle || 'untitled-tab'} space="sm">
            {!!group.tabTitle && (
              <Text {...TYPOGRAPHY.label} color="$textForeground">
                {group.tabTitle}
              </Text>
            )}
            {group.sections.map(section => (
              <VStack
                key={section.sectionTitle || 'untitled-section'}
                space="xs"
                pl={group.tabTitle ? '$4' : undefined}
              >
                {!!section.sectionTitle && (
                  <Text {...TYPOGRAPHY.bodySmall} color="$textMutedForeground">
                    {section.sectionTitle}
                  </Text>
                )}
                <VStack space="xs" pl="$2">
                  {section.issues.map(issue => (
                    <Pressable
                      key={issue.fieldName}
                      onPress={() => onSelectIssue(issue)}
                      display="flex"
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems='center'
                    >
                      <Text
                        {...TYPOGRAPHY.bodySmall}
                        color="$blue600"
                        textDecorationLine="underline"
                        cursor="pointer"
                      >
                        {issue.fieldLabel}
                        {/* — {issue.message} */}
                      </Text>
                      <LucideIcon
                        name={'ChevronRight' as any}
                        size={16}
                        color={'$blue600'}
                      />
                    </Pressable>
                  ))}
                </VStack>
              </VStack>
            ))}
          </VStack>
        ))}
      </VStack>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SchemaFormRenderer: React.FC<SchemaFormRendererProps> = ({
  schema,
  values = {},
  errors = {},
  onFieldChange = (...e) => {
    console.log(e);
  },
  optionsMap = {},
  disabled = false,
  t,
  mode = 'edit',
  firstNameRef,
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
  inputProps,
  selectProps,
  orgProfileStyles,
}) => {
  // Track password visibility per group
  const [visibilityGroups, setVisibilityGroups] = useState<
    Record<string, boolean>
  >({});

  const toggleVisibilityGroup = (group: string) => {
    setVisibilityGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Flat name → field-definition lookup, used to resolve `view` fields by name.
  const fieldsByName = useMemo(() => collectFieldsByName(schema), [schema]);

  // ── Multi-step wizard state (only used when the root schema is 2+ `tab` nodes) ──
  const rootTabs = useMemo(
    () => schema.filter(node => node.type === 'tab'),
    [schema],
  );
  const isMultiStep = rootTabs.length > 1 && rootTabs.length === schema.length;

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const safeStepIndex = Math.min(
    activeStepIndex,
    Math.max(rootTabs.length - 1, 0),
  );

  const [internalErrors, setInternalErrors] = useState<Record<string, string>>(
    {},
  );
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupIssues, setPopupIssues] = useState<ValidationIssue[]>([]);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  const fieldRefsRef = useRef<Record<string, any>>({});
  const pendingFocusFieldRef = useRef<{
    fieldName: string;
    message: string;
  } | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const registerFieldRef = (name: string, node: any) => {
    fieldRefsRef.current[name] = node;
  };

  // Reveals the standard inline error for exactly this one field, then scrolls,
  // focuses, and temporarily highlights it. Other invalid fields stay quiet —
  // Task 2 explicitly asks that the popup, not a wall of inline errors, be the
  // first thing the user sees after a failed validation.
  const revealAndFocusField = (name: string, message: string) => {
    setInternalErrors(prev => ({ ...prev, [name]: message }));

    setHighlightedField(name);
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(
      () => setHighlightedField(null),
      1600,
    );

    setTimeout(() => {
      const node = fieldRefsRef.current[name];
      if (node?.scrollIntoView)
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (node?.focus) node.focus();
    }, 50);
  };

  // Applies a fresh validation pass without auto-revealing newly-invalid fields:
  // a field only ever gets an inline message once the user has opened it from the
  // validation popup (`revealAndFocusField`). Already-revealed fields still track
  // the live result (cleared once fixed, updated if still invalid).
  const applyValidationResult = (
    freshErrors: Record<string, string>,
    visited: Set<string>,
  ) => {
    setInternalErrors(prev => {
      const next = { ...prev };
      visited.forEach(name => {
        if (!(name in next)) return; // never revealed — stays hidden
        if (freshErrors[name]) next[name] = freshErrors[name];
        else delete next[name]; // now valid — clear it
      });
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current)
        clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

  // Runs after navigating to a different step from the validation popup — the target
  // field only mounts once that step's content renders, so this waits a tick for it.
  useEffect(() => {
    const pending = pendingFocusFieldRef.current;
    if (!pending) return;
    pendingFocusFieldRef.current = null;

    const timer = setTimeout(() => {
      revealAndFocusField(pending.fieldName, pending.message);
    }, 50);

    return () => clearTimeout(timer);
  }, [safeStepIndex]);

  const handlePrevious = () => {
    setActiveStepIndex(i => Math.max(0, i - 1));
  };

  // Direct tab clicks navigate freely (no validation gating) — only the
  // Continue button validates before advancing. Values/errors/draft state
  // are untouched since they live outside `activeStepIndex`.
  const handleSelectStep = (index: number) => {
    setActiveStepIndex(index);
  };

  const handleContinue = () => {
    const currentTab = rootTabs[safeStepIndex];
    if (!currentTab) return;

    const {
      errors: stepErrors,
      issues: stepIssues,
      visited,
    } = collectValidationForRoots([currentTab], schema, values, optionsMap, t);

    applyValidationResult(stepErrors, visited);

    if (stepIssues.length === 0) {
      setActiveStepIndex(i => Math.min(i + 1, rootTabs.length - 1));
    } else {
      setPopupIssues(stepIssues);
      setIsPopupOpen(true);
    }
  };

  const handleSubmit = () => {
    const {
      errors: allErrors,
      issues: allIssues,
      visited,
    } = collectValidationForRoots(schema, schema, values, optionsMap, t);

    applyValidationResult(allErrors, visited);

    if (allIssues.length === 0) {
      onSubmit?.(values);
    } else {
      setPopupIssues(allIssues);
      setIsPopupOpen(true);
    }
  };

  const handleSaveDraft = () => {
    onSaveDraft?.(values);
  };

  const handleSelectIssue = (issue: ValidationIssue) => {
    setIsPopupOpen(false);

    if (
      issue.rootTabIndex !== undefined &&
      issue.rootTabIndex !== safeStepIndex
    ) {
      // Defer scroll/focus/highlight until the new step's fields mount (see effect above).
      pendingFocusFieldRef.current = {
        fieldName: issue.fieldName,
        message: issue.message,
      };
      setActiveStepIndex(issue.rootTabIndex);
      return;
    }

    revealAndFocusField(issue.fieldName, issue.message);
  };

  const baseCtx: NodeRenderContext = {
    values,
    errors,
    optionsMap,
    mode,
    t,
    onFieldChange,
    disabled,
    visibilityGroups,
    toggleVisibilityGroup,
    firstNameRef,
    fieldsByName,
    inputProps,
    selectProps,
    orgProfileStyles,
  };

  if (isMultiStep) {
    const activeTab = rootTabs[safeStepIndex];
    const stepCtx: NodeRenderContext = {
      ...baseCtx,
      errors: { ...errors, ...internalErrors },
      registerFieldRef,
      highlightedField,
    };

    const stepSubTitleText = activeTab?.subTitle
      ? t(
          `admin.users.createUser.${activeTab.subTitle.key}`,
          activeTab.subTitle.fallback,
        )
      : undefined;

    // Whole-form progress (every tab/section/nested node), not just the active step —
    // recalculated on every render, cheap tree walk, always reflects the latest `values`.
    const { total: requiredTotal, completed: requiredCompleted } =
      computeRequiredFieldProgress(schema, values, optionsMap);

  return (
    <VStack space="md" width="100%">
        <VStack width="100%">
          <StepProgress
            total={requiredTotal}
            completed={requiredCompleted}
            t={t}
          />

          <StepHeader
            tabs={rootTabs}
            activeStepIndex={safeStepIndex}
            onSelectStep={handleSelectStep}
            t={t}
          />
        </VStack>

        {!!stepSubTitleText && (
          <Text {...TYPOGRAPHY.caption} color="$textMutedForeground">
            {stepSubTitleText}
              </Text>
        )}

        {!!activeTab?.hint && <HintDisplay hint={activeTab.hint} t={t} />}

        <RenderNodes nodes={activeTab?.children} ctx={stepCtx} />

        <StepFooter
          isFirstStep={safeStepIndex === 0}
          isLastStep={safeStepIndex === rootTabs.length - 1}
          disabled={disabled || isSubmitting}
          onPrevious={handlePrevious}
          onContinue={handleContinue}
          onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
          onSubmit={handleSubmit}
          t={t}
        />

        <ValidationPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          issues={popupIssues}
          onSelectIssue={handleSelectIssue}
          t={t}
        />
      </VStack>
    );
  }

  return (
    <VStack space="md" width="100%">
      <RenderNodes nodes={schema} ctx={baseCtx} />
    </VStack>
  );
};

export default SchemaFormRenderer;

export const RenderRow = memo(
  ({ rows, values = {}, optionsMap = {}, mode, ...rest }: any) => {
    const renderedRows = useMemo(() => {
      return rows?.map((row: any, index: number) => {
            if (!isVisible(row.visibleWhen, values, optionsMap)) {
              return null;
            }

        const visibleFields = row.fields.flatMap((field: any) => {
          if (!isVisible(field.visibleWhen, values, optionsMap)) {
            return [];
          }

          if (!isVisibleIf(field.visibleIf, values)) {
            return [];
          }

          if (
            mode === 'preview' &&
            field.type === FORM_FIELD_TYPES.GROUP &&
            field.fields
          ) {
            return field.fields;
          }

          return [field];
        });

        if (!visibleFields.length) {
          return null;
        }

        return (
          <RowRenderer
            key={row.id ?? index}
            fields={visibleFields}
            isMobile={false}
            values={values}
            optionsMap={optionsMap}
            mode={mode}
            {...rest}
          />
        );
      });
    }, [rows, values, optionsMap, mode, rest]);

    return <>{renderedRows}</>;
  },
);

interface FieldType {
  field: FormField;
  t: (key: string, fallback?: string) => string;
  isMultiField?: boolean;
  values?: Record<string, string>;
  errors?: Record<string, string>;
  optionsMap?: OptionsMap;
  mode?: string;
  onFieldChange?: () => void;
  disabled?: boolean;
  visibilityGroups?: Record<string, boolean>;
  toggleVisibilityGroup?: (group: string) => void;
  /** Forwarded ref for the first autoFocus field */
  firstNameRef?: React.RefObject<any>;
  isNested?: boolean;
  isEditMode?: boolean;
  /** Flat name → field-definition lookup, used to resolve `view` fields */
  fieldsByName?: Record<string, FormField>;
  /** Registers a field's rendered container node, keyed by field name */
  registerFieldRef?: (name: string, node: any) => void;
  /** Name of the field to temporarily highlight (navigated to from the validation popup) */
  highlightedField?: string | null;
}

const RowRenderer = memo(
  ({
    isMobile,
    fields,
    t,
    ...fieldsProps
  }: any) => {
    const isMultiField = fields.length > 1;

            return (
              <HStack
                space="md"
                flexDirection={isMobile || !isMultiField ? 'column' : 'row'}
              >
        {fields.map((field: any) => (
          <FieldContainer
            key={field.name ?? field.label.key}
            isMultiField={isMultiField}
            field={field}
            t={t}
            {...fieldsProps}
          />
        ))}
      </HStack>
    );
  },
);

// ─── Hint (simple helper string, or an info/warning/danger/success banner) ────

const HINT_TYPE_CONFIG: Record<
  string,
  {
    bg: string;
    borderColor: string;
    textColor: string;
    icon: string;
    iconColor?: string;
    bulletTextColor?: string;
  }
> = {
  info: {
    bg: '$blue50',
    borderColor: '$blue200',
    bulletTextColor: '$blue800',
    textColor: '$blue900',
    iconColor: '$blue600',
    icon: 'Info',
  },
  warning: {
    bg: '$warning100',
    borderColor: '$warning700',
    textColor: '$warning700',
    icon: 'AlertTriangle',
  },
  danger: {
    bg: '$error100',
    borderColor: '$error700',
    textColor: '$error700',
    icon: 'XCircle',
  },
  success: {
    bg: '$success100',
    borderColor: '$success700',
    textColor: '$success700',
    icon: 'CheckCircle',
  },
};

const HintDisplay: React.FC<{
  hint: Hint;
  t: (key: string, fallback?: string) => string;
}> = ({ hint, t }) => {
  if (typeof hint === 'string') {
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
        <Text {...TYPOGRAPHY.bodySmall} color="$textMutedForeground" flex={1}>
          {hint}
        </Text>
      </HStack>
    );
  }

  const config = HINT_TYPE_CONFIG[hint.type ?? 'info'] ?? HINT_TYPE_CONFIG.info;
  const iconName = hint.icon ?? config.icon;
  const titleText = hint.title
    ? t(`admin.users.createUser.${hint.title.key}`, hint.title.fallback)
    : undefined;

                      return (
    <VStack
      space="xs"
      bg={config.bg}
      borderWidth={1}
      borderColor={config.borderColor}
      borderRadius="$xl"
      p="$3"
      width="100%"
    >
      <HStack space="sm" alignItems="flex-start">
        <Box mt={2}>
          <LucideIcon
            name={iconName as any}
            size={16}
            color={config?.iconColor || config.textColor}
          />
        </Box>
        <VStack space="xs" flex={1}>
          {!!titleText && (
            <Text
              {...TYPOGRAPHY.bodySmall}
              color={config.textColor}
              fontWeight="$medium"
            >
              {titleText}
                            </Text>
          )}
          {!!hint.bullets?.length && (
            <VStack space="xs">
              {hint.bullets.map((bullet, index) => (
                <HStack
                  key={bullet.key ?? index}
                  space="xs"
                  alignItems="flex-start"
                >
                  <Text color={config?.bulletTextColor || config.textColor}>
                    {'•'}
                            </Text>
                  <Text
                    {...TYPOGRAPHY.bodySmall}
                    color={config?.bulletTextColor || config.textColor}
                    flex={1}
                  >
                    {t(`admin.users.createUser.${bullet.key}`, bullet.fallback)}
                                  </Text>
                </HStack>
              ))}
            </VStack>
                            )}
        </VStack>
                          </HStack>
                        </VStack>
                      );
};

// ─── View Field (read-only display of another field's label/value) ───────────

interface ViewFieldDisplayProps {
  field: FormField;
  values: Record<string, string>;
  optionsMap: OptionsMap;
  t: (key: string, fallback?: string) => string;
  isMultiField?: boolean;
  fieldsByName: Record<string, FormField>;
  orgProfileStyles?: any;
}

const ViewFieldDisplay: React.FC<ViewFieldDisplayProps> = ({
  field,
  values,
  optionsMap,
  t,
  isMultiField,
  fieldsByName,
  orgProfileStyles,
}) => {
  const targetField = field.name ? fieldsByName[field.name] : undefined;

  const label = targetField?.label
    ? t(
        targetField.label.key.includes('.')
          ? targetField.label.key
          : `admin.users.createUser.${targetField.label.key}`,
        targetField.label.fallback,
      )
    : field.name ?? '-';

  let rawValue = field.name ? values[field.name] : undefined;
  if (!rawValue && targetField?.defaultValue) {
    rawValue = targetField.defaultValue;
  }

  let displayValue: string = rawValue || '-';
  const isNoDoc = !rawValue && targetField?.type === FORM_FIELD_TYPES.FILE_UPLOAD;
  if (isNoDoc) {
    displayValue = t('organizationProfile.noDocumentUploaded');
  } else if (targetField?.optionsSource) {
    const option = optionsMap[targetField.optionsSource]?.find(
      o => o.value === rawValue,
    );
    displayValue = option?.label || rawValue || '-';
  }
  displayValue = displayValue.replace(/_/g, '-');

  const orgStyles = orgProfileStyles;

  const getFieldLabelStyle = () => {
    if (!orgStyles) return undefined;
    if (field.name === 'specificTrainingAreas') {
      return orgStyles.orgProfileSpecificTrainingAreasTitle;
    }
    if (field.name === 'assetTypes') {
      return orgStyles.orgProfileAssetTypesTitle;
    }
    return orgStyles.orgProfileFieldLabel;
  };

  const labelStyle = getFieldLabelStyle() ?? {
    ...TYPOGRAPHY.caption,
    color: '$textMutedForeground',
  };

  const valueStyle = isNoDoc
    ? {
        ...(orgStyles?.orgProfileFieldValue ?? { ...TYPOGRAPHY.bodySmall }),
        color: '$textMutedForeground',
      }
    : (orgStyles?.orgProfileFieldValue ?? { ...TYPOGRAPHY.bodySmall, color: '$textForeground' });

  return (
    <VStack
      space="xs"
      flex={isMultiField ? 1 : undefined}
      width={!isMultiField ? '100%' : undefined}
    >
      <Text {...labelStyle}>
        {label}
        {targetField?.required && field.name !== 'supportCategories' && (
          <Text {...(orgStyles?.orgProfileRequiredAsterisk ?? { color: '$red500' })}> *</Text>
        )}
      </Text>
      <Text {...valueStyle}>
        {displayValue}
      </Text>
    </VStack>
  );
};

const FieldContainer = memo(
  ({
    field,
    isMultiField,
    values = {},
    errors = {},
    optionsMap = {},
    mode = '',
    t = (e: any) => e,
    disabled = false,
    visibilityGroups = {},
    toggleVisibilityGroup = () => {},
    firstNameRef,
    fieldsByName = {},
    registerFieldRef,
    highlightedField,
    inputProps,
    selectProps,
    orgProfileStyles,
    onFieldChange = (...e: any[]) => {
      console.log(e);
    },
  }: any) => {
    const value = field.name ? values[field.name] ?? '' : '';
    const error = field.name ? errors[field.name] : undefined;
    const isHighlighted = !!field.name && highlightedField === field.name;
    const containerRef = (node: any) => {
      if (field.name) registerFieldRef?.(field.name, node);
    };

    const subTextDef = field.subTitle ?? field.subtitle;
    const orgStyles = orgProfileStyles;
    const showRequiredAsterisk = field.required;

    const getFieldLabelStyle = () => {
      if (!orgStyles) return undefined;
      if (field.name === 'specificTrainingAreas') {
        return orgStyles.orgProfileSpecificTrainingAreasTitle;
      }
      if (field.name === 'assetTypes') {
        return orgStyles.orgProfileAssetTypesTitle;
      }
      return orgStyles.orgProfileFieldLabel;
    };

    const labelStyle = getFieldLabelStyle() ?? {
      ...TYPOGRAPHY.bodySmall,
      color: '$textForeground',
      fontWeight: '$medium',
    };

    if (field.type === FORM_FIELD_TYPES.VIEW) {
      const element = (
        <ViewFieldDisplay
          field={field}
          values={values}
          optionsMap={optionsMap}
          t={t}
          isMultiField={isMultiField}
          fieldsByName={fieldsByName}
          orgProfileStyles={orgProfileStyles}
        />
      );
      if (orgStyles) {
        if (field.name === 'specificTrainingAreas') {
          return (
            <Box {...orgStyles.orgProfileSpecificTrainingAreasContainer}>
              {element}
            </Box>
          );
        }
        if (field.name === 'assetTypes') {
          return (
            <Box {...orgStyles.orgProfileAssetTypesContainer}>
              {element}
            </Box>
          );
        }
      }
      return element;
    }

    let element: React.ReactNode = null;

    if (mode === 'preview') {
      if (field.type === FORM_FIELD_TYPES.NOTE) {
        return null;
      }

      if (orgStyles && field.type === FORM_FIELD_TYPES.CHECKBOX_GROUP) {
        const isCheckboxCardView =
          field.name === 'supportCategories' ||
          field.name === 'specificTrainingAreas' ||
          field.name === 'assetTypes';

        const opts =
          ((field as any).options && (field as any).options.length > 0)
            ? (field as any).options
            : (field.optionsSource ? (optionsMap[field.optionsSource] ?? []) : []);

        const selectedValues = (value || '')
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean);

        const selectedSet = new Set(selectedValues);

        if (isCheckboxCardView) {
          const containerProps = orgStyles?.orgProfileCheckboxContainer ?? { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: '$2' };
          const itemStyle = getCheckboxItemStyle(field.name || '', false, orgStyles) ?? (orgStyles?.orgProfileCheckboxItem ?? { minWidth: '22%', flexShrink: 1 });

          const hasGroups = opts.some((o: any) => !!o.group);

          element = (
            <VStack
              ref={containerRef}
              space="xs"
              flex={isMultiField ? 1 : undefined}
              width={!isMultiField ? '100%' : undefined}
            >
              <Text {...labelStyle}>
                {t(
                  field.label.key.includes('.')
                    ? field.label.key
                    : `admin.users.createUser.${field.label.key}`,
                  field.label.fallback,
                )}
                {showRequiredAsterisk && field.name !== 'supportCategories' && (
                  <Text {...(orgStyles?.orgProfileRequiredAsterisk ?? { color: '$red500' })}> *</Text>
                )}
              </Text>

              {!!subTextDef && (
                <Text {...(orgStyles?.orgProfileFieldSubTitle ?? { ...TYPOGRAPHY.caption, color: '$textMutedForeground' })}>
                  {t(
                    subTextDef.key.includes('.')
                      ? subTextDef.key
                      : `admin.users.createUser.${subTextDef.key}`,
                    subTextDef.fallback,
                  )}
                </Text>
              )}

              {hasGroups ? (
                <VStack space="sm" width="100%" mt="$1">
                  {Object.entries(
                    opts.reduce((acc: Record<string, any[]>, opt: any) => {
                      const gName = opt.group || 'OTHER';
                      if (!acc[gName]) acc[gName] = [];
                      acc[gName].push(opt);
                      return acc;
                    }, {})
                  ).map(([groupTitle, groupOpts]) => (
                    <VStack key={groupTitle} space="xs" width="100%" mb="$1">
                      <Text
                        fontSize="$xs"
                        fontWeight="$bold"
                        color="$textMutedForeground"
                        textTransform="uppercase"
                        letterSpacing={0.5}
                        mt="$1"
                        mb="$1"
                      >
                        {groupTitle}
                      </Text>
                      <Box {...containerProps}>
                        {groupOpts.map((opt: any) => {
                          const isChecked = selectedSet.has(opt.value);
                          const cardProps = isChecked
                            ? (orgStyles?.orgProfileCheckboxCheckedCard ?? { bg: '$primary50', borderColor: '$primary500', borderWidth: 1, borderRadius: 10, px: '$3', py: '$2' })
                            : (orgStyles?.orgProfileCheckboxCard ?? { bg: '$white', borderColor: '$borderLight200', borderWidth: 1, borderRadius: 10, px: '$3', py: '$2' });
                          const textProps = getCheckboxTextStyles(field.name || '', isChecked, orgStyles) ?? (isChecked
                            ? (orgStyles?.orgProfileCheckboxCheckedText ?? { fontSize: '$xs', color: '$primary500', fontWeight: '$medium' })
                            : (orgStyles?.orgProfileCheckboxText ?? { fontSize: '$xs', color: '$textForeground', fontWeight: '$normal' }));
                          const boxProps = isChecked
                            ? (orgStyles?.orgProfileCheckboxCheckedBox ?? { width: 16, height: 16, borderRadius: 3, borderWidth: 0, borderColor: 'transparent', bg: '$primary500', alignItems: 'center', justifyContent: 'center' })
                            : (orgStyles?.orgProfileCheckboxBox ?? { width: 16, height: 16, borderRadius: 3, borderWidth: 1, borderColor: '$borderLight300', bg: '$white', alignItems: 'center', justifyContent: 'center' });

                          return (
                            <Box
                              key={opt.value}
                              style={itemStyle}
                            >
                              <HStack
                                space="sm"
                                alignItems="center"
                                {...cardProps}
                              >
                                <Box {...boxProps}>
                                  {isChecked && (
                                    <LucideIcon name="Check" size={11} color="white" />
                                  )}
                                </Box>
                                <Text
                                  {...textProps}
                                  flex={1}
                                >
                                  {opt.label}
                                </Text>
                              </HStack>
                            </Box>
                          );
                        })}
                      </Box>
                    </VStack>
                  ))}
                </VStack>
              ) : (
                <Box {...containerProps} mt="$1">
                  {opts.map((opt: any) => {
                    const isChecked = selectedSet.has(opt.value);
                    const cardProps = isChecked
                      ? (orgStyles?.orgProfileCheckboxCheckedCard ?? { bg: '$primary50', borderColor: '$primary500', borderWidth: 1, borderRadius: 10, px: '$3', py: '$2' })
                      : (orgStyles?.orgProfileCheckboxCard ?? { bg: '$white', borderColor: '$borderLight200', borderWidth: 1, borderRadius: 10, px: '$3', py: '$2' });
                    const textProps = getCheckboxTextStyles(field.name || '', isChecked, orgStyles) ?? (isChecked
                      ? (orgStyles?.orgProfileCheckboxCheckedText ?? { fontSize: '$xs', color: '$primary500', fontWeight: '$medium' })
                      : (orgStyles?.orgProfileCheckboxText ?? { fontSize: '$xs', color: '$textForeground', fontWeight: '$normal' }));
                    const boxProps = isChecked
                      ? (orgStyles?.orgProfileCheckboxCheckedBox ?? { width: 16, height: 16, borderRadius: 3, borderWidth: 0, borderColor: 'transparent', bg: '$primary500', alignItems: 'center', justifyContent: 'center' })
                      : (orgStyles?.orgProfileCheckboxBox ?? { width: 16, height: 16, borderRadius: 3, borderWidth: 1, borderColor: '$borderLight300', bg: '$white', alignItems: 'center', justifyContent: 'center' });

                    return (
                      <Box
                        key={opt.value}
                        style={itemStyle}
                      >
                        <HStack
                          space="sm"
                          alignItems="center"
                          {...cardProps}
                        >
                          <Box {...boxProps}>
                            {isChecked && (
                              <LucideIcon name="Check" size={11} color="white" />
                            )}
                          </Box>
                          <Text
                            {...textProps}
                            flex={1}
                          >
                            {opt.label}
                          </Text>
                        </HStack>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </VStack>
          );
        } else {
          const optionsByVal: Record<string, string> = {};
          opts.forEach((o: any) => {
            optionsByVal[o.value] = o.label;
          });

          const pillBadges = selectedValues.map((v: string) => optionsByVal[v] || v);

          element = (
            <VStack
              ref={containerRef}
              space="xs"
              flex={isMultiField ? 1 : undefined}
              width={!isMultiField ? '100%' : undefined}
            >
              <Text {...labelStyle}>
                {t(
                  field.label.key.includes('.')
                    ? field.label.key
                    : `admin.users.createUser.${field.label.key}`,
                  field.label.fallback,
                )}
                {showRequiredAsterisk && field.name !== 'supportCategories' && (
                  <Text {...(orgStyles?.orgProfileRequiredAsterisk ?? { color: '$red500' })}> *</Text>
                )}
              </Text>

              {!!subTextDef && (
                <Text {...(orgStyles?.orgProfileFieldSubTitle ?? { ...TYPOGRAPHY.caption, color: '$textMutedForeground' })}>
                  {t(
                    subTextDef.key.includes('.')
                      ? subTextDef.key
                      : `admin.users.createUser.${subTextDef.key}`,
                    subTextDef.fallback,
                  )}
                </Text>
              )}

              {pillBadges.length > 0 ? (
                <HStack space="xs" flexWrap="wrap" mt="$1">
                  {pillBadges.map((badgeText: string, idx: number) => (
                    <HoverablePill
                      key={`${badgeText}-${idx}`}
                      badgeText={badgeText}
                      fieldName={field.name}
                      orgProfileStyles={orgStyles}
                    />
                  ))}
                </HStack>
              ) : (
                <Text {...(orgStyles?.orgProfileFieldValue ?? { ...TYPOGRAPHY.bodySmall, color: '$textForeground' })}>
                  -
                </Text>
              )}
            </VStack>
          );
        }
      } else {
        let displayValue = value || '-';
        const isNoDoc = !value && field.type === FORM_FIELD_TYPES.FILE_UPLOAD;
        if (isNoDoc) {
          displayValue = t('organizationProfile.noDocumentUploaded');
        }

        if (field.optionsSource) {
          const option = optionsMap[field.optionsSource]?.find(
            (o: any) => o.value === value,
          );

          displayValue = option?.label || value || '-';
        }

        displayValue =
          typeof displayValue === 'string'
            ? displayValue.replace(/_/g, '-')
            : String(displayValue);

        element = (
          <VStack
            ref={containerRef}
            space="xs"
            flex={isMultiField ? 1 : undefined}
            width={!isMultiField ? '100%' : undefined}
          >
            <Text {...labelStyle}>
              {t(
                field.label.key.includes('.')
                  ? field.label.key
                  : `admin.users.createUser.${field.label.key}`,
                field.label.fallback,
              )}
              {showRequiredAsterisk && (
                <Text {...(orgStyles?.orgProfileRequiredAsterisk ?? { color: '$red500' })}> *</Text>
              )}
            </Text>

            {!!subTextDef && (
              <Text {...(orgStyles?.orgProfileFieldSubTitle ?? { ...TYPOGRAPHY.caption, color: '$textMutedForeground' })}>
                {t(
                  subTextDef.key.includes('.')
                    ? subTextDef.key
                    : `admin.users.createUser.${subTextDef.key}`,
                  subTextDef.fallback,
                )}
              </Text>
            )}

            <HStack space="xs" alignItems="center">
              {!!field.icon && (
                <LucideIcon
                  name={field.icon as any}
                  size={14}
                  color="$textMutedForeground"
                />
              )}
              <Text
                {...(isNoDoc
                  ? {
                      ...(orgStyles?.orgProfileFieldValue ?? { ...TYPOGRAPHY.bodySmall }),
                      color: '$textMutedForeground',
                    }
                  : (orgStyles?.orgProfileFieldValue ?? { ...TYPOGRAPHY.bodySmall, color: '$textForeground' }))}
              >
                {displayValue}
              </Text>
            </HStack>
          </VStack>
        );
      }
    } else {
      element = (
        <VStack
          ref={containerRef}
          space="xs"
          flex={isMultiField ? 1 : undefined}
          width={!isMultiField ? '100%' : undefined}
          p={isHighlighted ? '$2' : undefined}
          borderRadius={isHighlighted ? '$md' : undefined}
          bg={isHighlighted ? '$warning100' : undefined}
        >
          {field.type !== FORM_FIELD_TYPES.NOTE && (
            <>
              <Text {...labelStyle}>
                {t(
                  field.label.key.includes('.')
                    ? field.label.key
                    : `admin.users.createUser.${field.label.key}`,
                  field.label.fallback,
                )}
                {field.required && (
                  <Text {...(orgStyles?.orgProfileRequiredAsterisk ?? { color: '$red500' })}> *</Text>
                )}
              </Text>
              {!!subTextDef && (
                <Text {...(orgStyles?.orgProfileFieldSubTitle ?? { ...TYPOGRAPHY.caption, color: '$textMutedForeground' })}>
                  {t(
                    subTextDef.key.includes('.')
                      ? subTextDef.key
                      : `admin.users.createUser.${subTextDef.key}`,
                    subTextDef.fallback,
                  )}
                </Text>
              )}
              {!!field.hint && <HintDisplay hint={field.hint} t={t} />}
            </>
          )}

          <FieldRenderer
            field={field}
            value={value}
            error={error}
            errors={errors}
            onChange={onFieldChange}
            disabled={disabled}
            optionsMap={optionsMap}
            values={values}
            t={t}
            visibilityGroups={visibilityGroups}
            toggleVisibilityGroup={toggleVisibilityGroup}
            autoFocusRef={firstNameRef}
            inputProps={inputProps}
            selectProps={selectProps}
            orgProfileStyles={orgProfileStyles}
          />

          {error && (
            <Text color="$error600" fontSize="$xs">
              {error}
            </Text>
          )}
        </VStack>
      );
    }

    if (orgStyles) {
      if (field.name === 'specificTrainingAreas') {
        return (
          <Box {...orgStyles.orgProfileSpecificTrainingAreasContainer}>
            {element}
          </Box>
        );
      }
      if (field.name === 'assetTypes') {
        return (
          <Box {...orgStyles.orgProfileAssetTypesContainer}>
            {element}
          </Box>
        );
      }
    }

    return element;
  },
);
