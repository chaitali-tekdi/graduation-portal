export const createUserStyles = {
  scrollView: {
    p: '$4',
    bg: '$backgroundLight0',
  },
  content: {
    space: 'lg',
    w: '$full',
    maxWidth: 720,
    alignSelf: 'center',
  },
  header: { space: 'xs' },
  title: { fontSize: '$2xl', fontWeight: '$bold', color: '$textDark900' },
  subtitle: { fontSize: '$sm', color: '$textLight500' },
} as const;
