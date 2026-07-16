import { baseApi } from "../baseApi";

const customerTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerTypes: builder.query({
      query: () => "/customer-types",
      providesTags: ["CustomerType"],
    }),
    createCustomerType: builder.mutation({
      query: (body) => ({ url: "/customer-types", method: "POST", body }),
      invalidatesTags: ["CustomerType"],
    }),
    updateCustomerType: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/customer-types/${id}`, method: "PUT", body }),
      invalidatesTags: ["CustomerType"],
    }),
    deleteCustomerType: builder.mutation({
      query: (id) => ({ url: `/customer-types/${id}`, method: "DELETE" }),
      invalidatesTags: ["CustomerType"],
    }),
  }),
});

const {
  useGetCustomerTypesQuery,
  useCreateCustomerTypeMutation,
  useUpdateCustomerTypeMutation,
  useDeleteCustomerTypeMutation,
} = customerTypesApi;

export default customerTypesApi;
export {
  useGetCustomerTypesQuery,
  useCreateCustomerTypeMutation,
  useUpdateCustomerTypeMutation,
  useDeleteCustomerTypeMutation,
};