import type { Theme } from "./types";

export function captionUnit(cW: number, cH: number) {
  return Math.min(cW, cH);
}

export function defaultLabelFontSize(cW: number, cH: number) {
  return captionUnit(cW, cH) * 0.028;
}

export function defaultHeadlineFontSize(cW: number, cH: number) {
  return captionUnit(cW, cH) * 0.092;
}

export function defaultLabelColor(theme: Theme) {
  return theme.accent;
}

export function defaultHeadlineColor(theme: Theme, inverted?: boolean) {
  return inverted ? theme.fgAlt : theme.fg;
}
