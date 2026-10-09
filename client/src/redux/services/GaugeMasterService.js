import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GAUGE_MASTER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const GaugeMasterApi = createApi({
  reducerPath: "GaugeMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["GaugeMaster"],
  endpoints: (builder) => ({
    getGaugeMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: GAUGE_MASTER_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: GAUGE_MASTER_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["GaugeMaster"],
    }),
    getGaugeMasterById: builder.query({
      query: (id) => {
        return {
          url: `${GAUGE_MASTER_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["GaugeMaster"],
    }),
    addGaugeMaster: builder.mutation({
      query: (payload) => ({
        url: GAUGE_MASTER_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["GaugeMaster"],
    }),

    updateGaugeMaster: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${GAUGE_MASTER_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["GaugeMaster"],
    }),
    deleteGaugeMaster: builder.mutation({
      query: (id) => ({
        url: `${GAUGE_MASTER_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GaugeMaster"],
    }),
  }),
});

export const {
  useGetGaugeMasterQuery,
  useGetGaugeMasterByIdQuery,
  useLazyGetGaugeMasterByIdQuery,
  useAddGaugeMasterMutation,
  useUpdateGaugeMasterMutation,
  useDeleteGaugeMasterMutation,
} = GaugeMasterApi;

export default GaugeMasterApi;
