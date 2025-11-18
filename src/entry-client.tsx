import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { getRouter } from './router'

const router = getRouter()
const queryClient = router.options.context!.queryClient

// Use createRoot instead of hydrateRoot since we're not doing SSR
createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>
)

