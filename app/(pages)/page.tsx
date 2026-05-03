'use client'

import Link from 'next/link'

/* ─── Title ─── */
function Title() {
  return (
    <h1
      style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
        color: '#111',
        letterSpacing: '0.15em',
        textAlign: 'center',
      }}
    >
      ARDUINO NODE
    </h1>
  )
}

/* ─── Button ─── */
function LaunchButton() {
  return (
    <Link href="/serial">
      <button
        style={{
          marginTop: 40,
          padding: '14px 28px',
          fontFamily: "'Share Tech Mono', monospace",
          background: '#111',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          letterSpacing: '0.2em',
          fontWeight: 'bold',
        }}
      >
        LAUNCH INTERFACE
      </button>
    </Link>
  )
}

/* ─── Page ─── */
export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Title />
      <LaunchButton />
    </main>
  )
}
