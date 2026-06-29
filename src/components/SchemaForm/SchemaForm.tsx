import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  InputSlot,
  InputIcon,
  Button,
  ButtonText,
  Pressable,
  Select,
  MailIcon,
  PhoneIcon,
  CalendarDaysIcon,
  LockIcon,
  GlobeIcon,
  InfoIcon,
  SettingsIcon,
  EyeIcon,
  EyeOffIcon,
} from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { usePlatform } from '@utils/platform';
import {
  getMatchFieldDependents,
  isConditionMet,
  localize,
  validateField,
} from '@utils/formValidation';
import type {
  FormField,
  FormFlags,
  FormSchema,
  FormValues,
  LocalizedText,
  OptionsSources,
} from '@app-types/formSchema';
import { schemaFormStyles as styles } from './Styles';

/** Maps the schema's icon names to the gluestack icon components we ship. */
const ICON_MAP: Record<string, any> = {
  Mail: MailIcon,
  Phone: PhoneIcon,
  Calendar: CalendarDaysIcon,
  Shield: LockIcon,
  Lock: LockIcon,
  MapPin: GlobeIcon,
  User: SettingsIcon,
  FileText: InfoIcon,
};

const resolveIcon = (name?: string): any =>
  name ? ICON_MAP[name] ?? InfoIcon : undefined;

/** Default native input props derived from a field's `type`. */
const typeInputDefaults = (
  type: FormField['type'],
): {
  keyboardType?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
} => {
  switch (type) {
    case 'email':
      return { keyboardType: 'email-address', autoCapitalize: 'none' };
    case 'tel':
      return { keyboardType: 'phone-pad' };
    case 'number':
      return { keyboardType: 'numeric' };
    default:
      return {};
  }
};

export interface SchemaFormProps {
  /** The form definition: an array of sections. */
  schema: FormSchema;
  /** Named option lists for select fields (static array or value-derived fn). */
  optionsSources?: OptionsSources;
  /** Boolean flags referenced by `visibleWhen.flag`. */
  flags?: FormFlags;
  initialValues?: FormValues;
  submitLabel?: LocalizedText | string;
  onSubmit: (values: FormValues) => void;
  onChange?: (values: FormValues) => void;
}

const SchemaForm: React.FC<SchemaFormProps> = ({
  schema,
  optionsSources = {},
  flags = {},
  initialValues = {},
  submitLabel,
  onSubmit,
  onChange,
}) => {
  const { t } = useLanguage();
  const { isMobile } = usePlatform();

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  // Flatten the schema once to build lookup maps for cross-field behaviour.
  const allFields = useMemo<FormField[]>(
    () => schema.flatMap(section => section.rows.flatMap(row => row.fields)),
    [schema],
  );

  const fieldByName = useMemo(() => {
    const map: Record<string, FormField> = {};
    allFields.forEach(field => (map[field.name] = field));
    return map;
  }, [allFields]);

  // field name -> names of select fields that depend on it (to reset on change).
  const dependentsOf = useMemo(() => {
    const map: Record<string, string[]> = {};
    allFields.forEach(field => {
      if (field.dependsOn) {
        (map[field.dependsOn] ??= []).push(field.name);
      }
    });
    return map;
  }, [allFields]);

  // field name -> names of fields whose `matchField` rule references it.
  const matchDependentsOf = useMemo(() => {
    const map: Record<string, string[]> = {};
    allFields.forEach(field => {
      getMatchFieldDependents(allFields, field.name).forEach(dep => {
        (map[field.name] ??= []).push(dep);
      });
    });
    return map;
  }, [allFields]);

  const passwordKey = useCallback(
    (field: FormField) => field.visibilityToggleGroup ?? field.name,
    [],
  );

  const getOptions = useCallback(
    (field: FormField, currentValues: FormValues) => {
      if (!field.optionsSource) {
        return [];
      }
      const source = optionsSources[field.optionsSource];
      if (!source) {
        return [];
      }
      return typeof source === 'function' ? source(currentValues) : source;
    },
    [optionsSources],
  );

  const handleChange = useCallback(
    (field: FormField, value: string) => {
      const next: FormValues = { ...values, [field.name]: value };
      // Reset any select that depends on this field (e.g. site <- province).
      dependentsOf[field.name]?.forEach(dep => {
        next[dep] = '';
      });
      setValues(next);

      setErrors(prev => {
        const updated = { ...prev };
        if (touched[field.name]) {
          updated[field.name] = validateField(field, value, next, t) ?? '';
        }
        matchDependentsOf[field.name]?.forEach(depName => {
          const depField = fieldByName[depName];
          if (depField && touched[depName]) {
            updated[depName] =
              validateField(depField, next[depName] ?? '', next, t) ?? '';
          }
        });
        return updated;
      });

      onChange?.(next);
    },
    [
      values,
      touched,
      dependentsOf,
      matchDependentsOf,
      fieldByName,
      t,
      onChange,
    ],
  );

  const handleBlur = useCallback(
    (field: FormField) => {
      setTouched(prev => ({ ...prev, [field.name]: true }));
      setErrors(prev => ({
        ...prev,
        [field.name]:
          validateField(field, values[field.name] ?? '', values, t) ?? '',
      }));
    },
    [values, t],
  );

  const handleSubmit = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    const nextTouched: Record<string, boolean> = {};

    schema.forEach(section => {
      if (!isConditionMet(section.visibleWhen, values, flags)) {
        return;
      }
      section.rows.forEach(row => {
        if (!isConditionMet(row.visibleWhen, values, flags)) {
          return;
        }
        row.fields.forEach(field => {
          if (!isConditionMet(field.visibleWhen, values, flags)) {
            return;
          }
          nextTouched[field.name] = true;
          const message = validateField(
            field,
            values[field.name] ?? '',
            values,
            t,
          );
          if (message) {
            nextErrors[field.name] = message;
          }
        });
      });
    });

    setTouched(prev => ({ ...prev, ...nextTouched }));
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values);
    }
  }, [schema, values, flags, t, onSubmit]);

  const renderField = (field: FormField) => {
    const error = touched[field.name] ? errors[field.name] : undefined;
    const value = values[field.name] ?? '';
    const label = localize(field.label, t);
    const zIndexStyle = field.zIndex ? { zIndex: field.zIndex } : undefined;

    const labelNode = label ? (
      <Text {...styles.label}>
        {label}
        {field.required ? <Text {...styles.requiredMark}> *</Text> : null}
      </Text>
    ) : null;

    const errorNode = error ? (
      <Text {...styles.errorText}>{error}</Text>
    ) : null;

    let control: React.ReactNode;

    if (field.type === 'select') {
      const disabled = isConditionMet(field.disabledWhen, values, flags);
      const ready = field.dependsOn
        ? (values[field.dependsOn] ?? '').trim() !== ''
        : true;
      const placeholder = localize(
        ready && field.placeholderWhenReady
          ? field.placeholderWhenReady
          : field.placeholder,
        t,
      );
      const options = disabled ? [] : getOptions(field, values);
      control = (
        <Box
          opacity={disabled ? 0.5 : 1}
          pointerEvents={disabled ? 'none' : 'auto'}
        >
          <Select
            options={options.map(option => ({
              value: option.value,
              name: option.label,
            }))}
            value={value}
            placeholder={placeholder}
            onChange={selected => handleChange(field, selected)}
          />
        </Box>
      );
    } else {
      const isPassword = field.type === 'password';
      const hidden = isPassword && !visiblePasswords[passwordKey(field)];
      const leadingIcon = resolveIcon(field.icon);
      const defaults = typeInputDefaults(field.type);
      control = (
        <Input
          isDisabled={false}
          {...(error ? { borderWidth: 1, borderColor: '$red500' } : {})}
        >
          {leadingIcon ? (
            <InputSlot pl="$3">
              <InputIcon as={leadingIcon} color="$textLight400" />
            </InputSlot>
          ) : null}
          <InputField
            value={value}
            onChangeText={(text: string) => handleChange(field, text)}
            onBlur={() => handleBlur(field)}
            placeholder={localize(field.placeholder, t)}
            autoFocus={field.autoFocus}
            secureTextEntry={isPassword ? hidden : undefined}
            keyboardType={
              (field.inputProps?.keyboardType ?? defaults.keyboardType) as any
            }
            autoCapitalize={
              field.inputProps?.autoCapitalize ?? defaults.autoCapitalize
            }
            maxLength={field.inputProps?.maxLength}
          />
          {isPassword && field.toggleVisibility ? (
            <InputSlot
              pr="$3"
              as={Pressable}
              onPress={() =>
                setVisiblePasswords(prev => ({
                  ...prev,
                  [passwordKey(field)]: !prev[passwordKey(field)],
                }))
              }
            >
              <InputIcon as={hidden ? EyeOffIcon : EyeIcon} />
            </InputSlot>
          ) : null}
        </Input>
      );
    }

    return (
      <VStack key={field.name} {...styles.fieldWrap} style={zIndexStyle}>
        {labelNode}
        {control}
        {errorNode}
      </VStack>
    );
  };

  const submitText =
    typeof submitLabel === 'string'
      ? submitLabel
      : localize(submitLabel, t) || t('common.submit');

  return (
    <VStack {...styles.container}>
      {schema.map(section => {
        if (!isConditionMet(section.visibleWhen, values, flags)) {
          return null;
        }
        const SectionIcon = resolveIcon(section.icon);
        return (
          <Box key={section.id} {...styles.section}>
            <HStack {...styles.sectionHeader}>
              {SectionIcon ? (
                <Box {...styles.sectionIconWrap}>
                  <SectionIcon color="$primary500" size="sm" />
                </Box>
              ) : null}
              <Text {...styles.sectionTitle}>
                {localize(section.title, t)}
              </Text>
            </HStack>

            <VStack space="md">
              {section.rows.map((row, rowIndex) => {
                if (!isConditionMet(row.visibleWhen, values, flags)) {
                  return null;
                }
                const visibleFields = row.fields.filter(field =>
                  isConditionMet(field.visibleWhen, values, flags),
                );
                if (visibleFields.length === 0) {
                  return null;
                }
                const Wrapper: any = isMobile ? VStack : HStack;
                return (
                  <Wrapper
                    key={`${section.id}-row-${rowIndex}`}
                    space="md"
                    style={
                      visibleFields.some(f => f.zIndex)
                        ? styles.rowElevated
                        : undefined
                    }
                  >
                    {visibleFields.map(renderField)}
                  </Wrapper>
                );
              })}
            </VStack>
          </Box>
        );
      })}

      <Button {...styles.submitButton} onPress={handleSubmit}>
        <ButtonText {...styles.submitButtonText}>{submitText}</ButtonText>
      </Button>
    </VStack>
  );
};

export default SchemaForm;
