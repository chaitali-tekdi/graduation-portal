import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  HStack,
  Text,
  VStack,
  ScrollView,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import FormStepperHeader, { StepperTabItem } from './components/FormStepperHeader';
import IncompleteFormModal, { MissingField } from './components/IncompleteFormModal';
import { useUserManagementFilters } from '@constants/USER_MANAGEMENT';
import { getSitesByProvince } from '../../services/usersService';
import SchemaFormRenderer, { validateSchema } from '@components/SchemaFormRenderer';
import { TRAINING_FORM_SCHEMA } from '@constants/TRAINING_FORM_SCHEMA';
import { useNavigation } from '@react-navigation/native';
import Container from '@components/ui/Container';
import { usePlatform } from '@utils/platform';

const MENTOR_INPUT_STYLE = {
  variant: 'outline' as const,
  size: 'md' as const,
  bg: '$white' as const,
  borderRadius: '$md' as const,
  borderWidth: 1,
  borderColor: '$borderLight300' as const,
};

interface CreateTrainingSessionScreenProps {
  onNavigate?: (route: string) => void;
}

// ─── Pillar → Session Type mapping ───────────────────────────────────────────
const PILLAR_SESSION_TYPES: Record<string, string[]> = {
  'Social Empowerment': [
    'Personal Mastery Training',
    'Parenting Skills Training',
    'GBV Awareness Session',
    'Substance Abuse Awareness Session',
  ],
  'Financial Inclusion': ['Financial Literacy Training'],
  Livelihoods: [
    'Generate Your Business Idea Training',
    'Start Your Business Training',
    'Diversification Strategy',
    'Market Growth Strategy',
    'Livelihood Specific Training',
    'Job Readiness Training',
    'Technical/Vocational Training',
  ],
};

const resolveKey = (key: string): string => {
  if (!key) return '';
  if (key.includes('.')) return key;
  return `admin.users.createUser.${key}`;
};

export const CreateTrainingSessionScreen: React.FC<
  CreateTrainingSessionScreenProps
> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.themePrimaryColor || theme.tokens.colors.primary500;
  const navigation = useNavigation();
  const { isMobile } = usePlatform();

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigation.navigate(route as never);
    }
  };

  const stepperTabs: StepperTabItem[] = [
    {
      key: 1,
      label: t('supportProvider.trainingSession.tabs.sessionDetails') || 'Session Details',
      iconName: 'FileText',
    },
    {
      key: 2,
      label: t('supportProvider.trainingSession.tabs.scheduleFormat') || 'Schedule & Format',
      iconName: 'Calendar',
    },
    {
      key: 3,
      label: t('supportProvider.trainingSession.tabs.reviewPublish') || 'Review & Publish',
      iconName: 'Check',
    },
  ];

  // Active step tab (1: Details, 2: Schedule & Format, 3: Review & Publish)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showIncompleteModal, setShowIncompleteModal] = useState<boolean>(false);
  const [missingFields, setMissingFields] = useState<MissingField[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  // Dynamic Province & Site
  const { provinces: dynamicProvinces } = useUserManagementFilters({});
  const [dynamicSites, setDynamicSites] = useState<any[]>([]);

  // ─── Unified form state ───────────────────────────────────────────────────
  const [values, setValues] = useState<Record<string, string>>({
    province: '',
    site: '',
    pillar: '',
    sessionType: '',
    sessionTitle: '',
    description: '',
    learningObjectives: '',
    targetAudience: '',
    certificateProvided: '',
    maxCapacity: '',
    recurringSession: 'Yes',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    formatType: 'Offline',
    venueLocation: '',
    resourceContent: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback((name: string, value: string) => {
    setValues(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'province') next.site = '';
      if (name === 'pillar') {
        next.sessionType = '';
        next.sessionTitle = '';
      }
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

    const selectedPillar = values.pillar;
    const sessionTypeOpts = selectedPillar && selectedPillar !== 'Others'
      ? (PILLAR_SESSION_TYPES[selectedPillar] || []).map(v => ({ value: v, label: v }))
      : [];

    return {
      provinces: provinceOpts,
      sites: siteOpts,
      pillars: [
        { value: 'Social Empowerment', label: t('supportProvider.trainingSession.step1.pillars.socialEmpowerment') || 'Social Empowerment' },
        { value: 'Financial Inclusion', label: t('supportProvider.trainingSession.step1.pillars.financialInclusion') || 'Financial Inclusion' },
        { value: 'Livelihoods', label: t('supportProvider.trainingSession.step1.pillars.livelihoods') || 'Livelihoods' },
        { value: 'Others', label: t('supportProvider.trainingSession.step1.pillars.others') || 'Others' },
      ],
      sessionTypes: sessionTypeOpts,
      targetAudienceOptions: [
        { value: 'Coach', label: t('supportProvider.trainingSession.step1.targetAudienceOptions.coach') || 'Coach' },
        { value: 'Participant', label: t('supportProvider.trainingSession.step1.targetAudienceOptions.participant') || 'Participant' },
        { value: 'Both', label: t('supportProvider.trainingSession.step1.targetAudienceOptions.both') || 'Both' },
      ],
      certificateOptions: [
        { value: 'Yes', label: t('supportProvider.trainingSession.step1.certificateOptions.yes') || 'Yes' },
        { value: 'No', label: t('supportProvider.trainingSession.step1.certificateOptions.no') || 'No' },
      ],
      recurringOptions: [
        { value: 'Yes', label: t('supportProvider.trainingSession.step1.recurringToggle') || 'Yes — recurring session' },
        { value: 'No', label: t('supportProvider.trainingSession.step1.recurringToggleNo') || 'No — one-off session' },
      ],
      formatOptions: [
        { value: 'Offline', label: t('supportProvider.trainingSession.step2.typeOptions.offline') || 'Offline', icon: 'MapPin' },
        { value: 'Online', label: t('supportProvider.trainingSession.step2.typeOptions.online') || 'Online', icon: 'Video' },
        { value: 'Hybrid', label: t('supportProvider.trainingSession.step2.typeOptions.hybrid') || 'Hybrid', icon: 'Users' },
      ],
    };
  }, [dynamicProvinces, dynamicSites, values.pillar, t]);

  const getTabLabel = useCallback((tabKey: string): string => {
    const tabObj = TRAINING_FORM_SCHEMA.find(s => s.id === tabKey);
    if (tabObj) {
      return t(resolveKey(tabObj.title?.key || tabObj.label?.key || ''), tabObj.title?.fallback || tabObj.label?.fallback || '');
    }
    return '';
  }, [t]);

  const getMissingFieldsForTabs = useCallback((tabKeys: string[]): MissingField[] => {
    const missing: MissingField[] = [];
    tabKeys.forEach(tabKey => {
      const tabObj = TRAINING_FORM_SCHEMA.find(s => s.id === tabKey);
      if (!tabObj) return;
      const tabSchema = tabObj.children || [];
      const validationErrs = validateSchema(tabSchema, values, optionsMap, t);
      tabSchema.forEach(section => {
        section.rows.forEach(row => {
          row.fields.forEach(field => {
            if (field.name && validationErrs[field.name]) {
              const labelStr = t(`supportProvider.trainingSession.step1.${field.label.key}`, '') ||
                               t(`supportProvider.trainingSession.step2.${field.label.key}`, '') ||
                               field.label.fallback;
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
    const stepNum = field.tabKey === 'sessionDetails' ? 1 : 2;
    setActiveStep(stepNum);

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
      TRAINING_FORM_SCHEMA.forEach(tab => {
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
  }, [t]);


  // ─── Continue / Publish action ────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (activeStep === 1) {
      const errs = validateSchema(TRAINING_FORM_SCHEMA.find(s => s.id === 'sessionDetails')?.children || [], values, optionsMap, t);
      if (Object.keys(errs).length > 0) {
        setMissingFields(getMissingFieldsForTabs(['sessionDetails']));
        setShowIncompleteModal(true);
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      const step1Errs = validateSchema(TRAINING_FORM_SCHEMA.find(s => s.id === 'sessionDetails')?.children || [], values, optionsMap, t);
      const step2Errs = validateSchema(TRAINING_FORM_SCHEMA.find(s => s.id === 'scheduleFormat')?.children || [], values, optionsMap, t);
      if (Object.keys(step1Errs).length > 0 || Object.keys(step2Errs).length > 0) {
        setMissingFields(getMissingFieldsForTabs(['sessionDetails', 'scheduleFormat']));
        setShowIncompleteModal(true);
        return;
      }
      setActiveStep(3);
    } else {
      const step1Errs = validateSchema(TRAINING_FORM_SCHEMA.find(s => s.id === 'sessionDetails')?.children || [], values, optionsMap, t);
      const step2Errs = validateSchema(TRAINING_FORM_SCHEMA.find(s => s.id === 'scheduleFormat')?.children || [], values, optionsMap, t);
      if (Object.keys(step1Errs).length > 0 || Object.keys(step2Errs).length > 0) {
        setMissingFields(getMissingFieldsForTabs(['sessionDetails', 'scheduleFormat']));
        setShowIncompleteModal(true);
        return;
      }
      setErrors({});
      setIsPublished(true);
      setTimeout(() => handleNavigate('support-provider-dashboard'), 1800);
    }
  }, [activeStep, values, optionsMap, t, getMissingFieldsForTabs]);

  const handlePrev = useCallback(() => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    } else {
      handleNavigate('support-provider-create-opportunities');
    }
  }, [activeStep]);

  // ─── Active tab schema ────────────────────────────────────────────────────
  const activeTabSchema = useMemo(() => {
    if (activeStep === 1) return TRAINING_FORM_SCHEMA.find(s => s.id === 'sessionDetails');
    if (activeStep === 2) return TRAINING_FORM_SCHEMA.find(s => s.id === 'scheduleFormat');
    if (activeStep === 3) return TRAINING_FORM_SCHEMA.find(s => s.id === 'review');
    return undefined;
  }, [activeStep]);

  const activeSchema = useMemo(() => activeTabSchema?.children || [], [activeTabSchema]);

  const reviewValues = useMemo(() => ({
    ...values,
    start: values.startDate
      ? `${values.startDate}${values.startTime ? ` ${t('supportProvider.trainingSession.step3.atText', 'at')} ${values.startTime}` : ''}`
      : '-',
    end: values.endDate
      ? `${values.endDate}${values.endTime ? ` ${t('supportProvider.trainingSession.step3.atText', 'at')} ${values.endTime}` : ''}`
      : '-',
  }), [values, t]);

  const isFinalStep = activeStep === stepperTabs.length;

  const prevLabel = t('supportProvider.trainingSession.buttons.previous') || 'Previous';
  const continueLabel = t('supportProvider.trainingSession.buttons.continue') || 'Continue';
  const saveDraftLabel = t('supportProvider.trainingSession.buttons.saveDraft') || 'Save as Draft';
  const publishLabel = t('supportProvider.trainingSession.step3.publishButton') || 'Publish Support';

  return (
    <VStack flex={1} bg="$backgroundLight50">
      {/* Form Header & Stepper — sticky at top, uses PageHeader internally */}
      <FormStepperHeader
        activeStep={activeStep}
        totalSteps={stepperTabs.length}
        setActiveStep={setActiveStep}
        onNavigateBack={handlePrev}
        title={t('supportProvider.trainingSession.pageTitle') || 'Create Training Session'}
        backButtonText={t('supportProvider.trainingSession.changeType') || 'Change Type'}
        badgeText={t('supportProvider.trainingSession.badgeText') || 'Training Session'}
        tabs={stepperTabs}
      />

      {/* Main content ScrollView */}
      <ScrollView flex={1}>
        <Container px="$4" $md-px="$6" py="$8">


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
            {isPublished && activeStep === 3 ? (
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
                  {t('supportProvider.forms.successTitle') || 'Training Session Created Successfully!'}
                </Text>
                <Text color="$textDark600" {...TYPOGRAPHY.caption} mt="$1">
                  {t('supportProvider.forms.successSub') || 'Redirecting back to dashboard...'}
                </Text>
              </Box>
            ) : (
              <VStack space="lg">
                {/* Step Heading & Subheading from active tab schema */}
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

                {/* Unified SchemaFormRenderer */}
                <SchemaFormRenderer
                  schema={activeSchema}
                  values={activeStep === 3 ? reviewValues : values}
                  errors={errors}
                  onFieldChange={handleFieldChange}
                  optionsMap={optionsMap}
                  t={t}
                  mode={activeStep === 3 ? 'preview' : 'edit'}
                  inputStyle={MENTOR_INPUT_STYLE}
                  selectStyle={MENTOR_INPUT_STYLE}
                  labelStyle={{ fontSize: '$sm', fontWeight: '$medium', color: '$textDark800' }}
                  hideSectionHeaders={activeStep !== 3}
                />
              </VStack>
            )}
          </Box>

          {/* ── Action Buttons — below the form card ── */}
          <HStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            flexDirection={isMobile ? 'column-reverse' : 'row'}
            gap={isMobile ? '$3' : '$0'}
            mb="$8"
          >
            {/* Previous */}
            <Button
              variant="outline"
              borderColor="$borderLight300"
              onPress={handlePrev}
              $web-style={{ cursor: 'pointer' }}
              width={isMobile ? '100%' : 'auto'}
            >
              <HStack alignItems="center" space="xs" justifyContent="center" width="100%">
                <LucideIcon name="ArrowLeft" size={14} color={theme.tokens.colors.onboardingFormBtnText} />
                <ButtonText color="$textDark800" {...TYPOGRAPHY.button}>{prevLabel}</ButtonText>
              </HStack>
            </Button>

            {/* Right-side: Publish (final step) or Save+Continue */}
            {isFinalStep ? (
              <Button
                bg={theme.tokens.colors.tickButtonActiveBg}
                $hover={{ bg: theme.tokens.colors.pillarLivelihoods }}
                $active={{ bg: theme.tokens.colors.success700 }}
                onPress={handleNext}
                $web-style={{ cursor: 'pointer' }}
                width={isMobile ? '100%' : 'auto'}
              >
                <HStack alignItems="center" space="xs" justifyContent="center" width="100%">
                  <LucideIcon name="Check" size={14} color={theme.tokens.colors.backgroundPrimary.light} />
                  <ButtonText color={theme.tokens.colors.backgroundPrimary.light} {...TYPOGRAPHY.button} fontWeight="$bold">
                    {publishLabel}
                  </ButtonText>
                </HStack>
              </Button>
            ) : (
              <HStack
                alignItems="center"
                flexDirection={isMobile ? 'column-reverse' : 'row'}
                width={isMobile ? '100%' : 'auto'}
                gap="$3"
              >
                {/* Save as Draft */}
                <Button
                  variant="outline"
                  borderColor="$borderLight300"
                  onPress={() => {}}
                  $web-style={{ cursor: 'pointer' }}
                  width={isMobile ? '100%' : 'auto'}
                >
                  <HStack alignItems="center" space="xs" justifyContent="center" width="100%">
                    <LucideIcon name="FileText" size={14} color={theme.tokens.colors.onboardingFormBtnText} />
                    <ButtonText color="$textDark800" {...TYPOGRAPHY.button}>{saveDraftLabel}</ButtonText>
                  </HStack>
                </Button>

                {/* Continue */}
                <Button
                  bg={primaryColor}
                  $hover={{ bg: theme.tokens.colors.primary600 }}
                  $active={{ bg: theme.tokens.colors.primary700 }}
                  onPress={handleNext}
                  $web-style={{ cursor: 'pointer' }}
                  width={isMobile ? '100%' : 'auto'}
                >
                  <HStack alignItems="center" space="xs" justifyContent="center" width="100%">
                    <ButtonText color={theme.tokens.colors.backgroundPrimary.light} {...TYPOGRAPHY.button} fontWeight="$bold">
                      {continueLabel}
                    </ButtonText>
                    <LucideIcon name="ArrowRight" size={14} color={theme.tokens.colors.backgroundPrimary.light} />
                  </HStack>
                </Button>
              </HStack>
            )}
          </HStack>

        </Container>

        {/* Incomplete Form Modal */}
        <IncompleteFormModal
          isOpen={showIncompleteModal}
          onClose={() => setShowIncompleteModal(false)}
          missingFields={missingFields}
          onFieldClick={handleFieldClick}
        />
      </ScrollView>
    </VStack>
  );
};

export default CreateTrainingSessionScreen;
