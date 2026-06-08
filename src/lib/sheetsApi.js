/**
 * src/lib/sheetsApi.js
 *
 * Purpose: All Google Sheets API v4 read/write operations for Family Cashflow
 * Context: Used by useSheets hook — never called directly from components
 * Dependencies: Google Sheets API v4 (REST), VITE_SHEETS_API_KEY, VITE_SHEET_ID
 *
 * Sheet structure expected (Sheet1):
 * Row 1: Headers — Date | Channel | Flow | Category | Purpose | Member | Amount | Balance
 * Row 2+: Data entries, one transaction per row
 *
 * Notes:
 * - API key is read-only capable; write operations use the same key via OAuth would
 *   require service account. For simplicity, writes use the public append endpoint
 *   which requires the sheet to be shared as "Anyone with link can edit".
 * - Balance is computed client-side before appending — sheet stores final value.
 */

const API_KEY   = import.meta.env.VITE_SHEETS_API_KEY
const SHEET_ID  = import.meta.env.VITE_SHEET_ID
const SHEET_TAB = 'Sheet1'
const BASE_URL  = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`

// ─── Column order must match sheet headers exactly ──────────────────────────
const COLUMNS = ['Date', 'Channel', 'Flow', 'Category', 'Purpose', 'Member', 'Amount', 'Balance']

/**
 * Fetches all ledger rows from the Google Sheet.
 *
 * @returns {Promise<Array<Object>>} Array of row objects keyed by column name.
 *   Example: [{ Date: '2026-05-13', Channel: 'BDO', Flow: 'In', ... }]
 *
 * @throws {Error} If the API request fails or returns a non-OK status.
 */
export async function fetchEntries() {
  // Read all rows starting from row 2 (row 1 is headers)
  const range    = `${SHEET_TAB}!A2:H`
  const url      = `${BASE_URL}/values/${encodeURIComponent(range)}?key=${API_KEY}`
  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Sheets API fetch failed: ${error.error?.message ?? response.statusText}`)
  }

  const data = await response.json()
  const rows = data.values ?? [] // API omits `values` key if sheet is empty

  // Map each raw row array to a named object for easier consumption in components
  return rows.map(row => {
    const entry = {}
    COLUMNS.forEach((col, index) => {
      entry[col] = row[index] ?? '' // Default empty string for missing trailing cells
    })
    return entry
  })
}

/**
 * Appends a single new transaction entry to the bottom of the sheet.
 *
 * @param {Object} entry - Transaction data to append.
 * @param {string} entry.Date       - ISO date string (e.g. '2026-05-13')
 * @param {string} entry.Channel    - Account used (e.g. 'BDO', 'GCash')
 * @param {string} entry.Flow       - 'In' or 'Out'
 * @param {string} entry.Category   - Category label (e.g. 'Food', 'Utilities')
 * @param {string} entry.Purpose    - Free text description
 * @param {string} entry.Member     - Family member (e.g. 'AJ', 'Kuya', 'Shared')
 * @param {number} entry.Amount     - Positive transaction amount
 * @param {number} entry.Balance    - Running balance after this transaction (computed client-side)
 *
 * @returns {Promise<void>}
 * @throws {Error} If the API request fails.
 *
 * Note: Requires the Google Sheet to be shared as "Anyone with link can edit"
 * for the API key to have write permission without OAuth.
 */
export async function appendEntry(entry) {
  const range = `${SHEET_TAB}!A:H`
  const url   = `${BASE_URL}/values/${encodeURIComponent(range)}:append`
               + `?valueInputOption=USER_ENTERED`
               + `&insertDataOption=INSERT_ROWS`
               + `&key=${API_KEY}`

  // Convert named object back to ordered array matching column layout
  const rowValues = COLUMNS.map(col => entry[col] ?? '')

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      values: [rowValues]
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Sheets API append failed: ${error.error?.message ?? response.statusText}`)
  }
}

/**
 * Computes the running balance for a new entry based on the last known balance.
 *
 * @param {Array<Object>} entries  - Existing entries from fetchEntries()
 * @param {string}        flow     - 'In' or 'Out'
 * @param {number}        amount   - Transaction amount (positive)
 *
 * @returns {number} New running balance after applying this transaction.
 *
 * Edge case: If no prior entries exist, balance starts from the transaction amount.
 */
export function computeBalance(entries, flow, amount) {
  const lastEntry   = entries[entries.length - 1]
  const lastBalance = lastEntry ? parseFloat(lastEntry.Balance) || 0 : 0

  return flow === 'In'
    ? lastBalance + amount
    : lastBalance - amount
}
