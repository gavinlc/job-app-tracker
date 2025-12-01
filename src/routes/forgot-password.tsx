import { createFileRoute } from '@tanstack/react-router'
import { ForgotPassword } from '../components/ForgotPassword'

export const Route = createFileRoute('/forgot-password')({
  head: () => ({
    meta: [
      {
        title: 'Forgot Password - Job Application Tracker',
      },
    ],
  }),
  component: ForgotPassword,
})

