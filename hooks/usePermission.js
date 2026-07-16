"use client";

import { useCallback } from "react";
import { useAuth } from "./useAuth";

function usePermission() {
  const { hasPermission, hasRole } = useAuth();

  const can = useCallback(
    (permission) => hasPermission(permission),
    [hasPermission]
  );

  const cannot = useCallback(
    (permission) => !hasPermission(permission),
    [hasPermission]
  );

  const hasAnyRole = useCallback(
    (roles) => hasRole(roles),
    [hasRole]
  );

  return { can, cannot, hasAnyRole };
}

export { usePermission };
