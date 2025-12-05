import { baseApi } from "@/redux/baseApi";

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addCourse: builder.mutation({
      query: (data) => ({
        url: "/courses/",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["Course"],
    }),

    getAllCourses: builder.query({
      query: (params = {}) => ({
        url: "/courses/",
        method: "GET",
        params: params,
      }),
      providesTags: ["Course"],
    }),

    // Note: This function uses course slug, not ID (backend route expects slug)
    getCourseById: builder.query({
      query: (slug) => ({
        url: `/courses/${slug}`, // Backend expects slug: GET /courses/:slug
        method: "GET",
      }),
      providesTags: (result, error, slug) => [{ type: "Course", id: slug }],
    }),

    updateCourse: builder.mutation({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        data: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Course", id }],
    }),

    patchCourse: builder.mutation({
      query: ({ slug, data }) => ({
        url: `/courses/${slug}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: "Course", id: slug }, "Course"],
    }),

    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Course", id }],
    }),
  }),
});

export const {
  useAddCourseMutation,
  useGetAllCoursesQuery,
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
  usePatchCourseMutation,
  useDeleteCourseMutation,
} = courseApi;
