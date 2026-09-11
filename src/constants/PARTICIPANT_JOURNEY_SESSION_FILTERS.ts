/**
 * My Sessions Filter Options
 * Data-driven filter options for My Sessions screen
 */

export interface SessionFilterOption {
  labelKey: string;
  value: string;
}

export const MY_SESSIONS_FILTER_OPTIONS: SessionFilterOption[] = [
  {
    labelKey: 'participantJourney.sessionFilters.all',
    value: 'all',
  },
  {
    labelKey: 'participantJourney.sessionFilters.trainingsAndSessions',
    value: 'trainings',
  },
  {
    labelKey: 'participantJourney.sessionFilters.additionalServices',
    value: 'additional_services',
  },
];
