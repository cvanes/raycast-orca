import { listMyRepos, searchRepos } from "../lib/github";

type Input = {
  /**
   * Free text GitHub search query, for example "raycast extensions" or "acme web-app".
   * Omit it to list the signed-in user's own repositories, most recently updated first.
   */
  query?: string;
  /**
   * Maximum number of repositories to return. Defaults to 30 for a search and 50 for the user's
   * own repositories.
   */
  limit?: number;
};

export default async function tool(input: Input) {
  const query = input.query?.trim();
  const result = query ? await searchRepos(query, input.limit) : await listMyRepos(input.limit);
  return { ghAvailable: result.available, reason: result.reason, repos: result.repos };
}
