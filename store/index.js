import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "./slices/authSlice";
import posApi from "./api/slices/posApi";
import auditApi from "./api/slices/auditApi";
import suppliersApi from "./api/slices/suppliersApi";
import purchaseOrdersApi from "./api/slices/purchaseOrdersApi";

const makeStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [posApi.reducerPath]: posApi.reducer,
      [auditApi.reducerPath]: auditApi.reducer,
      [suppliersApi.reducerPath]: suppliersApi.reducer,
      [purchaseOrdersApi.reducerPath]: purchaseOrdersApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        baseApi.middleware,
        posApi.middleware,
        auditApi.middleware,
        suppliersApi.middleware,
        purchaseOrdersApi.middleware,
      ),
  });

export { makeStore };
