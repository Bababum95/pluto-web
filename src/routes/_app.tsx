import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { Header } from "@/components/Header";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
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
