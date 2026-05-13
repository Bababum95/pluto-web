import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

import 'dayjs/locale/en'
import 'dayjs/locale/ru'

// Extend dayjs with required plugins
dayjs.extend(isoWeek)

export default dayjs
