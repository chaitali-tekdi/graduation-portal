import type {
  FormValues,
  OptionsSources,
  SelectOption,
} from '@app-types/formSchema';

const COUNTRY_CODES: SelectOption[] = [
  { value: '+27', label: '+27 (South Africa)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+1', label: '+1 (USA)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+234', label: '+234 (Nigeria)' },
];

const ROLES: SelectOption[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'lc', label: 'Learning Coordinator' },
  { value: 'participant', label: 'Participant' },
];

const GENDERS: SelectOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'preferNotToSay', label: 'Prefer not to say' },
];

const ORGANISATIONS: SelectOption[] = [
  { value: 'org1', label: 'SkillsSA' },
  { value: 'org2', label: 'BRAC' },
  { value: 'org3', label: 'Shikshalokam' },
];

const POSITIONS: SelectOption[] = [
  { value: 'pos1', label: 'Field Officer' },
  { value: 'pos2', label: 'Coordinator' },
  { value: 'pos3', label: 'Manager' },
];

const PROVINCES: SelectOption[] = [
  { value: 'gauteng', label: 'Gauteng' },
  { value: 'westernCape', label: 'Western Cape' },
  { value: 'kwazuluNatal', label: 'KwaZulu-Natal' },
];

// Sites are scoped to the selected province (demonstrates dependent selects).
const SITES_BY_PROVINCE: Record<string, SelectOption[]> = {
  gauteng: [
    { value: 'jhb', label: 'Johannesburg' },
    { value: 'pta', label: 'Pretoria' },
  ],
  westernCape: [
    { value: 'cpt', label: 'Cape Town' },
    { value: 'stellenbosch', label: 'Stellenbosch' },
  ],
  kwazuluNatal: [
    { value: 'durban', label: 'Durban' },
    { value: 'pmb', label: 'Pietermaritzburg' },
  ],
};

/**
 * Named option lists consumed by the user form's select fields. `sites` is a
 * function so its options react to the currently selected province.
 */
export const USER_FORM_OPTIONS: OptionsSources = {
  countryCodes: COUNTRY_CODES,
  roles: ROLES,
  genders: GENDERS,
  organisations: ORGANISATIONS,
  positions: POSITIONS,
  provinces: PROVINCES,
  sites: (values: FormValues) =>
    SITES_BY_PROVINCE[values.provinceId ?? ''] ?? [],
};

export default USER_FORM_OPTIONS;
