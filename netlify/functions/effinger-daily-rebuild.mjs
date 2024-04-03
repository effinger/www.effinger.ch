/*
 * Execution logs: https://app.netlify.com/sites/effinger/logs/functions/effinger-daily-rebuild
 * Netlify function docs: https://docs.netlify.com/functions/scheduled-functions/
 */

import fetch from 'node-fetch'

const BUILD_WEBHOOK = 'https://api.netlify.com/build_hooks/57f05f05d6865d2f243241ab'

export default async (_request, _context) => {
  return await fetch(BUILD_WEBHOOK, {method: 'POST'}).then(
      (response) => {
        console.log('Build hook successful:', response)
        return new Response("ok")
      },
      (...error) => {
        console.error('Build hook rejected:', ...error)
        return {
          statusCode: 500,
        }
      }
  )
}
