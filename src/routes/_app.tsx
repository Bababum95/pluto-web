import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-dvh">
      <Outlet />
    </div>
  );
};

export const Route = createFileRoute("/_app")({
  component: AppLayout,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
});
