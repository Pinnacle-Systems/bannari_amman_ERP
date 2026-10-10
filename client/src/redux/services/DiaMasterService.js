import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DIA_MASTER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const DiaMasterApi = createApi({
  reducerPath: "DiaMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["DiaMaster"],
  endpoints: (builder) => ({
    getDiaMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: DIA_MASTER_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: DIA_MASTER_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["DiaMaster"],
    }),
    getDiaMasterById: builder.query({
      query: (id) => {
        return {
          url: `${DIA_MASTER_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["DiaMaster"],
    }),
    addDiaMaster: builder.mutation({
      query: (payload) => ({
        url: DIA_MASTER_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["DiaMaster"],
    }),

    updateDiaMaster: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${DIA_MASTER_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["DiaMaster"],
    }),
    deleteDiaMaster: builder.mutation({
      query: (id) => ({
        url: `${DIA_MASTER_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DiaMaster"],
    }),
  }),
});

export const {
  useGetDiaMasterQuery,
  useGetDiaMasterByIdQuery,
  useLazyGetDiaMasterByIdQuery,
  useAddDiaMasterMutation,
  useUpdateDiaMasterMutation,
  useDeleteDiaMasterMutation,
} = DiaMasterApi;

export default DiaMasterApi;
