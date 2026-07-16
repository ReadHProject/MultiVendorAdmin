import { baseApi } from "../baseApi";

const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ page = 1, pageSize = 20, unreadOnly } = {}) => ({
        url: "/notifications",
        params: { page, pageSize, unreadOnly },
      }),
      providesTags: ["Notification"],
    }),
    getUnreadCount: builder.query({
      query: () => "/notifications/unread-count",
      providesTags: ["Notification"],
    }),
    markRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
    markAllRead: builder.mutation({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationsApi;

export default notificationsApi;
export {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
};
