import { apiFetch } from "./client";

export const fetchUsers = () => apiFetch("api/users/");

export const fetchUsersByGroupName = (groupName: string) =>
  apiFetch(`api/users/by-group-name/${groupName}`);

export const fetchUsersByGroupId = (groupId: number) =>
  apiFetch(`api/users/by-group-id/${groupId}`);

// Get all user groups
export const fetchUserGroups = () => apiFetch("api/user-groups/");