import { createFileRoute } from '@tanstack/react-router'

import { CreateCategoryPage } from '@/pages/categories'

export const Route = createFileRoute('/_app/categories/create')({
  component: CreateCategoryPage,
})
