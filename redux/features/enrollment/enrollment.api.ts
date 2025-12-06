import { baseApi } from "@/redux/baseApi";

export const enrollmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST endpoint for creating enrollment
    addEnrollment: builder.mutation({
      query: (data) => ({
        url: "/enrollments/",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["Enrollment"],
    }),
    
    // GET endpoint for fetching all enrollments (admin)
    getAllEnrollments: builder.query({
      query: (params = {}) => ({
        url: "/enrollments/",
        method: "GET",
        params: params,
      }),
      providesTags: ["Enrollment"],
    }),
    
    // GET endpoint for fetching student's enrollments
    getEnrollmentsByStudent: builder.query({
      query: (studentId) => ({
        url: `/enrollments/student/${studentId}`,
        method: "GET",
      }),
      providesTags: (result, error, studentId) => [{ type: "Enrollment", id: studentId }],
    }),
    
    // GET endpoint for fetching course enrollments (admin)
    getEnrollmentsByCourse: builder.query({
      query: (courseId) => ({
        url: `/enrollments/course/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [{ type: "Enrollment", id: courseId }],
    }),
  }),
});

export const {
  useAddEnrollmentMutation,
  useGetAllEnrollmentsQuery,
  useGetEnrollmentsByStudentQuery,
  useGetEnrollmentsByCourseQuery,
} = enrollmentApi;

