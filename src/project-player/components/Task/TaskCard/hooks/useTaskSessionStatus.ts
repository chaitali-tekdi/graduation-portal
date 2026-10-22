import { useEffect, useState } from 'react';
import { getMenteeSessions } from '../../../../../services/SupportOfferingsServices/supportOfferingsService';

export type TaskSessionStatus = 'attended' | 'scheduled' | 'missed' | null;

export interface MenteeSessionIds {
  attended: Set<string>;
  missed: Set<string>;
  upcoming: Set<string>;
  /** Raw upcoming (scheduled) session rows - idp_tasks, categories, mentor_id etc. */
  upcomingSessions: any[];
}

const SESSION_FETCH_LIMIT = 100;
const CACHE_TTL_MS = 326846234234238499;

// Every session-type task card on the screen needs the same two lists, so share one in-flight
// request per participant instead of firing two API calls per card.
const cache = new Map<string, { at: number; promise: Promise<MenteeSessionIds> }>();

const toIdSet = (res: { data: any[] }) =>
  new Set(res.data.map((s: any) => String(s?.id ?? s?.session_id ?? s?.sessionId)));

export const fetchMenteeSessionIds = (menteeId: string): Promise<MenteeSessionIds> => {
  const hit = cache.get(menteeId);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.promise;

  const promise = Promise.all([
    getMenteeSessions(menteeId, 'attended', 1, SESSION_FETCH_LIMIT),
    getMenteeSessions(menteeId, 'missed', 1, SESSION_FETCH_LIMIT),
    getMenteeSessions(menteeId, undefined, 1, SESSION_FETCH_LIMIT),
  ]).then(([attended, missed, upcoming]) => ({
    attended: toIdSet(attended),
    missed: toIdSet(missed),
    upcoming: toIdSet(upcoming),
    upcomingSessions: upcoming.data,
  }));

  cache.set(menteeId, { at: Date.now(), promise });
  promise.catch(() => cache.delete(menteeId));
  return promise;
};

/** Drop the cached lists so the next read refetches (call after scheduling/updating a session). */
export const invalidateTaskSessionStatus = (menteeId?: string) =>
  menteeId ? cache.delete(menteeId) : cache.clear();

/**
 * Resolves whether the session mapped to a task (task.metaInformation.sessionId) was attended, missed
 * or is still upcoming for the participant. Attended wins over missed, which wins over upcoming.
 */
export function useTaskSessionStatus(
  menteeId: string | undefined,
  sessionId: string | number | undefined,
  enabled: boolean,
): TaskSessionStatus {
  const [ids, setIds] = useState<MenteeSessionIds | null>(null);

  useEffect(() => {
    if (!enabled || !menteeId || sessionId === undefined || sessionId === null) return;
    let cancelled = false;
    fetchMenteeSessionIds(String(menteeId))
      .then((res) => !cancelled && setIds(res))
      .catch(() => !cancelled && setIds(null));
    return () => {
      cancelled = true;
    };
  }, [enabled, menteeId, sessionId]);

  if (!enabled || !ids || sessionId === undefined || sessionId === null) return null;
  const key = String(sessionId);
  if (__DEV__ && !ids.attended.has(key) && !ids.missed.has(key) && !ids.upcoming.has(key)) {
    console.log('[TaskSessionStatus] session not in any list', { menteeId, key, attended: [...ids.attended], missed: [...ids.missed], upcoming: [...ids.upcoming] });
  }
  if (ids.attended.has(key)) return 'attended';
  if (ids.missed.has(key)) return 'missed';
  if (ids.upcoming.has(key)) return 'scheduled';
  return null;
}

/**
 * True when the task's mapped session is still scheduled and the logged in user is its coach
 * (session.mentor_id === user id).
 */
export function useIsCoachSession(
  menteeId: string | undefined,
  sessionId: string | number | undefined,
  userId: string | number | undefined,
  enabled: boolean,
): boolean {
  const [ids, setIds] = useState<MenteeSessionIds | null>(null);

  useEffect(() => {
    if (!enabled || !menteeId || !userId || sessionId === undefined || sessionId === null) return;
    let cancelled = false;
    fetchMenteeSessionIds(String(menteeId))
      .then((res) => !cancelled && setIds(res))
      .catch(() => !cancelled && setIds(null));
    return () => {
      cancelled = true;
    };
  }, [enabled, menteeId, sessionId, userId]);

  if (!enabled || !ids || !userId || sessionId === undefined || sessionId === null) return false;
  const session = ids.upcomingSessions.find(
    (s: any) => String(s?.id ?? s?.session_id ?? s?.sessionId) === String(sessionId),
  );
  return !!session && String(session.mentor_id) === String(userId);
}
