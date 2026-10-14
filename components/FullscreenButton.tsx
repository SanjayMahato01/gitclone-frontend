'use client'
import { useEffect, useState } from 'react'

export default function FullscreenButton() {
    const [fullscreen, setFullscreen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
        document.addEventListener('fullscreenchange', onChange)
        onChange() // sync in case we're already in fullscreen
        return () => document.removeEventListener('fullscreenchange', onChange)
    }, [])

    const toggle = async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen()
            } else {
                await document.documentElement.requestFullscreen()
            }
        } catch {
            // ignore — user gesture requirement, permissions, etc.
        }
    }

    // Render a stable placeholder on the server + first client paint
    if (!mounted) {
        return (
            <button className="fullscreen-button" aria-label="Toggle fullscreen" disabled>
                ⛶<span>Fullscreen</span>
            </button>
        )
    }

    return (
        <button
            className="fullscreen-button"
            onClick={toggle}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
            {fullscreen ? '⤢' : '⛶'} <span>{fullscreen ? 'Exit' : 'Fullscreen'}</span>
        </button>
    )
}