import { createFileRoute } from "@tanstack/react-router";
import { redirect, useRouter, useRouterState } from "@tanstack/react-router";
import { z } from "zod";

import { AuthCard, useAuth } from "@/features/auth";
import { sleep } from "@/lib/utils";
import { useState } from "react";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const fallback = "/dashboard" as const;

export const Route = createFileRoute("/_auth/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback });
    }
  },
  component: LoginComponent,
});

function LoginComponent() {
  const auth = useAuth();
  const router = useRouter();
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const navigate = Route.useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const search = Route.useSearch();

  const onFormSubmit = async () => {
    setIsSubmitting(true);
    try {
      await auth.login(email);

      await router.invalidate();

      // This is just a hack being used to wait for the auth state to update
      // in a real app, you'd want to use a more robust solution
      await sleep(1);

      await navigate({ to: search.redirect || fallback });
    } catch (error) {
      console.error("Error logging in: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Spinner className="size-12" />;

  return (
    <AuthCard
      title="Login"
      description="Enter your email below to login to your account"
    >
      <div className="grid gap-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          className="w-full"
          onClick={onFormSubmit}
          isLoading={isSubmitting}
        >
          Sign in
        </Button>
      </div>
    </AuthCard>
  );
}
