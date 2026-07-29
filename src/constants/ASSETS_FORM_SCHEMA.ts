/**
 * ASSETS_FORM_SCHEMA
 *
 * Schema for the Asset Support form — structured identically to TRAINING_FORM_SCHEMA.
 * Each top-level entry is a "tab" with a `children` array of FormSection rows.
 *
 *   Tab 1: 'assetDetails'  → Asset Details
 *   Tab 2: 'review'        → Review & Publish
 */

import type { FormSection } from '@constants/CREATE_USER_FORM_SCHEMA';

export const ASSETS_FORM_SCHEMA: FormSection[] = [
  // ─── Tab 1: Asset Details ─────────────────────────────────────────────────
  {
    type: 'tab',
    id: 'assetDetails',
    icon: 'Package',
    title: {
      key: 'supportProvider.assetSupport.tabs.assetDetails',
      fallback: 'Asset Details',
    },
    heading: {
      key: 'supportProvider.assetSupport.step1.heading',
      fallback: 'Asset Details',
    },
    subheading: {
      key: 'supportProvider.assetSupport.step1.subheading',
      fallback: 'Fields marked * are required',
    },
    rows: [],
    children: [
      // ── Location ──────────────────────────────────────────────────────────
      {
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

      // ── Asset Type ────────────────────────────────────────────────────────
      {
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

      // ── Asset Details ─────────────────────────────────────────────────────
      {
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
                  fallback: 'Describe this asset, its purpose, and how it benefits the recipient...',
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

      // ── Availability ──────────────────────────────────────────────────────
      {
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
    ],
  },

  // ─── Tab 2: Review & Publish ──────────────────────────────────────────────
  {
    type: 'tab',
    id: 'review',
    icon: 'Check',
    title: {
      key: 'supportProvider.assetSupport.tabs.reviewPublish',
      fallback: 'Review & Publish',
    },
    heading: {
      key: 'supportProvider.assetSupport.step2.heading',
      fallback: 'Review & Publish',
    },
    rows: [],
    children: [
      // ── Asset Details Preview ─────────────────────────────────────────────
      {
        id: 'reviewAssetDetails',
        icon: 'Package',
        title: { key: 'reviewAssetDetails', fallback: 'Asset Details' },
        rows: [
          {
            fields: [
              {
                name: 'province',
                type: 'text',
                required: false,
                label: { key: 'supportProvider.assetSupport.step2.provinceLabel', fallback: 'Province' },
              },
              {
                name: 'site',
                type: 'text',
                required: false,
                label: { key: 'supportProvider.assetSupport.step2.siteLabel', fallback: 'Site' },
              },
            ],
          },
          {
            fields: [
              {
                name: 'assetType',
                type: 'text',
                required: false,
                label: { key: 'supportProvider.assetSupport.step2.assetTypeLabel', fallback: 'Asset Type' },
              },
              {
                name: 'livelihoodCategory',
                type: 'text',
                required: false,
                label: { key: 'supportProvider.assetSupport.step2.livelihoodCategoryLabel', fallback: 'Livelihood Category' },
              },
            ],
          },
          {
            fields: [
              {
                name: 'assetTitle',
                type: 'text',
                required: false,
                label: { key: 'supportProvider.assetSupport.step2.assetTitleLabel', fallback: 'Asset Title' },
              },
            ],
          },
          {
            fields: [
              {
                name: 'estimatedValue',
                type: 'text',
                required: false,
                label: { key: 'supportProvider.assetSupport.step2.estimatedValueLabel', fallback: 'Estimated Value' },
              },
            ],
          },
        ],
      },
    ],
  },
];
