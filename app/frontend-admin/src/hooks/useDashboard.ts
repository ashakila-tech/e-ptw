import { useEffect, useState, useCallback } from 'react';
import {
    fetchUsers, fetchAllApplications, fetchGroupsOptions, fetchUserGroups
} from "../../../shared/services/api";

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState({
    groups: [] as any[],
    usersCount: 0,
    totalApplications: 0,
    statusCounts: {} as Record<string, number>,
    roleCounts: {} as Record<string, number>,
  });

  const refetch = useCallback(() => setRefreshKey(prev => prev + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const [users, apps, groups, userGroups] = await Promise.all([
          fetchUsers().catch(() => []),
          fetchAllApplications().catch(() => []),
          fetchGroupsOptions({ page_size: 200 }).catch(() => []),
          fetchUserGroups().catch(() => []),
        ]);

        // Build a map of status -> count (normalize to UPPERCASE)
        const statusCounts: Record<string, number> = {};
        (apps || []).forEach((a: any) => {
          const status = String(a?.status || '').toUpperCase();
          if (!status) return;
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        if (!mounted) return;

        // groups from /api/groups/options return { value, label }
        const mappedGroups = (groups || []).map((g: any) => ({ id: g?.value, name: g?.label }));

        // Identify placeholder groups by name (e.g. 'group-1') and excluded group ids
        const placeholderRegex = /^group(-|_)?\d+$/i;
        const excludedGroupIds = new Set<number>();
        (mappedGroups || []).forEach((g: any) => {
          const name = String(g?.name || '');
          if (placeholderRegex.test(name) || /placeholder/i.test(name)) excludedGroupIds.add(g.id);
        });

        // Filter out placeholder options and very short labels
        const visibleGroups = mappedGroups.filter((g: any) => {
          const name = String(g?.name || '');
          if (!name) return false;
          if (name.length < 3) return false;
          if (placeholderRegex.test(name)) return false;
          if (/placeholder/i.test(name)) return false;
          return true;
        });

        // Create a map of user_id -> user object for easy lookup
        const usersMap = new Map<number, any>();
        (users || []).forEach((u: any) => { if (u?.id) usersMap.set(u.id, u); });

        // Compute excluded user ids from excludedGroupIds (so users in placeholder groups are excluded entirely)
        const excludedUserIds = new Set<number>();
        (userGroups || []).forEach((ug: any) => {
          if (ug?.group_id && excludedGroupIds.has(ug.group_id) && ug?.user_id) excludedUserIds.add(ug.user_id);
        });

        // For each visible group, resolve members from userGroups and usersMap
        const groupEntries = (visibleGroups || []).map((g: any) => {
          const members = (userGroups || [])
            .filter((ug: any) => ug.group_id === g.id)
            .map((ug: any) => usersMap.get(ug.user_id))
            .filter((u: any) => u !== undefined);
          return [g.name, members] as [string, any[]];
        });

        const roleCounts: Record<string, number> = {};
        const groupMembersMap: Record<string, any[]> = {};
        groupEntries.forEach(([display, members]: [string, any[]]) => {
          const list = (members || []).filter((m: any) => m && !excludedUserIds.has(m.id));
          roleCounts[display] = list.length;
          groupMembersMap[display] = list;
        });

        // Build set of users that belong to any included (visible) group
        const usersWithIncludedGroup = new Set<number>();
        Object.values(groupMembersMap).forEach((arr: any[]) => {
          (arr || []).forEach((m: any) => { if (m?.id) usersWithIncludedGroup.add(m.id); });
        });

        // Users with no included groups (exclude those who are members of placeholder groups entirely)
        const noGroupUsers = (users || []).filter((u: any) => u?.id && !usersWithIncludedGroup.has(u.id) && !excludedUserIds.has(u.id));
        const noGroupCount = noGroupUsers.length;

        // Debug logs: list all user names for All (excluding placeholder group memberships), each group, and No-group
        // try {
        //   const allIncludedUserNames = (users || []).filter((u: any) => u?.id && !excludedUserIds.has(u.id)).map((u: any) => u?.name).filter(Boolean);
        //   console.log('[Dashboard] All (included) users:', allIncludedUserNames);
        //   console.log('[Dashboard] Group members (filtered):', Object.fromEntries(Object.entries(groupMembersMap).map(([k, v]) => [k, (v || []).map((m: any) => m?.name).filter(Boolean)])));
        //   console.log('[Dashboard] No group users:', (noGroupUsers || []).map((u: any) => u?.name).filter(Boolean));
        // } catch (e) {
        //   // swallow logging errors
        //   console.warn('[Dashboard] Failed to log user lists', e);
        // }

        // Add special entries: No groups and simplified All (sum of role counts)
        roleCounts['No groups / None'] = noGroupCount;
        const allCount = Object.values(roleCounts).reduce((sum, v) => sum + (v || 0), 0);
        roleCounts['All'] = allCount;

        setData({
          groups: visibleGroups,
          usersCount: (users || []).length,
          totalApplications: (apps || []).length,
          statusCounts,
          roleCounts,
        });
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [refreshKey]);

  return { loading, error, data, refetch };
} 