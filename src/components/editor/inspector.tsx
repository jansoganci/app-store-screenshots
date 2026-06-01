"use client";
import * as React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  ChevronUp,
  Plus,
  RotateCw,
  Trash2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LAYOUT_HINT, LAYOUT_LABEL, themeById } from "@/lib/constants";
import { effectiveBgStyle } from "@/lib/color";
import { nid } from "@/lib/defaults";
import {
  createDeviceElement,
  deviceElementLabel,
  getSlideDeviceElements,
  isDeviceElementId,
  MAX_DEVICES_PER_SLIDE,
  syncLegacyScreenshotFields,
  toDeviceElementId,
} from "@/lib/device-elements";
import {
  deviceElementKey,
  isBuiltInElementId,
  isTextElementId,
  textElementKey,
  toTextElementId,
} from "@/lib/elements";
import { pickText, writeLocalized } from "@/lib/locale";
import type {
  BgStyle,
  BuiltInElementId,
  Device,
  DeviceElement,
  ElementId,
  ElementTransform,
  Orientation,
  Slide,
  SlideLayout,
  TextElement,
  TextStyle,
} from "@/lib/types";
import {
  defaultHeadlineColor,
  defaultHeadlineFontSize,
  defaultLabelColor,
  defaultLabelFontSize,
} from "@/lib/typography";
import { ScreenshotPicker } from "./screenshot-picker";
import { getCanvas, getElementTransform } from "./slide-canvas";

type Props = {
  slide: Slide;
  device: Device;
  orientation: Orientation;
  locale: string;
  themeId: string;
  selectedElementId: ElementId | null;
  onChange: (patch: Partial<Slide>) => void;
  onSelectElement: (id: ElementId | null) => void;
};

const ELEMENT_LABEL: Record<BuiltInElementId, string> = {
  caption: "Headline",
  device: "Device",
  deviceSecondary: "Back device",
};

export function Inspector({
  slide,
  device,
  orientation,
  locale,
  themeId,
  selectedElementId,
  onChange,
  onSelectElement,
}: Props) {
  const theme = themeById(themeId);
  const { cW, cH } = getCanvas(device, orientation);
  const labelDefaults = {
    fontSize: Math.round(defaultLabelFontSize(cW, cH)),
    fontWeight: 600,
    color: defaultLabelColor(theme),
  };
  const headlineDefaults = {
    fontSize: Math.round(defaultHeadlineFontSize(cW, cH)),
    fontWeight: 700,
    color: defaultHeadlineColor(theme, slide.inverted),
  };
  const bgMode = effectiveBgStyle(slide);
  const bgColorValue = slide.bgColor || (slide.inverted ? theme.bgAlt : theme.bg);
  const isFeatureGraphic = device === "feature-graphic" || slide.layout === "feature-graphic";
  const deviceElements = getSlideDeviceElements(slide, device, orientation);

  function commitDeviceElements(next: DeviceElement[]) {
    onChange({
      deviceElements: next.length > 0 ? next : undefined,
      ...syncLegacyScreenshotFields(next),
    });
  }

  function addPhone() {
    if (deviceElements.length >= MAX_DEVICES_PER_SLIDE) return;
    const element = createDeviceElement(slide, device, orientation, deviceElements);
    commitDeviceElements([...deviceElements, element]);
    onSelectElement(toDeviceElementId(element.id));
  }

  function removePhone(id: string) {
    commitDeviceElements(deviceElements.filter((element) => element.id !== id));
    onSelectElement(null);
  }

  function patchPhoneScreenshot(id: string, screenshot: string) {
    commitDeviceElements(
      deviceElements.map((element) =>
        element.id === id ? { ...element, screenshot } : element,
      ),
    );
  }


  const layoutValue = device === "feature-graphic" ? "feature-graphic" : slide.layout;
  const layoutOptions = Object.entries(LAYOUT_LABEL).filter(([layout]) =>
    device === "feature-graphic" ? layout === "feature-graphic" : layout !== "feature-graphic",
  );
  const localeLabel = slide.label?.[locale] ?? "";
  const localeHeadline = slide.headline?.[locale] ?? "";
  // When the active locale is empty, surface the fallback (typically en) as
  // the placeholder so the user sees what they're translating from.
  const headlineDefault = isFeatureGraphic ? "Your tagline." : "One idea\nper slide.";
  const labelPlaceholder = localeLabel ? "FEATURE 01" : pickText(slide.label, locale) || "FEATURE 01";
  const headlinePlaceholder = localeHeadline
    ? headlineDefault
    : pickText(slide.headline, locale) || headlineDefault;

  function setLocaleField(key: "label" | "headline", value: string) {
    onChange({ [key]: writeLocalized(slide[key], locale, value) } as Partial<Slide>);
  }

  React.useEffect(() => {
    if (device === "feature-graphic" && slide.layout !== "feature-graphic") {
      onChange({ layout: "feature-graphic", transforms: undefined, screenshotSecondary: undefined });
    }
  }, [device, onChange, slide.layout]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">Screen settings</h2>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            editing · {locale.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{LAYOUT_HINT[layoutValue]}</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Layout</Label>
          <Select
            value={layoutValue}
            onValueChange={(layout) => {
              const next = layout as SlideLayout;
              onChange({
                layout: next,
                transforms: undefined,
                screenshotSecondary:
                  next === "two-devices" ? slide.screenshotSecondary || slide.screenshot : undefined,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {layoutOptions.map(([layout, label]) => (
                <SelectItem key={layout} value={layout}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isFeatureGraphic && (
          <div className="space-y-1.5">
            <Label className="text-xs">Label</Label>
            <Input
              value={localeLabel}
              onChange={(e) => setLocaleField("label", e.target.value)}
              placeholder={labelPlaceholder}
            />
            <TextStyleControls
              style={slide.labelStyle}
              defaults={labelDefaults}
              onChange={(patch) =>
                onChange({
                  labelStyle: mergeTextStyle(slide.labelStyle, patch),
                })
              }
              onReset={() => onChange({ labelStyle: undefined })}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label className="text-xs">{isFeatureGraphic ? "Tagline" : "Headline"}</Label>
            <span className="text-[10px] text-muted-foreground">newline = break</span>
          </div>
          <Textarea
            value={localeHeadline}
            onChange={(e) => setLocaleField("headline", e.target.value)}
            rows={3}
            placeholder={headlinePlaceholder}
          />
          {!isFeatureGraphic && (
            <TextStyleControls
              style={slide.headlineStyle}
              defaults={headlineDefaults}
              onChange={(patch) =>
                onChange({
                  headlineStyle: mergeTextStyle(slide.headlineStyle, patch),
                })
              }
              onReset={() => onChange({ headlineStyle: undefined })}
            />
          )}
        </div>

        {/* Background */}
        <div className="space-y-1.5">
          <Label className="text-xs">Background</Label>
          <Select
            value={bgMode}
            onValueChange={(value) => {
              const mode = value as BgStyle;
              if (mode === "theme") {
                onChange({ bgStyle: undefined, bgColor: undefined });
                return;
              }
              onChange({
                bgStyle: mode,
                bgColor: slide.bgColor || (slide.inverted ? "#1a1a1a" : "#FF6B35"),
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="theme">Theme default</SelectItem>
              <SelectItem value="solid">Solid color</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
            </SelectContent>
          </Select>
          {bgMode !== "theme" && (
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={bgColorValue}
                className="h-9 w-12 p-1"
                onChange={(e) => onChange({ bgColor: e.target.value, bgStyle: bgMode })}
              />
              <Input
                type="text"
                value={slide.bgColor || ""}
                placeholder="#FF6B35"
                className="h-9 flex-1 font-mono text-xs"
                onChange={(e) =>
                  onChange({
                    bgColor: e.target.value || undefined,
                    bgStyle: bgMode,
                  })
                }
              />
            </div>
          )}
          {bgMode === "gradient" && (
            <p className="text-[11px] text-muted-foreground">
              Gradient uses your color — not the theme blue.
            </p>
          )}
        </div>

        {!isFeatureGraphic && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">Phones</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={deviceElements.length >= MAX_DEVICES_PER_SLIDE}
                onClick={addPhone}
              >
                <Plus className="h-3.5 w-3.5" />
                Phone
              </Button>
            </div>
            {deviceElements.length === 0 ? (
              <p className="rounded-md border border-dashed bg-muted/20 p-3 text-[11px] text-muted-foreground">
                No phone mockups on this screen. Add one to place a screenshot.
              </p>
            ) : (
              deviceElements.map((phone, index) => (
                <div key={phone.id} className="flex items-start gap-1">
                  <div className="min-w-0 flex-1">
                    <ScreenshotPicker
                      label={deviceElementLabel(index, deviceElements.length)}
                      value={phone.screenshot}
                      locale={locale}
                      onChange={(value) => patchPhoneScreenshot(phone.id, value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-1 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removePhone(phone.id)}
                    title="Remove phone"
                    aria-label="Remove phone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {!isFeatureGraphic && (
          <ElementTransformControls
            slide={slide}
            device={device}
            orientation={orientation}
            locale={locale}
            deviceElements={deviceElements}
            selectedElementId={selectedElementId}
            onChange={onChange}
            onSelectElement={onSelectElement}
            onAddPhone={addPhone}
            onRemovePhone={removePhone}
          />
        )}

        {isFeatureGraphic && (
          <p className="rounded-md border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            Shows app icon + name + tagline. Drop an icon at <span className="rounded bg-background px-1 py-0.5 font-mono text-[10px] text-foreground">/public/app-icon.png</span> (or leave blank — the app initial will be used). Name is set in the toolbar.
          </p>
        )}
      </div>
    </div>
  );
}

function mergeTextStyle(current: TextStyle | undefined, patch: Partial<TextStyle>): TextStyle | undefined {
  const next: TextStyle = { ...current };
  if ("fontSize" in patch) {
    if (patch.fontSize === undefined) delete next.fontSize;
    else next.fontSize = patch.fontSize;
  }
  if ("fontWeight" in patch) {
    if (patch.fontWeight === undefined) delete next.fontWeight;
    else next.fontWeight = patch.fontWeight;
  }
  if ("color" in patch) {
    if (patch.color === undefined) delete next.color;
    else next.color = patch.color;
  }
  if (next.fontSize === undefined && next.fontWeight === undefined && next.color === undefined) {
    return undefined;
  }
  return next;
}

function TextStyleControls({
  style,
  defaults,
  onChange,
  onReset,
}: {
  style?: TextStyle;
  defaults: { fontSize: number; fontWeight: number; color: string };
  onChange: (patch: Partial<TextStyle>) => void;
  onReset: () => void;
}) {
  const hasOverrides = !!(style?.fontSize || style?.fontWeight || style?.color);
  return (
    <div className="space-y-2 rounded-md border bg-muted/20 p-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">Typography</span>
        {hasOverrides && (
          <button
            type="button"
            className="text-[10px] text-muted-foreground underline hover:text-foreground"
            onClick={onReset}
          >
            Reset
          </button>
        )}
      </div>
      <div className="grid grid-cols-[1fr_76px_44px] gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Size</Label>
          <Input
            type="number"
            min={8}
            max={400}
            placeholder={String(defaults.fontSize)}
            value={style?.fontSize ?? ""}
            onChange={(event) =>
              onChange({
                fontSize: event.target.value ? Number(event.target.value) || undefined : undefined,
              })
            }
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Weight</Label>
          <Input
            type="number"
            min={100}
            max={900}
            step={100}
            placeholder={String(defaults.fontWeight)}
            value={style?.fontWeight ?? ""}
            onChange={(event) =>
              onChange({
                fontWeight: event.target.value ? Number(event.target.value) || undefined : undefined,
              })
            }
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Color</Label>
          <Input
            type="color"
            value={style?.color || defaults.color}
            className="h-9 p-1"
            onChange={(event) => onChange({ color: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function ElementTransformControls({
  slide,
  device,
  orientation,
  locale,
  deviceElements,
  selectedElementId,
  onChange,
  onSelectElement,
  onAddPhone,
  onRemovePhone,
}: {
  slide: Slide;
  device: Device;
  orientation: Orientation;
  locale: string;
  deviceElements: DeviceElement[];
  selectedElementId: ElementId | null;
  onChange: (patch: Partial<Slide>) => void;
  onSelectElement: (id: ElementId | null) => void;
  onAddPhone: () => void;
  onRemovePhone: (id: string) => void;
}) {
  const present: ElementId[] = ["caption"];
  for (const phone of deviceElements) present.push(toDeviceElementId(phone.id));
  for (const element of slide.textElements || []) present.push(toTextElementId(element.id));

  const transforms = slide.transforms || {};
  const activeId =
    selectedElementId && present.includes(selectedElementId) ? selectedElementId : null;
  const activeTransform = activeId
    ? getElementTransform(slide, device, orientation, activeId)
    : undefined;
  const activeTextElement =
    activeId && isTextElementId(activeId)
      ? slide.textElements?.find((element) => element.id === textElementKey(activeId))
      : null;
  const activeDeviceElement =
    activeId && isDeviceElementId(activeId)
      ? deviceElements.find((element) => element.id === deviceElementKey(activeId))
      : null;

  function getTransform(id: ElementId) {
    return getElementTransform(slide, device, orientation, id);
  }

  function patchElement(id: ElementId, patch: Partial<ElementTransform>) {
    const cur = getTransform(id);
    if (!cur) return;
    if (isTextElementId(id)) {
      const textId = textElementKey(id);
      onChange({
        textElements: (slide.textElements || []).map((element) =>
          element.id === textId
            ? { ...element, transform: { ...element.transform, ...patch } }
            : element,
        ),
      });
      return;
    }
    if (isDeviceElementId(id)) {
      const deviceId = deviceElementKey(id);
      const nextDevices = deviceElements.map((element) =>
        element.id === deviceId
          ? { ...element, transform: { ...element.transform, ...patch } }
          : element,
      );
      onChange({
        deviceElements: nextDevices,
        ...syncLegacyScreenshotFields(nextDevices),
      });
      return;
    }
    if (!isBuiltInElementId(id)) return;
    onChange({
      transforms: { ...transforms, [id]: { ...cur, ...patch } },
    });
  }

  function patchTextElement(id: string, patch: Partial<TextElement>) {
    onChange({
      textElements: (slide.textElements || []).map((element) =>
        element.id === id ? { ...element, ...patch } : element,
      ),
    });
  }

  function setTextElementValue(element: TextElement, value: string) {
    patchTextElement(element.id, { text: writeLocalized(element.text, locale, value) });
  }

  function deleteTextElement(element: TextElement) {
    const nextTextElements = (slide.textElements || []).filter((item) => item.id !== element.id);
    onChange({
      textElements: nextTextElements.length > 0 ? nextTextElements : undefined,
    });
    onSelectElement(null);
  }

  function addTextElement() {
    const { cW, cH } = getCanvas(device, orientation);
    const id = nid();
    const zIndex =
      Math.max(
        5,
        ...present.map((elementId) => getTransform(elementId)?.zIndex ?? defaultZ(elementId)),
      ) + 1;
    const element: TextElement = {
      id,
      text: writeLocalized({}, locale, "New text"),
      transform: {
        x: cW * 0.18,
        y: cH * 0.42,
        width: cW * 0.64,
        height: cH * 0.12,
        rotation: 0,
        zIndex,
      },
      fontSize: Math.round(Math.min(cW, cH) * 0.065),
      fontWeight: 800,
      align: "center",
    };
    onChange({ textElements: [...(slide.textElements || []), element] });
    onSelectElement(toTextElementId(id));
  }

  // Z-order: re-rank zIndex among present elements so they remain contiguous.
  function reorder(id: ElementId, dir: "front" | "back" | "up" | "down") {
    const ranked = [...present].sort((a, b) => {
      const za = getTransform(a)?.zIndex ?? defaultZ(a);
      const zb = getTransform(b)?.zIndex ?? defaultZ(b);
      return za - zb;
    });
    const idx = ranked.indexOf(id);
    if (idx === -1) return;
    let target = idx;
    if (dir === "front") target = ranked.length - 1;
    else if (dir === "back") target = 0;
    else if (dir === "up") target = Math.min(ranked.length - 1, idx + 1);
    else if (dir === "down") target = Math.max(0, idx - 1);
    if (target === idx) return;
    ranked.splice(idx, 1);
    ranked.splice(target, 0, id);
    const nextTransforms = { ...transforms };
    const nextTextElements = (slide.textElements || []).map((element) => ({
      ...element,
      transform: { ...element.transform },
    }));
    const nextDeviceElements = deviceElements.map((element) => ({
      ...element,
      transform: { ...element.transform },
    }));
    ranked.forEach((eid, i) => {
      const cur = getTransform(eid);
      if (!cur) return;
      if (isTextElementId(eid)) {
        const textId = textElementKey(eid);
        const textElement = nextTextElements.find((element) => element.id === textId);
        if (textElement) textElement.transform = { ...textElement.transform, zIndex: i + 1 };
      } else if (isDeviceElementId(eid)) {
        const deviceId = deviceElementKey(eid);
        const phone = nextDeviceElements.find((element) => element.id === deviceId);
        if (phone) phone.transform = { ...phone.transform, zIndex: i + 1 };
      } else if (isBuiltInElementId(eid)) {
        nextTransforms[eid] = { ...cur, zIndex: i + 1 };
      }
    });
    onChange({
      transforms: nextTransforms,
      textElements: nextTextElements,
      deviceElements: nextDeviceElements,
      ...syncLegacyScreenshotFields(nextDeviceElements),
    });
  }

  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Label className="text-xs font-semibold">Elements</Label>
          <p className="text-[11px] text-muted-foreground">
            {activeId
              ? "Fine-tune the selected element's rotation and stacking."
              : "Click an element on the canvas to fine-tune its rotation and stacking."}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 px-2 text-xs"
            disabled={deviceElements.length >= MAX_DEVICES_PER_SLIDE}
            onClick={onAddPhone}
          >
            <Plus className="h-3.5 w-3.5" />
            Phone
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 px-2 text-xs"
            onClick={addTextElement}
          >
            <Plus className="h-3.5 w-3.5" />
            Text
          </Button>
        </div>
      </div>

      {activeId ? (
        <ActiveElementPanel
          activeId={activeId}
          transform={activeTransform}
          textElement={activeTextElement || undefined}
          deviceElement={activeDeviceElement || undefined}
          deviceElements={deviceElements}
          locale={locale}
          onRotate={(rotation) => patchElement(activeId, { rotation })}
          onReorder={(dir) => reorder(activeId, dir)}
          onTextChange={(value) => {
            if (activeTextElement) setTextElementValue(activeTextElement, value);
          }}
          onTextPatch={(patch) => {
            if (activeTextElement) patchTextElement(activeTextElement.id, patch);
          }}
          onDeleteText={() => {
            if (activeTextElement) deleteTextElement(activeTextElement);
          }}
          onDeleteDevice={() => {
            if (activeDeviceElement) onRemovePhone(activeDeviceElement.id);
          }}
        />
      ) : (
        <div className="rounded border border-dashed bg-background/40 p-4 text-center text-[11px] text-muted-foreground">
          No element selected
        </div>
      )}
    </div>
  );
}

function ActiveElementPanel({
  activeId,
  transform,
  textElement,
  deviceElement,
  deviceElements,
  locale,
  onRotate,
  onReorder,
  onTextChange,
  onTextPatch,
  onDeleteText,
  onDeleteDevice,
}: {
  activeId: ElementId;
  transform: ElementTransform | undefined;
  textElement?: TextElement;
  deviceElement?: DeviceElement;
  deviceElements: DeviceElement[];
  locale: string;
  onRotate: (rotation: number) => void;
  onReorder: (dir: "front" | "back" | "up" | "down") => void;
  onTextChange: (value: string) => void;
  onTextPatch: (patch: Partial<TextElement>) => void;
  onDeleteText: () => void;
  onDeleteDevice: () => void;
}) {
  const engaged = !!transform;
  const rotation = transform?.rotation ?? 0;
  const label = elementLabel(activeId, deviceElements);
  return (
    <div className="space-y-2 rounded border bg-background/60 p-2.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-medium">
          {textElement && <Type className="h-3.5 w-3.5" />}
          {label}
        </span>
        {textElement ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:text-destructive"
            onClick={onDeleteText}
            title="Delete text element"
            aria-label="Delete text element"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : deviceElement ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:text-destructive"
            onClick={onDeleteDevice}
            title="Remove phone"
            aria-label="Remove phone"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : !engaged ? (
          <span className="text-[10px] text-muted-foreground">drag to enable</span>
        ) : null}
      </div>

      {textElement && (
        <TextElementPanel
          element={textElement}
          locale={locale}
          onTextChange={onTextChange}
          onTextPatch={onTextPatch}
        />
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <RotateCw className="h-3 w-3" /> Rotation
          </Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {rotation}°
          </span>
        </div>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={rotation}
          disabled={!engaged}
          onChange={(e) => onRotate(Number(e.target.value))}
          className="w-full disabled:opacity-50"
          aria-label={`${label} rotation`}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Layer</Label>
        <div className="grid grid-cols-4 gap-1">
          <LayerButton disabled={!engaged} onClick={() => onReorder("back")} label="Send to back">
            <ArrowDownToLine className="h-3.5 w-3.5" />
          </LayerButton>
          <LayerButton disabled={!engaged} onClick={() => onReorder("down")} label="Send backward">
            <ChevronDown className="h-3.5 w-3.5" />
          </LayerButton>
          <LayerButton disabled={!engaged} onClick={() => onReorder("up")} label="Bring forward">
            <ChevronUp className="h-3.5 w-3.5" />
          </LayerButton>
          <LayerButton disabled={!engaged} onClick={() => onReorder("front")} label="Bring to front">
            <ArrowUpToLine className="h-3.5 w-3.5" />
          </LayerButton>
        </div>
      </div>
    </div>
  );
}

function TextElementPanel({
  element,
  locale,
  onTextChange,
  onTextPatch,
}: {
  element: TextElement;
  locale: string;
  onTextChange: (value: string) => void;
  onTextPatch: (patch: Partial<TextElement>) => void;
}) {
  const text = element.text?.[locale] ?? pickText(element.text, locale);
  return (
    <div className="space-y-2 rounded border bg-muted/30 p-2">
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Text</Label>
        <Textarea
          value={text}
          rows={2}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Overlay text"
        />
      </div>
      <div className="grid grid-cols-[1fr_76px] gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Size</Label>
          <Input
            type="number"
            min={12}
            max={400}
            value={Math.round(element.fontSize || 72)}
            onChange={(event) => onTextPatch({ fontSize: Number(event.target.value) || 72 })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Color</Label>
          <Input
            type="color"
            value={element.color || "#171717"}
            className="h-9 p-1"
            onChange={(event) => onTextPatch({ color: event.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <LayerButton
          disabled={false}
          onClick={() => onTextPatch({ align: "left" })}
          label="Align left"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </LayerButton>
        <LayerButton
          disabled={false}
          onClick={() => onTextPatch({ align: "center" })}
          label="Align center"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </LayerButton>
        <LayerButton
          disabled={false}
          onClick={() => onTextPatch({ align: "right" })}
          label="Align right"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </LayerButton>
      </div>
    </div>
  );
}

function LayerButton({
  disabled,
  onClick,
  label,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 px-0"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {children}
    </Button>
  );
}

function elementLabel(id: ElementId, deviceElements: DeviceElement[]): string {
  if (isBuiltInElementId(id)) return ELEMENT_LABEL[id];
  if (isDeviceElementId(id)) {
    const index = deviceElements.findIndex((element) => element.id === deviceElementKey(id));
    if (index >= 0) return deviceElementLabel(index, deviceElements.length);
    return "Phone";
  }
  return "Text";
}

function defaultZ(id: ElementId): number {
  if (isTextElementId(id)) return 5;
  if (isDeviceElementId(id)) return 3;
  if (id === "deviceSecondary") return 2;
  if (id === "device") return 3;
  return 4; // caption on top
}
