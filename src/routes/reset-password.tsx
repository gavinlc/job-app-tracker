import { createFileRoute } from '@tanstack/react-router'
import { ResetPassword } from '../components/ResetPassword'

export const Route = createFileRoute('/reset-password')({
  head: () => ({
    meta: [
      {
        title: 'Reset Password - Job Application Tracker',
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: (search.code as string) || undefined,
    }
  },
  component: ResetPassword,
})

