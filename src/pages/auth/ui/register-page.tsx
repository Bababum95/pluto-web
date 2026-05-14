import { Link, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { AuthCard, useAuth } from '@/features/auth'
import { FALLBACK_URL } from '@/shared/config/auth-routes'
import { FormField } from '@/shared/ui/forms/form-field'
import { PasswordFormField } from '@/shared/ui/forms/password-form-field'
import { Button } from '@/shared/ui/button'
import { useTranslation } from '@/shared/lib/i18n'

export type RegisterPageProps = {
  redirect?: string
}

export function RegisterPage({ redirect }: RegisterPageProps) {
  const { register, loading } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()

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
      const { confirmPassword: _confirmPassword, ...registerPayload } = value
      await register(registerPayload)
      await router.invalidate()
      router.navigate({
        to: redirect || FALLBACK_URL,
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
