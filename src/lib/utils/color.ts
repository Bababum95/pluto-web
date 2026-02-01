/**
 * HSB color representation (0-360, 0-100, 0-100, 0-1).
 * Used internally for ColorArea and ColorSlider.
 */
export type HSB = {
  h: number
  s: number
  b: number
  a: number
}

/**
 * Parses a color string (hex, hsl, rgb) into HSB.
 * Throws on invalid input; returns default fallback for empty/invalid.
 */
export function parseColor(value: string): HSB {
  const trimmed = value.trim()
  if (!trimmed) return { h: 0, s: 0, b: 100, a: 1 }

  const hexMatch = trimmed.match(
    /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
  )
  if (hexMatch) return hexToHsb(hexMatch[1])

  const hslMatch = trimmed.match(
    /hsla?\(\s*([-\d.]+)\s*,\s*([-\d.]+)%\s*,\s*([-\d.]+)%\s*(?:,\s*([-\d.]+)\s*)?\)/
  )
  if (hslMatch) {
    const h = clamp(Number(hslMatch[1]), 0, 360)
    const s = clamp(Number(hslMatch[2]), 0, 100)
    const l = clamp(Number(hslMatch[3]), 0, 100)
    const a = hslMatch[4] != null ? clamp(Number(hslMatch[4]), 0, 1) : 1
    return hslToHsb({ h, s, l, a })
  }

  const rgbMatch = trimmed.match(
    /rgba?\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*(?:,\s*([-\d.]+)\s*)?\)/
  )
  if (rgbMatch) {
    const r = clamp(Number(rgbMatch[1]) / 255, 0, 1)
    const g = clamp(Number(rgbMatch[2]) / 255, 0, 1)
    const b = clamp(Number(rgbMatch[3]) / 255, 0, 1)
    const a = rgbMatch[4] != null ? clamp(Number(rgbMatch[4]), 0, 1) : 1
    return rgbToHsb({ r, g, b, a })
  }

  return { h: 0, s: 0, b: 100, a: 1 }
}

function hexToHsb(hex: string): HSB {
  let r: number, g: number, b: number, a: number
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255
    g = parseInt(hex[1] + hex[1], 16) / 255
    b = parseInt(hex[2] + hex[2], 16) / 255
    a = 1
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16) / 255
    g = parseInt(hex.slice(2, 4), 16) / 255
    b = parseInt(hex.slice(4, 6), 16) / 255
    a = 1
  } else {
    r = parseInt(hex.slice(0, 2), 16) / 255
    g = parseInt(hex.slice(2, 4), 16) / 255
    b = parseInt(hex.slice(4, 6), 16) / 255
    a = parseInt(hex.slice(6, 8), 16) / 255
  }
  return rgbToHsb({ r, g, b, a })
}

function hslToHsb({
  h,
  s: sL,
  l,
  a,
}: {
  h: number
  s: number
  l: number
  a: number
}): HSB {
  const sL01 = sL / 100
  const l01 = l / 100
  let b: number
  let s: number
  if (l01 >= 1) {
    b = 100
    s = 0
  } else if (l01 <= 0) {
    b = 0
    s = 0
  } else {
    b = l01 + sL01 * Math.min(l01, 1 - l01)
    b = b * 100
    s = b === 0 ? 0 : 200 * (1 - (l01 * 100) / b)
  }
  return { h, s: clamp(s, 0, 100), b: clamp(b, 0, 100), a }
}

function rgbToHsb({
  r,
  g,
  b,
  a,
}: {
  r: number
  g: number
  b: number
  a: number
}): HSB {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h = h * 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : (d / max) * 100
  const bVal = max * 100
  return { h, s, b: bVal, a }
}

/**
 * Converts HSB to hex string (e.g. "#ff0000" or "#ff0000ff" with alpha).
 */
export function hsbToHex(hsb: HSB, includeAlpha = false): string {
  const { r, g, b, a } = hsbToRgb(hsb)
  const rr = Math.round(r * 255)
    .toString(16)
    .padStart(2, '0')
  const gg = Math.round(g * 255)
    .toString(16)
    .padStart(2, '0')
  const bb = Math.round(b * 255)
    .toString(16)
    .padStart(2, '0')
  if (includeAlpha && hsb.a < 1) {
    const aa = Math.round(a * 255)
      .toString(16)
      .padStart(2, '0')
    return `#${rr}${gg}${bb}${aa}`
  }
  return `#${rr}${gg}${bb}`
}

function hsbToRgb(hsb: HSB): { r: number; g: number; b: number; a: number } {
  const { h, s, b, a } = hsb
  const s01 = s / 100
  const b01 = b / 100
  const c = b01 * s01
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = b01 - c
  let r = 0,
    g = 0,
    bl = 0
  if (h >= 0 && h < 60) {
    r = c
    g = x
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
  } else if (h >= 120 && h < 180) {
    g = c
    bl = x
  } else if (h >= 180 && h < 240) {
    g = x
    bl = c
  } else if (h >= 240 && h < 300) {
    r = x
    bl = c
  } else {
    r = c
    bl = x
  }
  return { r: r + m, g: g + m, b: bl + m, a }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}
