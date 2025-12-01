import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '../components/SignIn'

export const Route = createFileRoute('/sign-in')({
  head: () => ({
    meta: [
      {
        title: 'Sign In - Job Application Tracker',
      },
    ],
  }),
  component: SignIn,
})

