import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { marked } from 'marked'
import { fileTypeFromBuffer } from 'file-type'

const staticDir = './static'
// Create static directory if it doesn't exist
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true })
}

const app = new Hono()

// Add GitHub markdown CSS
const githubMarkdownCSS = `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css">
<style>
  .markdown-body {
    box-sizing: border-box;
    min-width: 200px;
    max-width: 980px;
    margin: 0 auto;
    padding: 45px;
  }
  @media (max-width: 767px) {
    .markdown-body {
      padding: 15px;
    }
  }
</style>
`
// Render docs/api.md
app.get('/', (c) => {
  const content = fs.readFileSync('./docs/api.md', 'utf-8')
  const htmlContent = marked(content)

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>API Documentation</title>
        ${githubMarkdownCSS}
      </head>
      <body>
        <article class="markdown-body">
          ${htmlContent}
        </article>
      </body>
    </html>
  `

  return c.html(html)
})

// Static file serving
app.use('/file/*',  serveStatic({
  root: './static',
  rewriteRequestPath: (path) => {
    return path.replace(/^\/file/, '')
  },
  onFound: (path, c) => {
    console.log('file serve found: ', path)
  },
  onNotFound(path, c) {
    console.log('file serve not found: ', path)
  },
}))

// Upload file using FormData
app.post('/upload', async (c) => {
  const contentType = c.req.header('Content-Type') || ''
  
  let buffer: ArrayBuffer
  let filename: string
  let extension: string | undefined
  
  // FormData
  if (contentType.includes('multipart/form-data')) {
    const body = await c.req.formData()
    const file = body.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    buffer = await file.arrayBuffer()
    extension = file.name.split('.').pop()!
  }
  // JSON
  else if (contentType.includes('application/json')) {
    const { base64, filename: fname } = await c.req.json()
    
    if (!base64) {
      return c.json({ error: 'Base64 string and filename are required' }, 400)
    }
    
    buffer = Buffer.from(base64, 'base64')
    if (fname) {
      extension = fname.split('.').pop()!
    } else {
      // Try to get extension from buffer
      extension = (await fileTypeFromBuffer(buffer))?.ext
    }

    if (!extension) {
      return c.json({ error: 'Cannot get filetype from base64' }, 400)
    }
  }
  // Unsupported Content-Type
  else {
    return c.json({ error: 'Unsupported Content-Type. Use multipart/form-data or application/json' }, 400)
  }


  filename = getUUID() + '.' + extension
  const filepath = path.join(staticDir, getTodayFormat(), filename)
  await ensureDirExists(path.dirname(filepath))
  fs.writeFileSync(filepath, Buffer.from(buffer))

  return c.json({ 
    success: true, 
    filename,
    url: `/file/${filename}`
  })
})

// Download file - supports both /download/:filepath and /download?filepath=xx/xx/1.html
app.use('/download/*', async (c) => {
  const filepath = c.req.path.replace(/^\/download/, '') || c.req.query('filepath')
  if (!filepath) {
    return c.json({ error: 'Filepath is required' }, 400)
  }
  
  const fullPath = path.resolve(path.join(staticDir, filepath))
  if (!fs.existsSync(fullPath)) {
    return c.json({ error: 'File not found' }, 404)
  }

  const file = fs.readFileSync(fullPath)
  const downloadName = path.basename(fullPath)
  return new Response(file, {
    headers: {
      'Content-Disposition': `attachment; filename="${downloadName}"`,
      'Content-Type': 'application/octet-stream',
    },
  })
})

const port = Number(process.env.PORT) || 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})


// YYYY-MM-DD
function getTodayFormat(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getUUID(): string {
  return crypto.randomUUID()
}

async function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }
}
