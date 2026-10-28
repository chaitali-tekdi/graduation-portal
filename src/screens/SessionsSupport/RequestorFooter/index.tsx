import React from 'react';
import { HStack, Text, Button, ButtonText } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { useMentorInfo } from '@hooks/useSessionStatus';
import styles from '../styles';

interface RequestFooterProps {
  item: any;
  onAssignSession?: (item: any) => void;
  provinces?: any[];
}

export const RequestFooter: React.FC<RequestFooterProps> = ({ item, onAssignSession, provinces }) => {
  const { t } = useLanguage();
  const navigation = useNavigation();

  const sessionId = item?.id || item?._id || '';
  // LC sees who published the offering: the mentor's name and organisation
  const { providerName } = useMentorInfo(item);
  const rawProvinceId = (Array.isArray(item?.provinces) ? item.provinces[0] : item?.provinces);
  const provinceName = provinces?.find((p: any) => p._id === rawProvinceId)?.name || rawProvinceId;

  const handleViewDetails = () => {
    // @ts-ignore
    navigation.navigate('session-details', { sessionId });
  }

  return (
    <HStack {...styles.requestorFooter}>
      <Text {...styles.requestorFooterText}>
        {t('supportProvider.supportOfferings.cards.publishedByPrefix', 'Published by: ')}
        <Text {...styles.requestorFooterOrgText}>
          {providerName}
        </Text>
        {/* Tenant org (e.g. brac_gbl) is not meaningful to LC, so hidden */}
        {/* {mentorOrgName ? ` (${mentorOrgName})` : ''} */}
      </Text>

      <HStack {...styles.requestorFooterActions}>
        <Button
          variant="solid"
          {...styles.requestorFooterViewDetailsButton}
          onPress={handleViewDetails}
        >
          <ButtonText {...(styles.requestorFooterViewDetailsText as any)}>
            {t('supportProvider.supportOfferings.cards.viewDetails')}
          </ButtonText>
        </Button>

        {/* <Button
          variant="solid"
          {...styles.requestorFooterAssignButton}
          onPress={handleAssignSession}
        >
          <ButtonText {...(styles.requestorFooterAssignText as any)}>
            {t('supportProvider.supportOfferings.cards.assignSession', 'Assign Session')}
          </ButtonText>
        </Button> */}
      </HStack>
    </HStack>
  );
};
