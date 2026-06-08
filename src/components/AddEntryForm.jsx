/**
 * src/components/AddEntryForm.jsx
 *
 * Purpose: Form for adding new ledger transactions — editor-only, hidden from viewers
 * Context: Rendered in App.jsx only when isEditor is true
 * Dependencies: Tailwind v3, useSheets hook (addEntry)
 *
 * Props:
 * - onAdd : async function(formData) => boolean — from useSheets.addEntry
 *
 * Form fields match ledger schema:
 * Date | Channel | Flow | Category | Purpose | Member | Amount
 * (Balance is computed in useSheets, not entered manually)
 */

import { useState } from 'react'

// ─── Predefined options — edit these to match your family's setup ────────────
const CHANNELS   = ['BDO', 'GCash', 'Cash']
const CATEGORIES = ['Food', 'Utilities', 'Allowance', 'Construction', 'Transport', 'Other']
const MEMBERS    = ['Aj', 'Francis', 'Jhomar', 'Melanie']

/**
 * Returns today's date as an ISO string (YYYY-MM-DD) in local time.
 * Using new Date().toISOString() returns UTC which can be off by one day in PH timezone.
 *
 * @returns {string} Local date string e.g. '2026-05-13'
 */
function getTodayLocal() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const INITIAL_STATE = {
  date:     getTodayLocal(),
  channel:  CHANNELS[0],
  flow:     'Out',
  category: CATEGORIES[0],
  purpose:  '',
  member:   MEMBERS[0],
  amount:   '',
}

/**
 * AddEntryForm
 *
 * @param {Object}   props
 * @param {Function} props.onAdd - Called with formData on submit; returns true on success
 */
export default function AddEntryForm({ onAdd }) {
  const [form,       setForm      ] = useState(INITIAL_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [formError,  setFormError ] = useState(null)
  const [success,    setSuccess   ] = useState(false)

  /**
   * Handles input changes for all fields — controlled component pattern.
   *
   * @param {React.ChangeEvent} e - Input or select change event
   */
  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    // Clear error on any change so user gets fresh feedback
    setFormError(null)
    setSuccess(false)
  }

  /**
   * Validates form fields before submission.
   *
   * @returns {string|null} Error message or null if valid
   */
  function validate() {
    if (!form.date)                         return 'Date is required.'
    if (!form.purpose.trim())               return 'Purpose is required.'
    if (!form.amount || isNaN(form.amount)) return 'Amount must be a number.'
    if (parseFloat(form.amount) <= 0)       return 'Amount must be greater than zero.'
    return null
  }

  /**
   * Submits the form — validates, calls onAdd, resets on success.
   */
  async function handleSubmit() {
    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSubmitting(true)
    setFormError(null)

    const ok = await onAdd({
      ...form,
      amount: parseFloat(form.amount),
    })

    setSubmitting(false)

    if (ok) {
      setForm(INITIAL_STATE) // Reset form on success
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000) // Clear success banner after 3s
    } else {
      setFormError('Failed to save. Check your connection and try again.')
    }
  }

  return (
    <div className="card mb-6">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        Add Transaction
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Channel */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Channel</label>
          <select name="channel" value={form.channel} onChange={handleChange} className="input">
            {CHANNELS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Flow */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Flow</label>
          <select name="flow" value={form.flow} onChange={handleChange} className="input">
            <option>In</option>
            <option>Out</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Member */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Member</label>
          <select name="member" value={form.member} onChange={handleChange} className="input">
            {MEMBERS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Amount (₱)</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="input mono"
          />
        </div>

        {/* Purpose — full width */}
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-3">
          <label className="text-xs text-gray-500">Purpose</label>
          <input
            type="text"
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            placeholder="e.g. Rice (1 sack)"
            className="input"
          />
        </div>

      </div>

      {/* Validation / API error */}
      {formError && (
        <p className="text-xs text-expense-600 mt-3">{formError}</p>
      )}

      {/* Success feedback */}
      {success && (
        <p className="text-xs text-brand-600 mt-3">Entry saved successfully.</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4 justify-end">
        <button
          onClick={() => { setForm(INITIAL_STATE); setFormError(null) }}
          className="btn-secondary text-sm"
          disabled={submitting}
        >
          Reset
        </button>
        <button
          onClick={handleSubmit}
          className="btn-primary text-sm"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Add Entry'}
        </button>
      </div>
    </div>
  )
}
