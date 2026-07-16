"use client";

import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import { setCredentials, logout as logoutAction } from "../store/slices/authSlice";
import { useLoginMutation, useLogoutMutation, useGetMeQuery } from "../store/api/slices/authApi";

function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, accessToken } = useSelector((state) => state.auth);
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = useCallback(
    async (credentials) => {
      const result = await loginMutation(credentials).unwrap();
      dispatch(setCredentials(result.data));
      return result.data;
    },
    [loginMutation, dispatch]
  );

  const logout = useCallback(async () => {
    await logoutMutation().unwrap().catch(() => {});
    dispatch(logoutAction());
  }, [logoutMutation, dispatch]);

  const hasPermission = useCallback(
    (code) => {
      if (!user) return false;
      if (user.permissions?.includes("*")) return true;
      return user.permissions?.includes(code) || false;
    },
    [user]
  );

  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
      return user.roles?.some((r) => roles.includes(r)) || false;
    },
    [user]
  );

  return { user, isAuthenticated, accessToken, login, logout, hasPermission, hasRole };
}

export { useAuth };
