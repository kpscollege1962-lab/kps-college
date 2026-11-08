const FRIDAY = /fri/i

const to12h = (value) => {
  if (!value) return null
  const [h, m] = String(value).split(':')
  const hours = Number(h)
  if (Number.isNaN(hours) || m === undefined) return null
  return `${hours % 12 || 12}:${m.slice(0, 2)} ${hours >= 12 ? 'PM' : 'AM'}`
}

const windowOf = (timing) => {
  const from = to12h(timing.start_time)
  const to = to12h(timing.end_time)
  return from && to ? `${from} to ${to}` : null
}

const labelOf = (timing) =>
  String(timing.day_type ?? timing.schedule_type ?? timing.timing_type ?? timing.type ?? timing.name ?? timing.label ?? '')

export const formatTimings = (timings = []) => {
  const rows = timings
    .map((t) => ({ text: windowOf(t), friday: FRIDAY.test(labelOf(t)) }))
    .filter((r) => r.text)
  if (!rows.length) return null

  const normal = rows.find((r) => !r.friday)
  const friday = rows.find((r) => r.friday)
  const main = (normal ?? friday).text

  return normal && friday && friday.text !== main ? `${main} (Fri ${friday.text})` : main
}