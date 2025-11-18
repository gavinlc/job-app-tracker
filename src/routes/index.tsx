import { createFileRoute } from '@tanstack/react-router'
import App from '../App'

export const Route = createFileRoute('/')({
  // Disable SSR to avoid hydration mismatches with React Query Suspense
  ssr: false,
  component: App,
})

