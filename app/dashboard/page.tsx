'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  useSearchRepositoriesQuery,
  useGetSavedRepositoriesQuery,
} from '@/lib/features/api/githubApi'
import RepoCard from '@/components/RepoCard'

const PER_PAGE = 5

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sort, setSort] = useState<'stars' | 'updated'>('stars')
  const [language, setLanguage] = useState('')
  const [page, setPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, sort, language])

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useSearchRepositoriesQuery({
    q: debouncedQuery,
    language: language || undefined,
    sort,
    page,
  })

  const { data: savedData } = useGetSavedRepositoriesQuery(1)

  const savedIds = useMemo(
    () => new Set(savedData?.repoIds ?? []),
    [savedData]
  )

  const repositories = data?.repositories ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 0

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | 'ellipsis')[] = [1]
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    if (start > 2) pages.push('ellipsis')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push('ellipsis')
    pages.push(totalPages)
    return pages
  }, [page, totalPages])

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const errorMessage =
    isError && error && 'data' in error && error.data
      ? (error.data as { message?: string }).message ?? 'Failed to load repositories.'
      : isError
        ? 'Failed to load repositories.'
        : null

  return (
    <div className="dashboard-wrap">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Open source explorer</p>
          <h1>Find your next repository</h1>
          <p>Search millions of public repositories on GitHub.</p>
        </div>
        <span className="api-status"><i /> GitHub API connected</span>
      </div>

      <div className="search-row">
        <div className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories by keyword..."
            aria-label="Search repositories"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'stars' | 'updated')}
          aria-label="Sort repositories"
        >
          <option value="stars">Most stars</option>
          <option value="updated">Recently updated</option>
        </select>
      </div>

      <div className="result-header">
        <p className="result-count">
          {isLoading ? (
            <span className="result-skeleton-text" aria-hidden="true" />
          ) : totalCount > 0 ? (
            <>
              Showing <strong>{repositories.length}</strong> of{' '}
              <strong>{totalCount.toLocaleString()}</strong> repositories
            </>
          ) : (
            'No repositories found'
          )}
        </p>
        {isFetching && !isLoading && (
          <span className="fetching-indicator" aria-live="polite">
            <span className="fetching-dot" />
            Updating…
          </span>
        )}
      </div>

      {isError && (
        <div className="repo-error" role="alert">
          {errorMessage}
        </div>
      )}

      <div className={`repo-list ${isFetching && !isLoading ? 'is-fetching' : ''}`}>
        {isLoading ? (
          Array.from({ length: PER_PAGE }).map((_, i) => (
            <RepoCardSkeleton key={i} />
          ))
        ) : (
          repositories.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isSaved={savedIds.has(repo.id)}
            />
          ))
        )}
      </div>

      {!isLoading && !isError && repositories.length === 0 && (
        <div className="repo-empty">
          <p className="repo-empty-title">No repositories found</p>
          <p className="repo-empty-sub">
            Nothing matched “{debouncedQuery}”. Try a different keyword or remove the language filter.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
          {isMobile ? (
            // ── Mobile: arrows + counter ──
            <>
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1 || isFetching}
                aria-label="Previous page"
                className="inline-flex items-center justify-center min-w-9 h-9 rounded-lg border border-white/10 text-zinc-400 text-sm transition hover:bg-white/5 hover:text-zinc-100 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                ←
              </button>

              <span className="min-w-16 text-center text-sm text-zinc-400">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages || isFetching}
                aria-label="Next page"
                className="inline-flex items-center justify-center min-w-9 h-9 rounded-lg border border-white/10 text-zinc-400 text-sm transition hover:bg-white/5 hover:text-zinc-100 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                →
              </button>
            </>
          ) : (
            // ── Desktop: numbered pagination ──
            <>
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1 || isFetching}
                className="min-w-9 h-9 px-3 rounded-lg border border-white/10 text-zinc-400 text-sm transition hover:bg-white/5 hover:border-white/20 hover:text-zinc-100 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {pageNumbers.map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`e-${i}`} className="px-1 text-zinc-500 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    disabled={isFetching}
                    aria-current={p === page ? 'page' : undefined}
                    className={`min-w-9 h-9 px-3 rounded-lg border text-sm transition disabled:opacity-35 disabled:cursor-not-allowed ${p === page
                        ? 'bg-blue-500/15 border-blue-500/50 text-blue-400 font-semibold'
                        : 'border-white/10 text-zinc-400 hover:bg-white/5 hover:border-white/20 hover:text-zinc-100'
                      }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages || isFetching}
                className="min-w-9 h-9 px-3 rounded-lg border border-white/10 text-zinc-400 text-sm transition hover:bg-white/5 hover:border-white/20 hover:text-zinc-100 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- Skeleton card ---------- */

function RepoCardSkeleton() {
  return (
    <div className="repo-card repo-card-skeleton" aria-hidden="true">
      <div className="repo-card-top">
        <div className="repo-skeleton-left">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-desc" />
          <div className="skeleton-line skeleton-desc skeleton-desc-short" />
        </div>
        <div className="skeleton-star" />
      </div>
      <div className="repo-meta">
        <div className="skeleton-pill" />
        <div className="skeleton-pill" />
        <div className="skeleton-pill" />
        <div className="skeleton-pill skeleton-pill-short" />
      </div>
    </div>
  )
}