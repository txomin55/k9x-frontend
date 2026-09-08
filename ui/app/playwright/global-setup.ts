import type { FullConfig } from "@playwright/test";
import { getMCRInstance } from "@test/config/mcr.config";

export default async function globalSetup(_config: FullConfig) {
  getMCRInstance().cleanCache();
}
