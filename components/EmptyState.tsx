import Link from 'next/link'

export default function EmptyState() {
  return (
    <div className="empty-state">
      <div>☆</div>
      <h2>No saved repositories yet</h2>
      <p>Star repositories from search to keep them here.</p>
      <Link href="/dashboard" className="submit-button">Explore repositories</Link>
    </div>
  )
}