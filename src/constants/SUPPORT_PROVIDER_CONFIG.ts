export interface MenuItemConfig {
  key: string;
  labelKey: string;
  label: string;
  iconName: string;
  route: string;
  active?: boolean;
}

export interface MetricConfig {
  key: string;
  category: string;
  badge?: string;
  categoryColor: string;
  categoryBg: string;
  iconName: string;
  label: string;
  value: string;
  unit: string;
  metaText: string;
  subText?: string;
  progressColor: string;
  progressPct: number;
}

export interface SupportCardConfig {
  key: string;
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  route: string;
  hoverBorderHex?: string;
}

export interface SupportProviderConfig {
  branding: {
    brandTitle: string;
    orgName: string;
    roleBadge: string;
    notificationCount: number;
    headerBgColor: string;
    themePrimaryColor: string;
    userAvatarBgGradient: string;
  };
  menuItems: MenuItemConfig[];
  dashboard: {
    titleKey: string;
    defaultTitle: string;
    subtitleKey: string;
    defaultSubtitle: string;
    createSupportButtonKey: string;
    defaultCreateSupportButton: string;
    createSupportIcon: string;
    impactOverview: {
      titleKey: string;
      defaultTitle: string;
      subtitleKey: string;
      defaultSubtitle: string;
      headerIcon: string;
      metrics: MetricConfig[];
    };
  };
  createSupport: {
    backKey: string;
    defaultBack: string;
    titleKey: string;
    defaultTitle: string;
    subtitleKey: string;
    defaultSubtitle: string;
    supportCards: SupportCardConfig[];
  };
  trainingSession: {
    backKey: string;
    defaultBack: string;
    titleKey: string;
    defaultTitle: string;
    subtitleKey: string;
    defaultSubtitle: string;
    forms: {
      sessionTitleKey: string;
      defaultSessionTitle: string;
      sessionTitlePlaceholderKey: string;
      defaultSessionTitlePlaceholder: string;
      categoryKey: string;
      defaultCategory: string;
      categoryPlaceholderKey: string;
      defaultCategoryPlaceholder: string;
      capacityKey: string;
      defaultCapacity: string;
      capacityPlaceholderKey: string;
      defaultCapacityPlaceholder: string;
      descriptionKey: string;
      defaultDescription: string;
      descriptionPlaceholderKey: string;
      defaultDescriptionPlaceholder: string;
      cancelKey: string;
      defaultCancel: string;
      createSessionKey: string;
      defaultCreateSession: string;
      successTitleKey: string;
      defaultSuccessTitle: string;
      successSubKey: string;
      defaultSuccessSub: string;
    };
  };
  generic: {
    returnToDashboardKey: string;
    defaultReturnToDashboard: string;
    genericDescKey: string;
    defaultGenericDesc: string;
  };
}

export const SUPPORT_PROVIDER_CONFIG: SupportProviderConfig = {
  branding: {
    brandTitle: 'GBL Partner Platform',
    orgName: '',
    roleBadge: 'GBL Partner',
    notificationCount: 3,
    headerBgColor: '#8B2842',
    themePrimaryColor: '#8B2842',
    userAvatarBgGradient:
      'linear-gradient(to right bottom, rgb(139, 40, 66) 0%, oklab(0.999994 0.0000455678 0.0000200868 / 0.9) 100%)',
  },
  menuItems: [
    {
      key: 'dashboard',
      labelKey: 'supportProvider.menu.dashboard',
      label: 'Dashboard',
      iconName: 'LayoutDashboard',
      route: 'dashboard',
      active: true,
    },
    {
      key: 'training_sessions',
      labelKey: 'supportProvider.menu.trainingSessions',
      label: 'Training Sessions',
      iconName: 'GraduationCap',
      route: 'create_training_session',
    },
    {
      key: 'support_offerings',
      labelKey: 'supportProvider.menu.supportOfferings',
      label: 'Support Offerings',
      iconName: 'Package',
      route: 'create_support',
    },
    {
      key: 'requests',
      labelKey: 'supportProvider.menu.requests',
      label: 'Requests',
      iconName: 'Bell',
      route: 'requests',
    },
    {
      key: 'materials_library',
      labelKey: 'supportProvider.menu.materialsLibrary',
      label: 'Materials Library',
      iconName: 'BookOpen',
      route: 'materials_library',
    },
    {
      key: 'profile',
      labelKey: 'supportProvider.menu.profile',
      label: 'Profile',
      iconName: 'User',
      route: 'profile',
    },
  ],
  dashboard: {
    titleKey: 'supportProvider.dashboard.title',
    defaultTitle: 'Dashboard',
    subtitleKey: 'supportProvider.dashboard.subtitle',
    defaultSubtitle: 'Overview of your impact and activities',
    createSupportButtonKey: 'supportProvider.dashboard.createSupport',
    defaultCreateSupportButton: 'Create Support for Participants',
    createSupportIcon: 'Plus',
    impactOverview: {
      titleKey: 'supportProvider.dashboard.impactOverview.title',
      defaultTitle: 'Support Impact Overview',
      subtitleKey: 'supportProvider.dashboard.impactOverview.subtitle',
      defaultSubtitle: 'Tracking participants across the support pipeline',
      headerIcon: 'TrendingUp',
      metrics: [
        {
          key: 'actually_needed',
          category: 'ACTUALLY NEEDED',
          categoryColor: '#EA580C',
          categoryBg: '#FFF7ED',
          iconName: 'User',
          label: 'Onboarded participants',
          value: '620',
          unit: 'participants',
          metaText: '31 sessions planned to serve them',
          progressColor: '#EA580C',
          progressPct: 100,
        },
        {
          key: 'committed',
          category: 'COMMITTED',
          categoryColor: '#3B82F6',
          categoryBg: '#EFF6FF',
          iconName: 'Calendar',
          label: 'Scheduled — yet to deliver',
          value: '133',
          unit: 'participants',
          metaText: '7 sessions scheduled',
          subText: '21% of needed',
          progressColor: '#3B82F6',
          progressPct: 21,
        },
        {
          key: 'delivered',
          category: 'DELIVERED',
          badge: '↑ 14%',
          categoryColor: '#16A34A',
          categoryBg: '#F0FDF4',
          iconName: 'CheckCircle',
          label: 'Completed sessions',
          value: '354',
          unit: 'participants',
          metaText: '19 sessions completed',
          subText: '57% of needed',
          progressColor: '#22C55E',
          progressPct: 57,
        },
      ],
    },
  },
  createSupport: {
    backKey: 'supportProvider.createSupport.back',
    defaultBack: 'Back to Dashboard',
    titleKey: 'supportProvider.createSupport.title',
    defaultTitle: 'Create New Support',
    subtitleKey: 'supportProvider.createSupport.subtitle',
    defaultSubtitle: 'Choose the type of support you want to create',
    supportCards: [
      {
        key: 'trainings_sessions',
        titleKey: 'supportProvider.cards.trainingsSessions.title',
        defaultTitle: 'Trainings & Sessions',
        descKey: 'supportProvider.cards.trainingsSessions.description',
        defaultDesc:
          'Structured learning sessions with a schedule, objectives, and participant capacity.',
        iconName: 'GraduationCap',
        iconBg: '#E0F2FE',
        iconColor: '#0284C7',
        route: 'create_training_session',
        hoverBorderHex: '#8B2842',
      },
      {
        key: 'additional_services',
        titleKey: 'supportProvider.cards.additionalServices.title',
        defaultTitle: 'Additional Services',
        descKey: 'supportProvider.cards.additionalServices.description',
        defaultDesc:
          'Advisory, legal, healthcare, or specialist services for participants.',
        iconName: 'Briefcase',
        iconBg: '#F3E8FF',
        iconColor: '#9333EA',
        route: 'additional_services',
        hoverBorderHex: '#8B2842',
      },
      {
        key: 'assets',
        titleKey: 'supportProvider.cards.assets.title',
        defaultTitle: 'Assets',
        descKey: 'supportProvider.cards.assets.description',
        defaultDesc:
          'Cash, in-kind, or voucher support for livelihood activities.',
        iconName: 'Package',
        iconBg: '#DCFCE7',
        iconColor: '#16A34A',
        route: 'assets',
        hoverBorderHex: '#8B2842',
      },
    ],
  },
  trainingSession: {
    backKey: 'supportProvider.trainingSession.back',
    defaultBack: 'Back to Create Support',
    titleKey: 'supportProvider.trainingSession.title',
    defaultTitle: 'Create Training Session',
    subtitleKey: 'supportProvider.trainingSession.subtitle',
    defaultSubtitle:
      'Set up a new structured learning session for participants',
    forms: {
      sessionTitleKey: 'supportProvider.forms.sessionTitle',
      defaultSessionTitle: 'Session Title *',
      sessionTitlePlaceholderKey: 'supportProvider.forms.sessionTitlePlaceholder',
      defaultSessionTitlePlaceholder: 'e.g. Financial Literacy & Business Management Workshop',
      categoryKey: 'supportProvider.forms.category',
      defaultCategory: 'Category / Sector *',
      categoryPlaceholderKey: 'supportProvider.forms.categoryPlaceholder',
      defaultCategoryPlaceholder: 'e.g. Livelihood & Skills',
      capacityKey: 'supportProvider.forms.capacity',
      defaultCapacity: 'Max Participant Capacity *',
      capacityPlaceholderKey: 'supportProvider.forms.capacityPlaceholder',
      defaultCapacityPlaceholder: 'e.g. 50',
      descriptionKey: 'supportProvider.forms.description',
      defaultDescription: 'Objectives & Description',
      descriptionPlaceholderKey: 'supportProvider.forms.descriptionPlaceholder',
      defaultDescriptionPlaceholder: 'Provide details about session goals, topics covered, and prerequisites...',
      cancelKey: 'supportProvider.forms.cancel',
      defaultCancel: 'Cancel',
      createSessionKey: 'supportProvider.forms.createSession',
      defaultCreateSession: 'Create Session',
      successTitleKey: 'supportProvider.forms.successTitle',
      defaultSuccessTitle: 'Training Session Created Successfully!',
      successSubKey: 'supportProvider.forms.successSub',
      defaultSuccessSub: 'Redirecting back to dashboard...',
    },
  },
  generic: {
    returnToDashboardKey: 'supportProvider.forms.returnToDashboard',
    defaultReturnToDashboard: 'Return to Dashboard',
    genericDescKey: 'supportProvider.forms.genericDesc',
    defaultGenericDesc: 'Manage and view your section configured for the Support Provider platform.',
  },
};

export default SUPPORT_PROVIDER_CONFIG;
