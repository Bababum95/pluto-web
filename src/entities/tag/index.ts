export { tagApi } from './model/api'
export { tagRepository } from './local/repository'
export {
  enqueueCreateTag,
  enqueueUpdateTag,
  enqueueDeleteTag,
} from './local/outbox-helpers'
export {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  setTags,
  addTag,
  removeTag,
  default as tagReducer,
} from './model/tag.slice'
export { selectTags, selectTagsStatus, selectTagById } from './model/selectors'
export type {
  TagDto,
  TagFormValues,
  CreateTagDto,
  UpdateTagDto,
} from './model/types'
