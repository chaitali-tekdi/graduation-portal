import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  HStack,
  Text,
  VStack,
  Button,
  ButtonText,
  Pressable,
} from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import { useUserManagementFilters } from '@constants/USER_MANAGEMENT';
import { getSitesByProvince } from '../../../services/usersService';
import SchemaFormRenderer, { validateSchema } from '@components/SchemaFormRenderer';
import { ASSETS_STEP1_SCHEMA } from '@constants/ASSETS_FORM_SCHEMA';


const MENTOR_INPUT_STYLE = {
  variant: 'outline' as const,
  size: 'md' as const,
  bg: '$white' as const,
  borderRadius: '$md' as const,
  borderWidth: 1,
  borderColor: '$borderLight300' as const,
};

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

  // Dynamic Province & Site
  const { provinces: dynamicProvinces } = useUserManagementFilters({});
  const [dynamicSites, setDynamicSites] = useState<any[]>([]);

  // ─── Unified form state ───────────────────────────────────────────────────
  const [values, setValues] = useState<Record<string, string>>({
    province: '',
    site: '',
    assetType: 'Cash',
    livelihoodCategory: '',
    assetTitle: '',
    assetDescription: '',
    estimatedValue: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback((name: string, value: string) => {
    setValues(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'province') next.site = '';
      return next;
    });
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  // Fetch sites when province changes
  useEffect(() => {
    if (!values.province) {
      setDynamicSites([]);
      return;
    }
    getSitesByProvince({ provinceId: values.province, page: 1, limit: 100 })
      .then(res => setDynamicSites(res.result?.data || []))
      .catch(() => setDynamicSites([]));
  }, [values.province]);

  // ─── Options map ─────────────────────────────────────────────────────────
  const optionsMap = useMemo(() => {
    const provinceOpts =
      dynamicProvinces && dynamicProvinces.length > 0
        ? dynamicProvinces.map((p: any) => ({
          value: p._id || p.id || p.name,
          label: p.name || p.label,
        }))
        : [];

    const siteOpts = dynamicSites
      ? dynamicSites.map((s: any) => ({
        value: s._id || s.id || s.name,
        label: s.name || s.label,
      }))
      : [];

    return {
      provinces: provinceOpts,
      sites: siteOpts,
      assetTypeOptions: [
        { value: 'Cash', label: t('supportProvider.assetSupport.step1.assetTypeOptions.cash') || 'Cash' },
        { value: 'In-kind', label: t('supportProvider.assetSupport.step1.assetTypeOptions.inKind') || 'In-kind' },
        { value: 'Voucher', label: t('supportProvider.assetSupport.step1.assetTypeOptions.voucher') || 'Voucher' },
      ],
    };
  }, [dynamicProvinces, dynamicSites, t]);

  const validateStep = useCallback((schemaToValidate: any[]) => {
    const validationErrs = validateSchema(schemaToValidate, values, optionsMap);
    if (Object.keys(validationErrs).length > 0) {
      setErrors(validationErrs);
      return false;
    }
    setErrors({});
    return true;
  }, [values, optionsMap]);

  // ─── Step navigation ──────────────────────────────────────────────────────
  const [isPublished, setIsPublished] = useState(false);

  const handleNext = () => {
    if (activeStep === 1) {
      const isValid = validateStep(ASSETS_STEP1_SCHEMA);
      if (!isValid) return;
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

            {/* All Step 1 fields — schema-driven */}
            <SchemaFormRenderer
              schema={ASSETS_STEP1_SCHEMA}
              values={values}
              errors={errors}
              onFieldChange={handleFieldChange}
              optionsMap={optionsMap}
              t={t}
              inputStyle={MENTOR_INPUT_STYLE}
              selectStyle={MENTOR_INPUT_STYLE}
              labelStyle={{ fontSize: '$sm', fontWeight: '$medium', color: '$textDark800' }}
              hideSectionHeaders={true}
            />
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
