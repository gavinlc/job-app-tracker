import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '../components/SignUp'

export const Route = createFileRoute('/sign-up')({
  head: () => ({
    meta: [
      {
        title: 'Sign Up - Job Application Tracker',
      },
    ],
  }),
  component: SignUp,
})

