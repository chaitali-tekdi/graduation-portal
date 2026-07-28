import React, { useState } from 'react';
import { Box, VStack } from '@gluestack-ui/themed';
import SupportProviderHeader from './components/SupportProviderHeader';
import SupportProviderDashboard from './SupportProviderDashboard';
import CreateSupportScreen from './CreateSupportScreen';
import CreateTrainingSessionScreen from './CreateTrainingSessionScreen';
import CreateAssetSupportScreen from './CreateAssetSupportScreen';
import SupportProviderGenericScreen from './SupportProviderGenericScreen';

/**
 * Support Provider Screen Controller
 * Handles Support Provider role navigation and views dynamically driven by configuration.
 */
const SupportProviderScreen: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');

  const renderActiveScreen = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <SupportProviderDashboard onNavigate={setCurrentRoute} />;
      case 'create_support':
        return <CreateSupportScreen onNavigate={setCurrentRoute} />;
      case 'create_training_session':
        return <CreateTrainingSessionScreen onNavigate={setCurrentRoute} />;
      case 'assets':
        return <CreateAssetSupportScreen onNavigate={setCurrentRoute} />;
      default:
        return (
          <SupportProviderGenericScreen
            route={currentRoute}
            onNavigate={setCurrentRoute}
          />
        );
    }
  };

  return (
    <VStack flex={1} bg="$white" minHeight="$full">
      {/* Top Banner Header with Popover Navigation Menu */}
      <SupportProviderHeader
        title="Dashboard"
        hamburgerMenuItems={[]}
        onHamburgerMenuSelect={(key) => setCurrentRoute(key || 'dashboard')}
      />

      {/* Dynamic Screen View */}
      <Box flex={1}>
        {renderActiveScreen()}
      </Box>
    </VStack>
  );
};

export default SupportProviderScreen;
