import { unstable_cache } from "next/cache";
import type { Activity } from "react-activity-calendar";

export const GITHUB_USERNAME = "hasiciburak";
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

/**
 * Set `GITHUB_CONTRIBUTIONS_TOKEN` to a token owned by GITHUB_USERNAME to have the
 * graph count work done in private repositories — most of a year's commits live
 * there, and the public calendar reads as a fraction of the real total.
 *
 * A classic PAT needs the `repo` scope; a fine-grained one needs read access to
 * the private repositories that should count. Without a token the fetcher falls
 * back to the public calendar below, which is public-only by construction: the
 * section still renders, just without the private breakdown.
 */
const CONTRIBUTIONS_QUERY = `
  query Contributions($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 100) {
          repository {
            isPrivate
          }
          contributions {
            totalCount
          }
        }
      }
    }
  }
`;

const PUBLIC_CONTRIBUTIONS_API = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;

const CACHE_SECONDS = 3600;

/** GitHub buckets each day into quartiles; react-activity-calendar wants 0–4. */
const LEVEL_BY_NAME: Record<string, Activity["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

interface GraphQlResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: {
            contributionDays?: {
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }[];
          }[];
        };
        commitContributionsByRepository?: {
          repository?: { isPrivate?: boolean };
          contributions?: { totalCount?: number };
        }[];
      };
    };
  };
  errors?: { message: string }[];
}

export interface GitHubContributionsData {
  contributions: Activity[];
  /**
   * Commits pushed to private repositories over the same year. Commits rather than
   * every contribution type, because commits are the only slice GitHub will break
   * down per repository — counting them against a mixed total would be dishonest.
   * Only the counts cross this boundary: repository names never leave the server,
   * so a public page cannot name a client's codebase.
   */
  privateCommits: number;
  /** Private repositories worked in, or 0 when the token cannot see them by name. */
  privateRepoCount: number;
}

const fetchFromGraphQl = async (
  token: string,
): Promise<GitHubContributionsData | null> => {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { login: GITHUB_USERNAME },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as GraphQlResponse;

  // GitHub answers 200 with an `errors` array for a revoked or under-scoped token,
  // so an ok response is not on its own evidence that there is a calendar here.
  if (json.errors?.length) {
    return null;
  }

  const collection = json.data?.user?.contributionsCollection;
  const calendar = collection?.contributionCalendar;
  const weeks = calendar?.weeks;

  if (!weeks?.length) {
    return null;
  }

  const contributions: Activity[] = weeks.flatMap((week) =>
    (week.contributionDays ?? []).map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: LEVEL_BY_NAME[day.contributionLevel] ?? 0,
    })),
  );

  if (!contributions.length) {
    return null;
  }

  const byRepository = collection?.commitContributionsByRepository ?? [];
  const visiblePrivate = byRepository.filter(
    (entry) => entry.repository?.isPrivate,
  );

  // A private repository the token cannot open is invisible here rather than
  // itemised, so an under-scoped token reports zero and the breakdown line simply
  // does not appear — better a missing line than a number that quietly undercounts.
  const privateCommits = visiblePrivate.reduce(
    (total, entry) => total + (entry.contributions?.totalCount ?? 0),
    0,
  );

  return {
    contributions,
    privateCommits,
    privateRepoCount: visiblePrivate.length,
  };
};

interface PublicApiResponse {
  contributions?: Activity[];
}

/** Public contributions only — the graph still draws when no token is configured. */
const fetchFromPublicApi = async (): Promise<GitHubContributionsData | null> => {
  const response = await fetch(PUBLIC_CONTRIBUTIONS_API);

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as PublicApiResponse;
  const contributions = json.contributions;

  if (!contributions?.length) {
    return null;
  }

  return {
    contributions,
    privateCommits: 0,
    privateRepoCount: 0,
  };
};

const loadContributions = async (): Promise<GitHubContributionsData | null> => {
  const token = process.env.GITHUB_CONTRIBUTIONS_TOKEN;

  try {
    if (token) {
      const authenticated = await fetchFromGraphQl(token);
      if (authenticated) {
        return authenticated;
      }
    }

    return await fetchFromPublicApi();
  } catch {
    return null;
  }
};

/**
 * `unstable_cache` rather than `fetch`'s own `next.revalidate`: the GraphQL call is
 * a POST, which the fetch cache does not hold, and this way the two sources share
 * one cache entry whichever of them answered.
 */
export const fetchGitHubContributions = unstable_cache(
  loadContributions,
  ["github-contributions", GITHUB_USERNAME],
  { revalidate: CACHE_SECONDS, tags: ["github-contributions"] },
);
