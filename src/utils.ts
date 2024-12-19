import fs from 'node:fs/promises'
import path from 'node:path'
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
  if (!(await fs.access(dir).then(() => true).catch(() => false))) {
    await fs.mkdir(dir, { recursive: true })
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

// return file count and size
export async function statsFolder(folderPath: string): Promise<{ count: number, size: string }> {
  const realPath = await fs.realpath(folderPath)
  
  async function calculateStats(dirPath: string): Promise<{ size: number, count: number }> {
    let totalSize = 0
    let fileCount = 0
    const items = await fs.readdir(dirPath)
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item)
      const stats = await fs.stat(itemPath)
      
      if (stats.isDirectory()) {
        const subStats = await calculateStats(itemPath)
        totalSize += subStats.size
        fileCount += subStats.count
      } else {
        totalSize += stats.size
        fileCount += 1
      }
    }
    
    return { size: totalSize, count: fileCount }
  }

  const stats = await calculateStats(realPath)
  const megabytes = (stats.size / (1024 * 1024)).toFixed(2)
  return {
    count: stats.count,
    size: `${megabytes}MB`
  }
}

export async function getSubFolders(folder: string): Promise<string[]> {
  const files = await fs.readdir(folder)
  const folders = []
  for (const file of files) {
    const stat = await fs.stat(path.join(folder, file))
    if (stat.isDirectory()) {
      folders.push(file)
    }
  }
  return folders
}
