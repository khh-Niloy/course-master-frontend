import { baseApi } from "@/redux/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    studentRegister: builder.mutation({
      query: (data) => ({
        url: "/students",
        method: "POST",
        data: data,
      }),
    }),
    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        data: data,
      }),
    }),
    getMe: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ['USER'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "GET",
      }),
      invalidatesTags: ['USER'],
    }),
  }),
});

export const { useStudentRegisterMutation, useLoginMutation, useGetMeQuery, useLogoutMutation } = authApi;
