import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
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
import { updateUser, getProvincesList, getAllSites } from '../../../../services/usersService';
import { useAuth } from '@contexts/AuthContext';
import { useLanguage } from '@contexts/LanguageContext';
import profileStyles from '../styles';


// ─── Main Component ───────────────────────────────────────────────────────────

// Helper: map individual checkbox group and other values from the API
const mapFieldToFormValues = (val: any): string => {
  if (!val) return '';
  const rawList = Array.isArray(val)
    ? val
    : typeof val === 'string'
      ? val.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [val];

  const valuesList = rawList.map((item: any) => {
    if (!item) return '';
    if (typeof item === 'object') {
      return item.value || item._id || item.id || item.name || '';
    }
    return String(item);
  });

  return valuesList.filter(Boolean).join(', ');
};

// Helper: map raw user profile response to form values
const mapProfileToValues = (profile: any): Record<string, string> => {
  const org = profile?.organizations?.[0] ?? {};
  const meta = org?.metaInformation ?? profile?.metaInformation ?? {};

  return {
    supportProviderName: org?.name || profile?.name || meta?.supportProviderName || '',
    providerType: mapFieldToFormValues(meta?.providerType || org?.type),
    contactPersonName: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone
      ? `${profile.phone_code ? '+' + profile.phone_code + ' ' : ''}${profile.phone}`
      : '',
    province: mapFieldToFormValues(meta?.province || meta?.provinces || profile?.provinces),
    siteCoverage: mapFieldToFormValues(meta?.siteCoverage || meta?.sites || profile?.sites),
    supportCategories: mapFieldToFormValues(meta?.supportCategories),
    specificTrainingAreas: mapFieldToFormValues(meta?.specificTrainingAreas),
    assetTypes: mapFieldToFormValues(meta?.assetTypes),
    agreementMou: meta?.agreementMou || '',
    orgCredentials: meta?.orgCredentials || '',
    about: profile?.about || meta?.about || '',
  };
};

// Helper: map edited form values back to API payload
const mapValuesToPayload = (values: Record<string, string>): Record<string, any> => {
  let phoneNum = values.phone?.trim() || '';
  let phoneCode = '27'; // default dial code if not parsed from formatted string

  if (phoneNum) {
    // If phone starts with +, extract country code vs phone body
    if (phoneNum.startsWith('+')) {
      const parts = phoneNum.slice(1).split(' ');
      if (parts.length > 1) {
        phoneCode = parts[0];
        phoneNum = parts.slice(1).join('');
      } else {
        phoneNum = parts[0];
      }
    }
  }

  return {
    name: values.contactPersonName?.trim(),
    email: values.email?.trim(),
    about: values.about?.trim() || values.supportProviderName?.trim() || values.contactPersonName?.trim() || 'Support Provider Organization',
    ...(phoneNum
      ? {
          phone: phoneNum,
          phone_code: phoneCode,
        }
      : {}),
    metaInformation: {
      providerType: values.providerType?.trim(),
      supportProviderName: values.supportProviderName?.trim(),
      province: values.province?.trim(),
      siteCoverage: values.siteCoverage?.trim(),
      supportCategories: values.supportCategories?.trim(),
      specificTrainingAreas: values.specificTrainingAreas?.trim(),
      assetTypes: values.assetTypes?.trim(),
    },
  };
};

interface OrgProfileViewProps {
  mode?: 'preview' | 'edit';
  onModeChange?: (mode: 'preview' | 'edit') => void;
  renderHeaderActions?: (actions: {
    mode: 'preview' | 'edit';
    isSaving: boolean;
    handleEditPress: () => void;
    handleCancel: () => void;
    handleSave: () => void;
  }) => void;
}

const OrgProfileView: React.FC<OrgProfileViewProps> = ({
  mode: externalMode,
  onModeChange,
  renderHeaderActions,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [internalMode, setInternalMode] = useState<'preview' | 'edit'>('preview');
  const mode = externalMode ?? internalMode;

  const setMode = useCallback((newMode: 'preview' | 'edit') => {
    setInternalMode(newMode);
    onModeChange?.(newMode);
  }, [onModeChange]);

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
  }, [user?.id]);

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
      await updateUser(user?.id ?? '', payload);
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

  useEffect(() => {
    if (renderHeaderActions) {
      renderHeaderActions({
        mode,
        isSaving,
        handleEditPress,
        handleCancel,
        handleSave,
      });
    }
  }, [renderHeaderActions, mode, isSaving, handleEditPress, handleCancel, handleSave]);

  return (
    <VStack space="lg" w="100%">
      <SchemaFormRenderer
        schema={ORG_PROFILE_SCHEMA}
        values={values}
        errors={errors}
        onFieldChange={handleFieldChange}
        optionsMap={optionsMap}
        mode={mode}
        disabled={isSaving}
        t={profileT}
        orgProfileStyles={profileStyles}
        inputProps={profileStyles.orgProfileInput}
        selectProps={profileStyles.orgProfileSelect}
      />
    </VStack>
  );
};

export default OrgProfileView;