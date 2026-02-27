// src/lib/tspl.ts

export const MM_TO_DOT = 8; // 203 DPI printer

export const mm = (value: number) => value * MM_TO_DOT;

export function baseConfig(widthMm: number, heightMm: number) {
  return `
SIZE ${widthMm} mm,${heightMm} mm
GAP 2 mm,0 mm
DENSITY 8
CLS
`;
}

export function print(count: number = 1) {
  return `
PRINT ${count}
`;
}
