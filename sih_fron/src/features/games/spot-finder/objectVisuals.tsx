import React, { type ReactNode } from "react";

// Reuse only authored shapes that were identical in the original page.
const deskVisual = (
  <svg viewBox="0 0 100 70" fill="currentColor">
    <path opacity="0.7" d="M5 60 V20 H20 V60z M80 60 V20 H95 V60z" />
    <path d="M0 10 L100 0 V15 L0 25z" />
  </svg>
);

const shelfVisual = (
  <svg viewBox="0 0 100 100" fill="currentColor">
    <path opacity="0.6" d="M5 0 H95 V100 H5z" />
    <path d="M0 15 H100 V20 H0z M0 50 H100 V55 H0z M0 85 H100 V90 H0z" />
    <path
      opacity="0.8"
      d="M15 20 V15 h10v5z m20 0 V15 h10v5z M60 55 V50 h15v5z M20 90 V85 h10v5z m30 0 V85 h20v5z"
    />
  </svg>
);

const wallVisual = (
  <svg viewBox="0 0 100 100" fill="currentColor">
    <path opacity="0.2" d="M0 0 H100 V100 H0z" />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      d="M0 25 H100 M0 50 H100 M0 75 H100 M50 0 V25 M25 25 V50 M75 25 V50 M50 50 V75 M25 75 V100 M75 75 V100"
    />
  </svg>
);

export const objectVisuals: Record<string, ReactNode> = {
  Desk: deskVisual,
  Window: (
    <svg viewBox="0 0 100 100" stroke="currentColor" fill="currentColor">
      <path fill="none" strokeWidth="6" d="M5 5 H95 V95 H5z" />
      <path
        opacity="0.3"
        fill="currentColor"
        stroke="none"
        d="M8 8 H92 V92 H8z"
      />
      <path strokeWidth="6" d="M5 50 H95 M50 5 V95" />
      <path strokeWidth="3" stroke="white" opacity="0.7" d="M15 85 L85 15" />
    </svg>
  ),
  Table: deskVisual,
  Shelf: shelfVisual,
  "Open Ground": (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
    >
      <path d="M5 95 C 30 70, 70 70, 95 95" strokeLinecap="round" />
      <path d="M25 80 C 40 60, 60 60, 75 80" strokeLinecap="round" />
      <path d="M45 65 C 50 55, 50 55, 55 65" strokeLinecap="round" />
    </svg>
  ),
  Wall: wallVisual,
  "Sturdy Desk": deskVisual,
  Elevator: (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
    >
      <path d="M20 5 H80 V95 H20z" />
      <path strokeWidth="4" d="M40 95 V5 M60 95 V5" />
      <path fill="currentColor" d="M50 20 L40 30 H60z M50 80 L40 70 H60z" />
    </svg>
  ),
  "Tall Bookshelf": shelfVisual,
  "Against Interior Wall": wallVisual,
  "Store Entrance": (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
    >
      <path d="M5 5 H95 V95 H5z" />
      <path d="M50 5 V95" />
      <path
        fill="currentColor"
        opacity="0.5"
        d="M40 45 h-5 v10 h5z M65 45 h-5 v10 h5z"
      />
    </svg>
  ),
  "Pulled Over, Inside Car": (
    <svg viewBox="0 0 100 60" fill="currentColor">
      <path d="M95,35 H85 L75,20 H25 L15,35 H5 C2,35 0,37 0,40 V48 C0,50 2,52 5,52 H15 V58 H25 V52 H75 V58 H85 V52 H95 C98,52 100,50 100,48 V40 C100,37 98,35 95,35 z M28,35 H72 V45 H28 V35 z" />
    </svg>
  ),
  "Under an Overpass": (
    <svg viewBox="0 0 100 100" fill="currentColor">
      <path opacity="0.7" d="M10 50 v40 h15 V50z M75 50 v40 h15 V50z" />
      <path d="M0 10 C 20 20, 80 20, 100 10 V40 H0z" />
      <path
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeDasharray="8 8"
        d="M0 25 H100"
      />
    </svg>
  ),
  "Between Seats": (
    <svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M5 80 L20 10 H40 L55 80 H5z M95 80 L80 10 H60 L45 80 H95z" />
      <path opacity="0.5" d="M20 10 H40 V20 H20z M80 10 H60 V20 H80z" />
    </svg>
  ),
};
