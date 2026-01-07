import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as htmlToImage from "html-to-image";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capture the schedule grid and download it as a high‑quality PNG image.
 *
 * Implementation details:
 *  - Uses `html-to-image` (toPng) instead of html2canvas for better cross‑browser stability.
 *  - Temporarily enables an `export-mode` class on the root element so Tailwind
 *    variants can reveal full text and hide UI controls.
 */
export const downloadScheduleImage = async (
  elementId: string
): Promise<void> => {
  const element = document.getElementById(elementId) as HTMLElement | null;
  if (!element) return;

  // Wait for fonts to be ready to avoid text glitches
  if ((document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
    } catch {
      // ignore
    }
  }

  const width = element.scrollWidth || element.offsetWidth;
  const height = element.scrollHeight || element.offsetHeight;

  const bodyStyles = getComputedStyle(document.body);
  const liveBg = bodyStyles.backgroundColor || "#ffffff";

  // Remember original className to restore after capture
  const originalClassName = element.className;
  element.classList.add("group", "export-mode");

  try {
    const dataUrl = await htmlToImage.toPng(element, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor:
        liveBg && liveBg !== "rgba(0, 0, 0, 0)" && liveBg !== "transparent"
          ? liveBg
          : "#ffffff",
      width,
      height,
      style: {
        // Ensure no unexpected scaling
        margin: "0",
      },
      filter: (node) => {
        if (!(node instanceof HTMLElement)) return true;

        // Skip obvious UI controls in the exported image
        const tag = node.tagName.toLowerCase();
        if (tag === "button") return false;
        if (node.dataset && node.dataset["exportIgnore"] === "true") return false;

        return true;
      },
    });

    const link = document.createElement("a");
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    link.href = dataUrl;
    link.download = `golestoon-schedule-${dateStr}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // Restore original classes and layout
    element.className = originalClassName;
  }
};
