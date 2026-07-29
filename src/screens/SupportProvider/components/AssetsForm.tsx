import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  HStack,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import { useUserManagementFilters } from '@constants/USER_MANAGEMENT';
import { getSitesByProvince } from '../../../services/usersService';
import SchemaFormRenderer, { validateSchema } from '@components/SchemaFormRenderer';
import { ASSETS_FORM_SCHEMA } from '@constants/ASSETS_FORM_SCHEMA';
import IncompleteFormModal, { MissingField } from './IncompleteFormModal';
import { useNavigation } from '@react-navigation/native';

const MENTOR_INPUT_STYLE = {
  variant: 'outline' as const,
  size: 'md' as const,
  bg: '$white' as const,
  borderRadius: '$md' as const,
  borderWidth: 1,
  borderColor: '$borderLight300' as const,
};

const resolveKey = (key: string): string => {
  if (!key) return '';
  if (key.includes('.')) return key;
  return `admin.users.createUser.${key}`;
};

interface AssetsFormProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  onNavigate?: (route: string) => void;
  /** Callback to notify parent when step changes and if it's the final step */
  onStepChange?: (step: number, isFinal: boolean) => void;
  /** Ref to expose next/prev handlers to the parent */
  onNextRef?: React.MutableRefObject<(() => void) | null>;
  onPrevRef?: React.MutableRefObject<(() => void) | null>;
}

export const AssetsForm: React.FC<AssetsFormProps> = ({
  activeStep,
  setActiveStep,
  onNavigate,
  onStepChange,
  onNextRef,
  onPrevRef,
}) => {
  const { t } = useLanguage();
  const { branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.themePrimaryColor || theme.tokens.colors.primary500;
  const navigation = useNavigation();

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigation.navigate(route as never);
    }
  };

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
  const [showIncompleteModal, setShowIncompleteModal] = useState<boolean>(false);
  const [missingFields, setMissingFields] = useState<MissingField[]>([]);
  const [isPublished, setIsPublished] = useState(false);

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

  const getTabLabel = useCallback((tabKey: string): string => {
    const tabObj = ASSETS_FORM_SCHEMA.find(s => s.id === tabKey);
    if (tabObj) {
      return t(resolveKey(tabObj.title?.key || ''), tabObj.title?.fallback || '');
    }
    return '';
  }, [t]);

  const getMissingFieldsForTabs = useCallback((tabKeys: string[]): MissingField[] => {
    const missing: MissingField[] = [];
    tabKeys.forEach(tabKey => {
      const tabObj = ASSETS_FORM_SCHEMA.find(s => s.id === tabKey);
      if (!tabObj) return;
      const tabSchema = tabObj.children || [];
      const validationErrs = validateSchema(tabSchema, values, optionsMap, t);
      tabSchema.forEach(section => {
        section.rows.forEach(row => {
          row.fields.forEach(field => {
            if (field.name && validationErrs[field.name]) {
              const labelStr = t(`supportProvider.assetSupport.step1.${field.label.key}`, '') || field.label.fallback;
              missing.push({
                name: field.name,
                label: labelStr,
                tabKey,
                tabLabel: getTabLabel(tabKey),
              });
            }
          });
        });
      });
    });
    return missing;
  }, [values, optionsMap, t, getTabLabel]);

  const handleFieldClick = useCallback((field: MissingField) => {
    setShowIncompleteModal(false);
    setActiveStep(1);

    setTimeout(() => {
      const element = document.getElementById(field.name);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = element.querySelector('input, select, textarea, button[role="combobox"]');
        if (input) (input as HTMLElement).focus();

        element.style.outline = 'none';
        element.style.border = '2px solid #8b5cf6';
        element.style.borderRadius = '8px';
        element.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.4)';
        element.style.transition = 'all 0.2s ease';

        setTimeout(() => {
          element.style.border = '';
          element.style.boxShadow = '';
          element.style.borderRadius = '';
          element.style.outline = '';
          element.style.transition = '';
        }, 2000);
      }

      let fieldObj: any = null;
      ASSETS_FORM_SCHEMA.forEach(tab => {
        (tab.children || []).forEach(section => {
          section.rows.forEach(row => {
            row.fields.forEach(f => {
              if (f.name === field.name) fieldObj = f;
            });
          });
        });
      });
      if (fieldObj) {
        const requiredRule = fieldObj.validation?.find((r: any) => r.rule === 'required');
        const msgKey = requiredRule?.message?.key;
        const msgFallback = requiredRule?.message?.fallback || 'This field is required';
        setErrors({ [field.name]: msgKey ? t(msgKey, msgFallback) : msgFallback });
      }
    }, 100);
  }, [t, setActiveStep]);

  // ─── Active tab schema ────────────────────────────────────────────────────
  const activeTabSchema = useMemo(() => {
    if (activeStep === 1) return ASSETS_FORM_SCHEMA.find(s => s.id === 'assetDetails');
    if (activeStep === 2) return ASSETS_FORM_SCHEMA.find(s => s.id === 'review');
    return undefined;
  }, [activeStep]);

  const activeSchema = useMemo(() => activeTabSchema?.children || [], [activeTabSchema]);

  // ─── Navigation ───────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (activeStep === 1) {
      const step1Tab = ASSETS_FORM_SCHEMA.find(s => s.id === 'assetDetails');
      const step1Schema = step1Tab?.children || [];
      const errs = validateSchema(step1Schema, values, optionsMap, t);
      if (Object.keys(errs).length > 0) {
        setMissingFields(getMissingFieldsForTabs(['assetDetails']));
        setShowIncompleteModal(true);
        return;
      }
      const nextStep = 2;
      setActiveStep(nextStep);
      onStepChange?.(nextStep, true);
    } else {
      // Publish
      const step1Tab = ASSETS_FORM_SCHEMA.find(s => s.id === 'assetDetails');
      const step1Schema = step1Tab?.children || [];
      const errs = validateSchema(step1Schema, values, optionsMap, t);
      if (Object.keys(errs).length > 0) {
        setMissingFields(getMissingFieldsForTabs(['assetDetails']));
        setShowIncompleteModal(true);
        return;
      }
      setErrors({});
      setIsPublished(true);
      setTimeout(() => handleNavigate('support-provider-dashboard'), 1800);
    }
  }, [activeStep, values, optionsMap, t, getMissingFieldsForTabs, onStepChange]);

  const handlePrev = useCallback(() => {
    if (activeStep > 1) {
      const prevStep = activeStep - 1;
      setActiveStep(prevStep);
      onStepChange?.(prevStep, false);
    } else {
      handleNavigate('support-provider-create-opportunities');
    }
  }, [activeStep, onStepChange]);

  // Wire handlers to parent refs so FormStepperHeader can call them
  React.useEffect(() => {
    if (onNextRef) onNextRef.current = handleNext;
    if (onPrevRef) onPrevRef.current = handlePrev;
  }, [handleNext, handlePrev, onNextRef, onPrevRef]);

  return (
    <Box width="100%" py="$8">
      {/* Multi-Step Card Content */}
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
        {isPublished && activeStep === 2 ? (
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
              {t('supportProvider.forms.assetSuccessTitle') || 'Asset Support Created Successfully!'}
            </Text>
            <Text color="$textDark600" {...TYPOGRAPHY.caption} mt="$1">
              {t('supportProvider.forms.successSub') || 'Redirecting back to dashboard...'}
            </Text>
          </Box>
        ) : (
          <VStack space="lg">
            {/* Step Heading & Subheading */}
            {activeTabSchema && (
              <VStack space="xs" mb="$2">
                <Text color="$textDark900" {...TYPOGRAPHY.h2}>
                  {t(resolveKey(activeTabSchema.heading?.key || ''), activeTabSchema.heading?.fallback || '')}
                </Text>
                {activeTabSchema.subheading && (
                  <Text color="$textDark500" {...TYPOGRAPHY.caption}>
                    {t(resolveKey(activeTabSchema.subheading.key), activeTabSchema.subheading.fallback)}
                  </Text>
                )}
              </VStack>
            )}

            {/* Schema-driven fields */}
            <SchemaFormRenderer
              schema={activeSchema}
              values={values}
              errors={errors}
              onFieldChange={handleFieldChange}
              optionsMap={optionsMap}
              t={t}
              mode={activeStep === 2 ? 'preview' : 'edit'}
              inputStyle={MENTOR_INPUT_STYLE}
              selectStyle={MENTOR_INPUT_STYLE}
              labelStyle={{ fontSize: '$sm', fontWeight: '$medium', color: '$textDark800' }}
              hideSectionHeaders={activeStep !== 2}
            />

            {/* Info banner on review step */}
            {activeStep === 2 && !isPublished && (
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
                    • {t('supportProvider.assetSupport.step2.infoBullet1', 'This support will be visible to all Coaches in the GBL network')}
                  </Text>
                  <Text color={theme.tokens.colors.blue800} {...TYPOGRAPHY.caption}>
                    • {t('supportProvider.assetSupport.step2.infoBullet2', 'Coaches can submit requests on behalf of participants')}
                  </Text>
                  <Text color={theme.tokens.colors.blue800} {...TYPOGRAPHY.caption}>
                    • {t('supportProvider.assetSupport.step2.infoBullet3', "You'll receive notifications when requests are submitted")}
                  </Text>
                </VStack>
              </Box>
            )}
          </VStack>
        )}
      </Box>

      {/* Incomplete Form Modal */}
      <IncompleteFormModal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        missingFields={missingFields}
        onFieldClick={handleFieldClick}
      />
    </Box>
  );
};

// Expose navigation helpers as static methods so the parent can call them
// via a ref or we pass them via a callback prop pattern.
// For simplicity we export a ref-forwarded version below.

export default AssetsForm;
