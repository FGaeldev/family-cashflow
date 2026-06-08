/**
 * src/App.jsx
 *
 * Purpose: Root component — composes all views, detects editor mode, wires hook
 * Context: Mounted by main.jsx; single-page app, no router needed
 * Dependencies: useSheets, SummaryCards, AddEntryForm, LedgerTable, Tailwind v3
 *
 * Editor mode detection:
 * - Checks URL param ?editor=<VITE_EDITOR_SECRET> on load
 * - If matched, renders AddEntryForm; otherwise read-only view
 * - Example: https://yoursite.github.io/family-cashflow/?editor=cashflow2026
 */

import { useMemo } from 'react'
import { useSheets }     from './hooks/useSheets'
import SummaryCards      from './components/SummaryCards'
import AddEntryForm      from './components/AddEntryForm'
import LedgerTable       from './components/LedgerTable'

/**
 * Checks whether the current visitor has editor access.
 * Compares ?editor= URL param against the secret stored in .env
 *
 * @returns {boolean} true if editor secret matches
 */
function checkIsEditor() {
  const params = new URLSearchParams(window.location.search)
  const secret = params.get('editor')
  return secret === import.meta.env.VITE_EDITOR_SECRET
}

/**
 * App
 * Root component — no props
 */
export default function App() {
  const { entries, loading, error, addEntry, refresh, summary } = useSheets()

  // Memoized — only recomputes if URL changes (won't during session, but safe)
  const isEditor = useMemo(() => checkIsEditor(), [])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <span className="text-brand-600 text-xl font-bold">₱</span>
            <h1 className="text-base font-semibold text-gray-900">Family Cashflow</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Editor indicator badge */}
            {isEditor && (
              <span className="text-xs bg-brand-100 text-brand-700 font-medium px-2 py-0.5 rounded-full">
                Editor
              </span>
            )}

            {/* Manual refresh button */}
            <button
              onClick={refresh}
              disabled={loading}
              className="text-xs text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-40"
              title="Refresh data"
            >
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>

        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* Summary cards — always visible */}
        <SummaryCards summary={summary} />

        {/* Add entry form — editor only */}
        {isEditor && (
          <AddEntryForm onAdd={addEntry} />
        )}

        {/* Ledger table — always visible */}
        <LedgerTable
          entries={entries}
          loading={loading}
          error={error}
        />

      </main>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="text-center text-xs text-gray-400 py-6">
        Family Cashflow — data stored in Google Sheets
      </footer>

    </div>
  )
}