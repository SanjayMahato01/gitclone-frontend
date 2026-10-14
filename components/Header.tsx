'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import GitHubMark from './GitHubMark'
import FullscreenButton from './FullscreenButton'
import { useLogoutMutation, useGetMeQuery } from '@/lib/features/api/authApi'
import type { RootState } from '@/lib/store'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // User pulled straight from the auth slice
  const user = useSelector((state: RootState) => state.auth.user)

  // Fetch the current user once on mount (hydrates the slice from the cookie).
  // onQueryStarted dispatches setUser / clearUser automatically.
  useGetMeQuery()

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()

  // Load saved theme
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
    setTheme(saved)
    document.documentElement.classList.toggle('dark', saved === 'dark')
    document.documentElement.classList.toggle('light', saved === 'light')
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.classList.toggle('light', next === 'light')
  }

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // Even if the server call fails, clear client state and redirect.
    }
    setMenuOpen(false)
    router.push('/login')
  }

  const initial = user?.username?.[0]?.toUpperCase() ?? '?'

  return (
    <TooltipProvider>
      <header className="topbar">
        <Link href="/dashboard" className="brand-button">
          <GitHubMark /> <span>github clone</span>
        </Link>

        {/* Desktop nav */}
        <nav className="topbar-nav desktop-nav">
          <Link href="/dashboard" className={pathname === '/dashboard' ? 'nav-active' : ''}>Search</Link>
          <Link href="/dashboard/saved" className={pathname === '/dashboard/saved' ? 'nav-active' : ''}>Saved</Link>
        </nav>

        <div className="topbar-actions">
          {/* Fullscreen — render prop passes the element directly */}
          <div className="desktop-only">
            <Tooltip>
              <TooltipTrigger render={<FullscreenButton />} />
              <TooltipContent>Toggle fullscreen</TooltipContent>
            </Tooltip>
          </div>

          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  className="theme-button"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? '☼' : '☾'}
                </button>
              }
            />
            <TooltipContent>
              Switch to {theme === 'dark' ? 'light' : 'dark'} mode
            </TooltipContent>
          </Tooltip>

          {/* Account dropdown — both triggers render into the SAME button */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger
                render={
                  <DropdownMenuTrigger
                    render={
                      <button className="avatar" aria-label="Account">
                        {initial}
                      </button>
                    }
                  />
                }
              />
              <TooltipContent>
                {user ? `${user.username} · ${user.email}` : 'Account'}
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" className="w-56">
              {/* DropdownMenuLabel must live inside a DropdownMenuGroup
                  in Base UI, otherwise it throws "MenuGroupContext is missing". */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-semibold">{user?.username ?? 'Guest'}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email ?? 'Not signed in'}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-red-500 focus:text-red-500"
              >
                {isLoggingOut ? 'Logging out…' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="logout-button desktop-only"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out…' : 'Logout'}
          </button>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
          <nav className="topbar-nav mobile-nav">
            <Link href="/dashboard" className={pathname === '/dashboard' ? 'nav-active' : ''}>Search</Link>
            <Link href="/dashboard/saved" className={pathname === '/dashboard/saved' ? 'nav-active' : ''}>Saved</Link>
          </nav>
          <div className="mobile-actions">
            <FullscreenButton />
            {user && (
              <div className="mobile-account">
                <p className="account-name">{user.username}</p>
                <p className="account-email">{user.email}</p>
              </div>
            )}
            <button
              className="logout-button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out…' : 'Logout'}
            </button>
          </div>
        </div>
        {menuOpen && <div className="mobile-backdrop" onClick={() => setMenuOpen(false)} />}
      </header>
    </TooltipProvider>
  )
}