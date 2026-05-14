import type { RootState } from '@/app/store'

export const selectTags = (state: RootState) => state.tag.tags
export const selectTagsStatus = (state: RootState) => state.tag.status

export const selectTagById = (id: string) => (state: RootState) =>
  state.tag.tags.find((t) => t.id === id)
