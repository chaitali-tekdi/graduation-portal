import React, { useState } from 'react';
import { Container, VStack, LucideIcon, Button, ButtonIcon, ButtonText, HStack } from '@ui';
import styles from './styles';
import SPTitleHeader from '@components/Header/SPTitleHeader';
import OrgProfileView from './components/OrgProfileView';
import { useLanguage } from '@contexts/LanguageContext';

const App = (): React.JSX.Element => {
  const { t } = useLanguage();
  const [isCancelHovered, setIsCancelHovered] = useState(false);
  const [headerActions, setHeaderActions] = useState<{
    mode: 'preview' | 'edit';
    isSaving: boolean;
    handleEditPress: () => void;
    handleCancel: () => void;
    handleSave: () => void;
  } | null>(null);

  return (
    <VStack {...(styles.orgProfileMainWrapper as any)}>
      <SPTitleHeader
        title={t('supportProvider.profile.title', 'Organisation Profile')}
        subTitle={t(
          'supportProvider.profile.subtitle',
          "Manage your organisation's information and support coverage"
        )}
        rightSection={
          headerActions?.mode === 'edit' ? (
            <HStack {...(styles.orgProfileHeaderActionsGroup as any)}>
              <Button
                variant="outline"
                action="secondary"
                {...(styles.orgProfileCancelButton as any)}
                onPress={headerActions.handleCancel}
                isDisabled={headerActions.isSaving}
                onHoverIn={() => setIsCancelHovered(true)}
                onHoverOut={() => setIsCancelHovered(false)}
              >
                <ButtonIcon
                  as={LucideIcon}
                  name="X"
                  {...(styles.orgProfileCancelButtonIcon as any)}
                  color={isCancelHovered ? '$primary500' : '$textLight700'}
                  mr="$2"
                />
                <ButtonText
                  {...(styles.orgProfileCancelButtonText as any)}
                  color={isCancelHovered ? '$primary500' : '$textLight700'}
                >
                  {t('supportProvider.profile.cancel', 'Cancel')}
                </ButtonText>
              </Button>

              <Button
                {...(styles.orgProfileSaveButton as any)}
                onPress={headerActions.handleSave}
                isDisabled={headerActions.isSaving}
              >
                <ButtonIcon as={LucideIcon} name="Save" {...(styles.orgProfileSaveButtonIcon as any)} mr="$2" />
                <ButtonText {...(styles.orgProfileSaveButtonText as any)}>
                  {headerActions.isSaving
                    ? t('common.saving', 'Saving...')
                    : t('supportProvider.profile.saveChanges', 'Save Changes')}
                </ButtonText>
              </Button>
            </HStack>
          ) : (
            <Button {...(styles.orgProfileEditButton as any)} onPress={() => headerActions?.handleEditPress()}>
              <ButtonIcon as={LucideIcon} name="SquarePen" color="$white" size={16} mr="$2" />
              <ButtonText color="$white">{t('supportProvider.profile.editProfile', 'Edit Profile')}</ButtonText>
            </Button>
          )
        }
      />

      <Container {...(styles.orgProfileContainer as any)}>
        <OrgProfileView renderHeaderActions={setHeaderActions} />
      </Container>
    </VStack>
  );
};

export default App;