import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import html2canvas from "html2canvas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capture the schedule grid and download it as a high‑quality PNG image.
 *
 * Key features:
 *  - High DPI (scale=3) for crisp text
 *  - Uses an \"export mode\" class to reveal otherwise hidden metadata
 *  - Forces full text expansion (no ellipsis) in the cloned DOM
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

  // 2) Capture with html2canvas and enable export-mode in the cloned DOM
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
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

      // Mark the capture root as the export group so Tailwind's
      // `group-[.export-mode]:*` variants become active.
      clonedElement.classList.add("group");
      clonedElement.classList.add("export-mode");

      // Force RTL + font family from the live document
      clonedDoc.documentElement.dir = document.documentElement.dir || "rtl";
      const body = clonedDoc.body as HTMLBodyElement;
      body.style.margin = "0";
      body.style.padding = "0";
      body.style.backgroundColor = "#ffffff";
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

      // B. Force full expansion of all truncated/hidden text
      const textNodes = clonedDoc.querySelectorAll(
        ".truncate, .overflow-hidden"
      );
      textNodes.forEach((node) => {
        const el = node as HTMLElement;
        el.style.overflow = "visible";
        el.style.whiteSpace = "normal";
        el.style.textOverflow = "clip";
        el.style.height = "auto";
        el.style.wordBreak = "break-word";
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
