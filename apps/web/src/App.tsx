import {
  OrganizationSwitcher,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from '@punchline-hq/auth/react'
import { Button } from '@punchline-hq/ui/components/button'
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { Laugh, LoaderCircle } from 'lucide-react'
import { DashboardPage } from './pages/DashboardPage'
import { EditJokePage, NewJokePage } from './pages/JokeEditorPage'
import { SharedJokePage } from './pages/SharedJokePage'

function SignedOutWelcome() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5ff] px-6 py-16">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-2xl bg-violet-600 text-white shadow-xl shadow-violet-200">
          <Laugh className="h-8 w-8" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600">
          Punchline HQ
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Your team’s jokes, under control.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-slate-600">
          Sign in to build, review, publish, and revoke mission-critical
          punchlines from your organization’s private workspace.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <SignInButton mode="modal">
            <Button size="lg">Sign in</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="lg" variant="outline">
              Create account
            </Button>
          </SignUpButton>
        </div>
      </div>
    </main>
  )
}

function WorkspaceLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f5ff] text-violet-600">
        <LoaderCircle className="h-8 w-8 animate-spin" aria-label="Loading" />
      </div>
    )
  }
  if (!isSignedIn) return <SignedOutWelcome />

  return (
    <div className="min-h-screen bg-[#f8f7fb] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="Punchline HQ dashboard"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">
              <Laugh className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-bold tracking-tight">
                Punchline HQ
              </span>
              <span className="block text-xs text-slate-500">
                Enterprise joke operations
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <OrganizationSwitcher
              hidePersonal
              appearance={{ elements: { rootBox: 'hidden sm:block' } }}
            />
            <UserButton />
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  )
}

const rootRoute = createRootRoute({ component: Outlet })
const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'workspace',
  component: WorkspaceLayout,
})
const dashboardRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/',
  component: DashboardPage,
})
const newJokeRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/jokes/new',
  component: NewJokePage,
})
const editJokeRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/jokes/$jokeId',
  component: EditJokePage,
})
const sharedJokeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/share/$shareToken',
  component: SharedJokePage,
})

const routeTree = rootRoute.addChildren([
  workspaceRoute.addChildren([dashboardRoute, newJokeRoute, editJokeRoute]),
  sharedJokeRoute,
])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />
}
