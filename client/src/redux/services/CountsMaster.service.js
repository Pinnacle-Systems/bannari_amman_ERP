import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { COUNTS_MASTER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const CountsMasterApi = createApi({
  reducerPath: "CountsMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["CountsMaster"],
  endpoints: (builder) => ({
    getCountsMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: COUNTS_MASTER_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: COUNTS_MASTER_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["CountsMaster"],
    }),
    getCountsMasterById: builder.query({
      query: (id) => {
        return {
          url: `${COUNTS_MASTER_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["CountsMaster"],
    }),
    addCountsMaster: builder.mutation({
      query: (payload) => ({
        url: COUNTS_MASTER_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["CountsMaster"],
    }),

    updateCountsMaster: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${COUNTS_MASTER_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["CountsMaster"],
    }),
    deleteCountsMaster: builder.mutation({
      query: (id) => ({
        url: `${COUNTS_MASTER_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CountsMaster"],
    }),
  }),
});

export const {
  useGetCountsMasterQuery,
  useGetCountsMasterByIdQuery,
  useLazyGetCountsMasterByIdQuery,
  useAddCountsMasterMutation,
  useUpdateCountsMasterMutation,
  useDeleteCountsMasterMutation,
} = CountsMasterApi;

export default CountsMasterApi;
