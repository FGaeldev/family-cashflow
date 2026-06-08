/**
 * src/hooks/useSheets.js
 *
 * Purpose: Custom React hook — manages all ledger state and Sheets API interactions
 * Context: Used by App.jsx and any component needing ledger data or mutations
 * Dependencies: src/lib/sheetsApi.js
 *
 * Exposes:
 * - entries     : all ledger rows fetched from Sheet
 * - loading     : true while fetching
 * - error       : error message string or null
 * - addEntry()  : appends a new transaction to the Sheet
 * - refresh()   : manually re-fetches entries
 * - summary     : computed totals (totalIn, totalOut, currentBalance)
 */

import { useState, useEffect, useCallback } from 'react'
import { fetchEntries, appendEntry, computeBalance } from '../lib/sheetsApi'

/**
 * useSheets
 *
 * @returns {Object} Ledger state and actions.
 * @returns {Array}    .entries       - All transaction rows as objects
 * @returns {boolean}  .loading       - Fetch in progress
 * @returns {string|null} .error      - Error message or null
 * @returns {Function} .addEntry      - Append new transaction
 * @returns {Function} .refresh       - Re-fetch from Sheet
 * @returns {Object}   .summary       - { totalIn, totalOut, currentBalance }
 */
export function useSheets() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError  ] = useState(null)

  /**
   * Fetches all entries from the Google Sheet.
   * Wrapped in useCallback so it can be passed as a stable ref (e.g. to refresh button).
   */
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const rows = await fetchEntries()
      setEntries(rows)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    refresh()
  }, [refresh])

  /**
   * Appends a new transaction entry to the Sheet.
   * Computes running balance before sending — Sheet stores final value.
   *
   * @param {Object} formData - Raw form values from AddEntryForm
   * @param {string} formData.date      - ISO date string
   * @param {string} formData.channel   - Account name
   * @param {string} formData.flow      - 'In' or 'Out'
   * @param {string} formData.category  - Category label
   * @param {string} formData.purpose   - Description
   * @param {string} formData.member    - Family member
   * @param {number} formData.amount    - Transaction amount (positive)
   *
   * @returns {Promise<boolean>} true on success, false on failure
   */
  const addEntry = useCallback(async (formData) => {
    setError(null)

    try {
      const amount  = parseFloat(formData.amount)

      // Compute running balance client-side before appending
      const balance = computeBalance(entries, formData.flow, amount)

      await appendEntry({
        Date:     formData.date,
        Channel:  formData.channel,
        Flow:     formData.flow,
        Category: formData.category,
        Purpose:  formData.purpose,
        Member:   formData.member,
        Amount:   amount,
        Balance:  balance,
      })

      // Re-fetch to sync local state with Sheet
      await refresh()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [entries, refresh])

  /**
   * Derived summary totals — recomputed whenever entries change.
   * Avoids redundant state by computing from source of truth.
   */
  const summary = {
    totalIn: entries
      .filter(e => e.Flow === 'In')
      .reduce((sum, e) => sum + (parseFloat(e.Amount) || 0), 0),

    totalOut: entries
      .filter(e => e.Flow === 'Out')
      .reduce((sum, e) => sum + (parseFloat(e.Amount) || 0), 0),

    // Use last row's Balance as current — avoids float drift from re-summing
    currentBalance: entries.length > 0
      ? parseFloat(entries[entries.length - 1].Balance) || 0
      : 0,
  }

  return { entries, loading, error, addEntry, refresh, summary }
}
