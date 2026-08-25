import React, { useState, useEffect } from 'react';
import { Box, Button, ButtonText, HStack, LucideIcon, Pressable, Text, VStack, useAlert, Spinner, Container } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import PageHeader from '@components/PageHeader';
import moment from 'moment';
import openExternalLink from '@utils/openExternalLink';
import { getSessionDetails } from '../../../services/mentoringService';
import { requestorAssignMenteesToSession } from '../../../services/SessionSupportServices/sessionRequestorService';
import { getProvincesList } from '../../../services/usersService';
import AssignParticipantsModal from '../components/modals/AssignParticipantsModal';
import styles from '../styles';

const SessionDetailsScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute() as any;
  const { showAlert } = useAlert();

  const { sessionId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Fetch session details ONLY ONCE when sessionId mounts
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [detailsRes, provincesData] = await Promise.all([
          getSessionDetails(sessionId),
          getProvincesList().catch(() => [])
        ]);

        if (isMounted) {
          const sessionObj = detailsRes?.result || detailsRes?.data || detailsRes;
          setSession(sessionObj);
          setProvinces(provincesData);
        }
      } catch (err) {
        console.error('Error fetching session details:', err);
        if (isMounted) {
          showAlert('error', 'Failed to load session details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleConfirmAssignment = async (selectedIds: string[]) => {
    if (!session) return;
    const id = session.id || session._id;
    try {
      setLoading(true);
      await requestorAssignMenteesToSession(id, selectedIds);
      showAlert(
        'success',
        t(
          'lc.sessionsSupport.alerts.assignSuccess',
          { count: selectedIds.length },
          `${selectedIds.length} participant(s) assigned to session successfully.`
        )
      );

      // Update local state instead of doing another API fetch to fulfill the "fetched ONLY ONCE" rule
      setSession((prev: any) => {
        if (!prev) return prev;
        const currentRemaining = prev.seats_remaining !== undefined ? prev.seats_remaining : (prev.seats_limit || prev.capacity || 0);
        const newRemaining = Math.max(0, currentRemaining - selectedIds.length);
        return {
          ...prev,
          seats_remaining: newRemaining,
        };
      });
    } catch (err) {
      console.error('Error assigning participants:', err);
      showAlert('error', 'Failed to assign participants to session.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$backgroundLight50">
        <Spinner size="large" color="#8B2842" />
      </Box>
    );
  }

  if (!session) {
    return (
      <Box {...styles.detailsScreenRoot}>
        <PageHeader
          backButtonText={t('common.backToSessions', 'Back to Sessions')}
          onBackPress={() => {
            navigation.navigate('sessions-support' as never);
          }}
          _backButton={styles.detailsHeaderBackButton}
        />
        <Box flex={1} justifyContent="center" alignItems="center" p="$4">
          <Text color="$textMuted">{t('lc.sessionsSupport.sessionNotFound', 'Session not found.')}</Text>
        </Box>
      </Box>
    );
  }

  // Parse delivery mode & organization name
  const item = session || {};
  const mentorName = item?.mentor_name || '';
  const rawDeliveryMode = (
    (typeof session.delivery_mode === 'object' ? session.delivery_mode?.value : session.delivery_mode) ||
    session.deliveryMode ||
    ''
  ).toLowerCase();

  const deliveryMode = rawDeliveryMode.includes('hybrid') ? 'hybrid' : (rawDeliveryMode.includes('online') || rawDeliveryMode.includes('virtual') ? 'online' : 'offline');


  // Get Province Name
  const rawProv = session.provinces?.[0] || session?.meta?.provinces?.[0];
  const foundProvince = provinces?.find((e: any) => e._id === rawProv || e.externalId === rawProv || e.name === rawProv);
  const provinceName = foundProvince ? foundProvince.name : (rawProv || '');

  const linkValue = session.meeting_info_details?.link || session.meeting_info?.link || '';
  const descriptionText = session.description || session.notes || '';

  // Date & Time parsing helper
  const parseMoment = (val: any) => {
    if (!val) return null;
    const num = Number(val);
    return moment(!isNaN(num) ? (num < 10000000000 ? num * 1000 : num) : val);
  };

  const startMoment = parseMoment(session.start_date);
  const endMoment = parseMoment(session.end_date);

  // Duration formatting using moment
  const diffMinutes = startMoment && endMoment ? endMoment.diff(startMoment, 'minutes') : 0;
  const durationHours = Math.floor(diffMinutes / 60);
  const durationMins = diffMinutes % 60;
  const durationText = diffMinutes > 0
    ? (durationHours > 0 && durationMins > 0
      ? t('lc.sessionsSupport.sessionDetails.durationValueHoursMinutes', { hours: durationHours, minutes: durationMins })
      : durationHours > 0
        ? t('lc.sessionsSupport.sessionDetails.durationValueHours', { count: durationHours })
        : t('lc.sessionsSupport.sessionDetails.durationValueMinutes', { count: durationMins }))
    : '';

  // Capacity calculation
  const totalSeats = session.seats_limit || session.capacity || 0;
  const remainingSeats = session.seats_remaining !== undefined ? session.seats_remaining : totalSeats;
  const enrolledSeats = Math.max(0, totalSeats - remainingSeats);

  // Format delivery mode label and icon
  const formatLabel = deliveryMode === 'online' ? 'Online' : deliveryMode === 'hybrid' ? 'Hybrid' : 'Offline';
  const formatIconName = deliveryMode === 'online' || deliveryMode === 'hybrid' ? 'Video' : 'MapPin';

  // Dynamic tags mapping (simple, clean, no duplicates)
  const sessionTags = Array.from(
    new Set([
      ...(Array.isArray(session.categories) ? session.categories : []).map((c: any) => (typeof c === 'object' ? c.label || c.name || c.value : c)),
      ...(Array.isArray(session.tags) ? session.tags : []).map((tg: any) => (typeof tg === 'object' ? tg.label || tg.name || tg.value : tg)),
      ...(Array.isArray(session.pathways) ? session.pathways : []).map((p: any) => (typeof p === 'object' ? p.label || p.name || p.value : p)),
      'Participants',
    ])
  ).filter(Boolean);

  // Parse learning objectives
  const rawObjectives = session.learning_objectives || session.meta?.learning_objectives || session.learningObjectives;
  const learningObjectives: string[] = Array.isArray(rawObjectives)
    ? rawObjectives.filter(Boolean)
    : typeof rawObjectives === 'string' && rawObjectives.trim()
      ? rawObjectives.split('\n').map((line: string) => line.replace(/^[•\-*\s]+/, '').trim()).filter(Boolean)
      : [];

  return (
    <Box {...styles.detailsScreenRoot}>
      <PageHeader
        title={session.title}
        _title={styles.detailsHeaderTitle}
        subtitle={mentorName}
        _subtitle={styles.detailsHeaderSubtitle}
        backButtonText={t('lc.sessionsSupport.sessionDetails.backToSessions', 'Back to Sessions')}
        onBackPress={() => { navigation.navigate('sessions-support' as never) }}
        _leftSection={styles.detailsHeaderLeftSection}
        _backButton={styles.detailsHeaderBackButton}
      />

      <Container {...styles.detailsMainContainer}>
        <HStack {...styles.detailsLayoutWrapper}>
          {/* RIGHT COLUMN (Web): Session Details Metadata Info Card */}
          <VStack {...styles.detailsRightCol}>
            {/* About This Session */}
            {descriptionText ? (
              <Box {...styles.detailsContentCard}>
                <Text {...styles.detailsCardHeader}>
                  {t('lc.sessionsSupport.sessionDetails.aboutThisSession')}
                </Text>
                <Text {...styles.detailsCardBodyText}>{descriptionText}</Text>
              </Box>
            ) : null}

            {/* Learning Objectives */}
            {learningObjectives.length > 0 ? (
              <Box {...styles.detailsContentCard}>
                <Text {...styles.detailsCardHeader}>
                  {t('lc.sessionsSupport.sessionDetails.learningObjectives')}
                </Text>
                <VStack>
                  {learningObjectives.map((obj, index) => (
                    <HStack key={index} {...styles.detailsLearningObjectiveItem}>
                      <Box {...styles.detailsLearningObjectiveBullet} bg="$primary500" />
                      <Text {...styles.detailsLearningObjectiveText}>{obj}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            ) : null}

            {/* Assign Participants */}
            <Box {...styles.detailsAssignBox}>
              <VStack {...styles.detailsAssignTextWrapper}>
                <HStack {...styles.detailsAssignHeaderHStack}>
                  <LucideIcon name="UserPlus" {...styles.detailsAssignIconProps} />
                  <Text {...styles.detailsAssignTitle}>
                    {t('lc.sessionsSupport.sessionDetails.assignParticipants')}
                  </Text>
                </HStack>
                <Text {...styles.detailsAssignSubtitle}>
                  {t('lc.sessionsSupport.sessionDetails.assignSubtitle')}
                </Text>
              </VStack>
              <Button
                variant="solid"
                {...styles.detailsAssignButton}
                onPress={() => setIsAssignModalOpen(true)}
              >
                <LucideIcon name="UserPlus" {...styles.detailsAssignIconProps1} />
                <ButtonText {...styles.detailsAssignButtonText}>
                  {t('lc.sessionsSupport.sessionDetails.assignParticipants')}
                </ButtonText>
              </Button>
            </Box>
          </VStack>

          {/* LEFT COLUMN (Web): Session Description/Content Cards */}
          <VStack {...styles.detailsLeftCol}>
            <VStack {...styles.detailsInfoCard}>
              {/* Date & Time */}
              <HStack {...styles.detailsInfoItem}>
                <Box {...styles.detailsDateTimeIconWrapper}>
                  <LucideIcon name="Calendar" {...styles.detailsDateTimeIconProps} />
                </Box>
                <VStack>
                  <Text {...styles.detailsDateTimeLabel}>
                    {t('lc.sessionsSupport.sessionDetails.dateTime')}
                  </Text>
                  <Text {...styles.detailsDateValue}>
                    {startMoment ? startMoment.format('dddd, D MMMM YYYY') : ''}
                  </Text>
                  <Text {...styles.detailsTimeValue}>
                    {startMoment ? startMoment.format('HH:mm') : ''}
                  </Text>
                </VStack>
              </HStack>

              {/* Duration */}
              {durationText ? (
                <HStack {...styles.detailsInfoItem}>
                  <Box {...styles.detailsIconWrapper}>
                    <LucideIcon name="Clock" {...styles.detailsIconProps} />
                  </Box>
                  <VStack>
                    <Text {...styles.detailsItemLabel}>
                      {t('lc.sessionsSupport.sessionDetails.duration')}
                    </Text>
                    <Text {...styles.detailsItemValue}>{durationText}</Text>
                  </VStack>
                </HStack>
              ) : null}

              {/* Format */}
              <HStack {...styles.detailsInfoItem}>
                <Box {...styles.detailsIconWrapper}>
                  <LucideIcon name={formatIconName} {...styles.detailsIconProps} />
                </Box>
                <VStack>
                  <Text {...styles.detailsItemLabel}>
                    {t('lc.sessionsSupport.sessionDetails.format')}
                  </Text>
                  <Text {...styles.detailsItemValue}>{formatLabel}</Text>
                </VStack>
              </HStack>

              {/* Location (Show ONLY the Province name. Do NOT show Site.) */}
              {provinceName ? (
                <HStack {...styles.detailsInfoItem}>
                  <Box {...styles.detailsIconWrapper}>
                    <LucideIcon name="MapPin" {...styles.detailsIconProps} />
                  </Box>
                  <VStack>
                    <Text {...styles.detailsItemLabel}>
                      {t('lc.sessionsSupport.sessionDetails.location')}
                    </Text>
                    <Text {...styles.detailsItemValue}>{provinceName}</Text>
                  </VStack>
                </HStack>
              ) : null}

              {/* Virtual Link (Only render if online link is present) */}
              {(deliveryMode === 'online' || deliveryMode === 'hybrid') && linkValue ? (
                <Pressable onPress={() => openExternalLink(linkValue)}>
                  <HStack {...styles.detailsInfoItem}>
                    <Box {...styles.detailsIconWrapper}>
                      <LucideIcon name="Video" {...styles.detailsIconProps} />
                    </Box>
                    <VStack>
                      <Text {...styles.detailsItemLabel}>
                        {t('lc.sessionsSupport.sessionDetails.virtualLink')}
                      </Text>
                      <Text {...styles.detailsVirtualLinkText}>{linkValue}</Text>
                    </VStack>
                  </HStack>
                </Pressable>
              ) : null}

              {/* Capacity */}
              {totalSeats > 0 ? (
                <HStack {...styles.detailsInfoItem}>
                  <Box {...styles.detailsIconWrapper}>
                    <LucideIcon name="Users" {...styles.detailsIconProps} />
                  </Box>
                  <VStack>
                    <Text {...styles.detailsItemLabel}>
                      {t('lc.sessionsSupport.sessionDetails.capacity')}
                    </Text>
                    <Text {...styles.detailsCapacityText}>
                      {enrolledSeats} / {totalSeats} {t('lc.sessionsSupport.sessionDetails.enrolled')}
                    </Text>
                    <Text {...styles.detailsSpotsText}>
                      {remainingSeats} {t('lc.sessionsSupport.sessionDetails.spotsRemaining')}
                    </Text>
                  </VStack>
                </HStack>
              ) : null}

              {/* Tags */}
              {sessionTags.length > 0 ? (
                <Box {...styles.detailsTagsWrapper}>
                  {sessionTags.map((tag, idx) => (
                    <Box key={idx} {...styles.detailsTagBadge}>
                      <Text {...styles.detailsTagBadgeText}>{tag}</Text>
                    </Box>
                  ))}
                </Box>
              ) : null}
            </VStack>
          </VStack>
        </HStack>
      </Container>

      <AssignParticipantsModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        session={session}
        onConfirm={handleConfirmAssignment}
      />
    </Box>
  );
};

export default SessionDetailsScreen;
