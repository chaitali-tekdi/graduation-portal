import React, { memo, useEffect, useState } from 'react';
import { Box, HStack, VStack, Text, Button, ButtonText, Avatar, AvatarFallbackText } from '@ui';
import Modal from '@components/ui/Modal';
import LucideIcon from '@components/ui/LucideIcon';
import { useAuth } from '@contexts/AuthContext';
import { useLanguage } from '@contexts/LanguageContext';
import { profileStyles, LCProfileStyles } from '@components/ui/Modal/Styles';
import { theme } from '@config/theme';
import { getUserProfile } from '../../services/authenticationService';
import { stylesHeader, participantAvatarWebStyle } from './Styles';

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
        <HStack justifyContent="flex-end" width="$full">
          <Button
            variant="outlineghost"
            size="sm"
            onPress={onClose}
            borderColor="$inputBorder"
            borderRadius="$md"
          >
            <ButtonText color="$textDark900">{t('common.close')}</ButtonText>
          </Button>
        </HStack>
      }
    >
      <VStack space="md" pt="$2">
        {/* Header Avatar and Name/ID */}
        <HStack space="md" alignItems="center" pb="$4">
          <Avatar
              {...stylesHeader.userAvatar}
              $web-style={participantAvatarWebStyle}
            >
              <AvatarFallbackText> </AvatarFallbackText>
              <Box
                position="absolute"
                justifyContent="center"
                alignItems="center"
                width="100%"
                height="100%"
              >
                <LucideIcon name="User" size={20} color="#fff" />
              </Box>
            </Avatar>
          <VStack space="xs">
            <Text fontSize="$lg" fontWeight="$bold" color="$textDark900">
              {currentUser?.name || '-'}
            </Text>
            <Text fontSize="$sm" color="$textDark600">
              {currentUser?.id || currentUser?.userId || '-'}
            </Text>
          </VStack>
        </HStack>

        {/* Fields list matching reference UI */}
        <VStack space="xs">
          <HStack space="xs" alignItems="center" mb="$1">
            <LucideIcon name="Phone" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...profileStyles.fieldLabel}>{t('common.profileFields.phoneNumber') || 'Phone Number'}</Text>
          </HStack>
          <Box {...LCProfileStyles.lcValueField} width="$full">
            <Text {...profileStyles.fieldValue}>
              {`${currentUser?.phone_code || ''} ${currentUser?.phone || ''}`.trim() || '-'}
            </Text>
          </Box>
        </VStack>

        <VStack space="xs">
          <HStack space="xs" alignItems="center" mb="$1">
            <LucideIcon name="Mail" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...profileStyles.fieldLabel}>{t('common.profileFields.email') || 'Email Address'}</Text>
          </HStack>
          <Box {...LCProfileStyles.lcValueField} width="$full">
            <Text {...profileStyles.fieldValue}>{currentUser?.email || '-'}</Text>
          </Box>
        </VStack>

        <VStack space="xs">
          <HStack space="xs" alignItems="center" mb="$1">
            <LucideIcon name="Calendar" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...profileStyles.fieldLabel}>{t('common.profileFields.dob') || 'Date of Birth'}</Text>
          </HStack>
          <Box {...LCProfileStyles.lcValueField} width="$full">
            <Text {...profileStyles.fieldValue}>{formattedDob}</Text>
          </Box>
        </VStack>

        <VStack space="xs">
          <HStack space="xs" alignItems="center" mb="$1">
            <LucideIcon name="MapPin" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...profileStyles.fieldLabel}>{t('common.profileFields.address') || 'Address'}</Text>
          </HStack>
          <Box {...LCProfileStyles.lcValueField} width="$full">
            <Text {...profileStyles.fieldValue}>{address}</Text>
          </Box>
        </VStack>

        <VStack space="xs">
          <HStack space="xs" alignItems="center" mb="$1">
            <LucideIcon name="MapPin" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...profileStyles.fieldLabel}>{t('common.profileFields.addressFields.province') || 'Province'}</Text>
          </HStack>
          <Box {...LCProfileStyles.lcValueField} width="$full">
            <Text {...profileStyles.fieldValue}>{province}</Text>
          </Box>
        </VStack>

        <VStack space="xs">
          <HStack space="xs" alignItems="center" mb="$1">
            <LucideIcon name="MapPin" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...profileStyles.fieldLabel}>{t('common.profileFields.addressFields.site') || 'Site'}</Text>
          </HStack>
          <Box {...LCProfileStyles.lcValueField} width="$full">
            <Text {...profileStyles.fieldValue}>{site}</Text>
          </Box>
        </VStack>

        <VStack space="xs">
          <HStack space="xs" alignItems="center" mb="$1">
            <LucideIcon name="UserCheck" size={16} color={theme.tokens.colors.textMutedForeground} />
            <Text {...profileStyles.fieldLabel}>{t('common.profileFields.emergencyContact') || 'Emergency Contact'}</Text>
          </HStack>
          <Box {...LCProfileStyles.lcValueField} width="$full">
            <Text {...profileStyles.fieldValue}>{emergencyContact}</Text>
          </Box>
        </VStack>
      </VStack>
    </Modal>
  );
};

export default memo(ParticipantProfileModal);
