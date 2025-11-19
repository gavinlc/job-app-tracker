import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/handler/password-reset')({
  beforeLoad: ({ search }) => {
    // Extract the code from the search params and redirect to reset-password page
    const code = (search as any)?.code
    if (code) {
      throw redirect({
        to: '/reset-password',
        search: { code },
      })
    } else {
      // If no code, redirect to forgot-password
      throw redirect({
        to: '/forgot-password',
      })
    }
  },
})

