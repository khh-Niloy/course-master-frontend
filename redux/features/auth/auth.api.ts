import { baseApi } from "@/redux/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    userRegister: builder.mutation({
      query: (data) => ({
        url: "/users",
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
      transformResponse: (response: { data: { user: any } }) => response.data,
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

export const { useUserRegisterMutation, useLoginMutation, useGetMeQuery, useLogoutMutation } = authApi;
