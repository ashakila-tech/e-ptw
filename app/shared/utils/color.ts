/**
 * A simple utility to lighten or darken a hex color.
 * @param color The hex color string.
 * @param percent The percentage to lighten (positive) or darken (negative).
 */
const shadeColor = (color: string, percent: number) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = Math.round(R * (100 + percent) / 100);
  G = Math.round(G * (100 + percent) / 100);
  B = Math.round(B * (100 + percent) / 100);
  const newR = Math.min(255, R).toString(16).padStart(2, '0');
  const newG = Math.min(255, G).toString(16).padStart(2, '0');
  const newB = Math.min(255, B).toString(16).padStart(2, '0');
  return `#${newR}${newG}${newB}`;
};

export default shadeColor;