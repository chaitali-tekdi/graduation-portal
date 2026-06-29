/**
 * Field-level validation engine for the schema-driven form.
 *
 * Each field in the schema can declare a list of `ValidationRule`s. These
 * helpers evaluate those rules against the current value (and the other form
 * values, for cross-field rules such as `matchField`) and return a localized
 * error message for the first failing rule.
 */
import type {
  FieldCondition,
  FormField,
  FormFlags,
  FormValues,
  LocalizedText,
  ValidationRule,
} from '@app-types/formSchema';

type TranslateFn = (key: string, options?: { defaultValue?: string }) => string;

// Simple, pragmatic email matcher (kept intentionally permissive).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Resolve a `LocalizedText` to a string, preferring the i18n translation for
 * `key` and falling back to `fallback` when no translation function or key is
 * available.
 */
export const localize = (
  text: LocalizedText | undefined,
  t?: TranslateFn,
): string => {
  if (!text) {
    return '';
  }
  if (text.key && t) {
    return t(text.key, { defaultValue: text.fallback });
  }
  return text.fallback;
};

const isEmpty = (value: string): boolean =>
  value === undefined || value === null || value.trim() === '';

const isFutureDate = (value: string): boolean => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return parsed.getTime() > today.getTime();
};

/**
 * Returns true when the given rule is violated by `value`.
 */
const ruleFails = (
  rule: ValidationRule,
  value: string,
  values: FormValues,
): boolean => {
  switch (rule.rule) {
    case 'required':
      return isEmpty(value);
    case 'maxLength':
      return !isEmpty(value) && value.length > rule.value;
    case 'minLength':
      return !isEmpty(value) && value.length < rule.value;
    case 'email':
      return !isEmpty(value) && !EMAIL_REGEX.test(value);
    case 'pattern':
      return !isEmpty(value) && !new RegExp(rule.value).test(value);
    case 'matchField':
      return !isEmpty(value) && value !== (values[rule.value] ?? '');
    case 'dateNotInFuture':
      return !isEmpty(value) && isFutureDate(value);
    default:
      return false;
  }
};

/**
 * Validate a single field, returning the localized message for the first failing
 * rule or `undefined` when the field is valid.
 */
export const validateField = (
  field: FormField,
  value: string,
  values: FormValues,
  t?: TranslateFn,
): string | undefined => {
  if (!field.validation) {
    return undefined;
  }
  for (const rule of field.validation) {
    if (ruleFails(rule, value ?? '', values)) {
      return localize(rule.message, t);
    }
  }
  return undefined;
};

/**
 * Evaluate a visibility/disabled condition against the current values + flags.
 * Returns true when the condition holds (i.e. "show" for `visibleWhen`,
 * "disable" for `disabledWhen`).
 */
export const isConditionMet = (
  condition: FieldCondition | undefined,
  values: FormValues,
  flags: FormFlags,
): boolean => {
  if (!condition) {
    return true;
  }
  if (condition.flag !== undefined) {
    return Boolean(flags[condition.flag]);
  }
  if (condition.field !== undefined) {
    const fieldValue = values[condition.field] ?? '';
    if (condition.empty !== undefined) {
      const empty = fieldValue.trim() === '';
      return condition.empty ? empty : !empty;
    }
    if (condition.equals !== undefined) {
      return fieldValue === String(condition.equals);
    }
    return fieldValue.trim() !== '';
  }
  return true;
};

/**
 * Returns the list of field names whose `matchField` rule references `fieldName`.
 * Used to re-validate dependent fields (e.g. confirmPassword) when the
 * referenced field changes.
 */
export const getMatchFieldDependents = (
  fields: FormField[],
  fieldName: string,
): string[] =>
  fields
    .filter(field =>
      (field.validation ?? []).some(
        rule => rule.rule === 'matchField' && rule.value === fieldName,
      ),
    )
    .map(field => field.name);
