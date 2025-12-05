import { baseApi } from "@/redux/baseApi";

export const assignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST endpoint for creating assignment
    addAssignment: builder.mutation({
      query: (data) => ({
        url: "/assignments/",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["Assignment"],
    }),
    
    // GET endpoint for fetching all assignments
    getAllAssignments: builder.query({
      query: (params = {}) => ({
        url: "/assignments/",
        method: "GET",
        params: params,
      }),
      providesTags: ["Assignment"],
    }),

    // PATCH endpoint for partially updating assignment
    patchAssignment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assignments/${id}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Assignment", id }, "Assignment"],
    }),
    
    getAssignmentById: builder.query({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Assignment", id }],
    }),
    
    submitAssignment: builder.mutation({
      query: (data) => ({
        url: `/assignments/${data.assignmentId}/submit`,
        method: "POST",
        data: { submission: data.submission },
      }),
      invalidatesTags: ["AssignmentSubmission"],
    }),
    
    getAssignmentSubmission: builder.query({
      query: (assignmentId) => ({
        url: `/assignments/${assignmentId}/submission`,
        method: "GET",
      }),
      providesTags: ["AssignmentSubmission"],
    }),
    
    getAllSubmissions: builder.query({
      query: (params = {}) => ({
        url: "/assignments/submissions/all",
        method: "GET",
        params: params,
      }),
      providesTags: ["AssignmentSubmission"],
    }),
    
    reviewAssignment: builder.mutation({
      query: ({ submissionId, data }) => ({
        url: `/assignments/submissions/${submissionId}/review`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: ["AssignmentSubmission"],
    }),
  }),
});

export const {
  useAddAssignmentMutation,
  useGetAllAssignmentsQuery,
  useGetAssignmentByIdQuery,
  usePatchAssignmentMutation,
  useSubmitAssignmentMutation,
  useGetAssignmentSubmissionQuery,
  useGetAllSubmissionsQuery,
  useReviewAssignmentMutation,
} = assignmentApi;
