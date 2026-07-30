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

import { FORM_FIELD_TYPES } from './CREATE_USER_FORM_SCHEMA';
import type { FormSection } from './CREATE_USER_FORM_SCHEMA';

export const ORG_PROFILE_SCHEMA: FormSection[] = [
  // ─── Basic Information ────────────────────────────────────────────────────
  {
    id: 'basicInformation',
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
            type: FORM_FIELD_TYPES.CHECKBOX_GROUP,
            required: true,
            label: { key: 'providerType', fallback: 'Provider Type' },
            placeholder: { fallback: 'Select provider type' },
            options: [
              { value: 'ngo', label: 'NGO' },
              { value: 'government_agency', label: 'Government agency' },
              { value: 'private_company', label: 'Private company' },
              { value: 'training_provider', label: 'Training provider' },
              { value: 'service_provider', label: 'Service provider' },
              { value: 'financial_institution', label: 'Financial institution' },
              { value: 'others', label: 'Others' },
            ],
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
            required: false,
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
    icon: 'MapPin',
    title: { key: 'coverage', fallback: 'Coverage' },
    rows: [
      {
        fields: [
          {
            name: 'province',
            type: FORM_FIELD_TYPES.CHECKBOX_GROUP,
            required: true,
            optionsSource: 'provinces',
            label: { key: 'province', fallback: 'Province' },
            subtitle: { key: 'provinceSubtitle', fallback: 'Provinces where they operate' },
            placeholder: { fallback: 'Select provinces' },
            options: [
              { value: 'eastern_cape', label: 'Eastern Cape' },
              { value: 'free_state', label: 'Free State' },
              { value: 'gauteng', label: 'Gauteng' },
              { value: 'kwazulu_natal', label: 'KwaZulu-Natal' },
              { value: 'limpopo', label: 'Limpopo' },
              { value: 'mpumalanga', label: 'Mpumalanga' },
              { value: 'north_west', label: 'North West' },
              { value: 'northern_cape', label: 'Northern Cape' },
              { value: 'western_cape', label: 'Western Cape' },
            ],
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
            type: FORM_FIELD_TYPES.CHECKBOX_GROUP,
            required: true,
            optionsSource: 'sites',
            label: { key: 'siteCoverage', fallback: 'Site Coverage' },
            subtitle: { key: 'siteCoverageSubtitle', fallback: 'Sites where they operate' },
            placeholder: { fallback: 'Select sites' },
            // Sites are loaded dynamically via optionsMap['sites'] from the parent component.
            // The static options array here is intentionally empty.
            options: [],
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
    icon: 'Tag',
    title: { key: 'supportCategoriesOffered', fallback: 'Support Categories Offered' },
    rows: [
      {
        fields: [
          {
            name: 'supportCategories',
            type: FORM_FIELD_TYPES.CHECKBOX_GROUP,
            required: true,
            label: { key: 'supportCategories', fallback: 'Support Categories' },
            subtitle: { key: 'supportCategoriesSubtitle', fallback: 'Select all that apply' },
            options: [
              { value: 'trainings_sessions', label: 'Trainings/Sessions' },
              { value: 'linkage_additional_services', label: 'Linkage to Additional Services' },
              { value: 'assets', label: 'Assets' },
              { value: 'others', label: 'Others' },
            ],
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
            type: FORM_FIELD_TYPES.CHECKBOX_GROUP,
            required: false,
            label: { key: 'specificTrainingAreas', fallback: 'Specific Training Areas' },
            options: [
              { value: 'personal_mastery_training', label: 'Personal Mastery Training' },
              { value: 'parenting_skills_training', label: 'Parenting Skills Training' },
              { value: 'gbv_awareness_session', label: 'GBV Awareness Session' },
              { value: 'substance_abuse_awareness', label: 'Substance Abuse Awareness Session' },
              { value: 'financial_literacy_training', label: 'Financial Literacy Training' },
              { value: 'generate_business_idea', label: 'Generate Your Business Idea Training' },
              { value: 'start_your_business', label: 'Start Your Business Training' },
              { value: 'diversification_strategy', label: 'Diversification Strategy' },
              { value: 'market_growth_strategy', label: 'Market Growth Strategy' },
              { value: 'livelihood_specific_training', label: 'Livelihood Specific Training' },
              { value: 'job_readiness_training', label: 'Job Readiness Training' },
              { value: 'technical_vocational_training', label: 'Technical/Vocational Training' },
              { value: 'work_placement', label: 'Work Placement' },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'assetTypes',
            type: FORM_FIELD_TYPES.CHECKBOX_GROUP,
            required: false,
            label: { key: 'assetTypes', fallback: 'Asset Types' },
            options: [
              { value: 'cash', label: 'Cash' },
              { value: 'in_kind', label: 'In-kind' },
              { value: 'voucher', label: 'Voucher' },
            ],
          },
        ],
      },
    ],
  },

  // ─── Documents ────────────────────────────────────────────────────────────
  {
    id: 'documents',
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
            subtitle: { key: 'agreementMouSubtitle', fallback: 'Upload if applicable' },
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
            subtitle: { key: 'orgCredentialsSubtitle', fallback: 'Certificates, Portfolio, etc.' },
            placeholder: { fallback: 'Click to upload PDF / DOC / JPG' },
          },
        ],
      },
    ],
  },
];
