import { getRouter } from './router'

export default async function handler(req: Request) {
  const router = getRouter()

  // Return empty HTML - client will render everything
  // This avoids hydration mismatches with React Query Suspense
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Track and manage your job applications" />
    <meta name="theme-color" content="#3b82f6" />
    <title>Job Application Tracker</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />
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
