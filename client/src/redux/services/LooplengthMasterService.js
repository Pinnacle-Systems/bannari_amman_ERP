import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LOOP_LENGTH_MASTER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const LoopLengthMasterApi = createApi({
  reducerPath: "LoopLengthMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["LoopLengthMaster"],
  endpoints: (builder) => ({
    getLoopLengthMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: LOOP_LENGTH_MASTER_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: LOOP_LENGTH_MASTER_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["LoopLengthMaster"],
    }),
    getLoopLengthMasterById: builder.query({
      query: (id) => {
        return {
          url: `${LOOP_LENGTH_MASTER_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LoopLengthMaster"],
    }),
    addLoopLengthMaster: builder.mutation({
      query: (payload) => ({
        url: LOOP_LENGTH_MASTER_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["LoopLengthMaster"],
    }),

    updateLoopLengthMaster: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${LOOP_LENGTH_MASTER_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LoopLengthMaster"],
    }),
    deleteLoopLengthMaster: builder.mutation({
      query: (id) => ({
        url: `${LOOP_LENGTH_MASTER_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LoopLengthMaster"],
    }),
  }),
});

export const {
  useGetLoopLengthMasterQuery,
  useGetLoopLengthMasterByIdQuery,
  useLazyGetLoopLengthMasterByIdQuery,
  useAddLoopLengthMasterMutation,
  useUpdateLoopLengthMasterMutation,
  useDeleteLoopLengthMasterMutation,
} = LoopLengthMasterApi;

export default LoopLengthMasterApi;
