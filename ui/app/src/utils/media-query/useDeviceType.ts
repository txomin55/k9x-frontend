import { createMemo, type Accessor } from "solid-js";
import { useMediaQuery } from "@/utils/media-query/useMediaQuery";

export type DeviceType = "mobile" | "tablet" | "laptop";

export function useDeviceType(): Accessor<DeviceType> {
  const isTabletUp = useMediaQuery("(min-width: 768px)");
  const isLaptopUp = useMediaQuery("(min-width: 1080px)");

  return createMemo<DeviceType>(() => {
    if (isLaptopUp()) return "laptop";
    if (isTabletUp()) return "tablet";
    return "mobile";
  });
}
