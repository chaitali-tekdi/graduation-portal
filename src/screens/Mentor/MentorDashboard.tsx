import React from 'react';
import {
  Box,
  HStack,
  Text,
  VStack,
  Pressable,
  ScrollView,
} from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';
// import ImpactOverviewCard from './components/ImpactOverviewCard';

interface MentorDashboardProps {
  onNavigate: (route: string) => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({
  onNavigate,
}) => {
  const { t } = useLanguage();
  const { dashboard, branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.themePrimaryColor || '#8B2842';

  const pageTitle = t(dashboard.titleKey) || dashboard.defaultTitle;
  const pageSubtitle = t(dashboard.subtitleKey) || dashboard.defaultSubtitle;
  const createSupportText =
    t(dashboard.createSupportButtonKey) || dashboard.defaultCreateSupportButton;

  return (
    <ScrollView flex={1} bg="$backgroundLight50">
      {/* Top Header Container with Background Color and Bottom Border */}
      <Box
        width="100%"
        bg="#ffffff"
        borderBottomWidth={1}
        borderColor="$borderLight200"
        py="$6"
        $md-py="$8"
        mb="$8"
      >
        <Box
          width="100%"
          maxWidth={1200}
          alignSelf="center"
          px="$4"
          $md-px="$8"
        >
          {/* Header Title & Action Button Row */}
          <HStack
            justifyContent="space-between"
            alignItems="center"
            flexDirection="column"
            $md-flexDirection="row"
            gap="$4"
          >
            {/* Left Heading */}
            <VStack space="xs">
              <Text color="$textDark900" fontWeight="$bold" fontSize="$2xl">
                {pageTitle}
              </Text>
              <Text color="$textDark600" fontSize="$sm">
                {pageSubtitle}
              </Text>
            </VStack>

            {/* Right Header Action Button */}
            <Pressable
              onPress={() => onNavigate('create_support')}
              bg={primaryColor}
              px="$4"
              py="$2.5"
              borderRadius="$lg"
              $hover={{ bg: '#7A2038' }}
              $active={{ bg: '#691A2F' }}
              $web-style={{
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              accessibilityRole="button"
              accessibilityLabel={createSupportText}
            >
              <HStack alignItems="center" space="xs">
                <LucideIcon
                  name={dashboard.createSupportIcon}
                  size={18}
                  color="#ffffff"
                />
                <Text color="#ffffff" fontWeight="$bold" fontSize="$sm">
                  {createSupportText}
                </Text>
              </HStack>
            </Pressable>
          </HStack>
        </Box>
      </Box>

      {/* Main Page Content Container */}
      <Box
        width="100%"
        maxWidth={1200}
        alignSelf="center"
        px="$4"
        $md-px="$8"
        pb="$12"
      >
        {/* Impact Overview Component */}
        {/* <Box mb="$8">
          <ImpactOverviewCard />
        </Box> */}
      </Box>
    </ScrollView>
  );
};

export default MentorDashboard;
