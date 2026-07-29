import React from 'react';
import { Box, HStack, Text, Pressable } from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import PageHeader from '@components/PageHeader';

export interface StepperTabItem {
  key: number;
  label: string;
  iconName: string;
}


interface FormStepperHeaderProps {
  activeStep: number;
  totalSteps: number;
  setActiveStep: (step: number) => void;
  onNavigateBack: () => void;
  title?: string;
  backButtonText?: string;
  badgeText?: string;
  tabs?: StepperTabItem[];
}

export const FormStepperHeader: React.FC<FormStepperHeaderProps> = ({
  activeStep,
  totalSteps,
  setActiveStep,
  onNavigateBack,
  title,
  backButtonText,
  badgeText: customBadgeText,
  tabs = [],
}) => {
  const { t } = useLanguage();
  const { branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.themePrimaryColor || theme.tokens.colors.primary500;

  const pageTitleText = title || t('supportProvider.trainingSession.pageTitle') || 'Create Training Session';
  const backText = backButtonText || t('supportProvider.trainingSession.changeType') || 'Change Type';
  const badgeText = customBadgeText;

  return (
    <Box width="100%" bg={theme.tokens.colors.backgroundPrimary.light}>
      {/* PageHeader — reuses the project-wide back button + title pattern */}
      <PageHeader
        title={pageTitleText}
        backButtonText={backText}
        onBackPress={onNavigateBack}
        _css={{ shadowOpacity: 0, borderBottomWidth: 0 }}
        rightSection={
          badgeText ? (
            <Box
              bg={
                badgeText === 'Asset' || badgeText === 'Assets'
                  ? theme.tokens.colors.success100
                  : theme.tokens.colors.optionalBadgeBg
              }
              px="$2.5"
              py="$1"
              borderRadius="$full"
            >
              <Text
                color={
                  badgeText === 'Asset' || badgeText === 'Assets'
                    ? theme.tokens.colors.pillarLivelihoods
                    : theme.tokens.colors.infoIconColor
                }
                {...TYPOGRAPHY.caption}
                fontWeight="$bold"
              >
                {badgeText}
              </Text>
            </Box>
          ) : null
        }
      />

      {/* Divider */}
      <Box width="100%" height={1} bg="$borderLight100" />

      {/* Tab Step Bar */}
      {tabs.length > 0 && (
        <Box width="100%" bg={theme.tokens.colors.backgroundPrimary.light}>
          <Box maxWidth={1152} alignSelf="center" width="100%" px="$4" $md-px="$6">
            <HStack
              space="md"
              $md-space="xl"
              flexWrap="wrap"
              alignItems="center"
              rowGap="$3"
              pt="$3"
              pb="$1"
            >
              {tabs.map(tab => {
                const isActive = activeStep === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setActiveStep(tab.key)}
                    pb="$3"
                    borderBottomWidth={isActive ? 2 : 0}
                    borderColor={primaryColor}
                    zIndex={2}
                    $web-style={{ cursor: 'pointer' }}
                  >
                    <HStack alignItems="center" space="xs">
                      <LucideIcon
                        name={tab.iconName as any}
                        size={16}
                        color={isActive ? primaryColor : theme.tokens.colors.textMuted}
                      />
                      <Text
                        color={isActive ? primaryColor : '$textDark500'}
                        {...TYPOGRAPHY.bodySmall}
                        fontWeight={isActive ? '$bold' : '$normal'}
                      >
                        {tab.label}
                      </Text>
                    </HStack>
                  </Pressable>
                );
              })}
            </HStack>
          </Box>
          {/* Full-width divider under tabs */}
          <Box width="100%" height={1} bg="$borderLight100" />
        </Box>
      )}


    </Box>
  );
};

export default FormStepperHeader;
