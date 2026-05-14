import { createFileRoute } from '@tanstack/react-router'

import { EditCategoryPage } from '@/pages/categories'

export const Route = createFileRoute('/_app/categories/$categoryId')({
  component: EditCategoryRoute,
})

function EditCategoryRoute() {
  const { categoryId } = Route.useParams()
  return <EditCategoryPage categoryId={categoryId} />
}
