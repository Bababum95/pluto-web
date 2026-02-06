import { createFileRoute, Link } from '@tanstack/react-router'
import { redirect, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { AuthCard, useAuth, FALLBACK_URL } from '@/features/auth'
import { FormField } from '@/components/forms/form-field'
import { PasswordFormField } from '@/components/forms/password-form-field'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { sleep } from '@/lib/utils'

export const Route = createFileRoute('/_auth/register')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || FALLBACK_URL })
    }
  },
  component: RegisterComponent,
})

function RegisterComponent() {
  const auth = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const form = useForm({
    validators: {
      onSubmit: z
        .object({
          name: z.string().min(1),
          email: z.email(),
          password: z.string().min(8),
          confirmPassword: z.string().min(8),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        }),
    },
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await auth.register(value)

        await router.invalidate()

        // This is just a hack being used to wait for the auth state to update
        // in a real app, you'd want to use a more robust solution
        await sleep(1)

        await navigate({
          to: search.redirect || FALLBACK_URL,
          viewTransition: { types: ['slide-left'] },
        })
      } catch (error) {
        console.error('Error registering: ', error)
      }
    },
  })

  return (
    <AuthCard
      title={t('auth.register')}
      description={t('auth.registerDescription')}
    >
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="name"
          children={(field) => (
            <FormField field={field} label={t('auth.name')} />
          )}
        />
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
        <form.Field
          name="password"
          children={(field) => (
            <PasswordFormField field={field} label={t('auth.password')} />
          )}
        />
        <form.Field
          name="confirmPassword"
          children={(field) => (
            <PasswordFormField
              field={field}
              label={t('auth.confirmPassword')}
            />
          )}
        />
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={!canSubmit}
              isLoading={isSubmitting}
            >
              {t('auth.signUp')}
            </Button>
          )}
        />
      </form>
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">{t('auth.haveAccount')} </span>
        <Link
          to="/login"
          className="text-primary underline-offset-4 hover:underline font-medium"
          viewTransition={{ types: ['slide-right'] }}
        >
          {t('auth.signIn')}
        </Link>
      </div>
    </AuthCard>
  )
}
