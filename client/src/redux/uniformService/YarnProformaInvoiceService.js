import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { YARN_PROFORMA_INVOICE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const YarnProformaInvoiceApi = createApi({
  reducerPath: "yarnProformaInvoice",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["yarnProformaInvoice"],
  endpoints: (builder) => ({
    getYarnProformaInvoice: builder.query({
      query: ({ params }) => {
        return {
          url: YARN_PROFORMA_INVOICE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["yarnProformaInvoice"],
    }),

    getYarnProformaInvoiceById: builder.query({
      query: (id) => {
        return {
          url: `${YARN_PROFORMA_INVOICE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["yarnProformaInvoice"],
    }),
    addYarnProformaInvoice: builder.mutation({
      query: (payload) => ({
        url: YARN_PROFORMA_INVOICE_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["yarnProformaInvoice"],
    }),
    updateYarnProformaInvoice: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${YARN_PROFORMA_INVOICE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["yarnProformaInvoice"],
    }),
    deleteYarnProformaInvoice: builder.mutation({
      query: (id) => ({
        url: `${YARN_PROFORMA_INVOICE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["yarnProformaInvoice"],
    }),
  }),
});

export const {
  useGetYarnProformaInvoiceQuery,
  useGetYarnProformaInvoiceByIdQuery,
  useLazyGetYarnProformaInvoiceByIdQuery,
  useAddYarnProformaInvoiceMutation,
  useUpdateYarnProformaInvoiceMutation,
  useDeleteYarnProformaInvoiceMutation,
} = YarnProformaInvoiceApi;

export default YarnProformaInvoiceApi;
