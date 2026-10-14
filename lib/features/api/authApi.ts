import { api } from "./apiSlice";
import { setUser, clearUser } from "../slices/authSlice";
import type { User } from "../slices/authSlice";

interface AuthResponse {
  message: string;
  user: User;
}

interface MessageResponse {
  message: string;
}

interface SignupInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<AuthResponse, SignupInput>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch {
          // Do not update state when signup fails.
        }
      },
    }),

    login: builder.mutation<AuthResponse, LoginInput>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch {
          // Do not update state when login fails.
        }
      },
    }),

    logout: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearUser());
        } catch {
          // Preserve state if logout fails.
        }
      },
    }),

    getMe: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch {
          // No valid session — make sure the store reflects that.
          dispatch(clearUser());
        }
      },
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;