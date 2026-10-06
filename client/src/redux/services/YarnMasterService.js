import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { YARN_MASTER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const YarnMasterApi = createApi({
  reducerPath: "YarnMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["YarnMaster"],
  endpoints: (builder) => ({
    getYarnMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: YARN_MASTER_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: YARN_MASTER_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["YarnMaster"],
    }),
    getYarnMasterById: builder.query({
      query: (id) => {
        return {
          url: `${YARN_MASTER_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["YarnMaster"],
    }),
    addYarnMaster: builder.mutation({
      query: (payload) => ({
        url: YARN_MASTER_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["YarnMaster"],
    }),

    updateYarnMaster: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${YARN_MASTER_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["YarnMaster"],
    }),
    deleteYarnMaster: builder.mutation({
      query: (id) => ({
        url: `${YARN_MASTER_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["YarnMaster"],
    }),
  }),
});

export const {
  useGetYarnMasterQuery,
  useGetYarnMasterByIdQuery,
  useLazyGetYarnMasterByIdQuery,
  useAddYarnMasterMutation,
  useUpdateYarnMasterMutation,
  useDeleteYarnMasterMutation,
} = YarnMasterApi;

export default YarnMasterApi;
