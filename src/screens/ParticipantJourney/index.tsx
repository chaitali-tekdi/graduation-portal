import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Heading, Pressable } from '@gluestack-ui/themed';
import { Container, LucideIcon } from '@ui';
import { useAuth } from '@contexts/AuthContext';
import { useLanguage } from '@contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { STATUS } from '@constants/app.constant';
import { PARTICIPANT_JOURNEY_CARDS } from '@constants/PARTICIPANT_JOURNEY_CARDS';
import dataService from '../../services/dataService';
import { participantJourneyStyles } from './Styles';
import { isWeb } from '@utils/platform';

const IconBadge: React.FC<{
  name: string;
  bg: string;
  color: string;
}> = ({ name, bg, color }) => (
  <Box {...participantJourneyStyles.iconBadge} bg={bg}>
    <LucideIcon name={name} size={16} color={color} strokeWidth={2} />
  </Box>
);

const ParticipantJourneyPortal: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | undefined>(user?.status);

  const coachName = user?.coachName;
  const coachContact = user?.coachContact;

  useEffect(() => {
    const participantId = (user as any)?.externalId || (user as any)?.userId || user?.id || '';
    const authUserId = user?.id || '';

    if (user?.status) {
      setCurrentStatus(user.status);
    }

    if (participantId && authUserId) {
      dataService.getParticipantDetails(participantId, authUserId)
        .then(result => {
          if (result?.data?.status) {
            setCurrentStatus(result.data.status);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const DISABLEABLE_CARD_IDS = ['idp-progress', 'sessions', 'graduation'];
  const normalizedStatus = (currentStatus || '').toString().trim().toUpperCase().replace(/\s+/g, '_');
  const shouldDisableCards =
    normalizedStatus === STATUS.NOT_ONBOARDED ||
    normalizedStatus === STATUS.ONBOARDED ||
    normalizedStatus === 'NOT_ONBOARDED' ||
    normalizedStatus === 'ONBOARDED';

  const handleCardPress = (card: any) => {
    if (card.variant === 'link' && card.navigationUrl) {
      // @ts-ignore
      navigation.navigate(card.navigationUrl);
    }
  };

  const renderCardContent = (card: any) => {
    if (card.variant === 'coach') {
      return (
        <VStack {...participantJourneyStyles.coachCardContent}>
          {card.rows.map((row: any) => {
            const isNameRow = row.id === 'coach-name';
            const value = isNameRow ? coachName : coachContact;
            const rowStyle = isNameRow
              ? participantJourneyStyles.coachRowFirstName
              : participantJourneyStyles.coachRow;

            return (
              <HStack key={row.id} {...rowStyle}>
                <IconBadge name={row.icon} bg={row.iconBg} color={row.iconColor} />
                <VStack {...participantJourneyStyles.coachText}>
                  <Text {...participantJourneyStyles.coachLabel}>{t(row.label)}</Text>
                  <Text {...participantJourneyStyles.coachValue}>{value || ''}</Text>
                </VStack>
              </HStack>
            );
          })}
        </VStack>
      );
    }

    return (
      <VStack {...participantJourneyStyles.linkCardContent}>
        <IconBadge name={card.icon} bg={card.iconBg} color={card.iconColor} />
        <VStack {...participantJourneyStyles.textContainer}>
          <Text {...participantJourneyStyles.cardTitle}>{t(card.title)}</Text>
          <Text {...participantJourneyStyles.cardDescription}>
            {t(card.description)}
          </Text>
        </VStack>
      </VStack>
    );
  };

  return (
    <Box {...participantJourneyStyles.page}>
      <Container {...participantJourneyStyles.container}>
        <VStack {...participantJourneyStyles.content}>
          <VStack {...participantJourneyStyles.header}>
            <Heading {...participantJourneyStyles.title}>
              {t('participantJourney.title')}
            </Heading>
            <Text {...participantJourneyStyles.welcome}>
              {user?.name
                ? t('participantJourney.welcomeBackNamed', { name: user.name })
                : t('participantJourney.welcomeBack')}
            </Text>
          </VStack>

          <Box {...participantJourneyStyles.cardsGrid}>
            {PARTICIPANT_JOURNEY_CARDS.map(card => {
              const isHovered = hoveredCardId === card.id;
              const isCardDisabled =
                DISABLEABLE_CARD_IDS.includes(card.id) && shouldDisableCards;
              const hoverBorderColor = card.hoverBorderColor || card.iconColor;
              const hoverBg = card.hoverBg || '$white';

              return (
                <Box key={card.id} {...participantJourneyStyles.cardColumn}>
                  <Pressable
                    {...participantJourneyStyles.pressableCard}
                    disabled={isCardDisabled}
                    onPress={() => {
                      if (!isCardDisabled) {
                        handleCardPress(card);
                      }
                    }}
                    {...(isWeb && !isCardDisabled && {
                      onHoverIn: () => setHoveredCardId(card.id),
                      onHoverOut: () => setHoveredCardId(null),
                    })}
                  >
                    <Box
                      {...(card.variant === 'coach'
                        ? participantJourneyStyles.coachCardBox
                        : {
                          ...participantJourneyStyles.cardBox,
                          ...(isCardDisabled ? { opacity: 0.5 } : {}),
                          ...(isHovered && !isCardDisabled
                            ? { borderColor: hoverBorderColor, bg: hoverBg }
                            : {}),
                        })}
                    >
                      {renderCardContent(card)}
                    </Box>
                  </Pressable>
                </Box>
              );
            })}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ParticipantJourneyPortal;
