import { baseApi } from "@/redux/baseApi";

export const progressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mark lesson as complete
    markLessonComplete: builder.mutation({
      query: ({ lessonId, timeSpent }) => ({
        url: `/progress/lesson/${lessonId}/complete`,
        method: "POST",
        data: { timeSpent },
      }),
      invalidatesTags: ["Progress", "Enrollment"],
    }),
    
    // Mark lesson as incomplete
    markLessonIncomplete: builder.mutation({
      query: (lessonId) => ({
        url: `/progress/lesson/${lessonId}/complete`,
        method: "DELETE",
      }),
      invalidatesTags: ["Progress", "Enrollment"],
    }),
    
    // Get lesson progress status
    getLessonProgress: builder.query({
      query: (lessonId) => ({
        url: `/progress/lesson/${lessonId}`,
        method: "GET",
      }),
      providesTags: (result, error, lessonId) => [{ type: "Progress", id: lessonId }],
    }),
    
    // Get enrollment progress summary
    getEnrollmentProgress: builder.query({
      query: (enrollmentId) => ({
        url: `/progress/enrollment/${enrollmentId}/summary`,
        method: "GET",
      }),
      providesTags: (result, error, enrollmentId) => [{ type: "Progress", id: enrollmentId }],
    }),
    
    // Get all progress for an enrollment
    getEnrollmentProgressDetails: builder.query({
      query: (enrollmentId) => ({
        url: `/progress/enrollment/${enrollmentId}`,
        method: "GET",
      }),
      providesTags: (result, error, enrollmentId) => [{ type: "Progress", id: `details-${enrollmentId}` }],
    }),
    
    // Get student's overall progress
    getStudentProgress: builder.query({
      query: () => ({
        url: "/progress/student/me",
        method: "GET",
      }),
      providesTags: ["Progress"],
    }),
  }),
});

export const {
  useMarkLessonCompleteMutation,
  useMarkLessonIncompleteMutation,
  useGetLessonProgressQuery,
  useGetEnrollmentProgressQuery,
  useGetEnrollmentProgressDetailsQuery,
  useGetStudentProgressQuery,
} = progressApi;
