import React, { useState } from 'react';
import { Box, VStack } from '@gluestack-ui/themed';
import MentorHeader from './components/MentorHeader';
import MentorDashboard from './MentorDashboard';
import CreateSupportScreen from './CreateSupportScreen';
import CreateTrainingSessionScreen from './CreateTrainingSessionScreen';
import MentorGenericScreen from './MentorGenericScreen';

/**
 * Mentor & Support Provider Screen Controller
 * Handles Mentor/Support Provider role navigation and views dynamically driven by configuration.
 */
const MentorScreen: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');

  const renderActiveScreen = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <MentorDashboard onNavigate={setCurrentRoute} />;
      case 'create_support':
        return <CreateSupportScreen onNavigate={setCurrentRoute} />;
      case 'create_training_session':
        return <CreateTrainingSessionScreen onNavigate={setCurrentRoute} />;
      default:
        return (
          <MentorGenericScreen
            route={currentRoute}
            onNavigate={setCurrentRoute}
          />
        );
    }
  };

  return (
    <VStack flex={1} bg="$white" minHeight="$full">
      {/* Top Banner Header with Popover Navigation Menu */}
      <MentorHeader
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
      />

      {/* Dynamic Screen View */}
      <Box flex={1}>
        {renderActiveScreen()}
      </Box>
    </VStack>
  );
};

export default MentorScreen;