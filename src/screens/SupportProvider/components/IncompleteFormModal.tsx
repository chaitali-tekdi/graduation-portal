import React from 'react';
import { Box, HStack, Text, VStack, Button, ButtonText, Pressable } from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import Modal from '@components/ui/Modal';
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import { useLanguage } from '@contexts/LanguageContext';

export interface MissingField {
  name: string;
  label: string;
  tabKey: string;
  tabLabel: string;
}

interface IncompleteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: MissingField[];
  onFieldClick: (field: MissingField) => void;
}

export const IncompleteFormModal: React.FC<IncompleteFormModalProps> = ({
  isOpen,
  onClose,
  missingFields,
  onFieldClick,
}) => {
  const { t } = useLanguage();

  // Group fields by tabLabel
  const groupedFields = React.useMemo(() => {
    const groups: Record<string, MissingField[]> = {};
    missingFields.forEach(field => {
      if (!groups[field.tabLabel]) {
        groups[field.tabLabel] = [];
      }
      groups[field.tabLabel].push(field);
    });
    return groups;
  }, [missingFields]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      maxWidth={540}
      showCloseButton={true}
      headerTitle={t('common.incompleteModal.title', 'Incomplete Form')}
      headerDescription={t('common.incompleteModal.message', 'Please complete all required fields.')}
      headerIcon={
        <LucideIcon
          name="AlertCircle"
          size={24}
          color={theme.tokens.colors.warningIconColor || '#ca8a04'}
        />
      }
      headerProps={{
        borderBottomWidth: 1,
        borderBottomColor: '$borderLight200',
        pb: '$4',
      }}
      footerContent={
        <HStack width="100%" justifyContent="flex-end">
          <Button
            variant="outline"
            borderColor="$borderLight300"
            bg={theme.tokens.colors.backgroundPrimary.light}
            onPress={onClose}
            px="$5"
            $hover={{ bg: theme.tokens.colors.hoverBackground }}
            $web-style={{ cursor: 'pointer' }}
          >
            <ButtonText color="$textDark800" {...TYPOGRAPHY.button}>
              {t('common.incompleteModal.ok', 'Go Back to Form')}
            </ButtonText>
          </Button>
        </HStack>
      }
    >
      <VStack space="md" py="$2">
        <Text color="$textDark600" {...TYPOGRAPHY.caption} fontWeight="$medium">
          {t('common.incompleteModal.instruction', 'Click on any field below to jump directly to it:')}
        </Text>

        <VStack space="lg" mt="$2">
          {Object.entries(groupedFields).map(([tabLabel, fields]) => (
            <VStack key={tabLabel} space="xs">
              {/* Tab Header */}
              <Text color="$textDark900" {...TYPOGRAPHY.label} fontWeight="$bold">
                {tabLabel}
              </Text>

              {/* Fields Links */}
              <VStack space="xs" pl="$2">
                {fields.map(field => (
                  <Pressable
                    key={field.name}
                    onPress={() => onFieldClick(field)}
                    $hover={{ opacity: 0.8 }}
                    $web-style={{ cursor: 'pointer' }}
                  >
                    <HStack space="xs" alignItems="center">
                      <Box w={4} h={4} borderRadius="$full" bg="$textMutedForeground" />
                      <Text
                        color="$primary500"
                        {...TYPOGRAPHY.bodySmall}
                        fontWeight="$medium"
                        textDecorationLine="underline"
                      >
                        {field.label}
                      </Text>
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </VStack>
          ))}
        </VStack>
      </VStack>
    </Modal>
  );
};

export default IncompleteFormModal;
