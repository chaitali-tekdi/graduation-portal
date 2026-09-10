import React, { useCallback } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  Button,
  ButtonText,
  HStack,
} from '@gluestack-ui/themed';
import { LucideIcon } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { useAlert } from '@components/ui/Alert';
import { openDownload } from '@utils/helper';
import { styles } from './Styles';

// @ts-ignore - process.env is injected by webpack DefinePlugin on web
const APK_DOWNLOAD_URL = process.env.APK_DOWNLOAD_URL || '';

const DownloadApkScreen: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const hasValidUrl = APK_DOWNLOAD_URL.trim().length > 0;

  const handleDownload = useCallback(() => {
    if (!hasValidUrl) return;
    openDownload(APK_DOWNLOAD_URL, t, showAlert);
  }, [hasValidUrl, t, showAlert]);

  return (
    <Box {...styles.pageWrapper}>
      <Box {...styles.card}>
        <VStack space="sm" alignItems="center" width="$full">
          {/* Icon */}
          <Box {...styles.iconWrapper}>
            <LucideIcon
              name="Smartphone"
              size={64}
              color="$primary500"
            />
          </Box>

          {/* App name */}
          <Heading {...styles.appName}>
            {t('downloadApk.appName')}
          </Heading>

          {/* Short description */}
          <Text {...styles.description}>
            {t('downloadApk.description')}
          </Text>

          {/* Download button */}
          <Button
            {...styles.downloadButton}
            onPress={handleDownload}
            isDisabled={!hasValidUrl}
          >
            <LucideIcon name="Download" size={20} color="$white" strokeWidth={2.5} />
            <ButtonText marginLeft="$2" fontWeight="bold">{t('downloadApk.downloadButton')}</ButtonText>
          </Button>

          {/* Graceful missing-URL warning */}
          {!hasValidUrl && (
            <Box {...styles.warningBox}>
              <HStack space="xs" alignItems="center" justifyContent="center">
                <LucideIcon
                  name="AlertCircle"
                  size={14}
                  color="$error600"
                />
                <Text {...styles.warningText}>
                  {t('downloadApk.urlNotConfigured')}
                </Text>
              </HStack>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default DownloadApkScreen;
