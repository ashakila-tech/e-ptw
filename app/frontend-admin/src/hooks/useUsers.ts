import { useEffect, useState, useCallback } from 'react';
import { fetchUsers, fetchUserGroups, fetchGroupsOptions, fetchCompanyById } from '../../../shared/services/api';

export type User = {
  id: number;
  company_id: number;
  name: string;
  email?: string | null;
  user_type?: number | null;
};

export type EnrichedUser = User & { 
  groups: string[]; 
  company_name?: string | null;
  user_group_objects?: { id: number; group_id: number; group_name: string }[];
};

export type GroupOption = { value: number; label: string };
export type UserGroup = { id: number; user_id: number; group_id: number };

export function useUsers(companyId?: number) {
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        // Fetch users, user-groups, and group options in parallel
        const [rawUsers, userGroups, groups] = await Promise.all([
          fetchUsers(),
          fetchUserGroups(),
          fetchGroupsOptions({ page_size: 100 }),
        ]);

        if (!mounted || !rawUsers) return;

        // Build group id -> label map
        const groupMap = new Map<number, string>();
        (groups || []).forEach((g: GroupOption) => {
          if (g?.value && g?.label) groupMap.set(Number(g.value), String(g.label));
        });

        // Build map user_id -> [{ id, group_id, group_name }]
        const userGroupsMap = new Map<number, { id: number; group_id: number; group_name: string }[]>();
        (userGroups || []).forEach((ug: UserGroup) => {
          if (!ug?.user_id) return;
          const arr = userGroupsMap.get(ug.user_id) || [];
          const name = groupMap.get(Number(ug.group_id)) || `Group ${ug.group_id}`;
          arr.push({ id: ug.id, group_id: ug.group_id, group_name: name });
          userGroupsMap.set(ug.user_id, arr);
        });

        // Fetch company names for unique company IDs
        const companyIds: number[] = Array.from(
          new Set(
            rawUsers
              .map((u: User) => u.company_id)
              .filter((id: number): id is number => typeof id === 'number')
          )
        );

        const companyResults = await Promise.all(
          companyIds.map(id => fetchCompanyById(id).catch(() => null))
        );

        const companyMap = new Map<number, string>();
        companyResults.forEach((c, idx) => {
          if (c && c.id && typeof c.name === 'string') {
            companyMap.set(companyIds[idx], c.name);
          }
        });

        // Enrich users
        const enriched: EnrichedUser[] = rawUsers.map((u: User) => {
          const uGroups = userGroupsMap.get(u.id) || [];
          return {
            id: u.id,
            company_id: u.company_id,
            company_name: companyMap.get(u.company_id) || null,
            name: u.name,
            email: u.email,
            user_type: u.user_type,
            groups: uGroups.map((g: { id: number; group_id: number; group_name: string }) => g.group_name),
            user_group_objects: uGroups,
          };
        });

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