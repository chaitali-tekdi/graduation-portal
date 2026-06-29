import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { Box, VStack, Text, useAlert } from '@ui';
import SchemaForm from '@components/SchemaForm';
import { useLanguage } from '@contexts/LanguageContext';
import logger from '@utils/logger';
import { userFormSchema } from '@constants/schemas/userFormSchema';
import { USER_FORM_OPTIONS } from '@constants/USER_FORM_OPTIONS';
import type { FormValues } from '@app-types/formSchema';
import { createUserStyles } from './Styles';

const SUPERVISOR_OR_LC_ROLES = ['supervisor', 'lc'];

const CreateUserScreen: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [values, setValues] = useState<FormValues>({});

  // Flags drive conditional visibility in the schema (visibleWhen.flag).
  const flags = useMemo(
    () => ({
      isSupervisorOrLC: SUPERVISOR_OR_LC_ROLES.includes(values.roleId ?? ''),
    }),
    [values.roleId],
  );

  const handleSubmit = (submitted: FormValues) => {
    logger.log('Create user submitted:', submitted);
    showAlert('success', t('createUser.success'));
  };

  return (
    <ScrollView {...createUserStyles.scrollView}>
      <VStack {...createUserStyles.content}>
        <Box {...createUserStyles.header}>
          <Text {...createUserStyles.title}>{t('createUser.title')}</Text>
          <Text {...createUserStyles.subtitle}>
            {t('createUser.subtitle')}
          </Text>
        </Box>

        <SchemaForm
          schema={userFormSchema}
          optionsSources={USER_FORM_OPTIONS}
          flags={flags}
          onChange={setValues}
          onSubmit={handleSubmit}
          submitLabel={{ key: 'createUser.submit', fallback: 'Create User' }}
        />
      </VStack>
    </ScrollView>
  );
};

export default CreateUserScreen;
