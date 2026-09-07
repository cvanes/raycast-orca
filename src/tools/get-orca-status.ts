import { status } from "../lib/api";
import { slimStatus } from "../lib/format";

export default async function tool() {
  return slimStatus(await status());
}
