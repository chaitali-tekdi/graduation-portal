import React, { useCallback } from 'react';
import {
  Box,
  HStack,
  Text,
  Pressable,
  VStack,
} from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import { useAuth } from '@contexts/AuthContext';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import type { MenuItemData } from '@components/ui/Menu';
import Menu from '@components/ui/Menu';
import openExternalLink from '@utils/openExternalLink';
import { useRoute } from '@react-navigation/native';

interface SupportProviderHeaderProps {
  title?: string;
  subTitle?: string;
  hamburgerMenuItems?: MenuItemData[];
  onHamburgerMenuSelect?: (key: string | undefined) => void;
}

export const SupportProviderHeader: React.FC<SupportProviderHeaderProps> = ({
  title,
  subTitle,
  hamburgerMenuItems,
  onHamburgerMenuSelect,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.headerBgColor || theme.tokens.colors.primary500;

  const brandTitleText = t('supportProvider.branding.brandTitle') || branding.brandTitle;
  const userOrgName =
    user?.organizations?.[0]?.name ||
    user?.organizations?.[0]?.label ||
    user?.organizations?.[0]?.code ||
    user?.user_organizations?.[0]?.organization?.name ||
    user?.user_organizations?.[0]?.organization?.label ||
    user?.orgName ||
    user?.organizationName ||
    user?.org_name ||
    user?.organization;

  const orgNameText = userOrgName || t('supportProvider.branding.orgName') || branding.orgName;

  let currentRoute = '';
  try {
    const routeObj = useRoute();
    currentRoute = routeObj?.name || '';
  } catch (e) {
    // ignore
  }

  const combinedMenuItems = React.useMemo<MenuItemData[]>(() => {
    const roleBadgeText = t('supportProvider.branding.roleBadge') || branding.roleBadge;
    const headerItem: MenuItemData = {
      key: 'org-header',
      textValue: 'org-header',
      showDividerAfter: true,
      customElement: (
        <VStack px="$4" py="$3" bg="$white" minWidth={200}>
          <Text color="$textDark900" {...TYPOGRAPHY.label} fontWeight="$bold" fontSize="$md">
            {orgNameText}
          </Text>
          <Text color="$textDark500" {...TYPOGRAPHY.caption} fontSize="$xs" mt="$0.5">
            {roleBadgeText}
          </Text>
        </VStack>
      ),
    };

    const mappedItems = (hamburgerMenuItems || []).map(item => {
      let isActive = item.route === currentRoute;
      if (item.key === 'dashboard' && (
        currentRoute === 'support-provider-create-opportunities' ||
        currentRoute === 'support-provider-training-sessions' ||
        currentRoute === 'support-provider-assets' ||
        currentRoute === 'support-provider-additional-services'
      )) {
        isActive = true;
      }
      return {
        ...item,
        active: isActive,
      };
    });

    return [headerItem, ...mappedItems];
  }, [hamburgerMenuItems, orgNameText, branding.roleBadge, t, currentRoute]);

  const renderMenuTrigger = useCallback(
    (triggerProps: any) => (
      <Pressable
        {...triggerProps}
        p="$1"
        borderRadius="$sm"
        $hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
        $active={{ bg: 'rgba(255, 255, 255, 0.2)' }}
        accessibilityRole="button"
        accessibilityLabel="Open Menu"
      >
        <LucideIcon name="Menu" size={22} color={theme.tokens.colors.backgroundPrimary.light} />
      </Pressable>
    ),
    [],
  );

  const handleHamburgerMenuSelect = async (key: string | undefined) => {
    const selectedItem = combinedMenuItems?.find(item => item.key === key);
    if (selectedItem?.isComingSoon) {
      return;
    }

    if (selectedItem?.href) {
      await openExternalLink(selectedItem.href);
      return;
    }

    onHamburgerMenuSelect?.(key);
  };

  return (
    <Box zIndex={1000} bg={primaryColor} width="100%">
      {/* Top Header Inner Centered Container */}
      <Box
        width="100%"
        alignSelf="center"
        px="$4"
        $md-px="$8"
        py="$3"
        minHeight={56}
        justifyContent="center"
        position="relative"
      >
        <HStack justifyContent="space-between" alignItems="center">
          {/* Left: Burger Menu + Brand Title */}
          <HStack alignItems="center" space="md">
            {hamburgerMenuItems ? (
              <Menu
                items={combinedMenuItems}
                placement="bottom left"
                offset={15}
                trigger={renderMenuTrigger}
                onSelect={handleHamburgerMenuSelect}
              />
            ) : null}

            <Text color={theme.tokens.colors.backgroundPrimary.light} {...TYPOGRAPHY.h3}>
              {brandTitleText}
            </Text>
          </HStack>

          {/* Right: User Org & Notification Bell */}
          <HStack alignItems="center" space="lg">
            <Text color={theme.tokens.colors.backgroundPrimary.light} {...TYPOGRAPHY.bodySmall} fontWeight="$medium">
              {orgNameText}
            </Text>

            {/* Bell Icon with Orange Badge */}
            <Box position="relative">
              <Pressable
                p="$1"
                borderRadius="$full"
                $hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              >
                <LucideIcon name="Bell" size={20} color={theme.tokens.colors.backgroundPrimary.light} />
              </Pressable>
              {branding.notificationCount > 0 && (
                <Box
                  position="absolute"
                  top={-2}
                  right={-4}
                  bg={theme.tokens.colors.pillarSocialProtection}
                  borderRadius="$full"
                  px="$1.5"
                  py={1}
                  minWidth={16}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color={theme.tokens.colors.backgroundPrimary.light} {...TYPOGRAPHY.caption} fontWeight="$bold" lineHeight={10}>
                    {branding.notificationCount}
                  </Text>
                </Box>
              )}
            </Box>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};

export default SupportProviderHeader;
