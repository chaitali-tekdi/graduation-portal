import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Container,
  HStack,
  LucideIcon,
  Spinner,
  Text,
  VStack,
} from '@ui';
import { useAlert } from '@components/ui';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import SchemaFormRenderer, { validateSchema } from '@components/SchemaFormRenderer';
import { ORG_PROFILE_SCHEMA } from '@constants/ORG_PROFILE_SCHEMA';
import { getUserProfile } from '../../../../services/authenticationService';
import { updateOrgAdminUser, getProvincesList, getAllSites } from '../../../../services/usersService';
import { useAuth } from '@contexts/AuthContext';
import { useLanguage } from '@contexts/LanguageContext';
import SPTitleHeader from '@components/Header/SPTitleHeader';
import styles from '../styles';

// ─── Section Card ─────────────────────────────────────────────────────────────

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    bg="$white"
    borderRadius="$lg"
    borderWidth={1}
    borderColor="$borderLight200"
    p="$4"
    shadowColor="$black"
    shadowOpacity={0.05}
    shadowRadius={4}
    shadowOffset={{ width: 0, height: 1 }}
    w="100%"
  >
    {children}
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

// Helper: get static options for a field in the schema
const getStaticOptions = (fieldName: string) => {
  for (const section of ORG_PROFILE_SCHEMA) {
    for (const row of section.rows) {
      for (const field of row.fields) {
        if (field.name === fieldName) {
          return field.options;
        }
      }
    }
  }
  return undefined;
};

// Helper: map individual checkbox group and other values from the API
const mapFieldToFormValues = (fieldName: string, val: any): string => {
  const staticOptions = getStaticOptions(fieldName);
  if (!val) return '';
  const rawList = Array.isArray(val)
    ? val
    : typeof val === 'string'
    ? val.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [val];

  const valuesList = rawList.map((item: any) => {
    if (!item) return '';
    let itemVal = '';
    if (typeof item === 'object') {
      itemVal = item.value || item._id || item.id || item.name || '';
    } else {
      itemVal = String(item);
    }

    if (staticOptions && staticOptions.length > 0) {
      const match = staticOptions.find(
        (opt: any) =>
          opt.value.toLowerCase() === itemVal.toLowerCase() ||
          opt.label.toLowerCase() === itemVal.toLowerCase() ||
          opt.value.replace(/_/g, ' ').toLowerCase() === itemVal.toLowerCase() ||
          opt.value.toLowerCase() === itemVal.replace(/[\s\/]/g, '_').toLowerCase()
      );
      if (match) return match.value;
    }
    return itemVal;
  });

  return valuesList.filter(Boolean).join(', ');
};

// Helper: map raw user profile response to form values
const mapProfileToValues = (profile: any): Record<string, string> => {
  const org = profile?.organizations?.[0] ?? {};
  const meta = org?.metaInformation ?? profile?.metaInformation ?? {};

  return {
    supportProviderName: org?.name || profile?.name || meta?.supportProviderName || '',
    providerType: mapFieldToFormValues('providerType', meta?.providerType || org?.type),
    contactPersonName: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone
      ? `${profile.phone_code ? '+' + profile.phone_code + ' ' : ''}${profile.phone}`
      : '',
    province: mapFieldToFormValues('province', meta?.province || meta?.provinces || profile?.provinces),
    siteCoverage: mapFieldToFormValues('siteCoverage', meta?.siteCoverage || meta?.sites || profile?.sites),
    supportCategories: mapFieldToFormValues('supportCategories', meta?.supportCategories),
    specificTrainingAreas: mapFieldToFormValues('specificTrainingAreas', meta?.specificTrainingAreas),
    assetTypes: mapFieldToFormValues('assetTypes', meta?.assetTypes),
    agreementMou: meta?.agreementMou || '',
    orgCredentials: meta?.orgCredentials || '',
  };
};

// Helper: map edited form values back to API payload
const mapValuesToPayload = (values: Record<string, string>): Record<string, any> => ({
  name: values.contactPersonName?.trim(),
  email: values.email?.trim(),
  ...(values.phone ? { phone: values.phone?.trim() } : {}),
  metaInformation: {
    providerType: values.providerType?.trim(),
    supportProviderName: values.supportProviderName?.trim(),
    province: values.province?.trim(),
    siteCoverage: values.siteCoverage?.trim(),
    supportCategories: values.supportCategories?.trim(),
    specificTrainingAreas: values.specificTrainingAreas?.trim(),
    assetTypes: values.assetTypes?.trim(),
  },
});

const OrgProfileView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedValues, setSavedValues] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [optionsMap, setOptionsMap] = useState<Record<string, { value: string; label: string }[]>>({});

  // ── Translation wrapper ──────────────────────────────────────────────────
  // SchemaFormRenderer hardcodes the 'admin.users.createUser.' prefix on every key.
  // This wrapper strips that prefix and looks up 'supportProvider.profile.*' instead,
  // falling back to the schema's inline fallback string.
  const profileT = useCallback(
    (key: string, fallback?: string): string => {
      const PREFIX = 'admin.users.createUser.';
      if (key.startsWith(PREFIX)) {
        return t(`supportProvider.profile.${key.slice(PREFIX.length)}`, fallback ?? '');
      }
      return t(key, fallback ?? '');
    },
    [t],
  );

  // ── Fetch profile on mount ───────────────────────────────────────────────
  // NOTE: Only `user?.id` is in the dependency array. `showAlert` and `t` are
  // intentionally excluded — they can be recreated on each render in some
  // context implementations, which would trigger an infinite loading loop.
  // Fetch optionsMap (provinces and sites) and profile on mount
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [provinces, sites, profile] = await Promise.all([
          getProvincesList(),
          getAllSites(),
          getUserProfile(user?.id ?? null),
        ]);

        if (!active) return;

        setOptionsMap({
          provinces: provinces.map((p: any) => ({
            value: p._id,
            label: p.metaInformation?.name || p.name || '',
          })),
          sites: sites.map((s: any) => ({
            value: s._id,
            label: s.metaInformation?.name || s.name || '',
          })),
        });

        const mapped = mapProfileToValues(profile);
        setSavedValues(mapped);
        setValues(mapped);
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Field change ─────────────────────────────────────────────────────────
  const handleFieldChange = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  // ── Edit / Cancel ─────────────────────────────────────────────────────────
  const handleEditPress = useCallback(() => {
    setValues(savedValues);
    setErrors({});
    setMode('edit');
  }, [savedValues]);

  const handleCancel = useCallback(() => {
    setValues(savedValues);
    setErrors({});
    setMode('preview');
  }, [savedValues]);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const validationErrs = validateSchema(ORG_PROFILE_SCHEMA, values, {});
    if (Object.keys(validationErrs).length > 0) {
      setErrors(validationErrs);
      return;
    }

    setIsSaving(true);
    try {
      const payload = mapValuesToPayload(values);
      await updateOrgAdminUser(user?.id ?? '', payload);
      setSavedValues(values);
      setMode('preview');
      showAlert('success', t('supportProvider.profile.saveSuccess', 'Profile updated successfully.'), {
        placement: 'bottom',
      });
    } catch (error: any) {
      const msg =
        error?.data?.message ||
        error?.message ||
        t('supportProvider.profile.saveError', 'Failed to update profile. Please try again.');
      showAlert('error', msg, { placement: 'bottom' });
    } finally {
      setIsSaving(false);
    }
  }, [values, user?.id, showAlert, t]);

  // ── Header right section ──────────────────────────────────────────────────
  const headerRightSection = useMemo(() => {
    if (mode === 'edit') {
      return (
        <HStack space="md" alignItems="center">
          <Button variant={'outline' as any} onPress={handleCancel} isDisabled={isSaving}>
            <ButtonIcon as={LucideIcon} name="X" />
            <ButtonText>{t('supportProvider.profile.cancel', 'Cancel')}</ButtonText>
          </Button>
          <Button
            variant="solid"
            bg="$success600"
            $hover-bg="$success700"
            $hover={{ bg: '$success700' }}
            onPress={handleSave}
            isDisabled={isSaving}
          >
            <ButtonIcon as={LucideIcon} name="Save" />
            <ButtonText color="$white">
              {isSaving
                ? t('common.saving', 'Saving...')
                : t('supportProvider.profile.saveChanges', 'Save Changes')}
            </ButtonText>
          </Button>
        </HStack>
      );
    }
    return (
      <Button onPress={handleEditPress}>
        <ButtonIcon as={LucideIcon} name="SquarePen" />
        <ButtonText>{t('supportProvider.profile.editProfile', 'Edit Profile')}</ButtonText>
      </Button>
    );
  }, [mode, isSaving, handleCancel, handleSave, handleEditPress, t]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <VStack flex={1}>
      <SPTitleHeader
        title={t('supportProvider.profile.title', 'Organisation Profile')}
        subTitle={t(
          'supportProvider.profile.subtitle',
          "Manage your organisation's information and support coverage",
        )}
        rightSection={headerRightSection}
      />

      <Container {...styles.container}>
        {isLoading ? (
          <Box alignItems="center" justifyContent="center" py="$10">
            <Spinner size="large" color="$primary500" />
          </Box>
        ) : (
          <VStack space="md" w="100%">
            {/*
             * Flow: ORG_PROFILE_SCHEMA → SchemaFormRenderer → rendered fields
             *
             * Each section from the schema gets:
             *  1. A reference-matched card header (icon + bold title)
             *  2. A divider
             *  3. SchemaFormRenderer with hideSectionHeaders=true, so only the
             *     field rows are rendered — no duplicate header from the renderer.
             */}
            {ORG_PROFILE_SCHEMA.map(section => (
              <SectionCard key={section.id}>
                {/* Section header — styled to match reference design */}
                <HStack space="sm" alignItems="center" mb="$3" pb="$3" borderBottomWidth={1} borderBottomColor="$borderLight200">
                  <Box bg="$primary50" borderRadius="$md" p="$1">
                    <LucideIcon name={section.icon as any} size={16} color="$primary700" />
                  </Box>
                  <Text
                    {...TYPOGRAPHY.bodySmall}
                    fontWeight="$semibold"
                    color="$textForeground"
                  >
                    {profileT(
                      `admin.users.createUser.${section.title.key}`,
                      section.title.fallback,
                    )}
                  </Text>
                </HStack>

                {/* Field rows — fully schema-driven, section header suppressed */}
                <SchemaFormRenderer
                  schema={[section]}
                  values={values}
                  errors={errors}
                  onFieldChange={handleFieldChange}
                  optionsMap={optionsMap}
                  mode={mode}
                  disabled={isSaving}
                  hideSectionHeaders={true}
                  t={profileT}
                />
              </SectionCard>
            ))}
          </VStack>
        )}
      </Container>
    </VStack>
  );
};

export default OrgProfileView;
