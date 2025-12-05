import { baseApi } from "@/redux/baseApi";

export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST endpoint for creating quiz
    addQuiz: builder.mutation({
      query: (data) => ({
        url: "/quizzes/",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["Quiz"],
    }),
    
    // GET endpoint for fetching all quizzes
    getAllQuizzes: builder.query({
      query: (params = {}) => ({
        url: "/quizzes/",
        method: "GET",
        params: params,
      }),
      providesTags: ["Quiz"],
    }),

    // PATCH endpoint for partially updating quiz
    patchQuiz: builder.mutation({
      query: ({ id, data }) => ({
        url: `/quizzes/${id}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Quiz", id }, "Quiz"],
    }),
    
    // getQuizById: builder.query({
    //   query: (id) => ({
    //     url: `/quizzes/${id}`,
    //     method: "GET",
    //   }),
    //   providesTags: (result, error, id) => [{ type: "Quiz", id }],
    // }),
    
    // updateQuiz: builder.mutation({
    //   query: ({ id, data }) => ({
    //     url: `/quizzes/${id}`,
    //     method: "PUT",
    //     data: data,
    //   }),
    //   invalidatesTags: (result, error, { id }) => [{ type: "Quiz", id }],
    // }),
    
    // deleteQuiz: builder.mutation({
    //   query: (id) => ({
    //     url: `/quizzes/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: (result, error, id) => [{ type: "Quiz", id }],
    // }),
    
    // searchQuizzesByTitle: builder.query({
    //   query: (searchTerm) => ({
    //     url: "/quizzes/search",
    //     method: "GET",
    //     params: { search: searchTerm },
    //   }),
    //   providesTags: ["Quiz"],
    // }),
    
    // Quiz Results endpoints - TODO: Implement in backend
    // submitQuizResult: builder.mutation({
    //   query: (data) => ({
    //     url: "/quiz-results/",
    //     method: "POST",
    //     data: data,
    //   }),
    //   invalidatesTags: ["QuizResult"],
    // }),
    
    // getQuizResultsByStudent: builder.query({
    //   query: (studentId) => ({
    //     url: `/quiz-results/student/${studentId}`,
    //     method: "GET",
    //   }),
    //   providesTags: ["QuizResult"],
    // }),
    
    // getQuizResultsByQuiz: builder.query({
    //   query: (quizId) => ({
    //     url: `/quiz-results/quiz/${quizId}`,
    //     method: "GET",
    //   }),
    //   providesTags: ["QuizResult"],
    // }),
  }),
});

export const {
  useAddQuizMutation,
  useGetAllQuizzesQuery,
  usePatchQuizMutation,
  // TODO: Export other hooks when backend endpoints are implemented
  // useGetQuizByIdQuery,
  // useUpdateQuizMutation,
  // useDeleteQuizMutation,
  // useSearchQuizzesByTitleQuery,
  // useSubmitQuizResultMutation,
  // useGetQuizResultsByStudentQuery,
  // useGetQuizResultsByQuizQuery,
} = quizApi;
