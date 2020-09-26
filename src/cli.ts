#!/usr/bin/env node

import { promises as fs } from 'fs'
import parseArgs from 'mri'
import generate from '.'

const log = {
  success(message: string) {
    console.info('✅', message)
  },
  error(message: string) {
    console.error('⛔', message)
  },
}

function showHelpMessage() {
  console.log(
    [
      'Usage: create-sitemap --baseUrl [URL]\n',
      'Options:\n',
      "  -b, --baseUrl\the site's fully qualified base url (can also be provided via `BASE_URL` environment variable)",
      '  -e, --exclude\tjson array of routes to exclude (optional)',
      '  -f, --format\tformat the sitemap xml with `prettier` (optional)',
      '  -z, --gzip\tcompress the sitemap with `gzip` (optional)',
      '  -r, --robots\tpath to robots.txt, or `true` to use default template (optional)',
      '  -h, --help\tshow this help message\n',
    ].join('\n'),
  )
}

function getOptions() {
  const args = parseArgs(process.argv.slice(2), {
    alias: {
      b: 'baseUrl',
      e: 'exclude',
      f: 'format',
      z: 'gzip',
      r: 'robots',
      h: 'help',
    },
  })
  return {
    baseUrl: args.baseUrl || process.env.BASE_URL,
    exclude: args.exclude,
    shouldFormat: args.format,
    shouldGzip: args.gzip,
    robots: args.robots,
    help: args.help,
  }
}

async function run() {
  const {
    baseUrl,
    exclude,
    shouldFormat,
    shouldGzip,
    robots,
    help,
  } = getOptions()

  if (help) {
    showHelpMessage()
    return Promise.resolve()
  }

  if (!baseUrl) {
    log.error('Please specify a baseUrl.')
    showHelpMessage()
    return Promise.resolve()
  }

  let filter
  if (exclude) {
    try {
      const routes = JSON.parse(exclude)
      if (!Array.isArray(routes)) {
        log.error(
          'Please specify an array of paths to exclude, e.g. `--exclude \'["success.md"]\'`.',
        )
        showHelpMessage()
        return Promise.resolve()
      }
      filter = (route: string) => !routes.includes(route)
    } catch (error) {
      log.error('Could not parse exclude option.')
      return Promise.resolve()
    }
  }

  let template = robots
  if (typeof robots === 'string') {
    template = await fs.readFile(robots, { encoding: 'utf-8' })
  }

  try {
    await generate({
      baseUrl,
      filter,
      shouldFormat,
      shouldGzip,
      robots: template,
    })
    log.success('Successfully generated sitemap.')
  } catch (error) {
    log.error(error)
  }
}

run().catch(log.error)
