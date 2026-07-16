import { baseApi } from "../baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    getMe: builder.query({
      query: () => "/auth/me",
    }),
    refreshToken: builder.mutation({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({ url: "/auth/forgot-password", method: "POST", body: data }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({ url: "/auth/reset-password", method: "POST", body: data }),
    }),
  }),
});

const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;

export default authApi;
export {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
};
