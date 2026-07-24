import React from 'react';
import { Box, HStack, Text, VStack, Pressable } from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';

interface FormStepperHeaderProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  onNavigateBack: () => void;
}

export const FormStepperHeader: React.FC<FormStepperHeaderProps> = ({
  activeStep,
  setActiveStep,
  onNavigateBack,
}) => {
  const { t } = useLanguage();
  const { branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.themePrimaryColor || '#8B2842';

  const changeTypeText = t('supportProvider.trainingSession.changeType') || 'Change Type';
  const pageTitleText = t('supportProvider.trainingSession.pageTitle') || 'Create Training Session';
  const badgeText = t('supportProvider.trainingSession.badgeText') || 'Training Session';
  const progressLabelText = t('supportProvider.trainingSession.progressLabel') || 'Progress';

  const tabDetailsText = t('supportProvider.trainingSession.tabs.sessionDetails') || 'Session Details';
  const tabScheduleText = t('supportProvider.trainingSession.tabs.scheduleFormat') || 'Schedule & Format';
  const tabReviewText = t('supportProvider.trainingSession.tabs.reviewPublish') || 'Review & Publish';

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

            <Box bg="#E0F2FE" px="$2.5" py="$1" borderRadius="$full">
              <Text color="#0284C7" fontWeight="$bold" fontSize="$xs">
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

        {/* 3 Step Tabs Bar - Responsive FlexWrap for Mobile (Moves to next line if needed) */}
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
            {/* Tab 1 */}
            <Pressable
              onPress={() => setActiveStep(1)}
              pb="$3"
              borderBottomWidth={activeStep === 1 ? 2 : 0}
              borderColor={primaryColor}
              zIndex={2}
              $web-style={{ cursor: 'pointer' }}
            >
              <HStack alignItems="center" space="xs">
                <LucideIcon
                  name="FileText"
                  size={16}
                  color={activeStep === 1 ? primaryColor : '#9CA3AF'}
                />
                <Text
                  color={activeStep === 1 ? primaryColor : '$textDark500'}
                  fontWeight={activeStep === 1 ? '$bold' : '$normal'}
                  fontSize="$sm"
                >
                  {tabDetailsText}
                </Text>
              </HStack>
            </Pressable>

            {/* Tab 2 */}
            <Pressable
              onPress={() => setActiveStep(2)}
              pb="$3"
              borderBottomWidth={activeStep === 2 ? 2 : 0}
              borderColor={primaryColor}
              zIndex={2}
              $web-style={{ cursor: 'pointer' }}
            >
              <HStack alignItems="center" space="xs">
                <LucideIcon
                  name="Calendar"
                  size={16}
                  color={activeStep === 2 ? primaryColor : '#9CA3AF'}
                />
                <Text
                  color={activeStep === 2 ? primaryColor : '$textDark500'}
                  fontWeight={activeStep === 2 ? '$bold' : '$normal'}
                  fontSize="$sm"
                >
                  {tabScheduleText}
                </Text>
              </HStack>
            </Pressable>

            {/* Tab 3 */}
            <Pressable
              onPress={() => setActiveStep(3)}
              pb="$3"
              borderBottomWidth={activeStep === 3 ? 2 : 0}
              borderColor={primaryColor}
              zIndex={2}
              $web-style={{ cursor: 'pointer' }}
            >
              <HStack alignItems="center" space="xs">
                <LucideIcon
                  name="Check"
                  size={16}
                  color={activeStep === 3 ? primaryColor : '#9CA3AF'}
                />
                <Text
                  color={activeStep === 3 ? primaryColor : '$textDark500'}
                  fontWeight={activeStep === 3 ? '$bold' : '$normal'}
                  fontSize="$sm"
                >
                  {tabReviewText}
                </Text>
              </HStack>
            </Pressable>
          </HStack>
        </Box>
      </Box>

      {/* Full-width Horizontal Divider line extending across the page below tabs */}
      <Box width="100%" height={1} bg="$borderLight100" />
    </Box>
  );
};

export default FormStepperHeader;
