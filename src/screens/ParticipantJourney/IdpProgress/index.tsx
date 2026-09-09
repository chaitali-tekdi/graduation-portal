import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Heading, Pressable } from '@gluestack-ui/themed';
import { Container, LucideIcon, Loader } from '@ui';
import { useAuth } from '@contexts/AuthContext';
import { useLanguage } from '@contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import InterventionPlan from '../../ParticipantDetail/InterventionPlan';
import dataService from '../../../services/dataService';
import { ProjectData } from '../../../project-player/types';
import { MODE } from '@constants/PROJECTDATA';
import { theme } from '@config/theme';
import { idpProgressStyles } from './Styles';
import { isWeb } from '@utils/platform';

const IdpProgressScreen: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [participantData, setParticipantData] = useState<any>(null);
  const [projectData, setProjectData] = useState<ProjectData | undefined>();
  const [projectUnavailableOffline, setProjectUnavailableOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      // The participant's own external/entity ID is stored in externalId or userId on the auth user
      const participantId = (user as any)?.externalId || (user as any)?.userId || user?.id || '';
      const authUserId = user?.id || '';

      if (!participantId || !authUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const detailResult = await dataService.getParticipantDetails(participantId, authUserId);
        const pData = detailResult?.data || null;
        setParticipantData(pData);

        if (pData) {
          const projectId =
            pData?.status === 'NOT_ONBOARDED' && pData?.onBoardedProjectId
              ? pData.onBoardedProjectId
              : pData?.idpProjectId || pData?.onBoardedProjectId || '';

          if (projectId) {
            const response = await dataService.getProject<ProjectData>(
              pData?.id || participantId,
              projectId,
              authUserId,
            );
            if (response?.data) {
              setProjectData(response.data);
            } else if (response?.isOffline && !response?.offlineDataAvailable) {
              setProjectUnavailableOffline(true);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch IDP project data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [user]);

  const handleBackToHome = () => {
    // @ts-ignore
    navigation.navigate('participant-portal');
  };

  return (
    <Box {...idpProgressStyles.page}>
      <Box {...idpProgressStyles.topHeaderBar}>
        <Container {...idpProgressStyles.headerContainer}>
          <HStack {...idpProgressStyles.headerTitleRow}>
            <Pressable
              {...idpProgressStyles.backPressable}
              {...(isWeb && {
                onHoverIn: () => setIsBackHovered(true),
                onHoverOut: () => setIsBackHovered(false),
              })}
              onPress={handleBackToHome}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
            >
              <Box
                {...idpProgressStyles.backIconBox}
                {...(isBackHovered ? idpProgressStyles.backIconBoxHover : {})}
              >
                <LucideIcon
                  name="ArrowLeft"
                  size={16}
                  color={isBackHovered ? theme.tokens.colors.primary500 : '$textDark900'}
                  strokeWidth={1.5}
                />
              </Box>
            </Pressable>
            <Heading {...idpProgressStyles.title}>
              {t('participantJourney.cards.idpProgress')}
            </Heading>
          </HStack>
        </Container>
      </Box>

      <Box {...idpProgressStyles.contentArea}>
        <Container {...idpProgressStyles.container}>
          <VStack {...idpProgressStyles.content}>
            <Text {...idpProgressStyles.subtitle}>
              {t('participantJourney.idpProgressSubtitle')}
            </Text>

            <Box {...idpProgressStyles.idpContent}>
              {isLoading ? (
                <Loader />
              ) : (
                <InterventionPlan
                  mode={MODE.readOnlyMode?.mode}
                  projectData={projectData}
                  projectUnavailableOffline={projectUnavailableOffline}
                  participantProfile={participantData}
                />
              )}
            </Box>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default IdpProgressScreen;
