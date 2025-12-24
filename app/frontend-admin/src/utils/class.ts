export function hexToRgb(hex: string) {
  const h = hex.replace('#', '').replace('0x', '');
  const normalized = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

export function getTextColor(bgHex: string) {
  try {
    const { r, g, b } = hexToRgb(bgHex);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 160 ? '#000' : '#fff';
  } catch (e) {
    return '#fff';
  }
}