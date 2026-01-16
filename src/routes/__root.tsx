import { useEffect } from "react";
import { Outlet, createRootRouteWithContext, useRouterState } from "@tanstack/react-router";

import { Devtools } from "@/components/Devtools";
import type { AuthContextType } from "@/features/auth";

const showDevtools =
  import.meta.env.DEV && import.meta.env.SHOW_DEVTOOLS != "false";

type RouterContext = {
  auth: AuthContextType;
};

function RootComponent() {
  const location = useRouterState({ select: (s) => s.location });

  // Reset scroll position on route change (especially important for iOS)
  useEffect(() => {
    // Reset scroll for all possible scroll containers
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also reset scroll for main element if it exists
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTop = 0;
    }
  }, [location.pathname]);

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
