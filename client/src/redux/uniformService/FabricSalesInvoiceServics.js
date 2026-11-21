import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FABRIC_SALES_INVOIVE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const FabricSalesInvoiceApi = createApi({
  reducerPath: "fabricSalesInvoice",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["fabricSalesInvoice"],
  endpoints: (builder) => ({
    getFabricSalesInvoice: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: FABRIC_SALES_INVOIVE_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: FABRIC_SALES_INVOIVE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["fabricSalesInvoice"],
    }),

    getFabricSalesInvoiceById: builder.query({
      query: (id) => {
        return {
          url: `${FABRIC_SALES_INVOIVE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["fabricSalesInvoice"],
    }),
    getFabricSalesInvoiceReport: builder.query({
      query: ({ params }) => {
        return {
          url: FABRIC_SALES_INVOIVE_API + "/report/all",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["fabricSalesInvoice"],
    }),
    addFabricSalesInvoice: builder.mutation({
      query: (payload) => ({
        url: FABRIC_SALES_INVOIVE_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["fabricSalesInvoice"],
    }),
    updateFabricSalesInvoice: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${FABRIC_SALES_INVOIVE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["fabricSalesInvoice"],
    }),
    deleteFabricSalesInvoice: builder.mutation({
      query: (id) => ({
        url: `${FABRIC_SALES_INVOIVE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["fabricSalesInvoice"],
    }),
  }),
});

export const {
  useGetFabricSalesInvoiceQuery,
  useGetFabricSalesInvoiceByIdQuery,
  useAddFabricSalesInvoiceMutation,
  useUpdateFabricSalesInvoiceMutation,
  useDeleteFabricSalesInvoiceMutation,
  useGetFabricSalesInvoiceReportQuery,
} = FabricSalesInvoiceApi;

export default FabricSalesInvoiceApi;
