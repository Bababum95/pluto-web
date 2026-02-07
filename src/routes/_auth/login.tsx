import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import {
  AuthCard,
  useAuth,
  FALLBACK_URL,
  PASSWORD_MIN_LENGTH,
} from '@/features/auth'
import { FormField } from '@/components/forms/form-field'
import { PasswordFormField } from '@/components/forms/password-form-field'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

export const Route = createFileRoute('/_auth/login')({
  component: LoginComponent,
})

function LoginComponent() {
  const { t } = useTranslation()
  const auth = useAuth()
  const router = useRouter()
  const search = Route.useSearch()
  const form = useForm({
    validators: {
      onSubmit: z.object({
        email: z.email(),
        password: z.string().min(PASSWORD_MIN_LENGTH),
      }),
    },
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await auth.login(value)
      await router.invalidate()
      router.navigate({
        to: search.redirect || FALLBACK_URL,
        viewTransition: { types: ['slide-right'] },
      })
    },
  })

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
        <form.Field
          name="password"
          children={(field) => (
            <PasswordFormField field={field} label={t('auth.password')} />
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
              {t('auth.signIn')}
            </Button>
          )}
        />
      </form>
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">{t('auth.noAccount')} </span>
        <Link
          to="/register"
          className="text-primary underline-offset-4 hover:underline font-medium"
          viewTransition={{ types: ['slide-left'] }}
        >
          {t('auth.signUp')}
        </Link>
      </div>
    </AuthCard>
  )
}
