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
import SUPPORT_PROVIDER_CONFIG, {
  SupportCardConfig,
} from '@constants/SUPPORT_PROVIDER_CONFIG';
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import SupportCard from './components/SupportCard';

interface CreateSupportScreenProps {
  onNavigate: (route: string) => void;
}

export const CreateSupportScreen: React.FC<CreateSupportScreenProps> = ({
  onNavigate,
}) => {
  const { t } = useLanguage();
  const { createSupport } = SUPPORT_PROVIDER_CONFIG;

  const backText = t(createSupport.backKey) || createSupport.defaultBack;
  const pageTitle = t(createSupport.titleKey) || createSupport.defaultTitle;
  const pageSubtitle =
    t(createSupport.subtitleKey) || createSupport.defaultSubtitle;

  return (
    <ScrollView flex={1} bg="$backgroundLight50">
      {/* Styled Top Header Container with Background Color and Bottom Border */}
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
          maxWidth={860}
          alignSelf="center"
          px="$4"
          $md-px="$8"
        >
          {/* Back Button */}
          <Pressable
            onPress={() => onNavigate('dashboard')}
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

          {/* Center-aligned Title and Subtitle Section */}
          <VStack space="xs" alignItems="flex-start">
            <Text color="$textDark900" {...TYPOGRAPHY.h1} fontWeight="$bold" alignItems="flex-start">
              {pageTitle}
            </Text>
            <Text color="$textDark600" {...TYPOGRAPHY.bodySmall} alignItems="flex-start">
              {pageSubtitle}
            </Text>
          </VStack>
        </Box>
      </Box>

      {/* Cards Container Section */}
      <Box
        width="100%"
        maxWidth={860}
        alignSelf="center"
        px="$4"
        $md-px="$8"
        pb="$12"
      >
        <Box
          flexDirection="column"
          $md-flexDirection="row"
          justifyContent="center"
          alignItems="stretch"
          gap="$6"
          maxWidth={1080}
          alignSelf="center"
          width="100%"
        >
          {createSupport.supportCards.map((card: SupportCardConfig) => (
            <SupportCard
              key={card.key}
              card={card}
              onPress={onNavigate}
            />
          ))}
        </Box>
      </Box>
    </ScrollView>
  );
};

export default CreateSupportScreen;
