export default {
  orgProfileMainWrapper: {
    flex: 1,
  },
  orgProfileContainer: {
    px: '$4',
    py: '$6',
    '$md-px': '$6',
  },
  orgProfileTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  orgProfileHeaderActionsGroup: {
    space: 'md' as const,
    alignItems: 'center' as const,
  },
  orgProfileCancelButton: {
    variant: 'outline' as const,
    borderColor: '$borderLight300' as const,
    bg: '$white' as const,
    borderRadius: 10 as const,
    h: 38,
    px: '$3' as const,
    space: 'xs' as const,
    sx: {
      ':hover': {
        bg: '$backgroundLight50',
        borderColor: '$borderLight300',
        // Text
        '_text': {
          color: '$primary500',
        },
        // Icon
        '_icon': {
          color: '$primary500',
        },
      },
    },
  },

  orgProfileCancelButtonText: {
    color: '$textLight700' as const,
    fontSize: '$sm' as const,
    fontWeight: '$medium' as const,
  },
  orgProfileSaveButton: {
    variant: 'solid' as const,
    bg: '$success600' as const,
    sx: {
      ':hover': {
        bg: '$success700',
      },
    },
  },
  orgProfileSectionCard: {
    bg: '$white' as const,
    borderRadius: '$lg' as const,
    borderWidth: 1,
    borderColor: '$borderLight100' as const,
    p: '$5' as const,
    shadowColor: '$black' as const,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    w: '100%' as const,
  },
  orgProfileSectionHeader: {
    space: 'md' as const,
    alignItems: 'center' as const,
    mb: '$4' as const,
  },
  orgProfileSectionIconBox: {
    p: '$2' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  orgProfileSectionIcon: {
    color: '$primary500' as const, // Primary purple theme color
    size: 22 as const, // Slightly larger than default
  },
  orgProfileSectionTitleText: {
    fontSize: 16, // Slightly smaller than default to match reference
    fontWeight: '600' as const,
    color: '$textDark900' as const,
    px: '$1' as const,
  },
  orgProfileFormInput: {
    bg: '$white' as const,
    borderColor: '$borderLight300' as const,
    borderWidth: 1,
    borderRadius: '$md' as const,
    h: 40,
    px: '$3' as const,
  },
  orgProfileFormSelect: {
    bg: '$white' as const,
    borderColor: '$borderLight300' as const,
    borderWidth: 1,
    borderRadius: '$md' as const,
    h: 40,
  },
  orgProfileLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#333333' as const,
  },
  orgProfileRequiredStar: {
    color: '#E53E3E' as const, // Reference red asterisk
    fontWeight: '700' as const,
  },
  orgProfileValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1A1A1A' as const,
  },
  orgProfileSubTitle: {
    fontSize: 12,
    color: '#718096' as const,
    mt: '$0.5' as const,
  },
  orgProfileCategorySectionHeader: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#2B6CB0' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    mb: '$2' as const,
    mt: '$3' as const,
  },
  orgProfileCategorySubGroupHeader: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#718096' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    mb: '$1.5' as const,
    mt: '$2' as const,
  },
  orgProfileCheckboxCardSelected: {
    bg: '#FDF2F4' as const, // Subtle maroon fill
    borderColor: '#9B2C2C' as const, // Dark maroon border
    borderWidth: 1,
    borderRadius: '$md' as const,
    px: '$3' as const,
    py: '$2' as const,
  },
  orgProfileCheckboxCardUnselected: {
    bg: '$white' as const,
    borderColor: '$borderLight200' as const,
    borderWidth: 1,
    borderRadius: '$md' as const,
    px: '$3' as const,
    py: '$2' as const,
  },
  orgProfileCheckboxTextSelected: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#9B2C2C' as const,
  },
  orgProfileCheckboxTextUnselected: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#4A5568' as const,
  },
  orgProfileBadgeSelected: {
    bg: '#EBF8FF' as const,
    px: '$3' as const,
    py: '$1' as const,
    borderRadius: '$full' as const,
    borderWidth: 1,
    borderColor: '#BEE3F8' as const,
  },
  orgProfileBadgeUnselected: {
    bg: '$backgroundLight100' as const,
    px: '$3' as const,
    py: '$1' as const,
    borderRadius: '$full' as const,
    borderWidth: 1,
    borderColor: '$borderLight200' as const,
  },
  orgProfileBadgeTextSelected: {
    fontSize: 12,
    color: '#2B6CB0' as const,
    fontWeight: '600' as const,
  },
  orgProfileBadgeTextUnselected: {
    fontSize: 12,
    color: '#4A5568' as const,
    fontWeight: '500' as const,
  },
  orgProfileMainContainer: {
    space: "lg" as const,
    borderRadius: '$lg' as const,
    borderWidth: 0,
    borderColor: 'transparent' as const,
    p: '$0' as const,
  },
};