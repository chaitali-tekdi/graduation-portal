/**
 * TRAINING_FORM_SCHEMA
 *
 * Single schema for the Create Training Session form.
 * Every field is declared here; each section carries a `tab` property
 * that maps it to the currently active tab:
 *
 *   'sessionDetails'   → Session Details tab (step 1)
 *   'scheduleFormat'   → Schedule & Format tab (step 2)
 *
 * The consumer filters sections by `tab === activeTab` before passing
 * them to SchemaFormRenderer or validateSchema.
 */

import type { FormSection } from '@constants/CREATE_USER_FORM_SCHEMA';

export const TRAINING_FORM_SCHEMA: (FormSection & { tab: string })[] = [
  // ─── Tab: Session Details ─────────────────────────────────────────────────

  {
    tab: 'sessionDetails',
    id: 'locationDetails',
    icon: 'MapPin',
    title: { key: 'locationDetails', fallback: 'Location' },
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
    tab: 'sessionDetails',
    id: 'pillarDetails',
    icon: 'Layers',
    title: { key: 'pillarDetails', fallback: 'Pillar' },
    rows: [
      {
        fields: [
          {
            name: 'pillar',
            type: 'pills' as any,
            required: true,
            label: { key: 'pillar', fallback: 'Pillar' },
            optionsSource: 'pillars',
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.pillarRequired', fallback: 'Pillar is required' },
              },
            ],
          },
        ],
      },
      {
        // shown when pillar is set and NOT 'Others'
        visibleWhen: { field: 'pillar', value: 'Others', not: true },
        fields: [
          {
            name: 'sessionType',
            type: 'select',
            required: true,
            label: { key: 'sessionType', fallback: 'Training / Session Type' },
            placeholder: { fallback: 'Select session type' },
            optionsSource: 'sessionTypes',
            dependsOn: 'pillar',
            disabledWhen: { field: 'pillar', empty: true },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.sessionTypeRequired', fallback: 'Session type is required' },
              },
            ],
          },
        ],
      },
      {
        // shown when pillar IS 'Others'
        visibleWhen: { field: 'pillar', value: 'Others' },
        fields: [
          {
            name: 'sessionTitle',
            type: 'text',
            required: true,
            label: { key: 'sessionTitle', fallback: 'Training / Session Title' },
            placeholder: { fallback: 'Describe this session...' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.sessionTitleRequired', fallback: 'Session title is required' },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    tab: 'sessionDetails',
    id: 'sessionContent',
    icon: 'FileText',
    title: { key: 'sessionContent', fallback: 'Session Content' },
    rows: [
      {
        fields: [
          {
            name: 'description',
            type: 'textarea',
            required: true,
            label: { key: 'description', fallback: 'Training / Session Description' },
            placeholder: {
              fallback: 'Describe what this session covers and what participants will learn...',
            },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.descriptionRequired', fallback: 'Description is required' },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'learningObjectives',
            type: 'textarea',
            required: false,
            label: { key: 'learningObjectives', fallback: 'Learning Objectives (optional)' },
            placeholder: { fallback: 'List the key learning outcomes, one per line...' },
          },
        ],
      },
    ],
  },

  {
    tab: 'sessionDetails',
    id: 'audienceAndCapacity',
    icon: 'Users',
    title: { key: 'audienceAndCapacity', fallback: 'Audience & Capacity' },
    rows: [
      {
        fields: [
          {
            name: 'targetAudience',
            type: 'pills' as any,
            required: true,
            label: { key: 'targetAudience', fallback: 'Target Audience' },
            optionsSource: 'targetAudienceOptions',
            defaultValue: 'Participant',
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.targetAudienceRequired', fallback: 'Target audience is required' },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'certificateProvided',
            type: 'pills' as any,
            required: true,
            label: { key: 'certificateProvided', fallback: 'Certificate Provided' },
            optionsSource: 'certificateOptions',
            defaultValue: 'Yes',
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.certificateRequired', fallback: 'Certificate choice is required' },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'maxCapacity',
            type: 'text',
            required: true,
            label: { key: 'maxCapacity', fallback: 'Maximum Capacity' },
            placeholder: { fallback: 'e.g. 20' },
            inputProps: { keyboardType: 'numeric' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.maxCapacityRequired', fallback: 'Maximum capacity is required' },
              },
            ],
          },
          {
            name: 'recurringSession',
            type: 'toggle' as any,
            required: false,
            label: { key: 'recurringSession', fallback: 'Recurring Session' },
            optionsSource: 'recurringOptions',
            defaultValue: 'No',
          },
        ],
      },
    ],
  },

  // ─── Tab: Schedule & Format ───────────────────────────────────────────────

  {
    tab: 'scheduleFormat',
    id: 'scheduleDetails',
    icon: 'Calendar',
    title: { key: 'scheduleDetails', fallback: 'Date & Time' },
    rows: [
      {
        fields: [
          {
            name: 'startDate',
            type: 'date',
            required: true,
            label: { key: 'startDate', fallback: 'Start Date' },
            placeholder: { fallback: 'dd/mm/yyyy' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.startDateRequired', fallback: 'Start date is required' },
              },
            ],
          },
          {
            name: 'startTime',
            type: 'text',
            required: true,
            label: { key: 'startTime', fallback: 'Start Time' },
            placeholder: { fallback: '--:--' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.startTimeRequired', fallback: 'Start time is required' },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'endDate',
            type: 'date',
            required: true,
            label: { key: 'endDate', fallback: 'End Date' },
            placeholder: { fallback: 'dd/mm/yyyy' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.endDateRequired', fallback: 'End date is required' },
              },
            ],
          },
          {
            name: 'endTime',
            type: 'text',
            required: true,
            label: { key: 'endTime', fallback: 'End Time' },
            placeholder: { fallback: '--:--' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.endTimeRequired', fallback: 'End time is required' },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    tab: 'scheduleFormat',
    id: 'formatDetails',
    icon: 'Presentation',
    title: { key: 'formatDetails', fallback: 'Format & Location' },
    rows: [
      {
        fields: [
          {
            name: 'formatType',
            type: 'pills' as any,
            required: true,
            label: { key: 'formatType', fallback: 'Type' },
            optionsSource: 'formatOptions',
            defaultValue: 'Offline',
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.formatTypeRequired', fallback: 'Format type is required' },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'venueLocation',
            type: 'text',
            required: true,
            label: { key: 'venueLocation', fallback: 'Venue Location' },
            placeholder: { fallback: 'Venue name and address...' },
            validation: [
              {
                rule: 'required',
                message: { key: 'errors.venueRequired', fallback: 'Venue location is required' },
              },
            ],
          },
        ],
      },
    ],
  },
];
