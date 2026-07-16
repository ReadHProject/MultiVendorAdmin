import { baseApi } from "../baseApi";

const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query({
      query: ({ page = 1, pageSize = 20, q, warehouseId } = {}) => ({
        url: "/inventory",
        params: { page, pageSize, q, warehouseId },
      }),
      providesTags: ["Inventory"],
    }),
    adjustInventory: builder.mutation({
      query: (body) => ({ url: "/inventory/adjust", method: "POST", body }),
      invalidatesTags: ["Inventory"],
    }),
    getMovements: builder.query({
      query: (params) => ({ url: "/inventory/movements", params }),
      providesTags: ["Inventory"],
    }),
    getAlerts: builder.query({
      query: () => "/inventory/alerts",
      providesTags: ["Inventory"],
    }),
  }),
});

const {
  useGetInventoryQuery,
  useAdjustInventoryMutation,
  useGetMovementsQuery,
  useGetAlertsQuery,
} = inventoryApi;

export default inventoryApi;
export {
  useGetInventoryQuery,
  useAdjustInventoryMutation,
  useGetMovementsQuery,
  useGetAlertsQuery,
};
