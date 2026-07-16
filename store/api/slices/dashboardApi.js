import { baseApi } from "../baseApi";

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => "/dashboard/summary",
      providesTags: ["Dashboard"],
    }),
    getDashboardCharts: builder.query({
      query: () => "/dashboard/charts",
      providesTags: ["Dashboard"],
    }),
  }),
});

const { useGetDashboardSummaryQuery, useGetDashboardChartsQuery } = dashboardApi;

export default dashboardApi;
export { useGetDashboardSummaryQuery, useGetDashboardChartsQuery };
