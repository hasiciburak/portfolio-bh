import { GithubGraphPanel } from "@/components/github-graph-panel";
import { fetchGitHubContributions } from "@/lib/github-contributions";

/**
 * Server half of the section: the GitHub token that makes private work countable
 * can only be read here. Only the aggregate numbers are handed down.
 */
const GithubGraphSection = async () => {
  const data = await fetchGitHubContributions();

  return (
    <GithubGraphPanel
      contributions={data?.contributions ?? null}
      privateCommits={data?.privateCommits ?? 0}
      privateRepoCount={data?.privateRepoCount ?? 0}
    />
  );
};

export default GithubGraphSection;
