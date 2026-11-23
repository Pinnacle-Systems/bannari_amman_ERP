import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SALES_INVOIVE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SalesInvoiceApi = createApi({
  reducerPath: "salesInvoice",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["salesInvoice"],
  endpoints: (builder) => ({
    getSalesInvoice: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SALES_INVOIVE_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: SALES_INVOIVE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["salesInvoice"],
    }),

    getSalesInvoiceById: builder.query({
      query: (id) => {
        return {
          url: `${SALES_INVOIVE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["salesInvoice"],
    }),
    getSalesInvoiceReport: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_INVOIVE_API + "/report/all",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["salesInvoice"],
    }),
    addSalesInvoice: builder.mutation({
      query: (payload) => ({
        url: SALES_INVOIVE_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["salesInvoice"],
    }),
    updateSalesInvoice: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${SALES_INVOIVE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["salesInvoice"],
    }),
    deleteSalesInvoice: builder.mutation({
      query: (id) => ({
        url: `${SALES_INVOIVE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["salesInvoice"],
    }),
  }),
});

export const {
  useGetSalesInvoiceQuery,
  useGetSalesInvoiceByIdQuery,
  useAddSalesInvoiceMutation,
  useUpdateSalesInvoiceMutation,
  useDeleteSalesInvoiceMutation,
  useGetSalesInvoiceReportQuery,
} = SalesInvoiceApi;

export default SalesInvoiceApi;
