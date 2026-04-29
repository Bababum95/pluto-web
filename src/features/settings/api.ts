import {
  settingsControllerFindOne,
  settingsControllerUpdate,
} from '@/lib/api/generated/settings/settings'

import type { SettingsDto, UpdateSettingsDto } from './types'

export const settingsApi = {
  get: (): Promise<SettingsDto> => settingsControllerFindOne(),
  update: (data: UpdateSettingsDto): Promise<SettingsDto> =>
    settingsControllerUpdate(data as never),
}
