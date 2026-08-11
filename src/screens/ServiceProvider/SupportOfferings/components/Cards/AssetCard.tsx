import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
  LucideIcon,
  Badge,
  BadgeText,
  useAlert,
} from '@ui';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '@contexts/LanguageContext';
import type { ProvinceEntity, SiteEntity } from '@app-types/Users';
import { getAssets } from '../../../../../services/SupportOfferingsServices/supportOfferingsService';
import type { AssetItem } from '../../../../../constants/SUPPORT_OFFERINGS_MOCK';
import styles from '../../styles';

// ---------- Helpers ----------

const getStatusColors = (status: string) => {
  switch (status) {
    case 'Draft':
      return { bg: '$backgroundLight100', border: '$borderColor', text: '$textSecondary', icon: 'FileText' };
    case 'Upcoming':
      return { bg: '$blue50', border: '#bfdbfe', text: '$blue600', icon: 'Clock' };
    case 'In progress':
    case 'In Progress':
      return { bg: '$observationTaskBg', border: '#fde68a', text: '$warningIconColor', icon: 'AlertCircle' };
    case 'Pending':
      return { bg: '$warning50', border: '#fde68a', text: '$warning600', icon: 'Clock' };
    case 'Accepted':
    case 'Completed':
    default:
      return { bg: '$success50', border: '#a7f3d0', text: '$success600', icon: 'CheckCircle' };
  }
};

const getDeliveryBadge = (format?: string) => {
  const f = (format || 'Offline').toLowerCase();
  if (f === 'virtual' || f === 'online') {
    return { label: 'Online', bg: '$blue50', border: '#bfdbfe', color: '$blue600', icon: 'Video' };
  }
  if (f === 'hybrid') {
    return { label: 'Hybrid', bg: '$purple50', border: '#e9d5ff', color: '$purple600', icon: 'Users' };
  }
  return { label: 'Offline', bg: '$warning50', border: '#fef08a', color: '$warning800', icon: 'MapPin' };
};

const formatRequestsDisplay = (requests?: string | number) => {
  if (!requests) return '0 requests / spots';
  const str = String(requests);
  const match = str.match(/\d+/);
  const count = match ? match[0] : str;
  return `${count} requests / spots`;
};

const getProviderInfo = (item: AssetItem) => {
  if ((item as any).providedBy) {
    return (item as any).providedBy;
  }
  if ((item as any).requestedBy) {
    return (item as any).requestedBy.split('•')[0].trim();
  }
  if (item.location) {
    return `${item.location} Community Development`;
  }
  return 'Support Hub';
};

// ---------- Card ----------

interface CardProps {
  item: AssetItem;
}

const Card: React.FC<CardProps> = ({ item }) => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const navigation = useNavigation();

  const statusColors = getStatusColors(item.status);
  const deliveryBadge = getDeliveryBadge((item as any).format);
  const providerName = getProviderInfo(item);
  const requestsText = formatRequestsDisplay(item.requests);
  const descriptionText = item.description;

  const handleCopy = () => {
    showAlert('success', t('supportProvider.supportOfferings.cards.alerts.offeringCopied', 'Offering copied to clipboard!'));
  };

  const handleViewDetails = () => {
    try {
      (navigation as any).navigate('requests', {
        offeringId: item.id,
        offeringType: 'assets',
        item,
      });
    } catch (e) {
      showAlert('info', t('supportProvider.supportOfferings.cards.alerts.navigatingRequests', 'Navigating to requests...'));
    }
  };

  const handleEdit = () => {
    try {
      (navigation as any).navigate('create-asset', {
        assetId: item.id,
        item,
      });
    } catch (e) {
      // fallback
    }
  };

  const isDraft = (item.status as string) === 'Draft';

  return (
    <Box {...styles.cardContainer}>
      <VStack {...styles.cardFullVStack}>
        {/* Row 1: Title + Status Badge + In-kind Badge (Left) & Delivery Badge (Right) */}
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
            {item.type ? (
              <Badge {...styles.inKindBadgeContainer}>
                <BadgeText {...styles.inKindBadgeText}>
                  {item.type}
                </BadgeText>
              </Badge>
            ) : null}
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

        {/* Row 2: Description Box */}
        {descriptionText ? (
          <Box {...styles.notesBox}>
            <Text {...styles.notesText}>
              {descriptionText}
            </Text>
          </Box>
        ) : null}

        {/* Row 3: Metadata */}
        <HStack {...styles.headerMetaHStack}>
          {item.sector ? (
            <HStack {...styles.metaItemHStack}>
              <LucideIcon name="Package" {...styles.cardMetaIconProps} />
              <Text {...styles.cardMetaSmText}>
                {item.sector}
              </Text>
            </HStack>
          ) : null}

          {item.value ? (
            <Text {...styles.cardValueBoldSmText}>
              {item.value}
            </Text>
          ) : null}

          {item.location ? (
            <HStack {...styles.metaItemHStack}>
              <LucideIcon name="MapPin" {...styles.cardMetaIconProps} />
              <Text {...styles.cardMetaSmText}>
                {item.location}
              </Text>
            </HStack>
          ) : null}

          <HStack {...styles.metaItemHStack}>
            <LucideIcon name="Users" {...styles.cardMetaIconProps} />
            <Text {...styles.cardMetaSmText}>
              {requestsText}
            </Text>
          </HStack>
        </HStack>

        {/* Row 4: Provided By & Action Buttons */}
        <HStack {...styles.requestedByRowHStack}>
          <Text {...styles.cardRequestedByText}>
            {t('supportProvider.supportOfferings.cards.providedBy', 'Provided by:')}{' '}
            <Text {...styles.cardRequestedByOrgText}>{providerName}</Text>
          </Text>

          <HStack {...styles.badgeContentHStack} space="sm">
            {isDraft ? (
              <Button
                variant="solid"
                {...styles.outlineActionBtn}
                onPress={handleEdit}
              >
                <ButtonText {...styles.outlineActionBtnText}>
                  {t('common.edit', 'Edit')}
                </ButtonText>
              </Button>
            ) : (
              <Button
                variant="outlineghost"
                {...styles.outlineActionBtn}
                onPress={handleCopy}
              >
                <ButtonIcon as={LucideIcon} name="Copy" {...styles.cardCopyIconProps} />
                <ButtonText {...styles.outlineActionBtnText}>
                  {t('supportProvider.supportOfferings.cards.copyOffering', 'Copy Offering')}
                </ButtonText>
              </Button>
            )}

            <Button
              variant="outlineghost"
              {...styles.detailsBtn}
              onPress={handleViewDetails}
            >
              <ButtonText {...styles.detailsBtnText}>
                {t('supportProvider.supportOfferings.cards.viewDetails', 'View Details')}
              </ButtonText>
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};

// ---------- ListCard ----------

interface AssetCardProps {
  searchQuery?: string;
  statusFilter?: string;
  provinceFilter?: string;
  siteFilter?: string;
  provincesList?: ProvinceEntity[];
  sitesList?: SiteEntity[];
}

export default function AssetCard({
  searchQuery,
  statusFilter,
  provinceFilter,
  siteFilter,
  provincesList = [],
  sitesList = [],
}: AssetCardProps): React.ReactElement {
  const [assets, setAssets] = useState<AssetItem[]>([]);

  useEffect(() => {
    getAssets({
      searchQuery,
      statusFilter,
      provinceFilter,
      siteFilter,
      provincesList,
      sitesList,
    }).then(setAssets);
  }, [searchQuery, statusFilter, provinceFilter, siteFilter, provincesList, sitesList]);

  return (
    <VStack {...styles.listContainer}>
      {assets.map((item) => (
        <Card key={item.id} item={item} />
      ))}
    </VStack>
  );
}
