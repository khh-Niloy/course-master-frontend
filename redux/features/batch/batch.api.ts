import { baseApi } from "@/redux/baseApi";

export const batchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST endpoint for creating batch
    addBatch: builder.mutation({
      query: (data) => ({
        url: "/batches/",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["Batch"],
    }),
    
    // GET endpoint for fetching all batches
    getAllBatches: builder.query({
      query: (params = {}) => ({
        url: "/batches/",
        method: "GET",
        params: params,
      }),
      providesTags: ["Batch"],
    }),
    
    // GET endpoint for fetching batches by course
    getBatchesByCourse: builder.query({
      query: (courseId) => ({
        url: `/batches/course/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [{ type: "Batch", id: courseId }],
    }),
  }),
});

export const {
  useAddBatchMutation,
  useGetAllBatchesQuery,
  useGetBatchesByCourseQuery,
} = batchApi;