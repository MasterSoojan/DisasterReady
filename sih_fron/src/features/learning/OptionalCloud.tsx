"use client";
import { Cloud, Clouds } from "@react-three/drei";
import type { ComponentProps } from "react";
import { useTextureSource } from "./textureSource";

// The same versioned asset used by the installed Drei Cloud component.
const cloudTexture =
  "https://rawcdn.githack.com/pmndrs/drei-assets/9225a9f1fbd449d9411125c2f419b843d0308c9f/cloud.png";

export function OptionalCloud(props: ComponentProps<typeof Cloud>) {
  const texture = useTextureSource(cloudTexture);
  return texture ? (
    <Clouds texture={texture}>
      <Cloud {...props} />
    </Clouds>
  ) : null;
}
