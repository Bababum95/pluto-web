import { createFileRoute } from '@tanstack/react-router'
import { redirect, useRouterState, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { AuthCard, useAuth, FALLBACK_URL } from '@/features/auth'
import { FormField } from '@/components/forms/form-field'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n'
import { sleep } from '@/lib/utils'

export const Route = createFileRoute('/_auth/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || FALLBACK_URL })
    }
  },
  component: LoginComponent,
})

function LoginComponent() {
  const auth = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const form = useForm({
    validators: {
      onSubmit: z.object({
        email: z.email(),
      }),
    },
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await auth.login(value.email)

        await router.invalidate()

        // This is just a hack being used to wait for the auth state to update
        // in a real app, you'd want to use a more robust solution
        await sleep(1)

        await navigate({
          to: search.redirect || FALLBACK_URL,
          viewTransition: { types: ['slide-left'] },
        })
      } catch (error) {
        console.error('Error logging in: ', error)
      }
    },
  })
  const isLoading = useRouterState({ select: (s) => s.isLoading })

  if (isLoading) return <Spinner className="size-12" />

  return (
    <AuthCard title={t('auth.login')} description={t('auth.description')}>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="email"
          children={(field) => (
            <FormField
              field={field}
              label="Email"
              inputProps={{
                type: 'email',
                placeholder: 'my@email.com',
              }}
            />
          )}
        />
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              className="mt-auto w-full"
              disabled={!canSubmit}
              isLoading={isSubmitting}
            >
              {t('auth.signIn')}
            </Button>
          )}
        />
      </form>
    </AuthCard>
  )
}
