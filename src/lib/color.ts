import type { BgStyle, Slide, Theme } from "./types";

export function shade(hex: string, percent: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c.length === 3 ? c.split("").map((x) => x + x).join("") : c, 16);
  if (!Number.isFinite(num)) return hex;
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const amt = Math.round((255 * percent) / 100);
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function themeBackground(theme: Theme, inverted?: boolean): string {
  const base = inverted ? theme.bgAlt : theme.bg;
  return `linear-gradient(160deg, ${base} 0%, ${shade(base, -6)} 100%)`;
}

function colorGradient(color: string, lighter = false): string {
  return `linear-gradient(160deg, ${color} 0%, ${shade(color, lighter ? 8 : -10)} 100%)`;
}

export function effectiveBgStyle(slide: Slide): BgStyle {
  if (slide.bgStyle) return slide.bgStyle;
  return slide.bgColor ? "solid" : "theme";
}

export function resolveSlideBackground(
  slide: Slide,
  theme: Theme,
): { background: string; blobColor: string; useThemeBlobs: boolean } {
  const inverted = !!slide.inverted;
  const mode = effectiveBgStyle(slide);

  if (mode === "theme" || !slide.bgColor) {
    return {
      background: themeBackground(theme, inverted),
      blobColor: theme.accent,
      useThemeBlobs: true,
    };
  }

  const color = slide.bgColor;
  if (mode === "solid") {
    return {
      background: color,
      blobColor: color,
      useThemeBlobs: false,
    };
  }

  return {
    background: colorGradient(color, inverted),
    blobColor: color,
    useThemeBlobs: false,
  };
}
