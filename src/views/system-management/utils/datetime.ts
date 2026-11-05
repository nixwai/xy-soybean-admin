import dayjs from 'dayjs';

/** 后台统一的时间展示格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** 将后端 ISO 时间格式化为本地可读文本，空值或非法值返回占位符。 */
export function formatDateTime(value?: string | null) {
  if (!value) return '-';

  const time = dayjs(value);

  return time.isValid() ? time.format(DATETIME_FORMAT) : value;
}
