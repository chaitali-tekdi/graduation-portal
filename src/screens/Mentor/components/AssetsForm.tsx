import React, { useState } from 'react';
import {
  Box,
  HStack,
  Text,
  VStack,
  Pressable,
  Input,
  InputField,
  Textarea,
  TextareaInput,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';

interface AssetsFormProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  onNavigate: (route: string) => void;
}

export const AssetsForm: React.FC<AssetsFormProps> = ({
  activeStep,
  setActiveStep,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const { branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.themePrimaryColor || theme.tokens.colors.primary500;

  // Form State
  const [province, setProvince] = useState('');
  const [site, setSite] = useState('');
  const [assetType, setAssetType] = useState('Cash');
  const [livelihoodCategory, setLivelihoodCategory] = useState('');
  const [assetTitle, setAssetTitle] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  // Step 2 Submission State
  const [isPublished, setIsPublished] = useState(false);

  const handleNext = () => {
    if (activeStep < 2) {
      setActiveStep(2);
    } else {
      setIsPublished(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1800);
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep(1);
    } else {
      onNavigate('create_support');
    }
  };

  return (
    <Box
      width="100%"
      maxWidth={760}
      alignSelf="center"
      px="$4"
      $md-px="$0"
      pb="$8"
      pt="$8"
    >
      {/* Multi-Step Card Content Container */}
      <Box
        width="100%"
        bg={theme.tokens.colors.backgroundPrimary.light}
        borderRadius="$xl"
        borderWidth={1}
        borderColor="$borderLight200"
        p="$5"
        $md-p="$8"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.05}
        shadowRadius={8}
        elevation={2}
        mb="$6"
      >
        {/* STEP 1: Asset Details */}
        {activeStep === 1 && (
          <VStack space="lg">
            <VStack space="xs" mb="$2">
              <Text color="$textDark900" {...TYPOGRAPHY.h2}>
                {t('supportProvider.assetSupport.step1.heading') || 'Asset Details'}
              </Text>
              <Text color="$textDark500" {...TYPOGRAPHY.caption}>
                Fields marked <Text color={theme.tokens.colors.error600} fontWeight="$bold">*</Text> are required
              </Text>
            </VStack>

            {/* Province & Site Row */}
            <HStack space="md" flexDirection="column" $md-flexDirection="row">
              <VStack space="xs" flex={1}>
                <Text color="$textDark800" {...TYPOGRAPHY.label}>
                  {t('supportProvider.assetSupport.step1.province') || 'Province'}{' '}
                  <Text color={theme.tokens.colors.error600}>*</Text>
                </Text>
                <Input
                  borderRadius="$md"
                  borderColor="$borderLight300"
                  $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                >
                  <InputField
                    placeholder={t('supportProvider.assetSupport.step1.provincePlaceholder') || 'Select province'}
                    value={province}
                    onChangeText={setProvince}
                  />
                  <Box pr="$3" justifyContent="center">
                    <LucideIcon name="ChevronDown" size={16} color={theme.tokens.colors.textMuted} />
                  </Box>
                </Input>
              </VStack>

              <VStack space="xs" flex={1}>
                <Text color="$textDark800" {...TYPOGRAPHY.label}>
                  {t('supportProvider.assetSupport.step1.site') || 'Site'}{' '}
                  <Text color={theme.tokens.colors.error600}>*</Text>
                </Text>
                <Input
                  borderRadius="$md"
                  borderColor="$borderLight300"
                  $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                >
                  <InputField
                    placeholder={t('supportProvider.assetSupport.step1.sitePlaceholder') || 'Select province first'}
                    value={site}
                    onChangeText={setSite}
                  />
                  <Box pr="$3" justifyContent="center">
                    <LucideIcon name="ChevronDown" size={16} color={theme.tokens.colors.textMuted} />
                  </Box>
                </Input>
              </VStack>
            </HStack>

            {/* Asset Type 3-button Selector */}
            <VStack space="xs">
              <Text color="$textDark800" {...TYPOGRAPHY.label}>
                {t('supportProvider.assetSupport.step1.assetType') || 'Asset Type'}{' '}
                <Text color={theme.tokens.colors.error600}>*</Text>
              </Text>
              <HStack space="xs" gap="$2">
                {[
                  { key: 'Cash', label: t('supportProvider.assetSupport.step1.assetTypeOptions.cash') || 'Cash' },
                  { key: 'In-kind', label: t('supportProvider.assetSupport.step1.assetTypeOptions.inKind') || 'In-kind' },
                  { key: 'Voucher', label: t('supportProvider.assetSupport.step1.assetTypeOptions.voucher') || 'Voucher' },
                ].map(item => {
                  const isSelected = assetType === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => setAssetType(item.key)}
                      flex={1}
                      py="$2.5"
                      borderRadius="$md"
                      borderWidth={1}
                      borderColor={isSelected ? primaryColor : '$borderLight300'}
                      bg={theme.tokens.colors.backgroundPrimary.light}
                      alignItems="center"
                      justifyContent="center"
                      $hover={{ borderColor: primaryColor }}
                      $web-style={{
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Text
                        color={isSelected ? primaryColor : '$textDark700'}
                        {...TYPOGRAPHY.caption}
                        fontWeight={isSelected ? '$bold' : '$medium'}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </HStack>
            </VStack>

            {/* Category of Livelihoods */}
            <VStack space="xs">
              <Text color="$textDark800" {...TYPOGRAPHY.label}>
                {t('supportProvider.assetSupport.step1.categoryLivelihoods') || 'Category of Livelihoods'}{' '}
                <Text color={theme.tokens.colors.error600}>*</Text>
              </Text>
              <Input
                borderRadius="$md"
                borderColor="$borderLight300"
                $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
              >
                <InputField
                  placeholder={
                    t('supportProvider.assetSupport.step1.categoryLivelihoodsPlaceholder') ||
                    'Select livelihood category'
                  }
                  value={livelihoodCategory}
                  onChangeText={setLivelihoodCategory}
                />
                <Box pr="$3" justifyContent="center">
                  <LucideIcon name="ChevronDown" size={16} color={theme.tokens.colors.textMuted} />
                </Box>
              </Input>
            </VStack>

            {/* Asset Title */}
            <VStack space="xs">
              <Text color="$textDark800" {...TYPOGRAPHY.label}>
                {t('supportProvider.assetSupport.step1.assetTitle') || 'Asset Title'}{' '}
                <Text color={theme.tokens.colors.error600}>*</Text>
              </Text>
              <Input
                borderRadius="$md"
                borderColor="$borderLight300"
                $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
              >
                <InputField
                  placeholder={
                    t('supportProvider.assetSupport.step1.assetTitlePlaceholder') ||
                    'Name of this asset...'
                  }
                  value={assetTitle}
                  onChangeText={setAssetTitle}
                />
              </Input>
            </VStack>

            {/* Asset Description */}
            <VStack space="xs">
              <Text color="$textDark800" {...TYPOGRAPHY.label}>
                {t('supportProvider.assetSupport.step1.assetDescription') || 'Asset Description'}{' '}
                <Text color={theme.tokens.colors.error600}>*</Text>
              </Text>
              <Textarea
                borderRadius="$md"
                borderColor="$borderLight300"
                minHeight={100}
                $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
              >
                <TextareaInput
                  placeholder={
                    t('supportProvider.assetSupport.step1.assetDescriptionPlaceholder') ||
                    'Describe this asset, its purpose, and how it benefits the recipient...'
                  }
                  value={assetDescription}
                  onChangeText={setAssetDescription}
                />
              </Textarea>
            </VStack>

            {/* Estimated Asset Value (Rands) */}
            <VStack space="xs">
              <Text color="$textDark800" {...TYPOGRAPHY.label}>
                {t('supportProvider.assetSupport.step1.estimatedValue') || 'Estimated Asset Value (Rands)'}{' '}
                <Text color={theme.tokens.colors.error600}>*</Text>
              </Text>
              <Input
                borderRadius="$md"
                borderColor="$borderLight300"
                $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
              >
                <InputField
                  placeholder={
                    t('supportProvider.assetSupport.step1.estimatedValuePlaceholder') ||
                    'R 0.00'
                  }
                  value={estimatedValue}
                  onChangeText={setEstimatedValue}
                />
              </Input>
            </VStack>

            {/* Availability (optional) */}
            <VStack space="md" mt="$1">
              <HStack space="xs" alignItems="center">
                <Text color="$textDark800" {...TYPOGRAPHY.label}>
                  {t('supportProvider.assetSupport.step1.availability') || 'Availability'}
                </Text>
                <Text color="$textDark400" {...TYPOGRAPHY.caption}>
                  {t('supportProvider.assetSupport.step1.optionalTag') || '(optional)'}
                </Text>
              </HStack>

              {/* Start Date & Start Time */}
              <HStack space="md" flexDirection="column" $md-flexDirection="row">
                <VStack space="xs" flex={1}>
                  <Text color="$textDark700" {...TYPOGRAPHY.caption} fontWeight="$medium">
                    {t('supportProvider.assetSupport.step1.startDate') || 'Start Date'}
                  </Text>
                  <Input
                    borderRadius="$md"
                    borderColor="$borderLight300"
                    $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                  >
                    <InputField
                      placeholder={t('supportProvider.assetSupport.step1.startDatePlaceholder') || 'dd/mm/yyyy'}
                      value={startDate}
                      onChangeText={setStartDate}
                    />
                  </Input>
                </VStack>

                <VStack space="xs" flex={1}>
                  <Text color="$textDark700" {...TYPOGRAPHY.caption} fontWeight="$medium">
                    {t('supportProvider.assetSupport.step1.startTime') || 'Start Time'}
                  </Text>
                  <Input
                    borderRadius="$md"
                    borderColor="$borderLight300"
                    $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                  >
                    <InputField
                      placeholder={t('supportProvider.assetSupport.step1.startTimePlaceholder') || '--:--'}
                      value={startTime}
                      onChangeText={setStartTime}
                    />
                  </Input>
                </VStack>
              </HStack>

              {/* End Date & End Time */}
              <HStack space="md" flexDirection="column" $md-flexDirection="row">
                <VStack space="xs" flex={1}>
                  <Text color="$textDark700" {...TYPOGRAPHY.caption} fontWeight="$medium">
                    {t('supportProvider.assetSupport.step1.endDate') || 'End Date'}
                  </Text>
                  <Input
                    borderRadius="$md"
                    borderColor="$borderLight300"
                    $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                  >
                    <InputField
                      placeholder={t('supportProvider.assetSupport.step1.endDatePlaceholder') || 'dd/mm/yyyy'}
                      value={endDate}
                      onChangeText={setEndDate}
                    />
                  </Input>
                </VStack>

                <VStack space="xs" flex={1}>
                  <Text color="$textDark700" {...TYPOGRAPHY.caption} fontWeight="$medium">
                    {t('supportProvider.assetSupport.step1.endTime') || 'End Time'}
                  </Text>
                  <Input
                    borderRadius="$md"
                    borderColor="$borderLight300"
                    $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                  >
                    <InputField
                      placeholder={t('supportProvider.assetSupport.step1.endTimePlaceholder') || '--:--'}
                      value={endTime}
                      onChangeText={setEndTime}
                    />
                  </Input>
                </VStack>
              </HStack>
            </VStack>
          </VStack>
        )}

        {/* STEP 2: Review & Publish */}
        {activeStep === 2 && (
          <VStack space="lg">
            <VStack space="xs" mb="$2">
              <Text color="$textDark900" {...TYPOGRAPHY.h2}>
                {t('supportProvider.assetSupport.step2.heading') || 'Review & Publish'}
              </Text>
            </VStack>

            {isPublished ? (
              <Box
                bg={theme.tokens.colors.success50}
                borderColor={theme.tokens.colors.accent300}
                borderWidth={1}
                borderRadius="$lg"
                p="$6"
                alignItems="center"
              >
                <LucideIcon name="CheckCircle" size={44} color={theme.tokens.colors.tickButtonActiveBg} />
                <Text color={theme.tokens.colors.tickButtonActiveBg} {...TYPOGRAPHY.h3} mt="$2">
                  Asset Support Created Successfully!
                </Text>
                <Text color="$textDark600" {...TYPOGRAPHY.caption} mt="$1">
                  Redirecting back to dashboard...
                </Text>
              </Box>
            ) : (
              <VStack space="md">
                {/* Empty Asset Details Box per Reference Image 3 */}
                <Box
                  borderWidth={1}
                  borderColor="$borderLight200"
                  borderRadius="$lg"
                  p="$4"
                  bg={theme.tokens.colors.backgroundPrimary.light}
                  minHeight={60}
                >
                  <Text color="$textDark900" {...TYPOGRAPHY.label} fontWeight="$bold">
                    {t('supportProvider.assetSupport.step2.assetDetailsCardTitle') || 'Asset Details'}
                  </Text>
                </Box>

                {/* Info Box matching Reference Image 3 */}
                <Box
                  bg={theme.tokens.colors.blue50}
                  borderWidth={1}
                  borderColor={theme.tokens.colors.blue200}
                  borderRadius="$lg"
                  p="$4"
                >
                  <HStack space="xs" alignItems="center" mb="$2">
                    <LucideIcon name="Info" size={16} color={theme.tokens.colors.blue600} />
                    <Text color={theme.tokens.colors.blue800} {...TYPOGRAPHY.caption} fontWeight="$bold">
                      {t('supportProvider.assetSupport.step2.infoTitle') || 'Before you publish:'}
                    </Text>
                  </HStack>
                  <VStack space="xs" pl="$5">
                    <Text color={theme.tokens.colors.blue800} {...TYPOGRAPHY.caption}>
                      • {t('supportProvider.assetsForm.step3.infoBullet1') || 'This support will be visible to all Coaches in the GBL network'}
                    </Text>
                    <Text color={theme.tokens.colors.blue800} {...TYPOGRAPHY.caption}>
                      • {t('supportProvider.assetsForm.step3.infoBullet2') || 'Coaches can submit requests on behalf of participants'}
                    </Text>
                    <Text color={theme.tokens.colors.blue800} {...TYPOGRAPHY.caption}>
                      • {t('supportProvider.assetsForm.step3.infoBullet3') || "You'll receive notifications when requests are submitted"}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            )}
          </VStack>
        )}
      </Box>

      {/* Bottom Action Bar */}
      {!isPublished && (
        <HStack justifyContent="space-between" alignItems="center" width="100%">
          {/* Previous Button */}
          <Button
            variant="outline"
            borderColor="$borderLight300"
            bg={theme.tokens.colors.backgroundPrimary.light}
            onPress={handlePrev}
            px="$5"
            $hover={{ bg: theme.tokens.colors.hoverBackground }}
            $web-style={{ cursor: 'pointer' }}
          >
            <HStack alignItems="center" space="xs">
              <LucideIcon name="ArrowLeft" size={16} color="$textDark700" />
              <ButtonText color="$textDark700" {...TYPOGRAPHY.button}>
                {t('supportProvider.assetSupport.buttons.previous') || 'Previous'}
              </ButtonText>
            </HStack>
          </Button>

          {/* Continue / Publish Support Button */}
          {activeStep === 1 ? (
            <Button
              bg={primaryColor}
              onPress={handleNext}
              px="$6"
              $hover={{ bg: theme.tokens.colors.primary600 }}
              $web-style={{ cursor: 'pointer' }}
            >
              <HStack alignItems="center" space="xs">
                <ButtonText color={theme.tokens.colors.backgroundPrimary.light} {...TYPOGRAPHY.button} fontWeight="$bold">
                  {t('supportProvider.assetSupport.buttons.continue') || 'Continue'}
                </ButtonText>
                <LucideIcon name="ArrowRight" size={16} color={theme.tokens.colors.backgroundPrimary.light} />
              </HStack>
            </Button>
          ) : (
            <Button
              bg={theme.tokens.colors.tickButtonActiveBg}
              onPress={handleNext}
              px="$6"
              $hover={{ bg: theme.tokens.colors.pillarLivelihoods }}
              $web-style={{ cursor: 'pointer' }}
            >
              <HStack alignItems="center" space="xs">
                <LucideIcon name="Check" size={16} color={theme.tokens.colors.backgroundPrimary.light} />
                <ButtonText color={theme.tokens.colors.backgroundPrimary.light} {...TYPOGRAPHY.button} fontWeight="$bold">
                  {t('supportProvider.assetSupport.step2.publishButton') || 'Publish Support'}
                </ButtonText>
              </HStack>
            </Button>
          )}
        </HStack>
      )}
    </Box>
  );
};

export default AssetsForm;
