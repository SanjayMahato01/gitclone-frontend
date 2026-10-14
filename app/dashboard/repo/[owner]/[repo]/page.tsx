'use client'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  useGetRepositoryDetailsQuery,
  useSaveRepositoryMutation,
  useRemoveSavedRepositoryMutation,
  useGetSavedRepositoriesQuery,
} from '@/lib/features/api/githubApi'

export default function RepoDetailPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>()
  const router = useRouter()

  const decodedOwner = decodeURIComponent(owner)
  const decodedRepo = decodeURIComponent(repo)

  const { data, isLoading, isError, error } = useGetRepositoryDetailsQuery({
    owner: decodedOwner,
    repo: decodedRepo,
  })

  // Saved state — comes from the full repoIds list, so it's correct even
  // for repos beyond page 1 of the saved list.
  const { data: savedData } = useGetSavedRepositoriesQuery(1)
  const isSaved = data?.repository
    ? (savedData?.repoIds ?? []).includes(data.repository.id)
    : false

  const [saveRepo, { isLoading: isSaving }] = useSaveRepositoryMutation()
  const [unsaveRepo, { isLoading: isRemoving }] = useRemoveSavedRepositoryMutation()
  const busy = isSaving || isRemoving

  const handleToggleSave = async () => {
    if (!data?.repository) return
    const { id, name } = data.repository
    try {
      if (isSaved) {
        await unsaveRepo(id).unwrap()
        toast.success(`Removed ${name} from saved`)
      } else {
        await saveRepo(id).unwrap()
        toast.success(`Saved ${name}`)
      }
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err && err.data
          ? (err.data as { message?: string }).message ?? 'Something went wrong.'
          : 'Something went wrong.'
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <div className="detail-wrap">
        <button className="back-button" onClick={() => router.back()}>
          ← Back to search
        </button>
        <div className="detail-card skeleton" style={{ height: 180 }} />
        <div className="detail-grid" style={{ marginTop: '1rem' }}>
          <div className="detail-card skeleton" style={{ height: 260 }} />
          <div className="detail-card skeleton" style={{ height: 260 }} />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    const message =
      error && 'data' in error && error.data
        ? (error.data as { message?: string }).message ?? 'Repository not found.'
        : 'Repository not found.'

    return (
      <div className="dashboard-wrap">
        <button className="back-button" onClick={() => router.back()}>
          ← Back
        </button>
        <div className="detail-card">
          <p className="eyebrow">Error</p>
          <h1>Couldn’t load repository</h1>
          <p className="detail-description">{message}</p>
        </div>
      </div>
    )
  }

  const { repository, latestCommits, topContributors } = data

  return (
    <div className="detail-wrap">
      <button className="back-button" onClick={() => router.back()}>
        ← Back to search
      </button>

      <div className="detail-card">
        <p className="eyebrow">Repository</p>
        <h1>{repository.fullName}</h1>
        <p className="detail-description">
          {repository.description ?? 'No description provided.'}
        </p>

        <div className="repo-stats">
          <span>★ {repository.stars.toLocaleString()} stars</span>
          <span>⑂ {repository.forks.toLocaleString()} forks</span>
          {repository.language && <span><i /> {repository.language}</span>}
        </div>

        <div className="detail-actions">
          <button
            className={`save-button ${isSaved ? 'is-saved' : ''}`}
            onClick={handleToggleSave}
            disabled={busy}
            aria-pressed={isSaved}
          >
            <span className={`star-icon ${busy ? 'spin' : ''}`} aria-hidden="true">
              {isSaved ? '★' : '☆'}
            </span>
            {isSaved ? 'Saved' : 'Save repository'}
          </button>

          <a
            className="gh-link"
            href={repository.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            Open on GitHub ↗
          </a>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h2>Latest commits</h2>
          {latestCommits.length === 0 ? (
            <p className="muted">No commits found.</p>
          ) : (
            latestCommits.map((commit) => (
              <div className="commit" key={commit.sha}>
                <span className="commit-dot">●</span>
                <div>
                  <strong>{commit.message.split('\n')[0]}</strong>
                  <small>
                    {commit.author?.username ?? 'Unknown'} ·{' '}
                    {commit.committedAt
                      ? new Date(commit.committedAt).toLocaleDateString()
                      : 'unknown date'}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="detail-card">
          <h2>Repository overview</h2>
          <div className="issue-count">
            <strong>{repository.openIssues.toLocaleString()}</strong>
            <span>open issues</span>
          </div>

          <h2>Top contributors</h2>
          {topContributors.length === 0 ? (
            <p className="muted">No contributors found.</p>
          ) : (
            topContributors.map((c) => (
              <div className="contributor" key={c.id}>
                <span className="mini-avatar">{c.username[0]?.toUpperCase()}</span>
                <span>{c.username}</span>
                <small>{c.contributions.toLocaleString()} contributions</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}