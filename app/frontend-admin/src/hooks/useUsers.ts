import { useEffect, useState, useCallback } from 'react';
import { fetchUsers, fetchUserGroups, fetchGroupsOptions, fetchCompanyById } from '../../../shared/services/api';

export type User = {
  id: number;
  company_id: number;
  name: string;
  email?: string | null;
  user_type?: number | null;
};

export type EnrichedUser = User & { groups: string[]; company_name?: string | null };

export function useUsers(companyId?: number) {
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        // Fetch users, user-groups and group options in parallel
        const [rawUsers, userGroups, groups] = await Promise.all([
          fetchUsers(),
          fetchUserGroups(),
          fetchGroupsOptions({ page_size: 100 }),
        ]);

        if (!mounted) return;

        // Build group id -> label map
        const groupMap = new Map<number, string>();
        (groups || []).forEach((g: any) => { if (g?.value) groupMap.set(g.value, g.label); });

        // Build map user_id -> [group names]
        const userGroupsMap = new Map<number, string[]>();
        (userGroups || []).forEach((ug: any) => {
          if (!ug?.user_id) return;
          const arr = userGroupsMap.get(ug.user_id) || [];
          const name = groupMap.get(ug.group_id) || `Group ${ug.group_id}`;
          arr.push(name);
          userGroupsMap.set(ug.user_id, arr);
        });

        // Fetch company names for unique company ids found in users
        const companyIds = Array.from(new Set(((rawUsers || []).map((r: any) => r?.company_id).filter(Boolean))));
        const companyResults = await Promise.all(
          companyIds.map((id: number) => fetchCompanyById(id).catch(() => null))
        );
        const companyMap = new Map<number, string>();
        companyResults.forEach((c: any, idx: number) => { if (c && c.id) companyMap.set(companyIds[idx], c.name); });

        const enriched = (rawUsers || []).map((u: any) => ({
          id: u.id,
          company_id: u.company_id,
          company_name: companyMap.get(u.company_id) || null,
          name: u.name,
          email: u.email,
          user_type: u.user_type,
          groups: userGroupsMap.get(u.id) || [],
        }));

        setUsers(enriched);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || String(err) || 'Failed to load users');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [companyId, refreshKey]);

  return { users, loading, error, refetch };
}
