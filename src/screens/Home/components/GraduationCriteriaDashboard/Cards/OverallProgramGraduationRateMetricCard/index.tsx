import React from 'react';
import { Box, HStack, VStack, Text } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { GRADUATION_METRICS } from '@constants/DASHBOARD_LC';
import { graduationCriteriaStyles } from '../../styles';

const OverallProgramGraduationRateMetricCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Box {...graduationCriteriaStyles.metricCard}>
      <HStack {...graduationCriteriaStyles.metricRow}>
        {GRADUATION_METRICS.map((metric, index) => {
          const isLast = index === GRADUATION_METRICS.length - 1;
          const label = t(metric.labelKey);
          const value = t(metric.valueKey);
          const description = t(metric.subLabelKey);

          return (
            <VStack
              key={metric.key}
              {...graduationCriteriaStyles.metricItem(isLast)}
            >
              {/* Colored Top Accent Bar */}
              <Box
                {...graduationCriteriaStyles.metricTopAccent(metric.colorToken)}
              />

              {/* Text Content */}
              <VStack {...graduationCriteriaStyles.metricTextContainer}>
                <Text {...graduationCriteriaStyles.metricLabel}>
                  {label}
                </Text>
                <Text
                  {...graduationCriteriaStyles.metricValue}
                  color={metric.colorToken}
                >
                  {value}
                </Text>
                <Text {...graduationCriteriaStyles.metricDescription}>
                  {description}
                </Text>
              </VStack>
            </VStack>
          );
        })}
      </HStack>
    </Box>
  );
};

export default OverallProgramGraduationRateMetricCard;
