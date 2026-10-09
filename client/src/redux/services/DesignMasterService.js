import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DESIGN_MASTER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const DesignMasterApi = createApi({
  reducerPath: "DesignMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["DesignMaster"],
  endpoints: (builder) => ({
    getDesignMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: DESIGN_MASTER_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: DESIGN_MASTER_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["DesignMaster"],
    }),
    getDesignMasterById: builder.query({
      query: (id) => {
        return {
          url: `${DESIGN_MASTER_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["DesignMaster"],
    }),
    addDesignMaster: builder.mutation({
      query: (payload) => ({
        url: DESIGN_MASTER_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["DesignMaster"],
    }),

    updateDesignMaster: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${DESIGN_MASTER_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["DesignMaster"],
    }),
    deleteDesignMaster: builder.mutation({
      query: (id) => ({
        url: `${DESIGN_MASTER_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DesignMaster"],
    }),
  }),
});

export const {
  useGetDesignMasterQuery,
  useGetDesignMasterByIdQuery,
  useLazyGetDesignMasterByIdQuery,
  useAddDesignMasterMutation,
  useUpdateDesignMasterMutation,
  useDeleteDesignMasterMutation,
} = DesignMasterApi;

export default DesignMasterApi;
