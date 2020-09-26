import { promises as fs, createWriteStream } from 'fs'
import { join } from 'path'
import { pipeline, Readable } from 'stream'
import { promisify } from 'util'
import { createGzip } from 'zlib'
import prettierPluginXml from '@prettier/plugin-xml'
import { BUILD_MANIFEST, PRERENDER_MANIFEST } from 'next/constants'
import { format } from 'prettier'
import u from 'unist-builder'
import type { Element } from 'xast'
import toXml from 'xast-util-to-xml'
import x from 'xastscript'

const DIST_DIR = join(process.cwd(), '.next')
const BUILD_MANIFEST_PATH = join(DIST_DIR, BUILD_MANIFEST)
const PRERENDER_MANIFEST_PATH = join(DIST_DIR, PRERENDER_MANIFEST)
const PUBLIC_DIR = join(process.cwd(), 'public')
const SITEMAP = 'sitemap.xml'
const SITEMAP_PATH = join(PUBLIC_DIR, SITEMAP)
const ROBOTS_PATH = join(PUBLIC_DIR, 'robots.txt')
const INTERNAL_ROUTES = new Set(['/404', '/_app', '/_error'])
const pipe = promisify(pipeline)

export type Options = {
  baseUrl: string
  filter?: (route: string) => boolean
  shouldFormat?: boolean
  shouldGzip?: boolean
  robots?: boolean | string
}

function all() {
  return true
}

async function zip(output: string, input: string) {
  const gzip = createGzip()
  const source = Readable.from(input)
  const destination = createWriteStream(output)
  await pipe(source, gzip, destination)
}

export default async function generate({
  baseUrl,
  filter = all,
  shouldFormat,
  shouldGzip,
  robots,
}: Options): Promise<void> {
  function createLink(route: string): Element {
    return x('url', [x('loc', String(new URL(route, baseUrl)))])
  }

  function createSitemap(links: Array<Element>) {
    return u('root', [
      u('instruction', { name: 'xml' }, 'version="1.0" encoding="UTF-8"'),
      x(
        'urlset',
        { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' },
        links,
      ),
    ])
  }

  function createRobotsTxt(template?: true | string) {
    return [
      template === true ? `User-agent: *` : template,
      `Sitemap: ${new URL(SITEMAP, baseUrl)}\n`,
    ].join('\n\n')
  }

  const buildManifest = JSON.parse(
    await fs.readFile(BUILD_MANIFEST_PATH, {
      encoding: 'utf-8',
    }),
  )
  const prerenderManifest = JSON.parse(
    await fs.readFile(PRERENDER_MANIFEST_PATH, {
      encoding: 'utf-8',
    }),
  )

  const dynamicRoutes = Object.keys(prerenderManifest.dynamicRoutes)
  const pages = Object.keys(buildManifest.pages)
  const prerenderedPages = Object.keys(prerenderManifest.routes)
  const staticPages = pages.filter((page) => !dynamicRoutes.includes(page))

  const routes = [...staticPages, ...prerenderedPages]
    .filter((route) => filter(route) && !INTERNAL_ROUTES.has(route))
    .sort()

  const links = routes.map(createLink)
  const sitemap = toXml(createSitemap(links))
  const formattedSitemap = shouldFormat
    ? format(sitemap, {
        parser: 'xml',
        plugins: [prettierPluginXml],
        xmlWhitespaceSensitivity: 'ignore',
      })
    : sitemap

  if (shouldGzip) {
    await zip(SITEMAP_PATH, formattedSitemap)
  } else {
    await fs.writeFile(SITEMAP_PATH, formattedSitemap, { encoding: 'utf-8' })
  }

  if (robots) {
    const robotsTxt = createRobotsTxt(robots)
    await fs.writeFile(ROBOTS_PATH, robotsTxt, { encoding: 'utf-8' })
  }
}
