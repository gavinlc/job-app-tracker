import { createFileRoute } from '@tanstack/react-router'
import { ResetPassword } from '../components/ResetPassword'

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: (search.code as string) || undefined,
    }
  },
  component: ResetPassword,
})

