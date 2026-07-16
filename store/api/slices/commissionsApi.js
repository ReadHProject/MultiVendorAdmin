import { baseApi } from "../baseApi";

const commissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommissions: builder.query({
      query: (params) => ({ url: "/commissions", params }),
      providesTags: ["Commission"],
    }),
    calculateCommissions: builder.mutation({
      query: () => ({ url: "/commissions/calculate", method: "POST" }),
      invalidatesTags: ["Commission"],
    }),
    approveCommission: builder.mutation({
      query: ({ ids }) => ({ url: "/commissions/approve", method: "PATCH", body: { ids } }),
      invalidatesTags: ["Commission"],
    }),
    payCommission: builder.mutation({
      query: (id) => ({ url: `/commissions/${id}/pay`, method: "PATCH" }),
      invalidatesTags: ["Commission"],
    }),
    getCommissionConfig: builder.query({
      query: () => "/commissions/config",
      providesTags: ["Commission"],
    }),
    updateCommissionConfig: builder.mutation({
      query: (body) => ({ url: "/commissions/config", method: "PUT", body }),
      invalidatesTags: ["Commission"],
    }),
  }),
});

const {
  useGetCommissionsQuery,
  useCalculateCommissionsMutation,
  useApproveCommissionMutation,
  usePayCommissionMutation,
  useGetCommissionConfigQuery,
  useUpdateCommissionConfigMutation,
} = commissionsApi;

export default commissionsApi;
export {
  useGetCommissionsQuery,
  useCalculateCommissionsMutation,
  useApproveCommissionMutation,
  usePayCommissionMutation,
  useGetCommissionConfigQuery,
  useUpdateCommissionConfigMutation,
};
