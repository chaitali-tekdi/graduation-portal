import React, { useState } from 'react';
import { Box, Text, VStack, Pressable } from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import { SupportCardConfig } from '@constants/SUPPORT_PROVIDER_CONFIG';

interface SupportCardProps {
  card: SupportCardConfig;
  onPress: (route: string) => void;
}

export const SupportCard: React.FC<SupportCardProps> = ({ card, onPress }) => {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const title = t(card.titleKey) || card.defaultTitle;
  const description = t(card.descKey) || card.defaultDesc;

  const borderColor = isHovered
    ? card.hoverBorderHex || '#8B2842'
    : '$borderLight200';

  return (
    <Pressable
      onPress={() => onPress(card.route)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      flex={1}
      minWidth={260}
      maxWidth={340}
      bg="#ffffff"
      borderRadius={16}
      borderWidth={isHovered ? 2.5 : 1}
      borderColor={borderColor}
      p="$6"
      alignItems="center"
      justifyContent="center"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: isHovered ? 6 : 2 }}
      shadowOpacity={isHovered ? 0.1 : 0.04}
      shadowRadius={isHovered ? 12 : 6}
      elevation={isHovered ? 4 : 1}
      $web-style={{
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      <VStack alignItems="center" space="md" width="100%">
        {/* Circle Icon Container */}
        <Box
          width={64}
          height={64}
          borderRadius={32}
          bg={card.iconBg}
          alignItems="center"
          justifyContent="center"
          mb="$2"
        >
          <LucideIcon name={card.iconName} size={28} color={card.iconColor} />
        </Box>

        {/* Card Title */}
        <Text
          color="$textDark900"
          fontWeight="$bold"
          fontSize="$lg"
          textAlign="center"
        >
          {title}
        </Text>

        {/* Card Description */}
        <Text
          color="$textDark600"
          fontSize="$xs"
          textAlign="center"
          lineHeight={18}
        >
          {description}
        </Text>
      </VStack>
    </Pressable>
  );
};

export default SupportCard;
