import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { AuthCard, useAuth, FALLBACK_URL } from '@/features/auth'
import { FormField } from '@/components/forms/form-field'
import { PasswordFormField } from '@/components/forms/password-form-field'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

export const Route = createFileRoute('/_auth/register')({
  component: RegisterComponent,
})

function RegisterComponent() {
  const { register, loading } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const search = Route.useSearch()

  const form = useForm({
    validators: {
      onSubmit: z
        .object({
          name: z.string().min(1),
          email: z.email(),
          password: z.string().min(6),
          confirmPassword: z.string().min(6),
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
      register(value)
      await router.invalidate()
      router.navigate({
        to: search.redirect || FALLBACK_URL,
        viewTransition: { types: ['slide-right'] },
      })
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
              disabled={!canSubmit || loading}
              isLoading={isSubmitting || loading}
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
