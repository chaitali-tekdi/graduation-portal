import React from 'react';
import { Box, Spinner, Text } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { useSessionTaskMapper } from './hooks/useSessionTaskMapper';
import AttendedSessionTaskSync from './AttendedSessionTaskSync';

/**
 * Holds back the task cards until the participant's scheduled sessions have been mapped onto the
 * IDP tasks (once, right after the project loads), so the cards render with their session tags.
 */
const SessionTaskMapperGate = ({ children }: { children: React.ReactNode }) => {
  const ready = useSessionTaskMapper();
  const { t } = useLanguage();

  if (!ready) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" gap="$3">
        <Spinner size="large" />
        <Text color="$textSecondary">{t('projectPlayer.checkingOfferings')}</Text>
      </Box>
    );
  }

  return (
    <>
      {children}
      <AttendedSessionTaskSync />
    </>
  );
};

export default SessionTaskMapperGate;
