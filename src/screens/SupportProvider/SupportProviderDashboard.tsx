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
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';

import { useNavigation } from '@react-navigation/native';

interface SupportProviderDashboardProps {
  onNavigate?: (route: string) => void;
}

export const SupportProviderDashboard: React.FC<SupportProviderDashboardProps> = ({
  onNavigate,
}) => {
  const { t } = useLanguage();
  const { dashboard, branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.themePrimaryColor || theme.tokens.colors.primary500;
  const navigation = useNavigation();

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigation.navigate(route as never);
    }
  };

  const pageTitle = t(dashboard.titleKey) || dashboard.defaultTitle;
  const pageSubtitle = t(dashboard.subtitleKey) || dashboard.defaultSubtitle;
  const createSupportText =
    t(dashboard.createSupportButtonKey) || dashboard.defaultCreateSupportButton;

  return (
    <ScrollView flex={1} bg="$backgroundLight50">
      {/* Top Header Container with Background Color and Bottom Border */}
      <Box
        width="100%"
        bg={theme.tokens.colors.backgroundPrimary.light}
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
              <Text color="$textDark900" {...TYPOGRAPHY.h1} fontWeight="$bold">
                {pageTitle}
              </Text>
              <Text color="$textDark600" {...TYPOGRAPHY.bodySmall}>
                {pageSubtitle}
              </Text>
            </VStack>
 
            {/* Right Header Action Button */}
            <Pressable
              onPress={() => handleNavigate('support-provider-create-opportunities')}
              bg={primaryColor}
              px="$4"
              py="$2.5"
              borderRadius="$lg"
              $hover={{ bg: theme.tokens.colors.primary600 }}
              $active={{ bg: theme.tokens.colors.primary700 }}
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
                  color={theme.tokens.colors.backgroundPrimary.light}
                />
                <Text color={theme.tokens.colors.backgroundPrimary.light} {...TYPOGRAPHY.bodySmall} fontWeight="$medium">
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

export default SupportProviderDashboard;
