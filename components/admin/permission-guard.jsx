"use client";

import { useAuth } from "../../hooks/useAuth";

function PermissionGuard({ permission, children, fallback = null }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) return fallback;
  return children;
}

function RoleGuard({ roles, children, fallback = null }) {
  const { hasRole } = useAuth();
  if (!hasRole(roles)) return fallback;
  return children;
}

export { PermissionGuard, RoleGuard };
