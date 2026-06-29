/**
 * Type definitions for the schema-driven form renderer.
 *
 * A form is described by a `FormSchema` (an array of sections). Each section
 * contains rows, and each row contains one or more fields. Fields declare their
 * own type, labels, visibility conditions and field-level validation rules.
 */

/**
 * A piece of user-facing text that can be translated.
 * `key` is looked up via i18n; `fallback` is used when no translation exists.
 */
export interface LocalizedText {
  key?: string;
  fallback: string;
}

export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'select'
  | 'date'
  | 'password';

export type ValidationRule =
  | { rule: 'required'; message: LocalizedText }
  | { rule: 'maxLength'; value: number; message: LocalizedText }
  | { rule: 'minLength'; value: number; message: LocalizedText }
  | { rule: 'email'; message: LocalizedText }
  | { rule: 'pattern'; value: string; message: LocalizedText }
  | { rule: 'matchField'; value: string; message: LocalizedText }
  | { rule: 'dateNotInFuture'; message: LocalizedText };

/**
 * A condition used by `visibleWhen` / `disabledWhen`.
 * - `flag`: matches a boolean flag passed to the form (e.g. role-based flags).
 * - `field` + `empty`: evaluates against another field's emptiness.
 * - `field` + `equals`: evaluates against another field's value.
 */
export interface FieldCondition {
  flag?: string;
  field?: string;
  empty?: boolean;
  equals?: string | number | boolean;
}

export interface FieldInputProps {
  keyboardType?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
}

export interface FormField {
  name: string;
  type: FieldType;
  label?: LocalizedText;
  placeholder?: LocalizedText;
  /** Placeholder shown once a `dependsOn` field has a value. */
  placeholderWhenReady?: LocalizedText;
  required?: boolean;
  autoFocus?: boolean;
  icon?: string;
  zIndex?: number;
  searchable?: boolean;
  /** Key into the `optionsSources` map (select fields only). */
  optionsSource?: string;
  /** Name of the field this field's options depend on. */
  dependsOn?: string;
  disabledWhen?: FieldCondition;
  visibleWhen?: FieldCondition;
  toggleVisibility?: boolean;
  /** Fields sharing a group toggle their visibility together (passwords). */
  visibilityToggleGroup?: string;
  valueFormat?: string;
  displayFormat?: string;
  inputProps?: FieldInputProps;
  validation?: ValidationRule[];
}

export interface FormRow {
  visibleWhen?: FieldCondition;
  fields: FormField[];
}

export interface FormSection {
  id: string;
  icon?: string;
  title: LocalizedText;
  visibleWhen?: FieldCondition;
  rows: FormRow[];
}

export type FormSchema = FormSection[];

export interface SelectOption {
  value: string;
  label: string;
}

export type FormValues = Record<string, string>;

export type FormFlags = Record<string, boolean>;

/**
 * Options for a select field: either a static list or a function of the current
 * form values (used for dependent selects, e.g. sites filtered by province).
 */
export type OptionsResolver =
  | SelectOption[]
  | ((values: FormValues) => SelectOption[]);

export type OptionsSources = Record<string, OptionsResolver>;
