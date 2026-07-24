import React, { useState } from 'react';
import { ScrollView } from '@gluestack-ui/themed';
import { useLanguage } from '@contexts/LanguageContext';
import FormStepperHeader, { StepperTabItem } from './components/FormStepperHeader';
import AssetsForm from './components/AssetsForm';

interface CreateAssetSupportScreenProps {
  onNavigate: (route: string) => void;
}

export const CreateAssetSupportScreen: React.FC<CreateAssetSupportScreenProps> = ({
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(1);

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

  return (
    <ScrollView flex={1} bg="$backgroundLight50">
      {/* Top Stepper Header with Assets Tabs */}
      <FormStepperHeader
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onNavigateBack={() => onNavigate('create_support')}
        title={t('supportProvider.assetSupport.pageTitle') || 'Create Asset'}
        badgeText={t('supportProvider.assetSupport.badgeText') || 'Asset'}
        tabs={assetStepperTabs}
      />

      {/* Separate AssetsForm Component */}
      <AssetsForm
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onNavigate={onNavigate}
      />
    </ScrollView>
  );
};

export default CreateAssetSupportScreen;
