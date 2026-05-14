import { useState } from 'react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { FormField } from '@/shared/ui/forms/form-field'
import { useAppDispatch } from '@/app/store'
import { createTag } from '@/entities/tag'
import type { TagDto } from '@/entities/tag'
import { MAX_TAG_NAME_LENGTH } from '../constants'

const MAX_LENGTH = MAX_TAG_NAME_LENGTH

type CreateTagDialogProps = {
  onSuccess?: (tag: TagDto) => void
}

export function CreateTagDialog({ onSuccess }: CreateTagDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const dispatch = useAppDispatch()
  const form = useForm({
    validators: {
      onSubmit: z.object({
        name: z
          .string()
          .min(1, { message: t('forms.validation.required') })
          .max(20, {
            message: t('forms.validation.maxLength', { maxLength: MAX_LENGTH }),
          }),
      }),
    },
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      const tag = await dispatch(createTag(value)).unwrap()
      onSuccess?.(tag)
      setOpen(false)
      form.reset()
    },
  })

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs" className="w-fit">
          <HugeiconsIcon icon={PlusSignIcon} size={14} />
          {t('tags.create.add')}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-sm"
        aria-describedby={undefined}
        variant="liquid"
      >
        <form
          className="grid gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('tags.create.title')}</DialogTitle>
          </DialogHeader>
          <form.Field
            name="name"
            children={(field) => (
              <FormField
                field={field}
                inputProps={{
                  placeholder: t('tags.create.placeholder'),
                  autoFocus: true,
                  autoComplete: 'off',
                  maxLength: MAX_LENGTH,
                }}
              />
            )}
          />
          <DialogFooter className="flex-row justify-end" showCloseButton={true}>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!canSubmit}
                  isLoading={isSubmitting}
                >
                  {t('common.actions.save')}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
