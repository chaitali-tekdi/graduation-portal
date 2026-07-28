/**
 * ASSETS_FORM_SCHEMA
 *
 * Single schema for the Assets (Asset Support) form.
 * Every field is declared here; each section carries a `tab` property
 * that maps it to the currently active tab:
 *
 *   'assetDetails'   → Asset Details tab (step 1)
 *
 * The consumer filters sections by `tab === activeTab` before passing
 * them to SchemaFormRenderer or validateSchema.
 */

import type { FormSection } from '@constants/CREATE_USER_FORM_SCHEMA';

export const ASSETS_FORM_SCHEMA: (FormSection & { tab: string })[] = [
  // ─── Tab: Asset Details ───────────────────────────────────────────────────

  {
    tab: 'assetDetails',
    id: 'assetLocation',
    icon: 'MapPin',
    title: { key: 'assetLocation', fallback: 'Location' },
    rows: [
      {
        fields: [
          {
            name: 'province',
            type: 'select',
            required: true,
            label: { key: 'province', fallback: 'Province' },
            placeholder: { fallback: 'Select province' },
            optionsSource: 'provinces',
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.provinceRequired', fallback: 'Province is required' },
              },
            ],
          },
          {
            name: 'site',
            type: 'select',
            required: true,
            label: { key: 'site', fallback: 'Site' },
            placeholder: { fallback: 'Select province first' },
            placeholderWhenReady: { key: 'sitePlaceholderReady', fallback: 'Select site' },
            optionsSource: 'sites',
            dependsOn: 'province',
            disabledWhen: { field: 'province', empty: true },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.siteRequired', fallback: 'Site is required' },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    tab: 'assetDetails',
    id: 'assetTypeDetails',
    icon: 'Package',
    title: { key: 'assetTypeDetails', fallback: 'Asset Type' },
    rows: [
      {
        fields: [
          {
            name: 'assetType',
            type: 'pills' as any,
            required: true,
            label: { key: 'assetType', fallback: 'Asset Type' },
            optionsSource: 'assetTypeOptions',
            defaultValue: 'Cash',
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.assetTypeRequired', fallback: 'Asset type is required' },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'livelihoodCategory',
            type: 'text',
            required: true,
            label: { key: 'livelihoodCategory', fallback: 'Category of Livelihoods' },
            placeholder: { fallback: 'Select livelihood category' },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.livelihoodCategoryRequired',
                  fallback: 'Livelihood category is required',
                },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    tab: 'assetDetails',
    id: 'assetContent',
    icon: 'FileText',
    title: { key: 'assetContent', fallback: 'Asset Details' },
    rows: [
      {
        fields: [
          {
            name: 'assetTitle',
            type: 'text',
            required: true,
            label: { key: 'assetTitle', fallback: 'Asset Title' },
            placeholder: { fallback: 'Name of this asset...' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.assetTitleRequired', fallback: 'Asset title is required' },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'assetDescription',
            type: 'textarea',
            required: true,
            label: { key: 'assetDescription', fallback: 'Asset Description' },
            placeholder: {
              fallback:
                'Describe this asset, its purpose, and how it benefits the recipient...',
            },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.assetDescriptionRequired',
                  fallback: 'Asset description is required',
                },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'estimatedValue',
            type: 'text',
            required: true,
            label: { key: 'estimatedValue', fallback: 'Estimated Asset Value (Rands)' },
            placeholder: { fallback: 'R 0.00' },
            inputProps: { keyboardType: 'numeric' },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.estimatedValueRequired',
                  fallback: 'Estimated value is required',
                },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    tab: 'assetDetails',
    id: 'assetAvailability',
    icon: 'Calendar',
    title: { key: 'assetAvailability', fallback: 'Availability (optional)' },
    rows: [
      {
        fields: [
          {
            name: 'startDate',
            type: 'date',
            required: false,
            label: { key: 'startDate', fallback: 'Start Date' },
            placeholder: { fallback: 'dd/mm/yyyy' },
          },
          {
            name: 'startTime',
            type: 'text',
            required: false,
            label: { key: 'startTime', fallback: 'Start Time' },
            placeholder: { fallback: '--:--' },
          },
        ],
      },
      {
        fields: [
          {
            name: 'endDate',
            type: 'date',
            required: false,
            label: { key: 'endDate', fallback: 'End Date' },
            placeholder: { fallback: 'dd/mm/yyyy' },
          },
          {
            name: 'endTime',
            type: 'text',
            required: false,
            label: { key: 'endTime', fallback: 'End Time' },
            placeholder: { fallback: '--:--' },
          },
        ],
      },
    ],
  },
];
