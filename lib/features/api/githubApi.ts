import { api } from "./apiSlice";

/* ---------- Types (match your controller's response shapes) ---------- */

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
  owner: string;
  ownerAvatar: string;
}

export interface RepositoryDetails extends Repository {
  openIssues: number;
}

export interface Commit {
  sha: string;
  message: string;
  url: string;
  author: {
    username: string;
    avatarUrl: string;
    url: string;
  } | null;
  committedAt: string | null;
}

export interface Contributor {
  id: number;
  username: string;
  avatarUrl: string;
  url: string;
  contributions: number;
}

export interface Paginated<T> {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
  items: T;
}

export interface SearchRepositoriesResponse {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
  sort: "stars" | "updated";
  repositories: Repository[];
}

export interface RepositoryDetailsResponse {
  repository: RepositoryDetails;
  latestCommits: Commit[];
  topContributors: Contributor[];
}

export interface SavedRepositoriesResponse {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
  repositories: Repository[];
  /** Full, unpaginated list of saved repo IDs — safe to use for "is this saved?" checks. */
  repoIds: string[];
}

/* ---------- Inputs ---------- */

export interface SearchRepositoriesArgs {
  q: string;
  language?: string;
  sort?: "stars" | "updated";
  page?: number;
}

export interface RepositoryDetailsArgs {
  owner: string;
  repo: string;
}

/* ---------- Endpoints ---------- */

export const githubApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchRepositories: builder.query<
      SearchRepositoriesResponse,
      SearchRepositoriesArgs
    >({
      query: ({ q, language, sort = "stars", page = 1 }) => {
        const params = new URLSearchParams({
          q,
          sort,
          page: String(page),
        });
        if (language) params.set("language", language);
        return `/github/search?${params.toString()}`;
      },
      providesTags: (_result, _error, { q, language, sort, page }) => [
        { type: "Search", id: `${q}|${language ?? ""}|${sort}|${page}` },
      ],
    }),

    getRepositoryDetails: builder.query<
      RepositoryDetailsResponse,
      RepositoryDetailsArgs
    >({
      query: ({ owner, repo }) =>
        `/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      providesTags: (_result, _error, { owner, repo }) => [
        { type: "Repo", id: `${owner}/${repo}` },
      ],
    }),

    saveRepository: builder.mutation<
      { message: string; repoIds: string[] },
      string // repoId
    >({
      query: (repoId) => ({
        url: `/github/saved/${encodeURIComponent(repoId)}`,
        method: "POST",
      }),
      invalidatesTags: ["SavedRepo"],
    }),

    getSavedRepositories: builder.query<SavedRepositoriesResponse, number>({
      query: (page = 1) => `/github/saved?page=${page}`,
      providesTags: (result) =>
        result
          ? [
              ...result.repositories.map((r) => ({
                type: "SavedRepo" as const,
                id: r.id,
              })),
              { type: "SavedRepo" as const, id: "LIST" },
            ]
          : [{ type: "SavedRepo" as const, id: "LIST" }],
    }),

    removeSavedRepository: builder.mutation<
      { message: string; repoIds: string[] },
      string
    >({
      query: (repoId) => ({
        url: `/github/saved/${encodeURIComponent(repoId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, repoId) => [
        { type: "SavedRepo", id: repoId },
        { type: "SavedRepo", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useSearchRepositoriesQuery,
  useGetRepositoryDetailsQuery,
  useSaveRepositoryMutation,
  useGetSavedRepositoriesQuery,
  useRemoveSavedRepositoryMutation,
} = githubApi;