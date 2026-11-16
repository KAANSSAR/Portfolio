// The neon accents were picked for a near-black background. On the light
// theme they wash out, so each one maps to a deeper shade of the same hue.
const LIGHT: Record<string, string> = {
  '#FF6B6B': '#D33A3A',
  '#4ECDC4': '#13877F',
  '#FFE66D': '#A97F00',
  '#A78BFA': '#6A4CD1',
  '#FF8C42': '#C85512',
  '#5FD068': '#23903A',
  '#FF5DA2': '#C72A6F',
  '#F5C518': '#A97F00',
};

export function accent(color: string, isDark: boolean): string {
  if (isDark) return color;
  return LIGHT[color.toUpperCase()] ?? color;
}
