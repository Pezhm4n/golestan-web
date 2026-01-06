export const Z_INDEX = {
  gridHeader: 30,
  conflictBadge: 40,
  discoveryTip: 45,
  // Preview/ghost course overlay in the grid – always above normal cells,
  // but below global popovers.
  ghostPreview: 60,
  popover: 100,
} as const;