import { getMCRInstance } from "./config/mcr.config";

async function globalTeardown() {
  await getMCRInstance().generate();
}

export default globalTeardown;
