import React, { useState, useRef } from 'react';
import {
  Box,
  HStack,
  Text,
  VStack,
  Pressable,
  ScrollView,
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
import FormStepperHeader from './components/FormStepperHeader';

interface CreateTrainingSessionScreenProps {
  onNavigate: (route: string) => void;
}

export const CreateTrainingSessionScreen: React.FC<
  CreateTrainingSessionScreenProps
> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { branding } = SUPPORT_PROVIDER_CONFIG;
  const primaryColor = branding.themePrimaryColor || '#8B2842';

  // Active step tab (1: Details, 2: Schedule & Format, 3: Review & Publish)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Step 1 Form States with Required Defaults
  const [province, setProvince] = useState('');
  const [site, setSite] = useState('');
  const [pillar, setPillar] = useState('Livelihoods');
  const [sessionType, setSessionType] = useState('');
  const [description, setDescription] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [targetAudience, setTargetAudience] = useState('Participant'); // Participant selected by default
  const [certificateProvided, setCertificateProvided] = useState('Yes'); // Yes selected by default
  const [maxCapacity, setMaxCapacity] = useState('20');
  const [isRecurring, setIsRecurring] = useState(false); // Can be toggled Yes/No matching Image 7 & 9

  // File Upload State
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 2 Form States
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [formatType, setFormatType] = useState('Offline');
  const [venueLocation, setVenueLocation] = useState('');

  // Step 3 Submission State
  const [isPublished, setIsPublished] = useState(false);

  // Button text
  const previousText = t('supportProvider.trainingSession.buttons.previous') || 'Previous';
  const continueText = t('supportProvider.trainingSession.buttons.continue') || 'Continue';

  const handleNext = () => {
    if (activeStep < 3) {
      setActiveStep(prev => prev + 1);
    } else {
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
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <ScrollView flex={1} bg="$backgroundLight50">
      {/* Hidden Native File Input for Cross-Platform Web Support */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
      />

      {/* Modular Form Header & Stepper Section with Full-Width Divider */}
      <FormStepperHeader
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onNavigateBack={() => onNavigate('create_support')}
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
          bg="#ffffff"
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
          {/* STEP 1: Session Details */}
          {activeStep === 1 && (
            <VStack space="lg">
              <VStack space="xs" mb="$2">
                <Text color="$textDark900" fontWeight="$bold" fontSize="$xl">
                  {t('supportProvider.trainingSession.step1.heading') || 'Training Session Details'}
                </Text>
                <Text color="$textDark500" fontSize="$xs">
                  Fields marked <Text color="#DC2626" fontWeight="$bold">*</Text> are required
                </Text>
              </VStack>

              {/* Province & Site Row */}
              <HStack space="md" flexDirection="column" $md-flexDirection="row">
                <VStack space="xs" flex={1}>
                  <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                    {t('supportProvider.trainingSession.step1.province') || 'Province'}{' '}
                    <Text color="#DC2626">*</Text>
                  </Text>
                  <Input
                    borderRadius="$md"
                    borderColor="$borderLight300"
                    $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                  >
                    <InputField
                      placeholder={t('supportProvider.trainingSession.step1.provincePlaceholder') || 'Select province'}
                      value={province}
                      onChangeText={setProvince}
                    />
                    <Box pr="$3" justifyContent="center">
                      <LucideIcon name="ChevronDown" size={16} color="#9CA3AF" />
                    </Box>
                  </Input>
                </VStack>

                <VStack space="xs" flex={1}>
                  <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                    {t('supportProvider.trainingSession.step1.site') || 'Site'}{' '}
                    <Text color="#DC2626">*</Text>
                  </Text>
                  <Input
                    borderRadius="$md"
                    borderColor="$borderLight300"
                    $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                  >
                    <InputField
                      placeholder={t('supportProvider.trainingSession.step1.sitePlaceholder') || 'Select province first'}
                      value={site}
                      onChangeText={setSite}
                    />
                    <Box pr="$3" justifyContent="center">
                      <LucideIcon name="ChevronDown" size={16} color="#9CA3AF" />
                    </Box>
                  </Input>
                </VStack>
              </HStack>

              {/* Pillar Selector Pills */}
              <VStack space="xs">
                <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                  {t('supportProvider.trainingSession.step1.pillar') || 'Pillar'}{' '}
                  <Text color="#DC2626">*</Text>
                </Text>
                <HStack space="xs" flexWrap="wrap" gap="$2">
                  {[
                    t('supportProvider.trainingSession.step1.pillars.socialEmpowerment') || 'Social Empowerment',
                    t('supportProvider.trainingSession.step1.pillars.financialInclusion') || 'Financial Inclusion',
                    t('supportProvider.trainingSession.step1.pillars.livelihoods') || 'Livelihoods',
                    t('supportProvider.trainingSession.step1.pillars.others') || 'Others',
                  ].map(option => {
                    const isSelected = pillar === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setPillar(option)}
                        px="$4"
                        py="$2.5"
                        borderRadius="$md"
                        borderWidth={1.5}
                        borderColor={isSelected ? primaryColor : '$borderLight300'}
                        bg={isSelected ? '#ffffff' : '#ffffff'}
                        $hover={{ borderColor: primaryColor }}
                        $web-style={{
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Text
                          color={isSelected ? primaryColor : '$textDark700'}
                          fontWeight={isSelected ? '$bold' : '$medium'}
                          fontSize="$xs"
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </HStack>
              </VStack>

              {/* Training / Session Type Dropdown */}
              <VStack space="xs">
                <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                  {t('supportProvider.trainingSession.step1.sessionType') || 'Training / Session Type'}{' '}
                  <Text color="#DC2626">*</Text>
                </Text>
                <Input
                  borderRadius="$md"
                  borderColor="$borderLight300"
                  $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                >
                  <InputField
                    placeholder={t('supportProvider.trainingSession.step1.sessionTypePlaceholder') || 'Select session type'}
                    value={sessionType}
                    onChangeText={setSessionType}
                  />
                  <Box pr="$3" justifyContent="center">
                    <LucideIcon name="ChevronDown" size={16} color="#9CA3AF" />
                  </Box>
                </Input>
              </VStack>

              {/* Training / Session Description */}
              <VStack space="xs">
                <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                  {t('supportProvider.trainingSession.step1.description') || 'Training / Session Description'}{' '}
                  <Text color="#DC2626">*</Text>
                </Text>
                <Textarea
                  borderRadius="$md"
                  borderColor="$borderLight300"
                  minHeight={90}
                  $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                >
                  <TextareaInput
                    placeholder={
                      t('supportProvider.trainingSession.step1.descriptionPlaceholder') ||
                      'Describe what this session covers and what participants will learn...'
                    }
                    value={description}
                    onChangeText={setDescription}
                  />
                </Textarea>
              </VStack>

              {/* Learning Objectives */}
              <VStack space="xs">
                <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                  {t('supportProvider.trainingSession.step1.learningObjectives') || 'Learning Objectives'}{' '}
                  <Text color="#9CA3AF" fontWeight="$normal" fontSize="$xs">
                    {t('supportProvider.trainingSession.step1.optionalTag') || '(optional)'}
                  </Text>
                </Text>
                <Textarea
                  borderRadius="$md"
                  borderColor="$borderLight300"
                  minHeight={90}
                  $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                >
                  <TextareaInput
                    placeholder={
                      t('supportProvider.trainingSession.step1.learningObjectivesPlaceholder') ||
                      'List the key learning outcomes, one per line...'
                    }
                    value={learningObjectives}
                    onChangeText={setLearningObjectives}
                  />
                </Textarea>
              </VStack>

              {/* Target Audience Pills (Participant selected by default) */}
              <VStack space="xs">
                <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                  {t('supportProvider.trainingSession.step1.targetAudience') || 'Target Audience'}{' '}
                  <Text color="#DC2626">*</Text>
                </Text>
                <HStack space="xs" gap="$2">
                  {[
                    t('supportProvider.trainingSession.step1.targetAudienceOptions.coach') || 'Coach',
                    t('supportProvider.trainingSession.step1.targetAudienceOptions.participant') || 'Participant',
                    t('supportProvider.trainingSession.step1.targetAudienceOptions.both') || 'Both',
                  ].map(option => {
                    const isSelected = targetAudience === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setTargetAudience(option)}
                        flex={1}
                        py="$2.5"
                        borderRadius="$md"
                        borderWidth={1}
                        borderColor={isSelected ? primaryColor : '$borderLight300'}
                        bg="#ffffff"
                        alignItems="center"
                        $web-style={{ cursor: 'pointer' }}
                      >
                        <Text
                          color={isSelected ? primaryColor : '$textDark700'}
                          fontWeight={isSelected ? '$bold' : '$medium'}
                          fontSize="$xs"
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </HStack>
              </VStack>

              {/* Certificate Provided Pills (Yes selected by default) */}
              <VStack space="xs">
                <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                  {t('supportProvider.trainingSession.step1.certificate') || 'Certificate Provided'}{' '}
                  <Text color="#DC2626">*</Text>
                </Text>
                <HStack space="xs" gap="$2">
                  {[
                    t('supportProvider.trainingSession.step1.certificateOptions.yes') || 'Yes',
                    t('supportProvider.trainingSession.step1.certificateOptions.no') || 'No',
                  ].map(option => {
                    const isSelected = certificateProvided === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setCertificateProvided(option)}
                        flex={1}
                        py="$2.5"
                        borderRadius="$md"
                        borderWidth={1}
                        borderColor={isSelected ? primaryColor : '$borderLight300'}
                        bg="#ffffff"
                        alignItems="center"
                        $web-style={{ cursor: 'pointer' }}
                      >
                        <Text
                          color={isSelected ? primaryColor : '$textDark700'}
                          fontWeight={isSelected ? '$bold' : '$medium'}
                          fontSize="$xs"
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </HStack>
              </VStack>

              {/* Capacity & Recurring Session Row matching Image 7 & Image 9 */}
              <HStack space="md" flexDirection="column" $md-flexDirection="row" alignItems="flex-end">
                <VStack space="xs" flex={1}>
                  <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                    {t('supportProvider.trainingSession.step1.maxCapacity') || 'Maximum Capacity'}{' '}
                    <Text color="#DC2626">*</Text>
                  </Text>
                  <Input
                    borderRadius="$md"
                    borderColor="$borderLight300"
                    $focus={{ borderColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.1 }}
                  >
                    <InputField
                      placeholder={t('supportProvider.trainingSession.step1.maxCapacityPlaceholder') || 'e.g. 20'}
                      keyboardType="numeric"
                      value={maxCapacity}
                      onChangeText={setMaxCapacity}
                    />
                  </Input>
                </VStack>

                <VStack space="xs" flex={1}>
                  <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                    {t('supportProvider.trainingSession.step1.recurringSession') || 'Recurring Session'}
                  </Text>
                  <Pressable
                    onPress={() => setIsRecurring(prev => !prev)}
                    py="$2.5"
                    px="$3"
                    borderRadius="$md"
                    borderWidth={1.5}
                    borderColor={isRecurring ? primaryColor : '$borderLight300'}
                    bg="#ffffff"
                    $web-style={{ cursor: 'pointer' }}
                  >
                    <HStack alignItems="center" space="xs">
                      {/* Radio button icon matching Image 7 & 9 */}
                      <Box
                        width={16}
                        height={16}
                        borderRadius={8}
                        borderWidth={isRecurring ? 5 : 1.5}
                        borderColor={isRecurring ? primaryColor : '#9CA3AF'}
                        bg="#ffffff"
                      />
                      <Text
                        color={isRecurring ? primaryColor : '$textDark700'}
                        fontWeight="$medium"
                        fontSize="$xs"
                      >
                        {isRecurring
                          ? t('supportProvider.trainingSession.step1.recurringToggle') || 'Yes — recurring session'
                          : t('supportProvider.trainingSession.step1.recurringToggleNo') || 'No — one-off session'}
                      </Text>
                    </HStack>
                  </Pressable>
                </VStack>
              </HStack>

              {/* Resource Content Upload Box matching Reference Images */}
              <VStack space="xs">
                <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                  {t('supportProvider.trainingSession.step1.resourceContent') || 'Resource Content'}{' '}
                  <Text color="#9CA3AF" fontWeight="$normal" fontSize="$xs">
                    {t('supportProvider.trainingSession.step1.optionalTag') || '(optional)'}
                  </Text>
                </Text>
                <Text color="#9CA3AF" fontSize="$xs">
                  {t('supportProvider.trainingSession.step1.resourceUploadSub') || 'Upload PDF or DOC training materials'}
                </Text>

                <Pressable
                  onPress={handleUploadClick}
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
                >
                  <VStack alignItems="center" space="xs">
                    <LucideIcon name="UploadCloud" size={28} color="#9CA3AF" />
                    <Text color="$textDark700" fontWeight="$medium" fontSize="$xs" mt="$1">
                      {selectedFileName || (t('supportProvider.trainingSession.step1.uploadPrompt') || 'Click to upload PDF / DOC')}
                    </Text>
                    <Text color="#9CA3AF" fontSize={11}>
                      {t('supportProvider.trainingSession.step1.maxSize') || 'Max 10 MB'}
                    </Text>
                  </VStack>
                </Pressable>
              </VStack>
            </VStack>
          )}

          {/* STEP 2: Schedule & Format */}
          {activeStep === 2 && (
            <VStack space="lg">
              <VStack space="xs" mb="$2">
                <Text color="$textDark900" fontWeight="$bold" fontSize="$xl">
                  {t('supportProvider.trainingSession.step2.heading') || 'Schedule & Format'}
                </Text>
                <Text color="$textDark500" fontSize="$xs">
                  {t('supportProvider.trainingSession.step2.subheading') || 'Set when and how the session will be delivered'}
                </Text>
              </VStack>

              {/* Start Date & Time */}
              <HStack space="md" flexDirection="column" $md-flexDirection="row">
                <VStack space="xs" flex={1}>
                  <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                    {t('supportProvider.trainingSession.step2.startDate') || 'Start Date'}{' '}
                    <Text color="#DC2626">*</Text>
                  </Text>
                  <Input borderRadius="$md" borderColor="$borderLight100">
                    <InputField
                      placeholder={t('supportProvider.trainingSession.step2.startDatePlaceholder') || 'dd/mm/yyyy'}
                      value={startDate}
                      onChangeText={setStartDate}
                    />
                  </Input>
                </VStack>

                <VStack space="xs" flex={1}>
                  <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                    {t('supportProvider.trainingSession.step2.startTime') || 'Start Time'}{' '}
                    <Text color="#DC2626">*</Text>
                  </Text>
                  <Input borderRadius="$md" borderColor="$borderLight100">
                    <InputField
                      placeholder={t('supportProvider.trainingSession.step2.startTimePlaceholder') || '--:--'}
                      value={startTime}
                      onChangeText={setStartTime}
                    />
                  </Input>
                </VStack>
              </HStack>

              {/* End Date & Time */}
              <HStack space="md" flexDirection="column" $md-flexDirection="row">
                <VStack space="xs" flex={1}>
                  <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                    {t('supportProvider.trainingSession.step2.endDate') || 'End Date'}{' '}
                    <Text color="#DC2626">*</Text>
                  </Text>
                  <Input borderRadius="$md" borderColor="$borderLight300">
                    <InputField
                      placeholder={t('supportProvider.trainingSession.step2.endDatePlaceholder') || 'dd/mm/yyyy'}
                      value={endDate}
                      onChangeText={setEndDate}
                    />
                  </Input>
                </VStack>

                <VStack space="xs" flex={1}>
                  <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                    {t('supportProvider.trainingSession.step2.endTime') || 'End Time'}{' '}
                    <Text color="#DC2626">*</Text>
                  </Text>
                  <Input borderRadius="$md" borderColor="$borderLight300">
                    <InputField
                      placeholder={t('supportProvider.trainingSession.step2.endTimePlaceholder') || '--:--'}
                      value={endTime}
                      onChangeText={setEndTime}
                    />
                  </Input>
                </VStack>
              </HStack>

              {/* Type (Offline, Online, Hybrid) */}
              <VStack space="xs">
                <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                  {t('supportProvider.trainingSession.step2.type') || 'Type'}{' '}
                  <Text color="#DC2626">*</Text>
                </Text>
                <HStack space="xs" gap="$2">
                  {[
                    {
                      label: t('supportProvider.trainingSession.step2.typeOptions.offline') || 'Offline',
                      icon: 'MapPin',
                    },
                    {
                      label: t('supportProvider.trainingSession.step2.typeOptions.online') || 'Online',
                      icon: 'Video',
                    },
                    {
                      label: t('supportProvider.trainingSession.step2.typeOptions.hybrid') || 'Hybrid',
                      icon: 'Users',
                    },
                  ].map(option => (
                    <Pressable
                      key={option.label}
                      onPress={() => setFormatType(option.label)}
                      flex={1}
                      py="$2.5"
                      borderRadius="$md"
                      borderWidth={1}
                      borderColor={formatType === option.label ? primaryColor : '$borderLight300'}
                      bg={formatType === option.label ? '#ffffff' : '#ffffff'}
                      alignItems="center"
                      $web-style={{ cursor: 'pointer' }}
                    >
                      <HStack alignItems="center" space="xs">
                        <LucideIcon
                          name={option.icon}
                          size={14}
                          color={formatType === option.label ? primaryColor : '#6B7280'}
                        />
                        <Text
                          color={formatType === option.label ? primaryColor : '$textDark700'}
                          fontWeight={formatType === option.label ? '$bold' : '$medium'}
                          fontSize="$xs"
                        >
                          {option.label}
                        </Text>
                      </HStack>
                    </Pressable>
                  ))}
                </HStack>
              </VStack>

              {/* Venue Location */}
              <VStack space="xs">
                <Text color="$textDark800" fontWeight="$medium" fontSize="$sm">
                  {t('supportProvider.trainingSession.step2.venueLocation') || 'Venue Location'}{' '}
                  <Text color="#DC2626">*</Text>
                </Text>
                <Input borderRadius="$md" borderColor="$borderLight300">
                  <InputField
                    placeholder={
                      t('supportProvider.trainingSession.step2.venuePlaceholder') ||
                      'Venue name and address...'
                    }
                    value={venueLocation}
                    onChangeText={setVenueLocation}
                  />
                </Input>
              </VStack>
            </VStack>
          )}

          {/* STEP 3: Review & Publish matching Image 8 */}
          {activeStep === 3 && (
            <VStack space="lg">
              <VStack space="xs" mb="$2">
                <Text color="$textDark900" fontWeight="$bold" fontSize="$xl">
                  {t('supportProvider.trainingSession.step3.heading') || 'Review & Publish'}
                </Text>
              </VStack>

              {isPublished ? (
                <Box
                  bg="#F0FDF4"
                  borderColor="#22C55E"
                  borderWidth={1}
                  borderRadius="$lg"
                  p="$6"
                  alignItems="center"
                >
                  <LucideIcon name="CheckCircle" size={44} color="#16A34A" />
                  <Text color="#16A34A" fontWeight="$bold" fontSize="$lg" mt="$2">
                    {t('supportProvider.forms.successTitle') || 'Training Session Created Successfully!'}
                  </Text>
                  <Text color="$textDark600" fontSize="$xs" mt="$1">
                    {t('supportProvider.forms.successSub') || 'Redirecting back to dashboard...'}
                  </Text>
                </Box>
              ) : (
                <VStack space="md">
                  {/* Session Details Summary matching Image 8 */}
                  <Box
                    borderWidth={1}
                    borderColor="$borderLight200"
                    borderRadius="$lg"
                    p="$4"
                    bg="#ffffff"
                  >
                    <Text color="$textDark900" fontWeight="$bold" fontSize="$sm" mb="$3">
                      {t('supportProvider.trainingSession.step3.sessionDetailsTitle') || 'Session Details'}
                    </Text>
                    <VStack space="xs">
                      <HStack space="xs" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                        <Text color="$textDark600" fontSize="$xs">
                          {t('supportProvider.trainingSession.step3.pillarLabel') || 'Pillar:'}
                        </Text>
                        <Text color="$textDark900" fontSize="$xs" fontWeight="$medium">
                          {pillar}
                        </Text>
                      </HStack>

                      <HStack space="xs" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                        <Text color="$textDark600" fontSize="$xs">
                          {t('supportProvider.trainingSession.step3.recurringLabel') || 'Recurring:'}
                        </Text>
                        <Text color="$textDark900" fontSize="$xs" fontWeight="$medium">
                          {isRecurring ? 'Yes' : 'No'}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Schedule Summary matching Image 8 */}
                  <Box
                    borderWidth={1}
                    borderColor="$borderLight200"
                    borderRadius="$lg"
                    p="$4"
                    bg="#ffffff"
                  >
                    <Text color="$textDark900" fontWeight="$bold" fontSize="$sm" mb="$3">
                      {t('supportProvider.trainingSession.step3.scheduleTitle') || 'Schedule'}
                    </Text>
                    <VStack space="xs">
                      <HStack space="xs" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                        <Text color="$textDark600" fontSize="$xs">
                          {t('supportProvider.trainingSession.step3.startLabel') || 'Start:'}
                        </Text>
                        <Text color="$textDark900" fontSize="$xs" fontWeight="$medium">
                          {startDate} {startDate && startTime ? t('supportProvider.trainingSession.step3.atText') || 'at' : ''} {startTime}
                        </Text>
                      </HStack>

                      <HStack space="xs" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                        <Text color="$textDark600" fontSize="$xs">
                          {t('supportProvider.trainingSession.step3.endLabel') || 'End:'}
                        </Text>
                        <Text color="$textDark900" fontSize="$xs" fontWeight="$medium">
                          {endDate} {endDate && endTime ? t('supportProvider.trainingSession.step3.atText') || 'at' : ''} {endTime}
                        </Text>
                      </HStack>

                      <HStack space="xs" flexWrap="wrap" alignItems="center" justifyContent="space-between">
                        <Text color="$textDark600" fontSize="$xs">
                          {t('supportProvider.trainingSession.step3.formatLabel') || 'Format:'}
                        </Text>
                        <Text color="$textDark900" fontSize="$xs" fontWeight="$medium">
                          {formatType}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Info Warning Banner matching Image 8 */}
                  <Box
                    bg="#EFF6FF"
                    borderWidth={1}
                    borderColor="#BFDBFE"
                    borderRadius="$lg"
                    p="$4"
                  >
                    <HStack space="xs" alignItems="center" mb="$2">
                      <LucideIcon name="Info" size={16} color="#2563EB" />
                      <Text color="#1E40AF" fontWeight="$bold" fontSize="$xs">
                        {t('supportProvider.trainingSession.step3.infoTitle') || 'Before you publish:'}
                      </Text>
                    </HStack>

                    <VStack space="xs" pl="$5">
                      <Text color="#1E40AF" fontSize={11}>
                        • {t('supportProvider.trainingSession.step3.infoBullet1') || 'This support will be visible to all Coaches in the GBL network'}
                      </Text>
                      <Text color="#1E40AF" fontSize={11}>
                        • {t('supportProvider.trainingSession.step3.infoBullet2') || 'Coaches can submit requests on behalf of participants'}
                      </Text>
                      <Text color="#1E40AF" fontSize={11}>
                        • {t('supportProvider.trainingSession.step3.infoBullet3') || "You'll receive notifications when requests are submitted"}
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              )}
            </VStack>
          )}
        </Box>

        {/* Bottom Action Navigation Buttons OUTSIDE the form container matching Images 7, 8, 9 */}
        <HStack justifyContent="space-between" alignItems="center" width="100%">
          <Button
            variant="outline"
            borderColor="$borderLight300"
            onPress={handlePrev}
            $web-style={{ cursor: 'pointer' }}
          >
            <HStack alignItems="center" space="xs">
              <LucideIcon name="ArrowLeft" size={14} color="#374151" />
              <ButtonText color="$textDark800" fontSize="$xs" fontWeight="$medium">
                {previousText}
              </ButtonText>
            </HStack>
          </Button>

          {activeStep < 3 ? (
            <Button
              bg={primaryColor}
              $hover={{ bg: '#7A2038' }}
              $active={{ bg: '#691A2F' }}
              onPress={handleNext}
              $web-style={{ cursor: 'pointer' }}
            >
              <HStack alignItems="center" space="xs">
                <ButtonText color="#ffffff" fontWeight="$bold" fontSize="$xs">
                  {continueText}
                </ButtonText>
                <LucideIcon name="ArrowRight" size={14} color="#ffffff" />
              </HStack>
            </Button>
          ) : (
            <Button
              bg="#16A34A"
              $hover={{ bg: '#15803D' }}
              $active={{ bg: '#166534' }}
              onPress={handleNext}
              $web-style={{ cursor: 'pointer' }}
            >
              <HStack alignItems="center" space="xs">
                <LucideIcon name="Check" size={14} color="#ffffff" />
                <ButtonText color="#ffffff" fontWeight="$bold" fontSize="$xs">
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
