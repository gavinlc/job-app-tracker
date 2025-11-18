import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { NotFound } from '../components/NotFound'
import '../index.css'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <>
      <HeadContent />
      <div suppressHydrationWarning>
        <Outlet />
      </div>
      <Scripts />
    </>
  ),
  notFoundComponent: () => <NotFound />,
})

