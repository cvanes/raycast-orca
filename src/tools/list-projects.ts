import { listRepos } from "../lib/api";
import { slimRepo } from "../lib/format";
import { withOrca } from "./shared/errors";

export default async function tool() {
  return withOrca(async () => ({ projects: (await listRepos()).map(slimRepo) }));
}
