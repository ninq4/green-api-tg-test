const MAX_DIGITS = 15

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, MAX_DIGITS)
  return digits.startsWith('89') ? `7${digits.slice(1)}` : digits
}

export function formatPhone(digits: string) {
  if (!digits) return ''
  if (!digits.startsWith('7')) return `+${digits}`

  const rest = digits.slice(1, 11)
  let result = '+7'
  if (rest.length > 0) result += ` (${rest.slice(0, 3)}`
  if (rest.length > 3) result += `) ${rest.slice(3, 6)}`
  if (rest.length > 6) result += `-${rest.slice(6, 8)}`
  if (rest.length > 8) result += `-${rest.slice(8, 10)}`
  return result
}

export function maskPhoneInput(value: string, previous: string) {
  const digits = normalizePhone(value)
  const deletedSeparator = value.length < previous.length && digits === normalizePhone(previous)
  return formatPhone(deletedSeparator ? digits.slice(0, -1) : digits)
}
