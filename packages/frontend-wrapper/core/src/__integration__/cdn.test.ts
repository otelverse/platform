import path from 'path'
import fs from 'fs'
import http from 'http'
import { AddressInfo } from 'net'

describe('CDN bundle', () => {
  const bundlePath = path.resolve(__dirname, '../../dist/otelverse-web.iife.js')
  let server: http.Server
  let port: number
  let pageContent: string

  beforeAll(() => {
    if (!fs.existsSync(bundlePath)) {
      throw new Error(
        `CDN bundle not found at ${bundlePath}. Run 'pnpm build:bundle' first.`,
      )
    }

    const bundle = fs.readFileSync(bundlePath, 'utf-8')

    pageContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body>
        <div id="result"></div>
        <script src="bundle.js"></script>
        <script>
          try {
            if (typeof OtelverseWeb !== 'undefined' && typeof OtelverseWeb.initOtel === 'function') {
              document.getElementById('result').textContent = 'OtelverseWeb loaded: ' + OtelverseWeb.initOtel().shutdown.name;
            } else {
              document.getElementById('result').textContent = 'FAIL: OtelverseWeb not found';
            }
          } catch (e) {
            document.getElementById('result').textContent = 'FAIL: ' + e.message;
          }
        </script>
      </body>
      </html>
    `

    server = http.createServer((req, res) => {
      if (req.url === '/bundle.js') {
        res.writeHead(200, { 'Content-Type': 'application/javascript' })
        res.end(bundle)
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(pageContent)
      }
    })

    return new Promise<void>((resolve) => {
      server.listen(0, () => {
        port = (server.address() as AddressInfo).port
        resolve()
      })
    })
  })

  afterAll(() => {
    server?.close()
  })

  it('exposes OtelverseWeb global with initOtel function', async () => {
    let puppeteer: any
    try {
      puppeteer = require('puppeteer')
    } catch {
      console.log('Puppeteer not available - skipping CDN test')
      // Verify bundle file exists and has expected content
      expect(fs.existsSync(bundlePath)).toBe(true)
      const content = fs.readFileSync(bundlePath, 'utf-8')
      expect(content).toContain('OtelverseWeb')
      expect(content).toContain('initOtel')
      return
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    try {
      const page = await browser.newPage()
      await page.goto(`http://localhost:${port}`, {
        waitUntil: 'networkidle0',
      })
      const result = await page.$eval('#result', (el: any) => el.textContent)
      expect(result).toContain('OtelverseWeb loaded')
    } finally {
      await browser.close()
    }
  }, 30000)
})
