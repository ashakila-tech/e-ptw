# app/utils/roles.py

"""
Central place to manage role/group-based permissions.
Later, this can evolve into a DB-driven or configuration-based role manager.
"""

# Group IDs that count as approvers
APPROVER_GROUP_IDS = {5, 6, 7}  # Supervisor, Safety Officer, Site Manager

# Optional redundancy: names that count as approvers
# APPROVER_GROUP_NAMES = {"Supervisor", "Safety Officer", "Site Manager"}


def is_user_approver(group_ids: list[int], group_names: list[str]) -> bool:
    """
    Determine if a user should be considered an approver based on their group IDs or names.
    """
    return any(
        gid in APPROVER_GROUP_IDS
        for gid, gname in zip(group_ids, group_names)
    )

def user_has_role(group_names: list[str], target_roles: set[str]) -> bool:
    return any(role in target_roles for role in group_names)