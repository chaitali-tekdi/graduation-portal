import React from 'react';
import { Box, VStack, HStack, Text, Progress, ProgressFilledTrack } from '@ui';
import { LucideIcon } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { outcomesStyles } from '../../styles';
import { PARTICIPANT_STATUS_METRICS, ParticipantOutcomes } from '@constants/DASHBOARD_LC';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';

interface ParticipantStatusMetricCardProps {
  outcomesData: ParticipantOutcomes;
}

const ParticipantStatusMetricCard: React.FC<ParticipantStatusMetricCardProps> = ({
  outcomesData,
}) => {
  const { t } = useLanguage();

  return (
    <Box {...outcomesStyles.participantStatusCard}>
      <VStack {...outcomesStyles.statusGrid}>
        {PARTICIPANT_STATUS_METRICS.map((metric) => {
          const metricData = outcomesData[metric.key as keyof ParticipantOutcomes] as any;
          if (!metricData) return null;

          return (
            <Box key={metric.key} {...outcomesStyles.statusItem}>
              <VStack>
                <HStack {...outcomesStyles.statusItemHeader}>
                  {metric.icon && (
                    <LucideIcon name={metric.icon} size={14} color="$textMutedForeground" />
                  )}
                  <Text {...TYPOGRAPHY.bodySmall} color="$textSecondary" fontWeight="$semibold">
                    {t(metric.labelKey)}
                  </Text>
                </HStack>

                <HStack {...outcomesStyles.statusItemValueRow}>
                  <Text {...TYPOGRAPHY.h4} color="$textPrimary" fontWeight="$bold">
                    {metricData.value}
                  </Text>
                  {metric.key === 'debtStatus' && (
                    <LucideIcon name="AlertCircle" size={16} color="$warning500" />
                  )}
                  {metric.key === 'igaStatus' && (
                    <LucideIcon name="CheckCircle2" size={16} color="$success600" />
                  )}
                </HStack>

                {/* Subtext rendering */}
                {(metric.key === 'monthlyIncome' || metric.key === 'currentSavings') && metricData.change && (
                  <HStack {...outcomesStyles.statusItemSubLabelRow}>
                    <LucideIcon name="TrendingUp" size={12} color="$success600" />
                    <Text {...TYPOGRAPHY.bodySmall} color="$success600" fontSize="$2xs">
                      {metricData.change} from baseline
                    </Text>
                  </HStack>
                )}

                {metric.key === 'igaStatus' && metricData.details && (
                  <Text {...TYPOGRAPHY.bodySmall} color="$textMutedForeground" fontSize="$xs" mt="$1">
                    {metricData.details}
                  </Text>
                )}

                {metric.key === 'selfEfficacyScore' && metricData.percent !== undefined && (
                  <VStack mt="$2">
                    <Progress
                      value={metricData.percent}
                      w="$full"
                      h="$1.5"
                      bg="$progressBarBackground"
                      borderRadius="$full"
                    >
                      <ProgressFilledTrack bg="$blue500" />
                    </Progress>
                    <Text {...TYPOGRAPHY.bodySmall} color="$textMutedForeground" fontSize="$2xs" mt="$1">
                      Baseline: 45/100
                    </Text>
                  </VStack>
                )}
              </VStack>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default ParticipantStatusMetricCard;
