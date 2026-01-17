import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <Outlet />
    </div>
  )
}
