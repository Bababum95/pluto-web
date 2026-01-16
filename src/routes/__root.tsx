import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { Devtools } from "@/components/Devtools";
import type { AuthContextType } from "@/features/auth";

const showDevtools =
  import.meta.env.DEV && import.meta.env.SHOW_DEVTOOLS != "false";

type RouterContext = {
  auth: AuthContextType;
};

function RootComponent() {
  return (
    <>
      <Outlet />
      {showDevtools && <Devtools />}
    </>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
