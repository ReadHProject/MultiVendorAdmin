import { baseApi } from "../baseApi";

const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => "/roles",
      providesTags: ["Role"],
    }),
    getRole: builder.query({
      query: (id) => `/roles/${id}`,
      providesTags: (result, error, id) => [{ type: "Role", id }],
    }),
    getPermissions: builder.query({
      query: () => "/roles/permissions",
      providesTags: ["Permission"],
    }),
    createRole: builder.mutation({
      query: (body) => ({ url: "/roles", method: "POST", body }),
      invalidatesTags: ["Role"],
    }),
    updateRole: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/roles/${id}`, method: "PUT", body }),
      invalidatesTags: ["Role"],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: ["Role"],
    }),
  }),
});

const {
  useGetRolesQuery,
  useGetRoleQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;

export default rolesApi;
export {
  useGetRolesQuery,
  useGetRoleQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
};
