import { baseApi } from "../baseApi";

const productTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductTypes: builder.query({
      query: () => "/product-types",
      providesTags: ["ProductType"],
    }),
    createProductType: builder.mutation({
      query: (body) => ({ url: "/product-types", method: "POST", body }),
      invalidatesTags: ["ProductType"],
    }),
    updateProductType: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/product-types/${id}`, method: "PUT", body }),
      invalidatesTags: ["ProductType"],
    }),
    deleteProductType: builder.mutation({
      query: (id) => ({ url: `/product-types/${id}`, method: "DELETE" }),
      invalidatesTags: ["ProductType"],
    }),
  }),
});

const {
  useGetProductTypesQuery,
  useCreateProductTypeMutation,
  useUpdateProductTypeMutation,
  useDeleteProductTypeMutation,
} = productTypesApi;

export default productTypesApi;
export {
  useGetProductTypesQuery,
  useCreateProductTypeMutation,
  useUpdateProductTypeMutation,
  useDeleteProductTypeMutation,
};
