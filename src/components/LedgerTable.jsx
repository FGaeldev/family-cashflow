/**
 * src/components/LedgerTable.jsx
 *
 * Purpose: Displays all ledger transactions in a scrollable table
 * Context: Rendered in App.jsx below SummaryCards, always visible to all users
 * Dependencies: Tailwind v3, entries array from useSheets hook
 *
 * Props:
 * - entries : Array<Object> — transaction rows from useSheets
 * - loading : boolean       — shows skeleton while fetching
 * - error   : string|null   — shows error message if fetch failed
 */

/**
 * Formats a number as Philippine Peso currency string.
 *
 * @param {number|string} value - Raw amount value
 * @returns {string} Formatted string e.g. '₱1,300.00'
 */
function formatPeso(value) {
  const num = parseFloat(value)
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(num)
}

/**
 * Formats an ISO date string to a readable short format.
 *
 * @param {string} dateStr - ISO date e.g. '2026-05-13'
 * @returns {string} e.g. 'May 13, 2026'
 */
function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  // Compensate for UTC parsing shifting date back one day in PH timezone
  const adjusted = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  return adjusted.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Table column definitions ────────────────────────────────────────────────
const COLUMNS = [
  { key: 'Date',     label: 'Date',     align: 'left'  },
  { key: 'Channel',  label: 'Channel',  align: 'left'  },
  { key: 'Flow',     label: 'Flow',     align: 'center'},
  { key: 'Category', label: 'Category', align: 'left'  },
  { key: 'Purpose',  label: 'Purpose',  align: 'left'  },
  { key: 'Member',   label: 'Member',   align: 'left'  },
  { key: 'Amount',   label: 'Amount',   align: 'right' },
  { key: 'Balance',  label: 'Balance',  align: 'right' },
]

/**
 * SkeletonRow — placeholder row shown while data is loading.
 */
function SkeletonRow() {
  return (
    <tr>
      {COLUMNS.map(col => (
        <td key={col.key} className="px-3 py-3">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  )
}

/**
 * LedgerTable
 *
 * @param {Object}       props
 * @param {Array}        props.entries - Transaction rows
 * @param {boolean}      props.loading - Fetch in progress
 * @param {string|null}  props.error   - Error message or null
 */
export default function LedgerTable({ entries, loading, error }) {

  return (
    <div className="card p-0 overflow-hidden">

      {/* Table header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Ledger
        </h2>
        <span className="text-xs text-gray-400">
          {loading ? 'Loading...' : `${entries.length} entries`}
        </span>
      </div>

      {/* Error state */}
      {error && (
        <div className="px-4 py-3 text-sm text-expense-600 bg-expense-100">
          Failed to load entries: {error}
        </div>
      )}

      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Column headers */}
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide
                    text-${col.align} whitespace-nowrap`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">

            {/* Loading skeletons */}
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}

            {/* Empty state */}
            {!loading && !error && entries.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No entries yet. Add the first transaction above.
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading && entries.map((entry, index) => {
              const isIn      = entry.Flow === 'In'
              const rowClass  = isIn ? 'row-in' : 'row-out'
              const balance   = parseFloat(entry.Balance)
              const balanceNegative = !isNaN(balance) && balance < 0

              return (
                <tr key={index} className={`${rowClass} hover:brightness-95 transition-all`}>

                  {/* Date */}
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                    {formatDate(entry.Date)}
                  </td>

                  {/* Channel */}
                  <td className="px-3 py-2 text-gray-700">
                    {entry.Channel || '—'}
                  </td>

                  {/* Flow badge */}
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold
                      ${isIn
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-red-100 text-expense-600'
                      }`}
                    >
                      {entry.Flow}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-2 text-gray-600">
                    {entry.Category || '—'}
                  </td>

                  {/* Purpose */}
                  <td className="px-3 py-2 text-gray-800 font-medium">
                    {entry.Purpose || '—'}
                  </td>

                  {/* Member */}
                  <td className="px-3 py-2 text-gray-600">
                    {entry.Member || '—'}
                  </td>

                  {/* Amount */}
                  <td className={`px-3 py-2 text-right mono font-medium
                    ${isIn ? 'text-brand-600' : 'text-expense-600'}`}
                  >
                    {formatPeso(entry.Amount)}
                  </td>

                  {/* Running balance */}
                  <td className={`px-3 py-2 text-right mono font-semibold
                    ${balanceNegative ? 'text-expense-600' : 'text-gray-800'}`}
                  >
                    {formatPeso(entry.Balance)}
                  </td>

                </tr>
              )
            })}

          </tbody>
        </table>
      </div>
    </div>
  )
}
