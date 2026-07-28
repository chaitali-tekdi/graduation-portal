import React, { useMemo } from 'react';
import { ScrollView, useColorMode, VStack } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import { SupportProviderHeader } from '../../screens/SupportProvider/components/SupportProviderHeader';
import { stylesLayout } from '../lc/Styles';
import { SUPPORT_PROVIDER_MENU_OPTIONS } from '@constants/PROFILE_MENU_OPTIONS';
import { useAuth } from '@contexts/AuthContext';
import { useLanguage } from '@contexts/LanguageContext';
import { useDocumentTitle } from '@hooks';
import logger from '@utils/logger';
import { useGlobal } from '@contexts/GlobalContext';

interface LayoutProps {
  title?: string;
  children: React.ReactNode;
  disableScroll?: boolean;
  pageName?: string; // Page name for title setting
}

const Layout: React.FC<LayoutProps> = ({ title, children, disableScroll, pageName }) => {
  const mode = useColorMode();
  const isDark = mode === 'dark';
  const { logout, navbarData } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { refComponent } = useGlobal();

  // Set document title for web - memoize to avoid recalculation
  const pageTitle = useMemo(() =>
    pageName ? t(`supportProvider.pageTitle.${pageName}`) : (title || ''),
    [pageName, title, t]
  );
  useDocumentTitle(pageTitle);

  // Handle menu item selection
  const handleMenuSelect = (key: string | undefined) => {
    logger.log('Support Provider Menu selected:', key);

    if (key === 'logout') {
      logout();
      return;
    }

    const menuItem = SUPPORT_PROVIDER_MENU_OPTIONS.find(item => item.key === key);
    if (menuItem?.route) {
      navigation.navigate(menuItem.route as never);
    }
  };

  return (
    <>
      <SupportProviderHeader
        title={pageTitle}
        subTitle={navbarData?.subtitle}
        hamburgerMenuItems={SUPPORT_PROVIDER_MENU_OPTIONS}
        onHamburgerMenuSelect={handleMenuSelect}
      />

      {/* Main Content */}
      {(() => {
        const content = <>{children}</>;
        if (disableScroll) {
          return (
            <VStack flex={1} bg={isDark ? '$backgroundDark950' : '$accent100'}>
              {content}
            </VStack>
          );
        }
        return (
          <ScrollView
            {...stylesLayout.mainContent}
            bg={isDark ? '$backgroundDark950' : '$accent100'}
          >
            {content}
          </ScrollView>
        );
      })()}
      {refComponent?.bottom || ""}
    </>
  );
};

export default Layout;
