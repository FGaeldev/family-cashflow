/**
 * src/components/SummaryCards.jsx
 *
 * Purpose: Displays three summary metric cards — Total In, Total Out, Current Balance
 * Context: Rendered at top of App.jsx, above the ledger table
 * Dependencies: Tailwind v3, summary object from useSheets hook
 *
 * Props:
 * - summary.totalIn        : number — sum of all In transactions
 * - summary.totalOut       : number — sum of all Out transactions
 * - summary.currentBalance : number — last recorded running balance
 */

/**
 * Formats a number as Philippine Peso currency string.
 *
 * @param {number} value - Amount to format
 * @returns {string} Formatted string e.g. '₱1,300.00'
 */
function formatPeso(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * SummaryCards
 *
 * @param {Object} props
 * @param {Object} props.summary - { totalIn, totalOut, currentBalance }
 */
export default function SummaryCards({ summary }) {
  const { totalIn, totalOut, currentBalance } = summary

  // Balance is negative — warn visually
  const balanceNegative = currentBalance < 0

  const cards = [
    {
      label: 'Total In',
      value: formatPeso(totalIn),
      valueClass: 'text-brand-600',
      bgClass: 'bg-brand-50 border-brand-100',
      icon: '↑',
      iconClass: 'text-brand-600',
    },
    {
      label: 'Total Out',
      value: formatPeso(totalOut),
      valueClass: 'text-expense-600',
      bgClass: 'bg-expense-100 border-red-100',
      icon: '↓',
      iconClass: 'text-expense-600',
    },
    {
      label: 'Current Balance',
      value: formatPeso(currentBalance),
      // Red if negative, green if positive
      valueClass: balanceNegative ? 'text-expense-600' : 'text-brand-600',
      bgClass: balanceNegative
        ? 'bg-expense-100 border-red-100'
        : 'bg-white border-gray-100',
      icon: '₱',
      iconClass: balanceNegative ? 'text-expense-600' : 'text-brand-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {cards.map(card => (
        <div
          key={card.label}
          className={`card ${card.bgClass} flex items-center gap-4`}
        >
          {/* Icon badge */}
          <div className={`text-2xl font-bold w-10 text-center ${card.iconClass}`}>
            {card.icon}
          </div>

          {/* Label + value */}
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {card.label}
            </p>
            <p className={`text-lg font-semibold mono ${card.valueClass}`}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
