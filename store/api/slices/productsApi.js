import { baseApi } from "../baseApi";

const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ page = 1, pageSize = 20, q, categoryId, brandId, status } = {}) => ({
        url: "/products",
        params: { page, pageSize, q, categoryId, brandId, status },
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [...result.data.items.map(({ id }) => ({ type: "Product", id })), "Product"]
          : ["Product"],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),
    generateBarcode: builder.mutation({
      query: () => ({ url: "/products/generate-barcode", method: "POST" }),
    }),
  }),
});

const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGenerateBarcodeMutation,
} = productsApi;

export default productsApi;
export {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGenerateBarcodeMutation,
};
