import React, { useState } from 'react';
import {
  Box,
  HStack,
  Text,
  Pressable,
  VStack,
  Divider,
} from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import { useAuth } from '@contexts/AuthContext';
import SUPPORT_PROVIDER_CONFIG, {
  MenuItemConfig,
} from '@constants/SUPPORT_PROVIDER_CONFIG';

interface MentorHeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const MentorHeader: React.FC<MentorHeaderProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const { logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { branding, menuItems } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.headerBgColor || '#8B2842';

  const brandTitleText = t('supportProvider.branding.brandTitle') || branding.brandTitle;
  const orgNameText = user?.orgName || t('supportProvider.branding.orgName') || branding.orgName;
  const roleBadgeText = user?.role || t('supportProvider.branding.roleBadge') || branding.roleBadge;

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleMenuSelect = (route: string) => {
    setIsMenuOpen(false);
    if (route === 'logout') {
      logout();
      return;
    }
    onNavigate(route);
  };

  return (
    <Box zIndex={1000} bg={primaryColor} width="100%">
      {/* Top Header Inner Centered Container */}
      <Box
        maxWidth={1200}
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
            <Pressable
              onPress={toggleMenu}
              p="$1"
              borderRadius="$sm"
              $hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              $active={{ bg: 'rgba(255, 255, 255, 0.2)' }}
              accessibilityRole="button"
              accessibilityLabel="Open Menu"
            >
              <LucideIcon name="Menu" size={22} color="#ffffff" />
            </Pressable>

            <Text color="#ffffff" fontWeight="$bold" fontSize="$lg">
              {brandTitleText}
            </Text>
          </HStack>

          {/* Right: User Org & Notification Bell */}
          <HStack alignItems="center" space="lg">
            <Text color="#ffffff" fontSize="$sm" fontWeight="$medium">
              {orgNameText}
            </Text>

            {/* Bell Icon with Orange Badge */}
            <Box position="relative">
              <Pressable
                p="$1"
                borderRadius="$full"
                $hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              >
                <LucideIcon name="Bell" size={20} color="#ffffff" />
              </Pressable>
              {branding.notificationCount > 0 && (
                <Box
                  position="absolute"
                  top={-2}
                  right={-4}
                  bg="#EA580C"
                  borderRadius="$full"
                  px="$1.5"
                  py={1}
                  minWidth={16}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="#ffffff" fontSize={10} fontWeight="$bold" lineHeight={10}>
                    {branding.notificationCount}
                  </Text>
                </Box>
              )}
            </Box>
          </HStack>
        </HStack>

        {/* Menu Overlay / Sidebar Dropdown */}
        {isMenuOpen && (
          <>
            {/* Transparent Backdrop to capture outside clicks without tinting Header */}
            <Pressable
              position="absolute"
              top={56}
              left={-2000}
              right={-2000}
              bottom={-2000}
              bg="rgba(0, 0, 0, 0.25)"
              zIndex={990}
              onPress={() => setIsMenuOpen(false)}
            />

            {/* Floating Menu Container matching Image 1 */}
            <Box
              position="absolute"
              top={52}
              left={16}
              width={260}
              bg="#ffffff"
              borderRadius="$lg"
              borderWidth={1}
              borderColor="$borderLight200"
              shadowColor="$shadowColor"
              shadowOffset={{ width: 0, height: 6 }}
              shadowOpacity={0.12}
              shadowRadius={16}
              elevation={10}
              zIndex={1000}
              overflow="hidden"
            >
              {/* Header User Profile Info in Menu */}
              <VStack p="$4" pb="$3" bg="#ffffff">
                <Text color="$textDark900" fontWeight="$bold" fontSize="$md">
                  {orgNameText}
                </Text>
                <Text color="$textDark500" fontSize="$xs">
                  {roleBadgeText}
                </Text>
              </VStack>

              <Divider borderColor="$borderLight200" />

              {/* Menu Items List */}
              <VStack py="$2">
                {menuItems.map((item: MenuItemConfig) => {
                  const isActive =
                    currentRoute === item.route ||
                    (item.route === 'dashboard' && currentRoute === 'dashboard');
                  const labelText = t(item.labelKey) || item.label;

                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => handleMenuSelect(item.route)}
                      px="$4"
                      py="$2.5"
                      bg={isActive ? '#FDF2F5' : 'transparent'}
                      $hover={{ bg: isActive ? '#FDF2F5' : '$backgroundLight100' }}
                      $web-style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                    >
                      <HStack alignItems="center" space="md">
                        <LucideIcon
                          name={item.iconName}
                          size={18}
                          color={isActive ? primaryColor : '#4B5563'}
                        />
                        <Text
                          color={isActive ? primaryColor : '$textDark800'}
                          fontWeight={isActive ? '$bold' : '$normal'}
                          fontSize="$sm"
                        >
                          {labelText}
                        </Text>
                      </HStack>
                    </Pressable>
                  );
                })}

                <Divider borderColor="$borderLight100" my="$1" />

                {/* Logout Option */}
                <Pressable
                  onPress={() => handleMenuSelect('logout')}
                  px="$4"
                  py="$2.5"
                  $hover={{ bg: '$backgroundLight100' }}
                  $web-style={{ cursor: 'pointer' }}
                >
                  <HStack alignItems="center" space="md">
                    <LucideIcon name="LogOut" size={18} color="#DC2626" />
                    <Text color="#DC2626" fontWeight="$medium" fontSize="$sm">
                      {t('common.logout') || 'Logout'}
                    </Text>
                  </HStack>
                </Pressable>
              </VStack>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MentorHeader;
