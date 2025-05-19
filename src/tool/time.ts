export const isoToLocalFormat = (isoString: string, timeZone = 'Asia/Shanghai') => {
  const date = new Date(isoString)

  // 日期格式化保持不变
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })

  // 新时间格式化（提取数字值）
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })

  // 使用 formatToParts 获取时间组件
  const timeParts = timeFormatter.formatToParts(date)
  let hour = '',
    minute = ''

  timeParts.forEach((part) => {
    if (part.type === 'hour') hour = parseInt(part.value).toString()
    if (part.type === 'minute') minute = part.value.padStart(2, '0')
  })

  return {
    start: Math.floor(date.getTime() / 1000),
    timestamp: `${dateFormatter.format(date)} ${hour}:${minute}`,
  }
}

export const secondsToTime = (seconds: number) => {
  const date = new Date(seconds * 1000).toISOString()
  const local = isoToLocalFormat(date)
  return local.timestamp
}
