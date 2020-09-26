# next-sitemap

Create a basic sitemap for Next.js's prerendered routes.

## How to use

This package will read the `prerender-manifest.json` generated by Next.js's
build process, and generate a `sitemap.xml` in the `public` folder.

To run the sitemap generation automatically after build, place a `postbuild`
script in `package.json`:

```json
  "scripts": {
    "build": "next build",
    "postbuild": "create-sitemap"
  }
```

### CLI

Running the sitemap generator via CLI requires passing the site's base url
either via `baseUrl` argument, or via `BASE_URL` environment variable:

```bash
create-sitemap --baseUrl https://example.com
```

or

```bash
BASE_URL=https://example.com create-sitemap
```

#### CLI Options

- `--baseUrl`, `-b`: the site's fully qualified base url
- `--exclude`, `-e`: json array of routes to exclude, e.g.
  `--exclude '["success.md"]'`
- `--format`, `-f`: format the sitemap xml with `prettier`
- `--gzip`, `-z`: compress the sitemap with `gzip`
- `--robots`, `-r`: path to robots.txt, or `true` to use default template

### Node

```js
import { generate } from '@stefanprobst/next-sitemap'

await generate({ baseUrl: 'https://example.com' })
```

#### Options

```ts
type Options = {
  baseUrl: string
  filter: (route: string) => boolean
  shouldFormat?: boolean
  shouldGzip?: boolean
  robots?: boolean | string
}
```

## Current limitations

- setting a custom `distDir` in `next.config.js` is not supported. the default
  `.next` is assumed.
- sitemap indexes are not supported.
- only one sitemap (i.e. max 50.000 routes) is supported.
- `<priority>`, `<lastmod>`, `<changefreq>` are not supported.
- adding locale alternates is not supported. place `<link rel="alternate">`
  elements in the `<head>` instead.
