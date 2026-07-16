import { baseApi } from "../baseApi";

const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ page = 1, pageSize = 20, q, status, role } = {}) => ({
        url: "/users",
        params: { page, pageSize, q, status, role },
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [...result.data.items.map(({ id }) => ({ type: "User", id })), "User"]
          : ["User"],
    }),
    getUser: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    createUser: builder.mutation({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }, "User"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
    assignRole: builder.mutation({
      query: ({ userId, role }) => ({ url: `/users/${userId}/roles`, method: "POST", body: { role } }),
      invalidatesTags: (result, error, { userId }) => [{ type: "User", id: userId }],
    }),
    removeRole: builder.mutation({
      query: ({ userId, roleId }) => ({ url: `/users/${userId}/roles/${roleId}`, method: "DELETE" }),
      invalidatesTags: (result, error, { userId }) => [{ type: "User", id: userId }],
    }),
  }),
});

const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useAssignRoleMutation,
  useRemoveRoleMutation,
} = usersApi;

export default usersApi;
export {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useAssignRoleMutation,
  useRemoveRoleMutation,
};
