import React from 'react';
import { Box, HStack, Text, VStack, Pressable } from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';

export interface StepperTabItem {
  key: number;
  label: string;
  iconName: string;
}

interface FormStepperHeaderProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  onNavigateBack: () => void;
  title?: string;
  badgeText?: string;
  tabs?: StepperTabItem[];
}

export const FormStepperHeader: React.FC<FormStepperHeaderProps> = ({
  activeStep,
  setActiveStep,
  onNavigateBack,
  title,
  badgeText: customBadgeText,
  tabs: customTabs,
}) => {
  const { t } = useLanguage();
  const { branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.themePrimaryColor || '#8B2842';

  const changeTypeText = t('supportProvider.trainingSession.changeType') || 'Change Type';
  const pageTitleText = title || t('supportProvider.trainingSession.pageTitle') || 'Create Training Session';
  const badgeText = customBadgeText || t('supportProvider.trainingSession.badgeText') || 'Training Session';
  const progressLabelText = t('supportProvider.trainingSession.progressLabel') || 'Progress';

  const defaultTabs: StepperTabItem[] = [
    {
      key: 1,
      label: t('supportProvider.trainingSession.tabs.sessionDetails') || 'Session Details',
      iconName: 'FileText',
    },
    {
      key: 2,
      label: t('supportProvider.trainingSession.tabs.scheduleFormat') || 'Schedule & Format',
      iconName: 'Calendar',
    },
    {
      key: 3,
      label: t('supportProvider.trainingSession.tabs.reviewPublish') || 'Review & Publish',
      iconName: 'Check',
    },
  ];

  const activeTabs = customTabs && customTabs.length > 0 ? customTabs : defaultTabs;

  return (
    <Box width="100%" bg="$white">
      {/* Aligned Header Section */}
      <Box
        width="100%"
        alignSelf="center"
        px="$4"
        $md-px="$0"
        pt="$5"
        $md-pt="$8"
      >
        {/* Back Link: Change Type */}
        <Box
          w="$full"
          maxWidth={860}
          alignSelf="center"
          px="$4"
          $md-px="$8"
        >
          <Pressable
            onPress={onNavigateBack}
            mb="$6"
            alignSelf="flex-start"
            $hover={{ opacity: 0.8 }}
            $web-style={{
              cursor: 'pointer',
            }}
          >
            <HStack alignItems="center" space="xs">
              <LucideIcon name="ArrowLeft" size={16} color="$textDark700" />
              <Text color="$textDark700" fontSize="$sm" fontWeight="$medium">
                {changeTypeText}
              </Text>
            </HStack>
          </Pressable>
        </Box>

        {/* Page Heading & Badge */}
        <Box
          w="$full"
          maxWidth={860}
          alignSelf="center"
          px="$4"
          $md-px="$8"
        >
          <HStack alignItems="center" space="md" mb="$4" flexWrap="wrap">
            <Text color="$textDark900" fontWeight="$bold" fontSize="$2xl">
              {pageTitleText}
            </Text>

            <Box
              bg={badgeText === 'Asset' || badgeText === 'Assets' ? '#DCFCE7' : '#E0F2FE'}
              px="$2.5"
              py="$1"
              borderRadius="$full"
            >
              <Text
                color={badgeText === 'Asset' || badgeText === 'Assets' ? '#15803D' : '#0284C7'}
                fontWeight="$bold"
                fontSize="$xs"
              >
                {badgeText}
              </Text>
            </Box>
          </HStack>
        </Box>

        <Box width="100%" height={1} bg="$borderLight100" mb="$2" />

        {/* Progress Bar Header - Static 0% per Design */}
        <Box
          w="$full"
          maxWidth={860}
          alignSelf="center"
          px="$4"
          $md-px="$8"
        >
          <VStack space="xs" mb="$3">
            <HStack justifyContent="space-between" alignItems="center">
              <Text color="$textDark600" fontSize="$xs" fontWeight="$medium">
                {progressLabelText}
              </Text>

              <Text color="$textDark600" fontSize="$xs" fontWeight="$medium">
                0%
              </Text>
            </HStack>

            <Box
              w="$full"
              h={4}
              bg="$backgroundLight200"
              borderRadius="$full"
              overflow="hidden"
            >
              <Box
                h="$full"
                w="0%"
                bg={primaryColor}
                borderRadius="$full"
              />
            </Box>
          </VStack>
        </Box>

        <Box width="100%" height={1} bg="$borderLight100" mb="$3" />

        {/* Dynamic Step Tabs Bar */}
        <Box
          w="$full"
          maxWidth={860}
          alignSelf="center"
          px="$4"
          $md-px="$8"
        >
          <HStack
            space="md"
            $md-space="xl"
            flexWrap="wrap"
            alignItems="center"
            rowGap="$3"
          >
            {activeTabs.map(tab => {
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
                      name={tab.iconName}
                      size={16}
                      color={isActive ? primaryColor : '#9CA3AF'}
                    />
                    <Text
                      color={isActive ? primaryColor : '$textDark500'}
                      fontWeight={isActive ? '$bold' : '$normal'}
                      fontSize="$sm"
                    >
                      {tab.label}
                    </Text>
                  </HStack>
                </Pressable>
              );
            })}
          </HStack>
        </Box>
      </Box>

      {/* Full-width Horizontal Divider line extending across the page below tabs */}
      <Box width="100%" height={1} bg="$borderLight100" />
    </Box>
  );
};

export default FormStepperHeader;
