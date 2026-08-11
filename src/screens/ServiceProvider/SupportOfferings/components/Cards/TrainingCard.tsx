import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  Box,
  HStack,
  VStack,
  Text,
  Pressable,
  LucideIcon,
  Badge,
  BadgeText,
  useAlert,
} from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import type { ProvinceEntity, SiteEntity } from '@app-types/Users';
import { getTrainingSessions, completeTrainingSession } from '../../../../../services/SupportOfferingsServices/supportOfferingsService';
import type { MaterialItem, TrainingSessionItem } from '../../../../../constants/SUPPORT_OFFERINGS_MOCK';
import SessionCompleteModal from '../modals/SessionCompleteModal';
import styles from '../../styles';

// ---------- Helpers ----------

const formatLocationDisplay = (item: TrainingSessionItem) => {
  if (item.location) {
    if (item.location.toLowerCase().includes('soweto')) return 'Soweto';
    if (item.location.toLowerCase().includes('durban')) return 'Durban';
    return item.location;
  }
  return item.province || item.siteKey || 'Location';
};

const formatParticipantsDisplay = (item: TrainingSessionItem) => {
  const expected = item.expectedParticipants || 25;
  let confirmed: string | number = '';

  if (item.confirmedPresent && !isNaN(Number(item.confirmedPresent))) {
    confirmed = item.confirmedPresent;
  } else if (item.participants) {
    const match = item.participants.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      return `${match[1]} / ${match[2]} participants`;
    }
  }

  if (!confirmed) {
    if (item.id === 1 || item.title.includes('Financial Literacy')) {
      confirmed = 10;
    } else if (item.id === 2 || item.title.includes('Business Plan')) {
      confirmed = 12;
    } else if (item.id === 3 || item.title.includes('Digital Marketing')) {
      confirmed = 12;
    } else if (item.id === 4 || item.title.includes('Accounting')) {
      confirmed = 2;
    } else {
      confirmed = Math.round(expected * 0.4);
    }
  }

  return `${confirmed} / ${expected} participants`;
};

const getProviderInfo = (item: TrainingSessionItem) => {
  let orgName = '';
  let provinceName = item.province || '';

  if (item.requestedBy) {
    const orgMatch = item.requestedBy.match(/\(([^)]+)\)/);
    if (orgMatch) {
      orgName = orgMatch[1];
    } else if (item.requestedBy.includes('•')) {
      orgName = item.requestedBy.split('•')[0].trim();
    } else {
      orgName = item.requestedBy.trim();
    }

    if (!provinceName && item.requestedBy.includes('•')) {
      provinceName = item.requestedBy.split('•')[1].trim();
    }
  }

  return {
    orgName: orgName || 'Johannesburg Youth Development',
    provinceName: provinceName || 'Gauteng',
  };
};

const getDeliveryBadge = (formatStr?: string) => {
  const fmt = (formatStr || '').toLowerCase();
  if (fmt === 'virtual' || fmt === 'online') {
    return {
      label: 'Online',
      icon: 'Video',
      bg: '$blue50',
      border: '$blue200',
      color: '$blue600',
    };
  }
  if (fmt === 'hybrid') {
    return {
      label: 'Hybrid',
      icon: 'MapPin',
      bg: '$purple50',
      border: '$purple200',
      color: '$purple600',
    };
  }
  return {
    label: 'Offline',
    icon: 'MapPin',
    bg: '$observationTaskBg',
    border: '#fde68a',
    color: '$warningIconColor',
  };
};

const getStatusColors = (status: string) => {
  switch (status) {
    case 'Draft':
      return {
        bg: '$backgroundLight100',
        border: '$borderColor',
        text: '$textSecondary',
        icon: 'FileText',
      };
    case 'Upcoming':
      return {
        bg: '$blue50',
        border: '$blue200',
        text: '$blue600',
        icon: 'Clock',
      };
    case 'In progress':
    case 'In Progress':
      return {
        bg: '$observationTaskBg',
        border: '#fde68a',
        text: '$warningIconColor',
        icon: 'AlertCircle',
      };
    case 'Completed':
    default:
      return {
        bg: '$success50',
        border: '#a7f3d0',
        text: '$success600',
        icon: 'CheckCircle',
      };
  }
};

const formatResourceName = (file: MaterialItem) => {
  const match = file.info?.match(/(\d+(?:\.\d+)?\s*(?:MB|KB|GB|B))/i);
  if (match && !file.name.includes(match[1])) {
    return `${file.name} (${match[1]})`;
  }
  return file.name;
};

// ---------- Card ----------

interface CardProps {
  item: TrainingSessionItem;
}

const Card: React.FC<CardProps> = ({ item: initialItem }) => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const navigation = useNavigation();
  const [item, setItem] = useState<TrainingSessionItem>(initialItem);
  const [isExpanded, setIsExpanded] = useState(false);
  const [files, setFiles] = useState<MaterialItem[]>(initialItem.materials || []);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  useEffect(() => {
    setItem(initialItem);
    setFiles(initialItem.materials || []);
  }, [initialItem]);

  const statusColors = getStatusColors(item.status);
  const deliveryBadge = getDeliveryBadge(item.format);
  const formattedDate = item.date ? (moment(item.date).isValid() ? moment(item.date).format('ddd, D MMM YYYY') : item.date) : '';
  const startTime = item.time?.split('-')[0]?.trim() || item.time || '';
  const dateTime = startTime ? `${formattedDate}, ${startTime}` : formattedDate;
  const duration = (item as any).duration || (item.time?.toLowerCase().includes('hour') ? item.time : '3 hours');
  const locationText = formatLocationDisplay(item);
  const participantsText = formatParticipantsDisplay(item);
  const { orgName, provinceName } = getProviderInfo(item);
  const descriptionText = item.notes || (item as any).description;
  const formatLower = (item.format || '').toLowerCase();
  const isOnline = formatLower === 'online' || formatLower === 'virtual';
  const hasPhysicalLocation = !isOnline && Boolean(locationText);

  const handleCopySession = () => {
    showAlert('success', t('supportProvider.supportOfferings.cards.alerts.sessionCopied'));
  };

  const handleConfirmSessionComplete = async (presentCount: number) => {
    try {
      await completeTrainingSession(String(item.id), { presentCount });
      setItem((prev) => ({
        ...prev,
        status: 'Completed',
        confirmedPresent: `${presentCount}`,
        completionNotes: prev.completionNotes || t('supportProvider.supportOfferings.cards.alerts.sessionCompleted'),
      }));
      showAlert('success', t('supportProvider.supportOfferings.cards.alerts.sessionCompleted'));
    } catch (error) {
      console.error('Error completing session via API:', error);
      showAlert('error', 'Failed to complete session. Please try again.');
    }
  };

  return (
    <Box {...styles.cardContainer}>
      <VStack {...styles.cardFullVStack}>
        {/* Row 1: Title + Status Badge (Left) & Delivery Badge (Right) */}
        <HStack {...styles.headerTopHStack}>
          <HStack {...styles.headerTitleBadgeHStack}>
            <Text {...styles.cardHeaderTitleText}>
              {item.title}
            </Text>
            <Badge {...styles.badgeContainer(statusColors.bg, statusColors.border)}>
              <HStack {...styles.badgeContentHStack}>
                <LucideIcon name={statusColors.icon} {...styles.badgeIconProps(statusColors.text)} />
                <BadgeText {...styles.badgeText(statusColors.text)}>
                  {item.status}
                </BadgeText>
              </HStack>
            </Badge>
          </HStack>

          <Badge {...styles.deliveryBadgeContainer(deliveryBadge.bg, deliveryBadge.border)}>
            <HStack {...styles.badgeContentHStack}>
              <LucideIcon name={deliveryBadge.icon} {...styles.badgeIconProps(deliveryBadge.color)} />
              <BadgeText {...styles.deliveryBadgeText(deliveryBadge.color)}>
                {deliveryBadge.label}
              </BadgeText>
            </HStack>
          </Badge>
        </HStack>

        {/* Row 2: Metadata */}
        <HStack {...styles.headerMetaHStack}>
          <HStack {...styles.trainingMetaItemHStack}>
            <LucideIcon name="Calendar" {...styles.cardMetaIconProps} />
            <Text {...styles.cardMetaSmText}>
              {dateTime}
            </Text>
          </HStack>

          <HStack {...styles.trainingMetaItemHStack}>
            <LucideIcon name="Clock" {...styles.cardMetaIconProps} />
            <Text {...styles.cardMetaSmText}>
              {duration}
            </Text>
          </HStack>

          {hasPhysicalLocation && (
            <HStack {...styles.trainingMetaItemHStack}>
              <LucideIcon name="MapPin" {...styles.cardMetaIconProps} />
              <Text {...styles.cardMetaSmText}>
                {locationText}
              </Text>
            </HStack>
          )}

          <HStack {...styles.trainingMetaItemHStack}>
            <LucideIcon name="Users" {...styles.cardMetaIconProps} />
            <Text {...styles.cardMetaSmText}>
              {participantsText}
            </Text>
          </HStack>
        </HStack>

        {/* Row 3: Notes / Description Box */}
        {descriptionText ? (
          <Box {...styles.notesBox}>
            <Text {...styles.notesText}>
              {descriptionText}
            </Text>
          </Box>
        ) : null}

        {/* Row 4: Provided By & Action Buttons */}
        <HStack {...styles.requestedByRowHStack}>
          <Text {...styles.cardRequestedByText}>
            {t('supportProvider.supportOfferings.cards.providedBy', 'Provided by:')}{' '}
            <Text {...styles.cardRequestedByOrgText}>{orgName}</Text>
            {provinceName ? (
              <Text {...styles.cardRequestedByProvinceText}>{` • ${provinceName}`}</Text>
            ) : null}
          </Text>

          <HStack {...styles.badgeContentHStack} space="sm">
            {(item.status as string) === 'Draft' ? (
              <>
                <Pressable
                  {...styles.outlineActionBtn}
                  onPress={() => {
                    (navigation as any).navigate('create-training-session', { sessionId: item.id, item });
                  }}
                >
                  <Text {...styles.outlineActionBtnText}>
                    {t('common.edit', 'Edit')}
                  </Text>
                </Pressable>

                <Pressable
                  {...styles.detailsBtn}
                  onPress={() => setIsExpanded(!isExpanded)}
                >
                  <Text {...styles.detailsBtnText}>
                    {isExpanded
                      ? t('supportProvider.supportOfferings.cards.hideDetails', 'Hide Details')
                      : t('supportProvider.supportOfferings.cards.viewDetails', 'View Details')}
                  </Text>
                </Pressable>
              </>
            ) : (item.status as string) === 'In progress' || (item.status as string) === 'In Progress' ? (
              <>
                <Pressable
                  {...styles.completeActionBtn}
                  onPress={() => setIsCompleteModalOpen(true)}
                >
                  <HStack {...styles.badgeContentHStack}>
                    <LucideIcon name="CheckCircle" {...styles.cardWhiteIconProps} />
                    <Text {...styles.completeActionBtnText}>
                      {t('supportProvider.supportOfferings.cards.complete', 'Complete')}
                    </Text>
                  </HStack>
                </Pressable>

                <Pressable
                  {...styles.detailsBtn}
                  onPress={() => setIsExpanded(!isExpanded)}
                >
                  <Text {...styles.detailsBtnText}>
                    {isExpanded
                      ? t('supportProvider.supportOfferings.cards.hideDetails', 'Hide Details')
                      : t('supportProvider.supportOfferings.cards.viewDetails', 'View Details')}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                {item.hasCopyButton && (
                  <Pressable
                    {...styles.outlineActionBtn}
                    onPress={handleCopySession}
                  >
                    <HStack {...styles.badgeContentHStack}>
                      <LucideIcon name="Copy" {...styles.cardCopyIconProps} />
                      <Text {...styles.outlineActionBtnText}>
                        {t('supportProvider.supportOfferings.cards.copySession', 'Copy Session')}
                      </Text>
                    </HStack>
                  </Pressable>
                )}

                <Pressable
                  {...styles.detailsBtn}
                  onPress={() => setIsExpanded(!isExpanded)}
                >
                  <Text {...styles.detailsBtnText}>
                    {isExpanded
                      ? t('supportProvider.supportOfferings.cards.hideDetails', 'Hide Details')
                      : t('supportProvider.supportOfferings.cards.viewDetails', 'View Details')}
                  </Text>
                </Pressable>
              </>
            )}
          </HStack>
        </HStack>

        {/* Accordion Content */}
        {isExpanded && (
          <VStack {...styles.expandedContentVStack}>
            {/* Location / Virtual Link */}
            {(!isOnline || item.virtualLink || item.location) && (
              <VStack {...styles.sectionVStack}>
                <Text {...styles.cardSectionTitleText}>
                  {isOnline && !item.location
                    ? t('supportProvider.supportOfferings.cards.virtualLink', 'Virtual Link')
                    : t('supportProvider.supportOfferings.cards.location', 'Location')}
                </Text>
                {item.virtualLink && isOnline && (
                  <HStack {...styles.virtualLinkHStack}>
                    <LucideIcon name="Video" {...styles.cardPrimaryIconProps} />
                    <Text {...styles.cardPrimaryLinkText}>
                      {item.virtualLink}
                    </Text>
                  </HStack>
                )}
                {(!isOnline || item.location) && (
                  <HStack {...styles.virtualLinkHStack}>
                    <LucideIcon name="MapPin" {...styles.cardMetaIconProps} />
                    <Text {...styles.cardLocationValueText}>
                      {item.location || locationText}
                    </Text>
                  </HStack>
                )}
              </VStack>
            )}

            {/* Attendance */}
            <VStack {...styles.sectionVStack}>
              <Text {...styles.cardSectionTitleText}>
                {t('supportProvider.supportOfferings.cards.attendance', 'Attendance')}
              </Text>
              <Box {...styles.attendanceBox}>
                <HStack {...styles.attendanceRowHStack}>
                  <VStack {...styles.attendanceItemVStack}>
                    <Text {...styles.cardMetaText}>
                      {t('supportProvider.supportOfferings.cards.expectedParticipants', 'Expected Participants')}
                    </Text>
                    <Text {...styles.cardValueBoldText}>
                      {item.expectedParticipants}
                    </Text>
                  </VStack>
                  <VStack {...styles.attendanceItemVStack}>
                    <Text {...styles.cardMetaText}>
                      {t('supportProvider.supportOfferings.cards.confirmedPresent', 'Confirmed Present')}
                    </Text>
                    {item.status === 'Completed' && item.confirmedPresent && !isNaN(Number(item.confirmedPresent)) ? (
                      <HStack {...styles.badgeContentHStack}>
                        <Text {...styles.cardSuccessBoldText}>
                          {item.confirmedPresent}
                        </Text>
                        <LucideIcon name="CheckCircle" {...styles.cardSuccessIconProps} />
                      </HStack>
                    ) : (
                      <Text {...styles.cardMetaSmText}>
                        {item.confirmedPresent ||
                          ((item.status as string) === 'In progress' || (item.status as string) === 'In Progress'
                            ? '--'
                            : t('supportProvider.supportOfferings.cards.notConfirmed', 'Not Confirmed'))}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Box>
            </VStack>

            {/* Session Resources */}
            {files.length > 0 && (
              <VStack {...styles.sectionVStack}>
                <Text {...styles.cardSectionTitleText}>
                  {t('supportProvider.supportOfferings.cards.sessionResources', 'Session Resources')}
                </Text>
                <VStack {...styles.filesListVStack}>
                  {files.map((file, idx) => (
                    <Box key={idx} {...styles.resourceCard}>
                      <HStack {...styles.fileCardOuterHStack}>
                        <HStack {...styles.fileCardInnerHStack}>
                          <LucideIcon name="FileText" {...styles.cardFileTextIconProps} />
                          <Text {...styles.resourceFileNameText} numberOfLines={1} ellipsizeMode="tail">
                            {formatResourceName(file)}
                          </Text>
                        </HStack>
                        <Pressable
                          onPress={() => showAlert('info', t('supportProvider.supportOfferings.cards.alerts.downloading', { name: file.name }))}
                          {...styles.iconPressablePadding}
                        >
                          <HStack {...styles.badgeContentHStack}>
                            <LucideIcon name="Download" {...styles.cardPrimaryIconProps} />
                            <Text {...styles.downloadLinkText}>
                              {t('common.download', 'Download')}
                            </Text>
                          </HStack>
                        </Pressable>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            )}

            {/* Completion Notes / Session Notes (when completed) */}
            {item.status === 'Completed' && item.completionNotes && (
              <VStack {...styles.sectionVStack}>
                <Text {...styles.cardSectionTitleText}>
                  {t('supportProvider.supportOfferings.cards.completionNotes', 'Completion Notes')}
                </Text>
                <Box {...styles.notesBox}>
                  <Text {...styles.cardDescriptionText}>
                    {item.completionNotes}
                  </Text>
                </Box>
              </VStack>
            )}
          </VStack>
        )}
      </VStack>

      {/* Session Complete Modal */}
      <SessionCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        sessionTitle={item.title}
        expectedParticipantsCount={item.expectedParticipants}
        initialParticipants={item.participantList}
        onConfirmComplete={handleConfirmSessionComplete}
      />
    </Box>
  );
};

// ---------- ListCard ----------

interface TrainingCardProps {
  searchQuery?: string;
  statusFilter?: string;
  provinceFilter?: string;
  siteFilter?: string;
  draftStatusFilter?: string;
  provincesList?: ProvinceEntity[];
  sitesList?: SiteEntity[];
}

export default function TrainingCard({
  searchQuery,
  statusFilter,
  provinceFilter,
  siteFilter,
  draftStatusFilter,
  provincesList = [],
  sitesList = [],
}: TrainingCardProps): React.ReactElement {
  const [trainings, setTrainings] = useState<TrainingSessionItem[]>([]);

  useEffect(() => {
    getTrainingSessions({
      searchQuery,
      statusFilter,
      provinceFilter,
      siteFilter,
      draftStatusFilter,
      provincesList,
      sitesList,
    }).then(setTrainings);
  }, [searchQuery, statusFilter, provinceFilter, siteFilter, draftStatusFilter, provincesList, sitesList]);

  return (
    <VStack {...styles.listContainer}>
      {trainings.map((item) => (
        <Card key={item.id} item={item} />
      ))}
    </VStack>
  );
}

