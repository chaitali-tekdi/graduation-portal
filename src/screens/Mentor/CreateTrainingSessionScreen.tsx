import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  HStack,
  Text,
  VStack,
  ScrollView,
  Button,
  ButtonText,
  Pressable,
} from '@gluestack-ui/themed';
import LucideIcon from '@components/ui/LucideIcon';
import { useLanguage } from '@contexts/LanguageContext';
import SUPPORT_PROVIDER_CONFIG from '@constants/SUPPORT_PROVIDER_CONFIG';
import { theme } from '@config/theme';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import FormStepperHeader from './components/FormStepperHeader';
import { useUserManagementFilters } from '@constants/USER_MANAGEMENT';
import { getSitesByProvince } from '../../services/usersService';
import SchemaFormRenderer, { validateSchema } from '@components/SchemaFormRenderer';
import {
  TRAINING_SESSION_STEP1_SCHEMA,
  TRAINING_SESSION_STEP2_SCHEMA,
} from '@constants/TRAINING_FORM_SCHEMA';


const MENTOR_INPUT_STYLE = {
  variant: 'outline' as const,
  size: 'md' as const,
  bg: '$white' as const,
  borderRadius: '$md' as const,
  borderWidth: 1,
  borderColor: '$borderLight300' as const,
};

interface CreateTrainingSessionScreenProps {
  onNavigate: (route: string) => void;
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

export const CreateTrainingSessionScreen: React.FC<
  CreateTrainingSessionScreenProps
> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.themePrimaryColor || theme.tokens.colors.primary500;

  // Active step tab (1: Details, 2: Schedule & Format, 3: Review & Publish)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Dynamic Province & Site
  const { provinces: dynamicProvinces } = useUserManagementFilters({});
  const [dynamicSites, setDynamicSites] = useState<any[]>([]);

  // File Upload State
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback((name: string, value: string) => {
    setValues(prev => {
      const next = { ...prev, [name]: value };
      // When province changes, reset site
      if (name === 'province') next.site = '';
      // When pillar changes, reset session type/title
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

    // Session types filtered by selected pillar
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
  const previousText = t('supportProvider.trainingSession.buttons.previous') || 'Previous';
  const continueText = t('supportProvider.trainingSession.buttons.continue') || 'Continue';

  const handleNext = () => {
    if (activeStep === 1) {
      const isValid = validateStep(TRAINING_SESSION_STEP1_SCHEMA);
      if (!isValid) return;
      setActiveStep(2);
    } else if (activeStep === 2) {
      const isValid = validateStep(TRAINING_SESSION_STEP2_SCHEMA);
      if (!isValid) return;
      setActiveStep(3);
    } else {
      setErrors({});
      setIsPublished(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1800);
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    } else {
      onNavigate('create_support');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFileName(file.name);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <ScrollView flex={1} bg="$backgroundLight50">
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
      />

      {/* Form Header & Stepper */}
      <FormStepperHeader
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onNavigateBack={handlePrev}
      />

      {/* Main Container - Aligned to Form Width (760px) */}
      <Box
        width="100%"
        maxWidth={790}
        alignSelf="center"
        px="$4"
        $md-px="$0"
        pb="$8"
        pt="$8"
      >

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
          {/* ── STEP 1: Session Details ─────────────────────────────────── */}
          {activeStep === 1 && (
            <VStack space="lg">
              <VStack space="xs" mb="$2">
                <Text color="$textDark900" {...TYPOGRAPHY.h2}>
                  {t('supportProvider.trainingSession.step1.heading') || 'Training Session Details'}
                </Text>
                <Text color="$textDark500" {...TYPOGRAPHY.caption}>
                  Fields marked <Text color={theme.tokens.colors.error600} fontWeight="$bold">*</Text> are required
                </Text>
              </VStack>

              {/* All Step 1 fields — schema-driven */}
              <SchemaFormRenderer
                schema={TRAINING_SESSION_STEP1_SCHEMA}
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

              {/* Resource Content Upload (no schema equivalent — file input) */}
              <VStack space="xs">
                <Text color="$textDark800" {...TYPOGRAPHY.label}>
                  {t('supportProvider.trainingSession.step1.resourceContent') || 'Resource Content'}{' '}
                  <Text color={theme.tokens.colors.textMuted} {...TYPOGRAPHY.caption}>
                    {t('supportProvider.trainingSession.step1.optionalTag') || '(optional)'}
                  </Text>
                </Text>
                <Text color={theme.tokens.colors.textMuted} {...TYPOGRAPHY.caption}>
                  {t('supportProvider.trainingSession.step1.resourceUploadSub') || 'Upload PDF or DOC training materials'}
                </Text>

                <Pressable
                  borderWidth={1}
                  borderStyle="dashed"
                  borderColor="$borderLight300"
                  borderRadius="$lg"
                  p="$6"
                  alignItems="center"
                  justifyContent="center"
                  bg="$backgroundLight50"
                  $hover={{ bg: '$backgroundLight100', borderColor: primaryColor }}
                  $web-style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onPress={handleUploadClick}
                >
                  <VStack alignItems="center" space="xs">
                    <LucideIcon name="Upload" size={28} color={theme.tokens.colors.textMuted} />
                    <Text color="$textDark700" {...TYPOGRAPHY.caption} fontWeight="$medium" mt="$1">
                      {selectedFileName || (t('supportProvider.trainingSession.step1.uploadPrompt') || 'Click to upload PDF / DOC')}
                    </Text>
                    <Text color={theme.tokens.colors.textMuted} {...TYPOGRAPHY.caption}>
                      {t('supportProvider.trainingSession.step1.maxSize') || 'Max 10 MB'}
                    </Text>
                  </VStack>
                </Pressable>
              </VStack>
            </VStack>
          )}

          {/* ── STEP 2: Schedule & Format ───────────────────────────────── */}
          {activeStep === 2 && (
            <VStack space="lg">
              <VStack space="xs" mb="$2">
                <Text color="$textDark900" {...TYPOGRAPHY.h2}>
                  {t('supportProvider.trainingSession.step2.heading') || 'Schedule & Format'}
                </Text>
                <Text color="$textDark500" {...TYPOGRAPHY.caption}>
                  {t('supportProvider.trainingSession.step2.subheading') || 'Set when and how the session will be delivered'}
                </Text>
              </VStack>

              {/* All Step 2 fields — schema-driven */}
              <SchemaFormRenderer
                schema={TRAINING_SESSION_STEP2_SCHEMA}
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

          {/* ── STEP 3: Review & Publish ────────────────────────────────── */}
          {activeStep === 3 && (
            <VStack space="lg">
              <VStack space="xs" mb="$2">
                <Text color="$textDark900" {...TYPOGRAPHY.h2}>
                  {t('supportProvider.trainingSession.step3.heading') || 'Review & Publish'}
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
                    {t('supportProvider.forms.successTitle') || 'Training Session Created Successfully!'}
                  </Text>
                  <Text color="$textDark600" {...TYPOGRAPHY.caption} mt="$1">
                    {t('supportProvider.forms.successSub') || 'Redirecting back to dashboard...'}
                  </Text>
                </Box>
              ) : (
                <VStack space="md">
                  {/* Session Details Summary */}
                  <Box
                    borderWidth={1}
                    borderColor="$borderLight200"
                    borderRadius="$lg"
                    p="$4"
                    bg={theme.tokens.colors.backgroundPrimary.light}
                  >
                    <Text color="$textDark900" {...TYPOGRAPHY.label} fontWeight="$bold" mb="$3">
                      {t('supportProvider.trainingSession.step3.sessionDetailsTitle') || 'Session Details'}
                    </Text>
                    <VStack space="xs">
                      <HStack space="xs" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                        <Text color="$textDark600" {...TYPOGRAPHY.caption}>
                          {t('supportProvider.trainingSession.step3.pillarLabel') || 'Pillar:'}
                        </Text>
                        <Text color="$textDark900" {...TYPOGRAPHY.caption} fontWeight="$medium">
                          {values.pillar || '-'}
                        </Text>
                      </HStack>

                      <HStack space="xs" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                        <Text color="$textDark600" {...TYPOGRAPHY.caption}>
                          {t('supportProvider.trainingSession.step3.recurringLabel') || 'Recurring:'}
                        </Text>
                        <Text color="$textDark900" {...TYPOGRAPHY.caption} fontWeight="$medium">
                          {values.recurringSession || 'No'}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Schedule Summary */}
                  <Box
                    borderWidth={1}
                    borderColor="$borderLight200"
                    borderRadius="$lg"
                    p="$4"
                    bg={theme.tokens.colors.backgroundPrimary.light}
                  >
                    <Text color="$textDark900" {...TYPOGRAPHY.label} fontWeight="$bold" mb="$3">
                      {t('supportProvider.trainingSession.step3.scheduleTitle') || 'Schedule'}
                    </Text>
                    <VStack space="xs">
                      <HStack space="xs" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                        <Text color="$textDark600" {...TYPOGRAPHY.caption}>
                          {t('supportProvider.trainingSession.step3.startLabel') || 'Start:'}
                        </Text>
                        <Text color="$textDark900" {...TYPOGRAPHY.caption} fontWeight="$medium">
                          {values.startDate}{values.startDate && values.startTime ? ` ${t('supportProvider.trainingSession.step3.atText') || 'at'} ` : ''}{values.startTime}
                        </Text>
                      </HStack>

                      <HStack space="xs" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                        <Text color="$textDark600" {...TYPOGRAPHY.caption}>
                          {t('supportProvider.trainingSession.step3.endLabel') || 'End:'}
                        </Text>
                        <Text color="$textDark900" {...TYPOGRAPHY.caption} fontWeight="$medium">
                          {values.endDate}{values.endDate && values.endTime ? ` ${t('supportProvider.trainingSession.step3.atText') || 'at'} ` : ''}{values.endTime}
                        </Text>
                      </HStack>

                      <HStack space="xs" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                        <Text color="$textDark600" {...TYPOGRAPHY.caption}>
                          {t('supportProvider.trainingSession.step3.formatLabel') || 'Format:'}
                        </Text>
                        <Text color="$textDark900" {...TYPOGRAPHY.caption} fontWeight="$medium">
                          {values.formatType}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Info Banner */}
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
                        {t('supportProvider.trainingSession.step3.infoTitle') || 'Before you publish:'}
                      </Text>
                    </HStack>

                    <VStack space="xs" pl="$5">
                      <Text color={theme.tokens.colors.blue800} {...TYPOGRAPHY.caption}>
                        • {t('supportProvider.trainingSession.step3.infoBullet1') || 'This support will be visible to all Coaches in the GBL network'}
                      </Text>
                      <Text color={theme.tokens.colors.blue800} {...TYPOGRAPHY.caption}>
                        • {t('supportProvider.trainingSession.step3.infoBullet2') || 'Coaches can submit requests on behalf of participants'}
                      </Text>
                      <Text color={theme.tokens.colors.blue800} {...TYPOGRAPHY.caption}>
                        • {t('supportProvider.trainingSession.step3.infoBullet3') || "You'll receive notifications when requests are submitted"}
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              )}
            </VStack>
          )}
        </Box>

        {/* Bottom Action Navigation Buttons */}
        <HStack justifyContent="space-between" alignItems="center" width="100%">
          <Button
            variant="outline"
            borderColor="$borderLight300"
            onPress={handlePrev}
            $web-style={{ cursor: 'pointer' }}
          >
            <HStack alignItems="center" space="xs">
              <LucideIcon name="ArrowLeft" size={14} color={theme.tokens.colors.onboardingFormBtnText} />
              <ButtonText color="$textDark800" {...TYPOGRAPHY.button}>
                {previousText}
              </ButtonText>
            </HStack>
          </Button>

          {activeStep < 3 ? (
            <Button
              bg={primaryColor}
              $hover={{ bg: theme.tokens.colors.primary600 }}
              $active={{ bg: theme.tokens.colors.primary700 }}
              onPress={handleNext}
              $web-style={{ cursor: 'pointer' }}
            >
              <HStack alignItems="center" space="xs">
                <ButtonText color={theme.tokens.colors.backgroundPrimary.light} {...TYPOGRAPHY.button} fontWeight="$bold">
                  {continueText}
                </ButtonText>
                <LucideIcon name="ArrowRight" size={14} color={theme.tokens.colors.backgroundPrimary.light} />
              </HStack>
            </Button>
          ) : (
            <Button
              bg={theme.tokens.colors.tickButtonActiveBg}
              $hover={{ bg: theme.tokens.colors.pillarLivelihoods }}
              $active={{ bg: theme.tokens.colors.success700 }}
              onPress={handleNext}
              $web-style={{ cursor: 'pointer' }}
            >
              <HStack alignItems="center" space="xs">
                <LucideIcon name="Check" size={14} color={theme.tokens.colors.backgroundPrimary.light} />
                <ButtonText color={theme.tokens.colors.backgroundPrimary.light} {...TYPOGRAPHY.button} fontWeight="$bold">
                  {t('supportProvider.trainingSession.step3.publishButton') || 'Publish Support'}
                </ButtonText>
              </HStack>
            </Button>
          )}
        </HStack>
      </Box>
    </ScrollView>
  );
};

export default CreateTrainingSessionScreen;
