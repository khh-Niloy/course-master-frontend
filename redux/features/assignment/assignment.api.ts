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
    
    // getAssignmentById: builder.query({
    //   query: (id) => ({
    //     url: `/assignments/${id}`,
    //     method: "GET",
    //   }),
    //   providesTags: (result, error, id) => [{ type: "Assignment", id }],
    // }),
    
    // updateAssignment: builder.mutation({
    //   query: ({ id, data }) => ({
    //     url: `/assignments/${id}`,
    //     method: "PUT",
    //     data: data,
    //   }),
    //   invalidatesTags: (result, error, { id }) => [{ type: "Assignment", id }],
    // }),
    
    // deleteAssignment: builder.mutation({
    //   query: (id) => ({
    //     url: `/assignments/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: (result, error, id) => [{ type: "Assignment", id }],
    // }),
    
    // searchAssignmentsByTitle: builder.query({
    //   query: (searchTerm) => ({
    //     url: "/assignments/search",
    //     method: "GET",
    //     params: { search: searchTerm },
    //   }),
    //   providesTags: ["Assignment"],
    // }),
  }),
});

export const {
  useAddAssignmentMutation,
  useGetAllAssignmentsQuery,
  usePatchAssignmentMutation,
  // TODO: Export other hooks when backend endpoints are implemented
  // useGetAssignmentByIdQuery,
  // useUpdateAssignmentMutation,
  // useDeleteAssignmentMutation,
  // useSearchAssignmentsByTitleQuery,
} = assignmentApi;
