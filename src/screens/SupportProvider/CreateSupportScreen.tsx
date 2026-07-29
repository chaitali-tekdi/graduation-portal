import React from 'react';
import {
  Box,
  HStack,
  Text,
  VStack,
  ScrollView,
} from '@gluestack-ui/themed';
import { PageHeader } from '@components/PageHeader';
import Container from '@components/ui/Container';
import { useLanguage } from '@contexts/LanguageContext';
import SUPPORT_PROVIDER_CONFIG, {
  SupportCardConfig,
} from '@constants/SUPPORT_PROVIDER_CONFIG';
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import SupportCard from './components/SupportCard';
import { useNavigation } from '@react-navigation/native';

interface CreateSupportScreenProps {
  onNavigate?: (route: string) => void;
}

export const CreateSupportScreen: React.FC<CreateSupportScreenProps> = ({
  onNavigate,
}) => {
  const { t } = useLanguage();
  const { createSupport } = SUPPORT_PROVIDER_CONFIG;
  const navigation = useNavigation();

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigation.navigate(route as never);
    }
  };

  const backText = t(createSupport.backKey) || createSupport.defaultBack;
  const pageTitle = t(createSupport.titleKey) || createSupport.defaultTitle;
  const pageSubtitle =
    t(createSupport.subtitleKey) || createSupport.defaultSubtitle;

  return (
    <VStack flex={1} bg="$backgroundLight50">
      {/* PageHeader at the top with back button */}
      <PageHeader
        backButtonText={backText}
        onBackPress={() => handleNavigate('support-provider-dashboard')}
      />

      {/* Main content ScrollView */}
      <ScrollView flex={1}>
        <Container py="$8" px="$4" $md-px="$8">
          {/* Center-aligned Title and Subtitle Section inside the Container */}
          <VStack space="xs" mb="$6">
            <Text color="$textDark900" {...TYPOGRAPHY.h2} fontWeight="$bold">
              {pageTitle}
            </Text>
            <Text color="$textDark600" {...TYPOGRAPHY.bodySmall}>
              {pageSubtitle}
            </Text>
          </VStack>

          {/* Full-width Divider */}
          <Box height={1} bg="$borderLight200" width="100%" mb="$8" />

          {/* Three cards in a responsive grid */}
          <HStack
            flexDirection="column"
            $md-flexDirection="row"
            justifyContent="center"
            alignItems="stretch"
            gap="$6"
            width="100%"
          >
            {createSupport.supportCards.map((card: SupportCardConfig) => (
              <SupportCard
                key={card.key}
                card={card}
                onPress={handleNavigate}
              />
            ))}
          </HStack>
        </Container>
      </ScrollView>
    </VStack>
  );
};

export default CreateSupportScreen;
