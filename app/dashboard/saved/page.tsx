'use client'
import { useState } from 'react'
import {
  useGetSavedRepositoriesQuery ,
} from '@/lib/features/api/githubApi'
import RepoCard from '@/components/RepoCard'
import EmptyState from '@/components/EmptyState'

const PER_PAGE = 5

export default function SavedPage() {
  const [page, setPage] = useState(1)

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetSavedRepositoriesQuery(page)

  const repositories = data?.repositories ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 0

  const savedIds = new Set(data?.repoIds ?? [])

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const errorMessage =
    isError && error && 'data' in error && error.data
      ? (error.data as { message?: string }).message ?? 'Failed to load saved repositories.'
      : isError
        ? 'Failed to load saved repositories.'
        : null

  return (
    <div className="dashboard-wrap">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Open source explorer</p>
          <h1>Saved repositories</h1>
          <p>Your personal collection of repositories.</p>
        </div>
        <span className="api-status"><i /> GitHub API connected</span>
      </div>

      <p className="result-count">
        {isLoading
          ? 'Loading…'
          : totalCount > 0
            ? `You have ${totalCount.toLocaleString()} saved ${totalCount === 1 ? 'repository' : 'repositories'}`
            : ''}
      </p>

      {isError && (
        <div className="repo-error" role="alert">
          {errorMessage}
        </div>
      )}

      <div className={`repo-list ${isFetching && !isLoading ? 'is-fetching' : ''}`}>
        {isLoading ? (
          Array.from({ length: PER_PAGE }).map((_, i) => (
            <div key={i} className="repo-card skeleton" aria-hidden="true" />
          ))
        ) : repositories.length > 0 ? (
          repositories.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isSaved={savedIds.has(repo.id)}
            />
          ))
        ) : (
          !isError && <EmptyState />
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1 || isFetching}
            aria-label="Previous page"
          >
            ← Previous
          </button>

          <span className="page-indicator">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages || isFetching}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}