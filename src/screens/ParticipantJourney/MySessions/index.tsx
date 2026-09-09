import React, { useState, useEffect, useMemo } from 'react';
import { Box, VStack, HStack, Text, Heading, Pressable } from '@gluestack-ui/themed';
import { Container, LucideIcon, Loader } from '@ui';
import { useAuth } from '@contexts/AuthContext';
import { useLanguage } from '@contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import dataService from '../../../services/dataService';
import { ProjectData, Task } from '../../../project-player/types/project.types';
import { TASK_STATUS } from '@constants/app.constant';
import { theme } from '@config/theme';
import { mySessionsStyles } from './Styles';
import { isWeb } from '@utils/platform';

type SessionTab = 'scheduled' | 'attended' | 'missed';

interface SessionItem {
  id: string;
  title: string;
  provider: string;
  date: string;
  duration: string;
  mode: string;
  location: string;
  tags: string[];
  status: 'scheduled' | 'attended' | 'missed';
}

const extractSessionTasks = (tasks: Task[] = []): Task[] => {
  const result: Task[] = [];
  const traverse = (items: Task[]) => {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      } else if (item.tasks && item.tasks.length > 0) {
        traverse(item.tasks);
      } else {
        result.push(item);
      }
    }
  };
  traverse(tasks);
  return result;
};

const getModeIcon = (mode: string) => {
  const lower = (mode || '').toLowerCase();
  if (lower.includes('online') || lower.includes('virtual')) {
    return 'Video';
  }
  if (lower.includes('hybrid')) {
    return 'Building';
  }
  return 'Users';
};

const MySessionsScreen: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<SessionTab>('scheduled');
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  useEffect(() => {
    const fetchSessionData = async () => {
      const participantId = (user as any)?.externalId || (user as any)?.userId || user?.id || '';
      const authUserId = user?.id || '';

      if (!participantId || !authUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const detailResult = await dataService.getParticipantDetails(participantId, authUserId);
        const pData = detailResult?.data || null;

        if (pData) {
          const projectId =
            (pData?.status === 'NOT_ONBOARDED' && pData?.onBoardedProjectId)
              ? pData.onBoardedProjectId
              : pData?.idpProjectId || pData?.onBoardedProjectId || '';

          if (projectId) {
            const response = await dataService.getProject<ProjectData>(
              pData?.id || participantId,
              projectId,
              authUserId,
            );

            if (response?.data?.tasks) {
              const leafTasks = extractSessionTasks(response.data.tasks);
              const mappedSessions: SessionItem[] = leafTasks.map(task => {
                const meta = task.metaInformation || {};
                const taskStatusStr = (task.status as string) || '';
                let status: 'scheduled' | 'attended' | 'missed' = 'scheduled';
                if (
                  taskStatusStr === TASK_STATUS.COMPLETED ||
                  taskStatusStr === 'completed' ||
                  taskStatusStr === 'attended' ||
                  meta.status === 'attended'
                ) {
                  status = 'attended';
                } else if (taskStatusStr === 'missed' || meta.status === 'missed') {
                  status = 'missed';
                }

                return {
                  id: task._id || '',
                  title: task.name || task.label || '',
                  provider: task.serviceProvider || meta.provider || meta.organization || meta.serviceProvider || '',
                  date: meta.date || meta.formattedDate || meta.scheduledDate || '',
                  duration: meta.duration || '',
                  mode: meta.mode || meta.deliveryMode || '',
                  location: meta.location || meta.venue || '',
                  tags: Array.isArray(meta.tags)
                    ? meta.tags
                    : meta.category
                      ? [meta.category]
                      : [],
                  status,
                };
              });

              setSessions(mappedSessions);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch sessions data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [user]);

  const handleBackToHome = () => {
    // @ts-ignore
    navigation.navigate('participant-portal');
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => session.status === activeTab);
  }, [sessions, activeTab]);

  const renderBadge = (status: 'scheduled' | 'attended' | 'missed') => {
    switch (status) {
      case 'attended':
        return (
          <Box {...mySessionsStyles.statusBadgeAttended}>
            <LucideIcon name="CheckCircle2" size={12} color={theme.tokens.colors.success600} strokeWidth={2} />
            <Text {...mySessionsStyles.statusTextAttended}>
              {t('participantJourney.tabs.attended')}
            </Text>
          </Box>
        );
      case 'missed':
        return (
          <Box {...mySessionsStyles.statusBadgeMissed}>
            <LucideIcon name="AlertCircle" size={12} color={theme.tokens.colors.error600} strokeWidth={2} />
            <Text {...mySessionsStyles.statusTextMissed}>
              {t('participantJourney.tabs.missed')}
            </Text>
          </Box>
        );
      case 'scheduled':
      default:
        return (
          <Box {...mySessionsStyles.statusBadgeScheduled}>
            <LucideIcon name="Clock" size={12} color={theme.tokens.colors.blue600} strokeWidth={2} />
            <Text {...mySessionsStyles.statusTextScheduled}>
              {t('participantJourney.tabs.scheduled')}
            </Text>
          </Box>
        );
    }
  };

  return (
    <Box {...mySessionsStyles.page}>
      <Box {...mySessionsStyles.topHeaderBar}>
        <Container {...mySessionsStyles.headerContainer}>
          <HStack {...mySessionsStyles.headerTitleRow}>
            <Pressable
              {...mySessionsStyles.backPressable}
              {...(isWeb && {
                onHoverIn: () => setIsBackHovered(true),
                onHoverOut: () => setIsBackHovered(false),
              })}
              onPress={handleBackToHome}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
            >
              <Box
                {...mySessionsStyles.backIconBox}
                {...(isBackHovered ? mySessionsStyles.backIconBoxHover : {})}
              >
                <LucideIcon
                  name="ArrowLeft"
                  size={16}
                  color={isBackHovered ? theme.tokens.colors.primary500 : '$textDark900'}
                  strokeWidth={1.5}
                />
              </Box>
            </Pressable>
            <Heading {...mySessionsStyles.title}>
              {t('participantJourney.cards.sessions')}
            </Heading>
          </HStack>
        </Container>
      </Box>

      <Box {...mySessionsStyles.contentArea}>
        <Container {...mySessionsStyles.container}>
          <VStack {...mySessionsStyles.content}>
            <Text {...mySessionsStyles.subtitle}>
              {t('participantJourney.sessionsSubtitle')}
            </Text>

            <HStack {...mySessionsStyles.tabsContainer}>
              <Pressable
                {...mySessionsStyles.tabItem}
                {...(activeTab === 'scheduled'
                  ? mySessionsStyles.tabItemActive
                  : mySessionsStyles.tabItemInactive)}
                onPress={() => setActiveTab('scheduled')}
              >
                <Text
                  {...mySessionsStyles.tabText}
                  {...(activeTab === 'scheduled'
                    ? mySessionsStyles.tabTextActive
                    : mySessionsStyles.tabTextInactive)}
                >
                  {t('participantJourney.tabs.scheduled')}
                </Text>
              </Pressable>

              <Pressable
                {...mySessionsStyles.tabItem}
                {...(activeTab === 'attended'
                  ? mySessionsStyles.tabItemActive
                  : mySessionsStyles.tabItemInactive)}
                onPress={() => setActiveTab('attended')}
              >
                <Text
                  {...mySessionsStyles.tabText}
                  {...(activeTab === 'attended'
                    ? mySessionsStyles.tabTextActive
                    : mySessionsStyles.tabTextInactive)}
                >
                  {t('participantJourney.tabs.attended')}
                </Text>
              </Pressable>

              <Pressable
                {...mySessionsStyles.tabItem}
                {...(activeTab === 'missed'
                  ? mySessionsStyles.tabItemActive
                  : mySessionsStyles.tabItemInactive)}
                onPress={() => setActiveTab('missed')}
              >
                <Text
                  {...mySessionsStyles.tabText}
                  {...(activeTab === 'missed'
                    ? mySessionsStyles.tabTextActive
                    : mySessionsStyles.tabTextInactive)}
                >
                  {t('participantJourney.tabs.missed')}
                </Text>
              </Pressable>
            </HStack>

            {isLoading ? (
              <Loader />
            ) : filteredSessions.length === 0 ? (
              <Box {...mySessionsStyles.emptyStateContainer}>
                <Text {...mySessionsStyles.emptyStateText}>
                  {t('participantJourney.noSessions')}
                </Text>
              </Box>
            ) : (
              <Box {...mySessionsStyles.cardsGrid}>
                {filteredSessions.map(session => {
                  const modeIconName = getModeIcon(session.mode);

                  return (
                    <Box key={session.id} {...mySessionsStyles.cardBox}>
                      <HStack {...mySessionsStyles.cardHeader}>
                        <Heading {...mySessionsStyles.cardTitle}>
                          {session.title}
                        </Heading>
                        {renderBadge(session.status)}
                      </HStack>

                      {session.provider ? (
                        <Text {...mySessionsStyles.cardSubtitle}>
                          {session.provider}
                        </Text>
                      ) : null}

                      {session.date || session.duration || session.mode ? (
                        <HStack {...mySessionsStyles.metaRow}>
                          <LucideIcon
                            name="Calendar"
                            size={14}
                            color={theme.tokens.colors.textMutedForeground}
                            strokeWidth={1.5}
                          />
                          {session.date ? (
                            <Text {...mySessionsStyles.metaText}>
                              {session.date}
                            </Text>
                          ) : null}
                          {session.date && (session.duration || session.mode) ? (
                            <Text {...mySessionsStyles.metaText}>•</Text>
                          ) : null}
                          {session.duration ? (
                            <Text {...mySessionsStyles.metaText}>
                              {session.duration}
                            </Text>
                          ) : null}
                          {session.duration && session.mode ? (
                            <Text {...mySessionsStyles.metaText}>•</Text>
                          ) : null}
                          {session.mode ? (
                            <>
                              <LucideIcon
                                name={modeIconName}
                                size={14}
                                color={theme.tokens.colors.textMutedForeground}
                                strokeWidth={1.5}
                              />
                              <Text {...mySessionsStyles.metaText}>
                                {session.mode}
                              </Text>
                            </>
                          ) : null}
                        </HStack>
                      ) : null}

                      {session.location ? (
                        <HStack {...mySessionsStyles.locationRow}>
                          <LucideIcon
                            name="MapPin"
                            size={14}
                            color={theme.tokens.colors.textMutedForeground}
                            strokeWidth={1.5}
                          />
                          <Text {...mySessionsStyles.locationText}>
                            {session.location}
                          </Text>
                        </HStack>
                      ) : null}

                      {session.tags && session.tags.length > 0 ? (
                        <HStack {...mySessionsStyles.tagsRow}>
                          {session.tags.map((tag, idx) => (
                            <Box key={idx} {...mySessionsStyles.tagChip}>
                              <Text {...mySessionsStyles.tagText}>{tag}</Text>
                            </Box>
                          ))}
                        </HStack>
                      ) : null}
                    </Box>
                  );
                })}
              </Box>
            )}
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default MySessionsScreen;
