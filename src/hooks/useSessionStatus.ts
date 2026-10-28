import { useMemo } from 'react';
import { SESSION_STATUS, SESSION_STATUS_LABEL } from '@constants/SUPPORT_PROVIDER_CARDS';

interface SessionStatusItem {
  status?: string;
  start_date?: string | number;
  end_date?: string | number;
}

const toMs = (value: string | number): number =>
  typeof value === 'number' || !isNaN(Number(value))
    ? Number(value) * 1000
    : new Date(value).getTime();

// Normalizes a raw backend status (DRAFT / PUBLISHED / LIVE / COMPLETED / CANCELLED)
// plus start/end dates into the human-facing status label shown on session/service cards.
export const deriveStatusLabel = (item: SessionStatusItem): string => {
  const rawStatus = item?.status || '';
  const thisStatus = String(rawStatus).toUpperCase();

  if (thisStatus === SESSION_STATUS.CANCELLED) {
    return SESSION_STATUS_LABEL.CANCELLED;
  }
  if (thisStatus === SESSION_STATUS.DRAFT) {
    return SESSION_STATUS_LABEL.DRAFT;
  }
  if (thisStatus === SESSION_STATUS.COMPLETED) {
    return SESSION_STATUS_LABEL.COMPLETED;
  }

  if (item?.start_date) {
    const startMs = toMs(item.start_date);
    const endMs = item.end_date !== undefined ? toMs(item.end_date) : undefined;
    const nowMs = Date.now();

    if (endMs !== undefined && nowMs > endMs) {
      return SESSION_STATUS_LABEL.COMPLETED;
    }
    if (nowMs < startMs) {
      return SESSION_STATUS_LABEL.UPCOMING;
    }
    return SESSION_STATUS_LABEL.IN_PROGRESS;
  }

  if (thisStatus === SESSION_STATUS.LIVE) {
    return SESSION_STATUS_LABEL.IN_PROGRESS;
  }
  if (thisStatus === SESSION_STATUS.PUBLISHED) {
    return SESSION_STATUS_LABEL.UPCOMING;
  }

  return rawStatus || SESSION_STATUS_LABEL.UPCOMING;
};

export function useSessionStatus(item: SessionStatusItem, statusOverride?: string | null) {
  return useMemo(() => {
    const statusTag = statusOverride || deriveStatusLabel(item);

    return {
      statusTag,
      isDraft: statusTag === SESSION_STATUS_LABEL.DRAFT,
      isUpcoming: statusTag === SESSION_STATUS_LABEL.UPCOMING,
      isInProgress: statusTag === SESSION_STATUS_LABEL.IN_PROGRESS,
      isCompleted: statusTag === SESSION_STATUS_LABEL.COMPLETED,
      isCancelled: statusTag === SESSION_STATUS_LABEL.CANCELLED,
    };
  }, [item?.status, item?.start_date, item?.end_date, statusOverride]);
}

interface RequesterInfoItem {
  mentor_name?: string;
  provider_name?: string | null;
  organization?: string | { name?: string };
  requested_by?: { name?: string | null; organization?: string | null };
  meta?: {
    mentor_name?: string;
    provider_name?: string | null;
    organization?: string | { name?: string };
  };
}

// Only offerings created by accepting an LC request have a requester (from the session list API);
// offerings the SP created themselves show no "Requested by"
export function useRequesterInfo(item: RequesterInfoItem) {
  return useMemo(() => {
    const requesterName = item?.requested_by?.name || undefined;
    const requesterOrgName = item?.requested_by?.organization || undefined;

    return { requesterName, requesterOrgName };
  }, [item?.requested_by?.name, item?.requested_by?.organization]);
}

export function useMentorInfo(item: RequesterInfoItem) {
  return useMemo(() => {
    const mentorName = item?.mentor_name || item?.meta?.mentor_name;
    const org = item?.organization || item?.meta?.organization;
    const mentorOrgName = typeof org === 'object' ? org?.name : org;
    // Show the Support Provider's name; fall back to the mentor's own name when it is not set
    const providerName = item?.provider_name || item?.meta?.provider_name || mentorName;

    return { mentorName, mentorOrgName, providerName };
  }, [item?.mentor_name, item?.meta?.mentor_name, item?.organization, item?.meta?.organization, item?.provider_name, item?.meta?.provider_name]);
}