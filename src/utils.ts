import fs from 'node:fs'
import crypto from 'node:crypto'

// YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayFormat(): string {
  const date = new Date()
  return formatDate(date)
}

export function getUUID(): string {
  return crypto.randomUUID()
}

export async function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }
}

// YYYY-MM-DD
export function isDateFolderPassedOneMonth(folder: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(folder)) {
    console.warn(`Invalid folder name: ${folder}`)
    return false
  }

  const date = new Date(folder)
  const aMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  return date < aMonthAgo
}
