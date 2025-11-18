import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import { getRouter } from './router'

export default async function handler(req: Request) {
    const router = getRouter()
    const manifest = getRouterManifest()

    // Return empty HTML - client will render everything
    // This avoids hydration mismatches with React Query Suspense
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Job Application Tracker</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
}
