import {
  CANVAS,
  IPAD_RATIO,
  MK_RATIO,
  ipadW,
  phoneW,
  phoneWSmall,
  tabletLW,
  tabletPW,
} from "./constants";
import { nid } from "./defaults";
import type {
  Device,
  DeviceElement,
  ElementTransform,
  Orientation,
  Slide,
} from "./types";

export const DEVICE_ELEMENT_PREFIX = "device:";
export const MAX_DEVICES_PER_SLIDE = 3;

export type DeviceElementId = `device:${string}`;

export function isDeviceElementId(id: string | null | undefined): id is DeviceElementId {
  return typeof id === "string" && id.startsWith(DEVICE_ELEMENT_PREFIX);
}

export function toDeviceElementId(id: string): DeviceElementId {
  return `${DEVICE_ELEMENT_PREFIX}${id}` as DeviceElementId;
}

export function deviceElementKey(id: DeviceElementId | string): string {
  return isDeviceElementId(id) ? id.slice(DEVICE_ELEMENT_PREFIX.length) : id;
}

function getFrameAspect(device: Device, orientation: Orientation) {
  switch (device) {
    case "iphone":
      return MK_RATIO;
    case "android":
      return 9 / 19.5;
    case "ipad":
      return IPAD_RATIO;
    case "android-7":
    case "android-10":
      return orientation === "landscape" ? 8 / 5 : 5 / 8;
    default:
      return 1;
  }
}

function frameWidthFrac(device: Device, orientation: Orientation, small = false) {
  const { cW, cH } = getCanvasSize(device, orientation);
  switch (device) {
    case "iphone":
    case "android":
      return small ? phoneWSmall(cW, cH) : phoneW(cW, cH);
    case "ipad":
      return small ? ipadW(cW, cH, 0.6) : ipadW(cW, cH);
    case "android-7":
    case "android-10":
      if (orientation === "landscape") {
        return small ? tabletLW(cW, cH, 0.5) : tabletLW(cW, cH);
      }
      return small ? tabletPW(cW, cH, 0.62) : tabletPW(cW, cH);
    default:
      return small ? phoneWSmall(cW, cH) : phoneW(cW, cH);
  }
}

export function getCanvasSize(device: Device, orientation: Orientation) {
  const c = CANVAS[device];
  if ((device === "android-7" || device === "android-10") && orientation === "landscape") {
    return { cW: c.wL!, cH: c.hL! };
  }
  return { cW: c.w, cH: c.h };
}

function defaultDeviceRect(
  slide: Slide,
  device: Device,
  orientation: Orientation,
  slot: "primary" | "secondary" | "extra",
): ElementTransform {
  const { cW, cH } = getCanvasSize(device, orientation);
  const frameAspect = getFrameAspect(device, orientation);
  const deviceW = frameWidthFrac(device, orientation) * cW;
  const deviceH = deviceW / frameAspect;
  const smallW = frameWidthFrac(device, orientation, true) * cW;
  const smallH = smallW / frameAspect;

  if (slot === "secondary") {
    return {
      x: -cW * 0.06,
      y: cH - smallH - cH * 0.05,
      width: smallW,
      height: smallH,
      rotation: 9,
      zIndex: 2,
    };
  }

  if (slot === "extra") {
    return {
      x: cW * 0.12,
      y: cH - deviceH * 0.85,
      width: deviceW * 0.75,
      height: (deviceW * 0.75) / frameAspect,
      rotation: -6,
      zIndex: 2,
    };
  }

  if (slide.layout === "device-top") {
    return {
      x: (cW - deviceW) / 2,
      y: -cH * 0.1,
      width: deviceW,
      height: deviceH,
      rotation: 0,
      zIndex: 3,
    };
  }

  if (slide.layout === "hero") {
    return {
      x: (cW - deviceW) / 2,
      y: cH - deviceH + deviceH * 0.15,
      width: deviceW,
      height: deviceH,
      rotation: 0,
      zIndex: 3,
    };
  }

  if (slide.layout === "split-landscape") {
    return {
      x: cW - deviceW + cW * 0.03,
      y: (cH - deviceH) / 2,
      width: deviceW,
      height: deviceH,
      rotation: 0,
      zIndex: 3,
    };
  }

  if (slide.layout === "two-devices" && slot === "primary") {
    return {
      x: cW - deviceW * 0.9 + cW * 0.06,
      y: cH - deviceH * 0.9 - cH * 0.02,
      width: deviceW * 0.9,
      height: (deviceW * 0.9) / frameAspect,
      rotation: 0,
      zIndex: 3,
    };
  }

  return {
    x: (cW - deviceW) / 2,
    y: cH - deviceH - cH * 0.02,
    width: deviceW,
    height: deviceH,
    rotation: 0,
    zIndex: 3,
  };
}

export function cleanDeviceElement(value: unknown): DeviceElement | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<DeviceElement>;
  if (typeof raw.id !== "string" || !raw.id.trim()) return undefined;
  const transform = cleanTransform(raw.transform);
  if (!transform) return undefined;
  return {
    id: raw.id,
    screenshot: typeof raw.screenshot === "string" ? raw.screenshot : "",
    transform,
    ...(typeof raw.opacity === "number" && Number.isFinite(raw.opacity) ? { opacity: raw.opacity } : {}),
  };
}

function cleanTransform(value: unknown): ElementTransform | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<ElementTransform>;
  const required = [raw.x, raw.y, raw.width, raw.height];
  if (!required.every((n) => typeof n === "number" && Number.isFinite(n))) return undefined;
  return {
    x: raw.x!,
    y: raw.y!,
    width: Math.max(1, raw.width!),
    height: Math.max(1, raw.height!),
    ...(typeof raw.rotation === "number" && Number.isFinite(raw.rotation)
      ? { rotation: raw.rotation }
      : {}),
    ...(typeof raw.zIndex === "number" && Number.isFinite(raw.zIndex)
      ? { zIndex: raw.zIndex }
      : {}),
  };
}

function buildLegacyDeviceElements(
  slide: Slide,
  device: Device,
  orientation: Orientation,
): DeviceElement[] {
  if (slide.layout === "no-device" || slide.layout === "feature-graphic") return [];

  const elements: DeviceElement[] = [];
  const transforms = slide.transforms || {};

  function pushLegacy(
    id: string,
    screenshot: string,
    slot: "primary" | "secondary",
    opacity?: number,
  ) {
    const saved = slot === "secondary" ? transforms.deviceSecondary : transforms.device;
    const fallback = defaultDeviceRect(slide, device, orientation, slot);
    elements.push({
      id,
      screenshot,
      transform: saved
        ? {
            x: saved.x,
            y: saved.y,
            width: saved.width,
            height: saved.height,
            rotation: saved.rotation ?? fallback.rotation ?? 0,
            zIndex: saved.zIndex ?? fallback.zIndex,
          }
        : fallback,
      ...(opacity !== undefined ? { opacity } : {}),
    });
  }

  if (slide.layout === "two-devices") {
    pushLegacy("secondary", slide.screenshotSecondary || slide.screenshot, "secondary", 0.85);
    pushLegacy("primary", slide.screenshot, "primary");
  } else if (slide.screenshot || transforms.device) {
    pushLegacy("primary", slide.screenshot, "primary");
  }

  return elements.sort(
    (a, b) => (a.transform.zIndex ?? 3) - (b.transform.zIndex ?? 3),
  );
}

export function getSlideDeviceElements(
  slide: Slide,
  device: Device,
  orientation: Orientation,
): DeviceElement[] {
  if (slide.layout === "feature-graphic" || device === "feature-graphic") return [];
  if (slide.deviceElements && slide.deviceElements.length > 0) {
    return [...slide.deviceElements].sort(
      (a, b) => (a.transform.zIndex ?? 3) - (b.transform.zIndex ?? 3),
    );
  }
  return buildLegacyDeviceElements(slide, device, orientation);
}

export function syncLegacyScreenshotFields(
  deviceElements: DeviceElement[] | undefined,
): Pick<Slide, "screenshot" | "screenshotSecondary"> {
  const sorted = [...(deviceElements || [])].sort(
    (a, b) => (a.transform.zIndex ?? 3) - (b.transform.zIndex ?? 3),
  );
  const byZ = sorted;
  const front = byZ[byZ.length - 1];
  const back = byZ.length > 1 ? byZ[byZ.length - 2] : undefined;
  return {
    screenshot: front?.screenshot ?? "",
    screenshotSecondary: back?.screenshot,
  };
}

export function migrateSlideDeviceElements(
  slide: Slide,
  device: Device,
  orientation: Orientation,
): Slide {
  if (slide.layout === "feature-graphic" || slide.layout === "no-device") {
    const cleaned = Array.isArray(slide.deviceElements)
      ? slide.deviceElements.map(cleanDeviceElement).filter((d): d is DeviceElement => !!d)
      : [];
    return {
      ...slide,
      deviceElements: cleaned.length > 0 ? cleaned : undefined,
    };
  }

  let deviceElements: DeviceElement[];
  if (slide.deviceElements && slide.deviceElements.length > 0) {
    deviceElements = slide.deviceElements
      .map(cleanDeviceElement)
      .filter((d): d is DeviceElement => !!d);
  } else {
    deviceElements = buildLegacyDeviceElements(slide, device, orientation);
  }

  const legacyScreens = syncLegacyScreenshotFields(deviceElements);
  const transforms = slide.transforms ? { ...slide.transforms } : undefined;
  if (transforms) {
    delete transforms.device;
    delete transforms.deviceSecondary;
    if (Object.keys(transforms).length === 0) {
      // keep caption transforms only — handled below
    }
  }

  return {
    ...slide,
    deviceElements: deviceElements.length > 0 ? deviceElements : undefined,
    screenshot: legacyScreens.screenshot,
    screenshotSecondary: legacyScreens.screenshotSecondary,
    transforms:
      transforms && Object.keys(transforms).length > 0
        ? transforms
        : slide.transforms?.caption
          ? { caption: slide.transforms.caption }
          : undefined,
  };
}

export function createDeviceElement(
  slide: Slide,
  device: Device,
  orientation: Orientation,
  existing: DeviceElement[],
): DeviceElement {
  const slot: "primary" | "secondary" | "extra" =
    existing.length === 0 ? "primary" : existing.length === 1 ? "secondary" : "extra";
  const transform = defaultDeviceRect(slide, device, orientation, slot);
  const zIndex =
    Math.max(2, ...existing.map((element) => element.transform.zIndex ?? 3)) + 1;
  return {
    id: nid(),
    screenshot: existing[0]?.screenshot ?? slide.screenshot ?? "",
    transform: { ...transform, zIndex },
    ...(slot === "secondary" ? { opacity: 0.85 } : {}),
  };
}

export function deviceElementLabel(index: number, total: number): string {
  if (total <= 1) return "Phone";
  if (index === total - 1) return "Phone (front)";
  if (index === total - 2) return "Phone (back)";
  return `Phone ${index + 1}`;
}
