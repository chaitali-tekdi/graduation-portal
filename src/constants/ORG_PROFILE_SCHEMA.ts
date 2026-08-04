/**
 * ORG_PROFILE_SCHEMA
 *
 * Schema-driven definition for the Organisation Profile page (Service Provider role).
 * Used by SchemaFormRenderer in both view (preview) and edit modes.
 *
 * Field names must match the mapping used in OrgProfileView's loadProfile / buildPayload.
 * To change the API field mapping, update those functions — no changes here are required.
 *
 * Static options (Provider Type, Province, Support Categories, Asset Types) are defined
 * inline so SchemaFormRenderer can render checkboxes without an async optionsMap call.
 */


import { FORM_FIELD_TYPES, FormSection } from '@constants/CREATE_USER_FORM_SCHEMA';

export const ORG_PROFILE_SCHEMA: FormSection[] = [
  // ─── Basic Information ────────────────────────────────────────────────────
  {
    id: 'basicInformation',
    type: 'section',
    icon: 'Building2',
    title: { key: 'basicInformation', fallback: 'Basic Information' },
    rows: [
      {
        fields: [
          {
            name: 'supportProviderName',
            type: FORM_FIELD_TYPES.TEXT,
            required: true,
            label: { key: 'supportProviderName', fallback: 'Support Provider Name' },
            placeholder: { fallback: 'Enter support provider name' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.supportProviderNameRequired', fallback: 'Support provider name is required.' },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'providerType',
            type: FORM_FIELD_TYPES.SELECT,
            required: true,
            label: { key: 'providerType', fallback: 'Provider Type' },
            placeholder: { fallback: 'Select provider type' },
            optionsSource: 'providerType',
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.providerTypeRequired', fallback: 'Provider type is required.' },
              },
            ],
          },
        ],
      },
    ],
  },

  // ─── Contact Person ───────────────────────────────────────────────────────
  {
    id: 'contactPerson',
    type: 'section',
    icon: 'User',
    title: { key: 'contactPerson', fallback: 'Contact Person' },
    rows: [
      {
        fields: [
          {
            name: 'contactPersonName',
            type: FORM_FIELD_TYPES.TEXT,
            required: true,
            label: { key: 'contactPersonName', fallback: 'Contact Person (Focal Person)' },
            placeholder: { fallback: 'Enter contact person name' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.contactPersonRequired', fallback: 'Contact person name is required.' },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'email',
            type: FORM_FIELD_TYPES.EMAIL,
            required: true,
            icon: 'Mail',
            label: { key: 'email', fallback: 'Email' },
            placeholder: { fallback: 'Enter email address' },
            inputProps: { keyboardType: 'email-address', autoCapitalize: 'none' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.emailRequired', fallback: 'Email is required.' },
              },
              {
                rule: 'email',
                message: { key: 'errors.emailInvalid', fallback: 'Enter a valid email address.' },
              },
            ],
          },
          {
            name: 'phone',
            type: FORM_FIELD_TYPES.TEL,
            required: true,
            icon: 'Phone',
            label: { key: 'phone', fallback: 'Phone' },
            placeholder: { fallback: 'Enter phone number' },
            inputProps: { keyboardType: 'phone-pad' },
          },
        ],
      },
    ],
  },

  // ─── Coverage ─────────────────────────────────────────────────────────────
  {
    id: 'coverage',
    type: 'section',
    icon: 'MapPin',
    title: { key: 'coverage', fallback: 'Coverage' },
    rows: [
      {
        fields: [
          {
            name: 'province',
            type: FORM_FIELD_TYPES.SELECT,
            required: true,
            optionsSource: 'provinces',
            label: { key: 'province', fallback: 'Province' },
            subHeader: { key: 'provinceSubtitle', fallback: 'Provinces where they operate' },
            placeholder: { fallback: 'Select provinces' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.provinceRequired', fallback: 'Please select at least one province.' },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'siteCoverage',
            type: FORM_FIELD_TYPES.SELECT,
            required: true,
            optionsSource: 'sites',
            label: { key: 'siteCoverage', fallback: 'Site Coverage' },
            subHeader: { key: 'siteCoverageSubtitle', fallback: 'Sites where they operate' },
            placeholder: { fallback: 'Select sites' },
            // Sites are loaded dynamically via optionsMap['sites'] from the parent component.
            // The static options array here is intentionally empty.
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.siteCoverageRequired', fallback: 'Please select at least one site.' },
              },
            ],
          },
        ],
      },
    ],
  },

  // ─── Support Categories Offered ───────────────────────────────────────────
  {
    id: 'supportCategories',
    type: 'section',
    icon: 'Tag',
    title: { key: 'supportCategoriesOffered', fallback: 'Support Categories Offered' },
    rows: [
      {
        fields: [
          {
            name: 'supportCategories',
            type: FORM_FIELD_TYPES.SELECT,
            required: true,
            label: { key: 'supportCategories', fallback: 'Support Categories' },
            subHeader: { key: 'supportCategoriesSubtitle', fallback: 'Select all that apply' },
            optionsSource: 'supportCategories',
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.supportCategoriesRequired', fallback: 'Please select at least one category.' },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'specificTrainingAreas',
            type: FORM_FIELD_TYPES.SELECT,
            required: false,
            label: { key: 'specificTrainingAreas', fallback: 'Specific Training Areas' },
            optionsSource: 'specificTrainingAreas',
          },
        ],
      },
      {
        fields: [
          {
            name: 'assetTypes',
            type: FORM_FIELD_TYPES.SELECT,
            required: false,
            label: { key: 'assetTypes', fallback: 'Asset Types' },
            optionsSource: 'assetTypes',
          },
        ],
      },
    ],
  },

  // ─── Documents ────────────────────────────────────────────────────────────
  {
    id: 'documents',
    type: 'section',
    icon: 'FileText',
    title: { key: 'documents', fallback: 'Documents' },
    rows: [
      {
        fields: [
          {
            name: 'agreementMou',
            type: FORM_FIELD_TYPES.FILE_UPLOAD,
            required: false,
            label: { key: 'agreementMou', fallback: 'Agreement / MoU' },
            subHeader: { key: 'agreementMouSubtitle', fallback: 'Upload if applicable' },
            placeholder: { fallback: 'Click to upload PDF / DOC / JPG' },
          },
        ],
      },
      {
        fields: [
          {
            name: 'orgCredentials',
            type: FORM_FIELD_TYPES.FILE_UPLOAD,
            required: false,
            label: { key: 'orgCredentials', fallback: 'Organisation Credentials' },
            subHeader: { key: 'orgCredentialsSubtitle', fallback: 'Certificates, Portfolio, etc.' },
            placeholder: { fallback: 'Click to upload PDF / DOC / JPG' },
          },
        ],
      },
    ],
  },
];