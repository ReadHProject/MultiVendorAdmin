import { baseApi } from "../baseApi";

const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query({
      query: (params) => ({ url: "/reports/sales", params }),
      providesTags: ["Report"],
    }),
    getInventoryReport: builder.query({
      query: (params) => ({ url: "/reports/inventory", params }),
      providesTags: ["Report"],
    }),
    getProfitLossReport: builder.query({
      query: (params) => ({ url: "/reports/profit-loss", params }),
      providesTags: ["Report"],
    }),
    getCommissionReport: builder.query({
      query: (params) => ({ url: "/reports/commission", params }),
      providesTags: ["Report"],
    }),
    getCustomerReport: builder.query({
      query: (params) => ({ url: "/reports/customer", params }),
      providesTags: ["Report"],
    }),
  }),
});

const {
  useGetSalesReportQuery,
  useGetInventoryReportQuery,
  useGetProfitLossReportQuery,
  useGetCommissionReportQuery,
  useGetCustomerReportQuery,
} = reportsApi;

export default reportsApi;
export {
  useGetSalesReportQuery,
  useGetInventoryReportQuery,
  useGetProfitLossReportQuery,
  useGetCommissionReportQuery,
  useGetCustomerReportQuery,
};
