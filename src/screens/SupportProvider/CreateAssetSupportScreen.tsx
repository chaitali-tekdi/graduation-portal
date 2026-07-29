import React, { useState, useRef, useCallback } from 'react';
import { ScrollView, VStack } from '@gluestack-ui/themed';
import { useLanguage } from '@contexts/LanguageContext';
import FormStepperHeader, { StepperTabItem } from './components/FormStepperHeader';
import AssetsForm from './components/AssetsForm';
import { useNavigation } from '@react-navigation/native';
import Container from '@components/ui/Container';

interface CreateAssetSupportScreenProps {
  onNavigate?: (route: string) => void;
}

export const CreateAssetSupportScreen: React.FC<CreateAssetSupportScreenProps> = ({
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(1);
  const [isFinalStep, setIsFinalStep] = useState(false);
  const navigation = useNavigation();

  // Refs that AssetsForm wires its nav handlers into
  const nextHandlerRef = useRef<(() => void) | null>(null);
  const prevHandlerRef = useRef<(() => void) | null>(null);

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigation.navigate(route as never);
    }
  };

  const assetStepperTabs: StepperTabItem[] = [
    {
      key: 1,
      label: t('supportProvider.assetSupport.tabs.assetDetails') || 'Asset Details',
      iconName: 'Package',
    },
    {
      key: 2,
      label: t('supportProvider.assetSupport.tabs.reviewPublish') || 'Review & Publish',
      iconName: 'Check',
    },
  ];

  const handleStepChange = useCallback((step: number) => {
    setActiveStep(step);
    setIsFinalStep(step >= assetStepperTabs.length);
  }, [assetStepperTabs.length]);

  const handleFormStepChange = useCallback((step: number, isFinal: boolean) => {
    setActiveStep(step);
    setIsFinalStep(isFinal);
  }, []);

  const handlePrev = useCallback(() => {
    if (activeStep > 1) {
      handleStepChange(activeStep - 1);
    } else {
      handleNavigate('support-provider-create-opportunities');
    }
  }, [activeStep]);

  return (
    <VStack flex={1} bg="$backgroundLight50">
      {/* Top Stepper Header — uses PageHeader internally, buttons configured here */}
      <FormStepperHeader
        activeStep={activeStep}
        totalSteps={assetStepperTabs.length}
        setActiveStep={handleStepChange}
        onNavigateBack={handlePrev}
        title={t('supportProvider.assetSupport.pageTitle') || 'Create Asset'}
        backButtonText={t('supportProvider.trainingSession.changeType') || 'Change Type'}
        badgeText={t('supportProvider.assetSupport.badgeText') || 'Asset'}
        tabs={assetStepperTabs}
        isFinalStep={isFinalStep}
        buttons={{
          onPrev: handlePrev,
          onContinue: () => nextHandlerRef.current?.(),
          onSaveDraft: () => {},
          hideSaveDraft: true,
          publishText: t('supportProvider.assetSupport.step2.publishButton') || 'Publish Support',
        }}
      />

      {/* Main content ScrollView */}
      <ScrollView flex={1}>
        <Container px="$4" $md-px="$6">
          <AssetsForm
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            onNavigate={handleNavigate}
            onStepChange={handleFormStepChange}
            onNextRef={nextHandlerRef}
            onPrevRef={prevHandlerRef}
          />
        </Container>
      </ScrollView>
    </VStack>
  );
};

export default CreateAssetSupportScreen;
