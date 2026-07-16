import { baseApi } from "../baseApi";

const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: (group) => group ? `/settings?group=${group}` : "/settings",
      providesTags: ["Setting"],
    }),
    getSetting: builder.query({
      query: (key) => `/settings/${key}`,
      providesTags: (result, error, key) => [{ type: "Setting", id: key }],
    }),
    updateSetting: builder.mutation({
      query: ({ key, value }) => ({ url: `/settings/${key}`, method: "PUT", body: { value } }),
      invalidatesTags: ["Setting"],
    }),
    getSettingGroups: builder.query({
      query: () => "/settings/groups",
      providesTags: ["Setting"],
    }),
  }),
});

const {
  useGetSettingsQuery,
  useGetSettingQuery,
  useUpdateSettingMutation,
  useGetSettingGroupsQuery,
} = settingsApi;

export default settingsApi;
export {
  useGetSettingsQuery,
  useGetSettingQuery,
  useUpdateSettingMutation,
  useGetSettingGroupsQuery,
};
