import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';

export const orgProfileStyles = {
  orgProfileMainWrapper: {
    flex: 1,
  },
  orgProfileContainer: {
    px: '$4',
    py: '$6',
    '$md-px': '$6',
  },

  // Header Actions
  orgProfileHeaderActionsGroup: {
    space: 'sm' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    gap: '$2',
  },
  orgProfileEditButton: {
    bg: '$primary500',
    borderRadius: 10,
    px: '$4',
    py: '$2',
    height: 38,
  },
  orgProfileCancelButton: {
    bg: '$white',
    borderWidth: 1,
    borderColor: '$gray300',
    borderRadius: 10,
    px: '$4',
    py: '$2',
    height: 38,
    $web: {
      cursor: 'pointer' as const,
      transition: 'all 0.2s ease' as const,
      _hover: {
        borderColor: '$primary500' as const,
        bg: '$primary50' as const,
      },
    },
  },
  orgProfileCancelButtonText: {
    color: '$textSecondary',
    fontSize: '$sm' as const,
    fontWeight: '$medium' as const,
    $web: {
      transition: 'color 0.2s ease' as const,
    },
  },
  orgProfileCancelButtonIcon: {
    color: '$textSecondary',
    size: 16,
    $web: {
      transition: 'color 0.2s ease' as const,
    },
  },
  orgProfileSaveButton: {
    bg: '$success600',
    borderRadius: 10,
    px: '$4',
    py: '$2',
    height: 38,
  },
  orgProfileSaveButtonText: {
    color: '$white',
    fontSize: '$sm' as const,
    fontWeight: '$medium' as const,
  },
  orgProfileSaveButtonIcon: {
    color: '$white',
    size: 16,
  },

  // Section Card Styles (Borders, Spacing, Padding, Background, Elevation)
  orgProfileSectionContainer: {
    bg: '$white',
    borderRadius: '$xl',
    borderWidth: 1,
    borderColor: '$borderLight200',
    p: '$6',
    shadowColor: '$backgroundDark900',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    mb: '$4',
  },
  orgProfileSectionHeaderContainer: {
    space: 'xs' as const,
    mb: '$4',
  },
  orgProfileSectionTitle: {
    ...TYPOGRAPHY.h3,
    color: '$textPrimary', // Changed to black as requested
    fontWeight: '$bold',
    fontSize: '$md',
  },
  orgProfileSectionIcon: {
    size: 20,
    color: '$primary500',
  },

  // Field Label & Value Styles
  orgProfileFieldLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: '$textForeground',
    fontWeight: '$medium',
    fontSize: '$sm',
  },
  orgProfileFieldSubTitle: {
    ...TYPOGRAPHY.caption,
    color: '$textMutedForeground',
    fontSize: '$xs',
  },
  orgProfileFieldValue: {
    ...TYPOGRAPHY.bodySmall,
    color: '$textForeground',
    fontSize: '$sm',
    fontWeight: '$normal',
  },
  orgProfileRequiredAsterisk: {
    color: '$red500',
    fontSize: '$sm',
    fontWeight: '$bold',
  },

  // Checkbox Styles (View & Edit mode)
  orgProfileCheckboxContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: '$3', // Increased gap for spacing
    width: '100%',
  },
  orgProfileCheckboxItem: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 180,
    maxWidth: '100%',
  },
  orgProfileCheckboxCard: {
    bg: '$white',
    borderColor: '$borderLight100',
    borderWidth: 1,
    borderRadius: 10,
    px: '$3', // Slightly reduced inner padding
    py: '$2', // Slightly reduced inner padding
    minHeight: 40,
    justifyContent: 'center' as const,
  },
  orgProfileCheckboxCheckedCard: {
    bg: '$primary50',
    borderColor: '$primary500',
    borderWidth: 1,
    borderRadius: 10,
    px: '$3', // Slightly reduced inner padding
    py: '$2', // Slightly reduced inner padding
    minHeight: 40,
    justifyContent: 'center' as const,
  },
  orgProfileCheckboxBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '$borderLight200',
    bg: '$white',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  orgProfileCheckboxCheckedBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 0,
    borderColor: 'transparent',
    bg: '$primary500',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  orgProfileCheckboxText: {
    fontSize: '$xs',
    color: '$textPrimary', // Darker theme color
    fontWeight: '$medium',
  },
  orgProfileCheckboxCheckedText: {
    fontSize: '$xs',
    color: '$primary700', // Darker primary theme color for checked text
    fontWeight: '$semibold',
  },

  // Specific Training Areas & Asset Types container styles
  orgProfileSpecificTrainingAreasContainer: {
    borderWidth: 1,
    borderColor: '$borderLight100', // grey border matching the dark grey title
    bg: '$bgSidebar',
    borderRadius: '$lg',
    p: '$4',
    mt: '$3',
    mb: '$3',
  },
  orgProfileAssetTypesContainer: {
    borderWidth: 1,
    borderColor: '$borderLight100', // grey border matching the dark grey title
    bg: '$gray50',
    borderRadius: '$lg',
    p: '$4',
    mt: '$3',
    mb: '$3',
  },
  orgProfileSpecificTrainingAreasTitle: {
    fontSize: '$sm',
    color: '$blue800', // slightly darker blue
    fontWeight: '$semibold',
  },
  orgProfileAssetTypesTitle: {
    fontSize: '$sm',
    color: '$success700', // theme color (theme token)
    fontWeight: '$semibold',
  },

  // Input & Select Styles (Edit mode)
  orgProfileInput: {
    bg: '$white',
    borderColor: '$borderLight200',
    borderWidth: 1,
    borderRadius: '$md',
    height: 40,
    px: '$3',
  },
  orgProfileSelect: {
    bg: '$white',
    borderColor: '$borderLight200',
    borderWidth: 1,
    borderRadius: '$md',
    height: 40,
  },

  // Spacing & Padding Tokens
  orgProfileSpacing: {
    sectionSpace: 'lg',
    rowSpace: 'md',
    fieldSpace: 'xs',
    padding: '$6',
  },
};

export default orgProfileStyles;