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
    
    getQuizById: builder.query({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Quiz", id }],
    }),
    
    // Quiz Results endpoints
    submitQuizResult: builder.mutation({
      query: (data) => ({
        url: `/quizzes/${data.quizId}/submit`,
        method: "POST",
        data: { answers: data.answers },
      }),
      invalidatesTags: ["QuizResult"],
    }),
    
    getQuizResult: builder.query({
      query: (quizId) => ({
        url: `/quizzes/${quizId}/result`,
        method: "GET",
      }),
      providesTags: ["QuizResult"],
    }),
  }),
});

export const {
  useAddQuizMutation,
  useGetAllQuizzesQuery,
  useGetQuizByIdQuery,
  usePatchQuizMutation,
  useSubmitQuizResultMutation,
  useGetQuizResultQuery,
} = quizApi;
