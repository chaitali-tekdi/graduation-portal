import React, { memo, useEffect, useState } from 'react';
import { Box, HStack, VStack, Text, Button, ButtonText, Avatar, AvatarFallbackText } from '@ui';
import Modal from '@components/ui/Modal';
import LucideIcon from '@components/ui/LucideIcon';
import { useAuth } from '@contexts/AuthContext';
import { useLanguage } from '@contexts/LanguageContext';
import { theme } from '@config/theme';
import { getUserProfile } from '../../services/authenticationService';
import { stylesHeader, participantAvatarWebStyle } from './Styles';
import { participantProfileModalStyles } from './ParticipantProfileModal.Styles';

interface ParticipantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ParticipantProfileModal: React.FC<ParticipantProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        if (isMounted && data) {
          setProfileData(data);
        }
      } catch {
        // Fall back to AuthContext user
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const currentUser = profileData || user;

  const formattedDob = currentUser?.dob ? new Date(currentUser.dob).toLocaleDateString() : '-';
  const address = currentUser?.location || '-';
  const province = currentUser?.province?.label || (typeof currentUser?.province === 'string' ? currentUser.province : '-');
  const site = currentUser?.site?.label || (typeof currentUser?.site === 'string' ? currentUser.site : '-');
  const emergencyContact = currentUser?.emergencyContact || '-';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerTitle=""
      size="md"
      bodyProps={{ pt: '$0', pb: '$0' }}
      footerContent={
        <HStack {...participantProfileModalStyles.footerContainer}>
          <Button
            {...participantProfileModalStyles.closeButton}
            onPress={onClose}
            variant="outlineghost"
          >
            <ButtonText {...participantProfileModalStyles.closeButtonText}>
              {t('common.close')}
            </ButtonText>
          </Button>
        </HStack>
      }
    >
      <VStack space="md" pt="$2">
        {/* Header Avatar and Name/ID */}
        <HStack {...participantProfileModalStyles.headerSection}>
          <Avatar
            {...stylesHeader.userAvatar}
            $web-style={participantAvatarWebStyle}
          >
            <AvatarFallbackText> </AvatarFallbackText>
            <Box {...participantProfileModalStyles.avatarIconBox}>
              <LucideIcon name="User" size={20} color="#fff" />
            </Box>
          </Avatar>
          <VStack {...participantProfileModalStyles.headerInfo}>
            <Text {...participantProfileModalStyles.nameText}>
              {currentUser?.name || '-'}
            </Text>
            <Text {...participantProfileModalStyles.idText}>
              {currentUser?.id || currentUser?.userId || '-'}
            </Text>
          </VStack>
        </HStack>

        {/* Fields list */}
        <VStack {...participantProfileModalStyles.fieldGroup}>
          <HStack {...participantProfileModalStyles.labelRow}>
            <LucideIcon name="Phone" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...participantProfileModalStyles.fieldLabel}>
              {t('common.profileFields.phoneNumber') || 'Phone Number'}
            </Text>
          </HStack>
          <Box {...participantProfileModalStyles.valueField}>
            <Text {...participantProfileModalStyles.fieldValue}>
              {`${currentUser?.phone_code || ''} ${currentUser?.phone || ''}`.trim() || '-'}
            </Text>
          </Box>
        </VStack>

        <VStack {...participantProfileModalStyles.fieldGroup}>
          <HStack {...participantProfileModalStyles.labelRow}>
            <LucideIcon name="Mail" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...participantProfileModalStyles.fieldLabel}>
              {t('common.profileFields.email') || 'Email Address'}
            </Text>
          </HStack>
          <Box {...participantProfileModalStyles.valueField}>
            <Text {...participantProfileModalStyles.fieldValue}>
              {currentUser?.email || '-'}
            </Text>
          </Box>
        </VStack>

        <VStack {...participantProfileModalStyles.fieldGroup}>
          <HStack {...participantProfileModalStyles.labelRow}>
            <LucideIcon name="Calendar" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...participantProfileModalStyles.fieldLabel}>
              {t('common.profileFields.dob') || 'Date of Birth'}
            </Text>
          </HStack>
          <Box {...participantProfileModalStyles.valueField}>
            <Text {...participantProfileModalStyles.fieldValue}>
              {formattedDob}
            </Text>
          </Box>
        </VStack>

        <VStack {...participantProfileModalStyles.fieldGroup}>
          <HStack {...participantProfileModalStyles.labelRow}>
            <LucideIcon name="MapPin" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...participantProfileModalStyles.fieldLabel}>
              {t('common.profileFields.address') || 'Address'}
            </Text>
          </HStack>
          <Box {...participantProfileModalStyles.valueField}>
            <Text {...participantProfileModalStyles.fieldValue}>
              {address}
            </Text>
          </Box>
        </VStack>

        <VStack {...participantProfileModalStyles.fieldGroup}>
          <HStack {...participantProfileModalStyles.labelRow}>
            <LucideIcon name="MapPin" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...participantProfileModalStyles.fieldLabel}>
              {t('common.profileFields.addressFields.province') || 'Province'}
            </Text>
          </HStack>
          <Box {...participantProfileModalStyles.valueField}>
            <Text {...participantProfileModalStyles.fieldValue}>
              {province}
            </Text>
          </Box>
        </VStack>

        <VStack {...participantProfileModalStyles.fieldGroup}>
          <HStack {...participantProfileModalStyles.labelRow}>
            <LucideIcon name="MapPin" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...participantProfileModalStyles.fieldLabel}>
              {t('common.profileFields.addressFields.site') || 'Site'}
            </Text>
          </HStack>
          <Box {...participantProfileModalStyles.valueField}>
            <Text {...participantProfileModalStyles.fieldValue}>
              {site}
            </Text>
          </Box>
        </VStack>

        <VStack {...participantProfileModalStyles.fieldGroup}>
          <HStack {...participantProfileModalStyles.labelRow}>
            <LucideIcon name="UserCheck" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...participantProfileModalStyles.fieldLabel}>
              {t('common.profileFields.emergencyContact') || 'Emergency Contact'}
            </Text>
          </HStack>
          <Box {...participantProfileModalStyles.valueField}>
            <Text {...participantProfileModalStyles.fieldValue}>
              {emergencyContact}
            </Text>
          </Box>
        </VStack>
      </VStack>
    </Modal>
  );
};

export default memo(ParticipantProfileModal);
