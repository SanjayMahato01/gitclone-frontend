'use client'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  useSaveRepositoryMutation,
  useRemoveSavedRepositoryMutation,
  type Repository,
} from '@/lib/features/api/githubApi'

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const day = 86_400_000
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`
  if (diff < day) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 30 * day) return `${Math.floor(diff / day)}d ago`
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))}mo ago`
  return `${Math.floor(diff / (365 * day))}y ago`
}

interface RepoCardProps {
  repo: Repository
  isSaved?: boolean
}

export default function RepoCard({ repo, isSaved = false }: RepoCardProps) {
  const [saveRepo, { isLoading: isSaving }] = useSaveRepositoryMutation()
  const [unsaveRepo, { isLoading: isRemoving }] = useRemoveSavedRepositoryMutation()

  const busy = isSaving || isRemoving

  const languageColor = repo.language
    ? LANGUAGE_COLORS[repo.language] ?? '#8b949e'
    : '#8b949e'

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (isSaved) {
        await unsaveRepo(repo.id).unwrap()
        toast.success(`Removed ${repo.name} from saved`)
      } else {
        await saveRepo(repo.id).unwrap()
        toast.success(`Saved ${repo.name}`)
      }
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err && err.data
          ? (err.data as { message?: string }).message ?? 'Something went wrong.'
          : 'Something went wrong.'
      toast.error(message)
    }
  }

  return (
    <Link
      href={`/dashboard/repo/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`}
      className="repo-card"
    >
      <div className="repo-card-top">
        <div>
          <h2>{repo.name}</h2>
          <p>{repo.description ?? 'No description provided.'}</p>
        </div>

        <button
          type="button"
          aria-label={`${isSaved ? 'Remove' : 'Save'} ${repo.name}`}
          aria-pressed={isSaved}
          aria-busy={busy}
          className={`star-button ${isSaved ? 'is-saved' : ''} ${busy ? 'is-busy' : ''}`}
          onClick={handleToggleSave}
          disabled={busy}
        >
          <span className={`star-icon ${busy ? 'spin' : ''}`} aria-hidden="true">
            {isSaved ? '★' : '☆'}
          </span>
        </button>
      </div>

      <div className="repo-meta">
        <span>★ {(repo.stars ?? 0).toLocaleString()}</span>
        <span>⑂ {(repo.forks ?? 0).toLocaleString()}</span>
        {repo.language && (
          <span>
            <i style={{ background: languageColor }} /> {repo.language}
          </span>
        )}
        <span className="updated">{relativeTime(repo.updatedAt)}</span>
      </div>
    </Link>
  )
}