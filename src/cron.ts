import fs from 'node:fs'
import path from 'node:path'
import { CronJob } from 'cron'
import { ensureDirExists, formatDate, getTodayFormat, isDateFolderPassedOneMonth } from './utils.js'
import { staticDir } from './constants.js'

const CRON_TIME = '0 0 * * *'
const TIMEZONE = 'Asia/Shanghai'
const context = null

export function startCronJobs() {
  // Job: create date format folder
  new CronJob(
    CRON_TIME,
    async () => {
      console.log('Job: create date format folder started')
      const folderName = getTodayFormat()
      await ensureDirExists(folderName)
      console.log(`Job: create date format folder: ${folderName}`)
    },
    () => {
      console.log('Job: create date format folder completed')
    },
    true,
    TIMEZONE,
    context,
    true,
  )

  // Job: delete old folders
  new CronJob(
    CRON_TIME,
    async () => {
      console.log('Job: delete old folders started')
      // Get all
      const folders = fs.readdirSync(staticDir)
      for (const folder of folders) {
        const folderPath = path.join(staticDir, folder)
        // Only process if it's a directory
        if (!fs.statSync(folderPath).isDirectory()) {
          continue
        }
        // Check if the folder is passed one month
        if (isDateFolderPassedOneMonth(folder)) {
          console.log(`Job: delete old folder: ${folder}`)
          fs.rmSync(folderPath, { recursive: true })
        }
      }
    },
    () => {
      console.log('Job: delete old folders completed')
    },
    true,
    TIMEZONE,
    context,
    true,
  )
}