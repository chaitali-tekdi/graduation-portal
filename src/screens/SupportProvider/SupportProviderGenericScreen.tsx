import React from 'react';
import { Box, HStack, Text, Pressable, ScrollView } from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';

import { useRoute, useNavigation } from '@react-navigation/native';

interface SupportProviderGenericScreenProps {
  route?: string;
  onNavigate?: (route: string) => void;
}

export const SupportProviderGenericScreen: React.FC<SupportProviderGenericScreenProps> = ({
  route,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const { generic, branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.themePrimaryColor || theme.tokens.colors.primary500;
  const routeObj = useRoute();
  const navigation = useNavigation();

  const currentRoute = route || routeObj.name;

  const handleNavigate = (targetRoute: string) => {
    if (onNavigate) {
      onNavigate(targetRoute);
    } else {
      navigation.navigate(targetRoute as never);
    }
  };

  const menuItem = SUPPORT_PROVIDER_CONFIG.menuItems.find(
    item => item.route === currentRoute,
  );

  const title = menuItem
    ? t(menuItem.labelKey) || menuItem.label
    : currentRoute.replace('support-provider-', '').replace('_', ' ').toUpperCase();
  const iconName = menuItem?.iconName || 'Package';

  const backText =
    t(SUPPORT_PROVIDER_CONFIG.createSupport.backKey) ||
    SUPPORT_PROVIDER_CONFIG.createSupport.defaultBack;
  const returnToDashboardText =
    t(generic.returnToDashboardKey) || generic.defaultReturnToDashboard;
  const genericDesc = t(generic.genericDescKey) || generic.defaultGenericDesc;

  return (
    <ScrollView flex={1} bg="$backgroundLight50">
      {/* Centered Page Container */}
      <Box
        width="100%"
        maxWidth={1200}
        alignSelf="center"
        px="$4"
        $md-px="$8"
        py="$5"
        $md-py="$8"
      >
        {/* Back Link */}
        <Pressable
          onPress={() => handleNavigate('support-provider-dashboard')}
          mb="$4"
          alignSelf="flex-start"
          $hover={{ opacity: 0.8 }}
          $web-style={{ cursor: 'pointer' }}
        >
          <HStack alignItems="center" space="xs">
            <LucideIcon name="ArrowLeft" size={16} color="$textDark800" />
            <Text color="$textDark800" {...TYPOGRAPHY.label}>
              {backText}
            </Text>
          </HStack>
        </Pressable>

        {/* Content Box */}
        <Box
          maxWidth={800}
          width="100%"
          alignSelf="center"
          bg={theme.tokens.colors.backgroundPrimary.light}
          borderRadius="$xl"
          borderWidth={1}
          borderColor="$borderLight200"
          p="$6"
          $md-p="$10"
          alignItems="center"
          justifyContent="center"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.05}
          shadowRadius={8}
          elevation={2}
        >
          <Box bg={theme.tokens.colors.primary50} p="$4" borderRadius="$full" mb="$4">
            <LucideIcon name={iconName} size={40} color={primaryColor} />
          </Box>

          <Text color="$textDark900" {...TYPOGRAPHY.h1} mb="$2">
            {title}
          </Text>

          <Text
            color="$textDark500"
            {...TYPOGRAPHY.bodySmall}
            textAlign="center"
            maxWidth={480}
            mb="$6"
          >
            {genericDesc}
          </Text>

          <Pressable
            bg={primaryColor}
            px="$6"
            py="$2.5"
            borderRadius="$lg"
            onPress={() => handleNavigate('support-provider-dashboard')}
            $hover={{ bg: theme.tokens.colors.primary600 }}
            $web-style={{ cursor: 'pointer' }}
          >
            <Text color={theme.tokens.colors.backgroundPrimary.light} {...TYPOGRAPHY.button} fontWeight="$bold">
              {returnToDashboardText}
            </Text>
          </Pressable>
        </Box>
      </Box>
    </ScrollView>
  );
};

export default SupportProviderGenericScreen;
