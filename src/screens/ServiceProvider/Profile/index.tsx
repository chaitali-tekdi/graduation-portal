import React, { useState } from 'react';
import { Container, VStack, LucideIcon, Button, ButtonIcon, ButtonText, HStack } from '@ui';
import styles from './styles';
import SPTitleHeader from '@components/Header/SPTitleHeader';
import OrgProfileView from './components/OrgProfileView';
import { useLanguage } from '@contexts/LanguageContext';

const App = (): React.JSX.Element => {
  const { t } = useLanguage();
  const [headerActions, setHeaderActions] = useState<{
    mode: 'preview' | 'edit';
    isSaving: boolean;
    handleEditPress: () => void;
    handleCancel: () => void;
    handleSave: () => void;
  } | null>(null);

  return (
    <VStack {...styles.orgProfileMainWrapper}>
      <SPTitleHeader
        title={t('supportProvider.profile.title', 'Organisation Profile')}
        subTitle={t(
          'supportProvider.profile.subtitle',
          "Manage your organisation's information and support coverage"
        )}
        rightSection={
          headerActions?.mode === 'edit' ? (
            <HStack {...styles.orgProfileHeaderActionsGroup}>
              <Button
                {...styles.orgProfileCancelButton}
                onPress={headerActions.handleCancel}
                isDisabled={headerActions.isSaving}
              >
                <ButtonIcon as={LucideIcon} name="X" />
                <ButtonText {...styles.orgProfileCancelButtonText}>
                  {t('supportProvider.profile.cancel', 'Cancel')}
                </ButtonText>
              </Button>

              <Button
                {...styles.orgProfileSaveButton}
                onPress={headerActions.handleSave}
                isDisabled={headerActions.isSaving}
              >
                <ButtonIcon as={LucideIcon} name="Save" />
                <ButtonText>
                  {headerActions.isSaving
                    ? t('common.saving', 'Saving...')
                    : t('supportProvider.profile.saveChanges', 'Save Changes')}
                </ButtonText>
              </Button>
            </HStack>
          ) : (
            <Button onPress={() => headerActions?.handleEditPress()}>
              <ButtonIcon as={LucideIcon} name="SquarePen" />
              <ButtonText>{t('supportProvider.profile.editProfile', 'Edit Profile')}</ButtonText>
            </Button>
          )
        }
      />

      <Container {...styles.orgProfileContainer}>
        <OrgProfileView renderHeaderActions={setHeaderActions} />
      </Container>
    </VStack>
  );
};

export default App;