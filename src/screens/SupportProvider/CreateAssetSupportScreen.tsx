import React, { useState } from 'react';
import { ScrollView } from '@gluestack-ui/themed';
import { useLanguage } from '@contexts/LanguageContext';
import FormStepperHeader, { StepperTabItem } from './components/FormStepperHeader';
import AssetsForm from './components/AssetsForm';
import { useNavigation } from '@react-navigation/native';

interface CreateAssetSupportScreenProps {
  onNavigate?: (route: string) => void;
}

export const CreateAssetSupportScreen: React.FC<CreateAssetSupportScreenProps> = ({
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(1);
  const navigation = useNavigation();

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

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    } else {
      handleNavigate('support-provider-create-opportunities');
    }
  };

  return (
    <ScrollView flex={1} bg="$backgroundLight50">
      {/* Top Stepper Header with Assets Tabs */}
      <FormStepperHeader
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onNavigateBack={handlePrev}
        title={t('supportProvider.assetSupport.pageTitle') || 'Create Asset'}
        badgeText={t('supportProvider.assetSupport.badgeText') || 'Asset'}
        tabs={assetStepperTabs}
      />

      {/* Separate AssetsForm Component */}
      <AssetsForm
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onNavigate={handleNavigate}
      />
    </ScrollView>
  );
};

export default CreateAssetSupportScreen;
