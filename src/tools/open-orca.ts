import { open } from "../lib/api";
import { focusOrca } from "../lib/app";
import { slimStatus } from "../lib/format";

export default async function tool() {
  const result = await open();
  await focusOrca();
  return slimStatus(result);
}
