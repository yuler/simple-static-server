import fs from 'node:fs'
import path from 'node:path'
import { CronJob } from 'cron'
import { ensureDirExists, getTomorrowFormat, isDateFolderPassedOneMonth } from './utils.js'
import { staticDir } from './constants.js'

const CRON_TIME = '0 0 * * *'
const TIMEZONE = 'Asia/Shanghai'
const context = null

export function startCronJobs() {
  // Job: create date format folder
  new CronJob(
    CRON_TIME,
    async () => {
      console.log('Job [create folder]: started')
      const folderName = path.join(staticDir, getTomorrowFormat())
      await ensureDirExists(folderName)
      console.log(`Job [create folder]: ${folderName}`)
      console.log('Job [create folder]: completed')
    },
    () => {},
    true,
    TIMEZONE,
    context,
    true,
  )

  // Job: delete old folders
  new CronJob(
    CRON_TIME,
    async () => {
      console.log('Job [delete folder]: started')
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
          console.log(`Job [delete folder]: ${folder}`)
          fs.rmSync(folderPath, { recursive: true })
        }
      }
      console.log('Job [delete folder]: completed')
    },
    () => {},
    true,
    TIMEZONE,
    context,
    true,
  )
}