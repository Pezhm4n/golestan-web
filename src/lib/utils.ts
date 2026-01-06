import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import html2canvas from "html2canvas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capture the schedule grid and download it as a high‑quality PNG image.
 *
 * Key goals:
 *  - WYSIWYG: respect current theme (dark/light) and Tailwind classes
 *  - High DPI (scale=3) for crisp text
 *  - Use an \"export mode\" class to reveal otherwise hidden metadata
 *  - Expand truncated text without breaking layout
 */
export const downloadScheduleImage = async (
  elementId: string
): Promise<void> => {
  const element = document.getElementById(elementId) as HTMLElement | null;
  if (!element) return;

  // 1) Wait for all fonts to be ready (prevents garbled text)
  if ((document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
    } catch {
      // Even if this fails, we still proceed with capture
    }
  }

  const width = element.scrollWidth || element.offsetWidth;
  const height = element.scrollHeight || element.offsetHeight;

  // Determine background from the live element/theme so we don't force white
  const liveBg = getComputedStyle(element).backgroundColor || '';

  // 2) Capture with html2canvas and enable export-mode in the cloned DOM
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    // Let html2canvas infer the background from computed styles;
    // if we pass a color here it would override dark mode.
    backgroundColor: null,
    logging: false,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
    letterRendering: true,
    onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.getElementById(
        elementId
      ) as HTMLElement | null;
      if (!clonedElement) return;

      // 2.1 Preserve theme context (Tailwind classes, dark mode, etc.)
      clonedDoc.documentElement.className = document.documentElement.className;
      clonedDoc.body.className = document.body.className;

      // Keep direction and font from the live document
      clonedDoc.documentElement.dir = document.documentElement.dir || "rtl";

      const body = clonedDoc.body as HTMLBodyElement;
      body.style.margin = "0";
      body.style.padding = "0";
      // Use the same background that the element is rendered with (if any)
      if (liveBg && liveBg !== "rgba(0, 0, 0, 0)" && liveBg !== "transparent") {
        body.style.backgroundColor = liveBg;
      }
      body.style.width = `${width}px`;
      body.style.height = `${height}px`;
      body.style.overflow = "hidden";

      // Tight crop to the grid itself
      clonedElement.style.position = "absolute";
      clonedElement.style.top = "0";
      clonedElement.style.left = "0";
      clonedElement.style.margin = "0";
      clonedElement.style.transform = "none";
      clonedElement.style.transformOrigin = "top left";
      clonedElement.style.width = `${width}px`;
      clonedElement.style.height = `${height}px`;

      const bodyFont =
        getComputedStyle(document.body).fontFamily ||
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      clonedElement.style.fontFamily = bodyFont;

      // Mark the capture root as the export group so Tailwind's
      // `group-[.export-mode]:*` variants become active.
      clonedElement.classList.add("group");
      clonedElement.classList.add("export-mode");

      // 2.2 Anti-truncate: expand course text so full content is visible
      // We only target text containers inside course cards so the grid/time-slot
      // sizing remains intact.
      const textNodes = clonedElement.querySelectorAll<HTMLElement>(
        "[data-export-course-card] .truncate, " +
          "[data-export-course-card] .overflow-hidden, " +
          "[data-export-course-card] [class*='line-clamp']"
      );
      textNodes.forEach((el) => {
        el.style.overflow = "visible";
        el.style.whiteSpace = "normal"; // allow wrapping
        el.style.textOverflow = "clip";
        el.style.maxHeight = "none";
        el.style.height = "auto";
        el.style.wordBreak = "break-word";
        // @ts-expect-error non-standard properties for line clamping
        (el.style as any).lineClamp = "none";
        // @ts-expect-error vendor-prefixed property
        (el.style as any).webkitLineClamp = "none";
      });

      // 2.3 Optimize course card spacing and font size for export
      const courseCards = clonedElement.querySelectorAll<HTMLElement>(
        "[data-export-course-card]"
      );
      courseCards.forEach((card) => {
        card.style.padding = "2px";
        card.style.fontSize = "0.75rem";
        // Keep height controlled by the grid/time-slot; don't override it
        // so that the visual duration mapping is preserved.
      });

      // 2.4 Prevent parent clipping: let ancestors of course cards overflow visibly
      courseCards.forEach((card) => {
        let parent = card.parentElement;
        let depth = 0;
        while (parent && parent !== clonedElement && depth < 5) {
          const style = clonedDoc.defaultView?.getComputedStyle(parent);
          if (style && style.overflow !== "visible") {
            (parent as HTMLElement).style.overflow = "visible";
          }
          parent = parent.parentElement;
          depth += 1;
        }
      });

      // C. Hide UI controls (buttons, delete icons, floating toolbars)
      const uiControls = clonedDoc.querySelectorAll(
        "button, .delete-icon-class, [data-tour='download-image'], .floating-zoom-controls"
      );
      uiControls.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    },
  });

  // 3) Save the image as PNG
  const image = canvas.toDataURL("image/png", 1.0);
  const link = document.createElement("a");
  const date = new Date();
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
  link.href = image;
  link.download = `golestoon-schedule-${dateStr}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
