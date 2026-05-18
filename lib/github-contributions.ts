import type { Activity } from "react-activity-calendar";

export const GITHUB_USERNAME = "hasiciburak";
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

const CONTRIBUTIONS_API = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;

interface ContributionsApiResponse {
  total?: { lastYear?: number };
  contributions?: Activity[];
}

export interface GitHubContributionsData {
  contributions: Activity[];
  totalLastYear: number;
}

export async function fetchGitHubContributions(): Promise<GitHubContributionsData | null> {
  try {
    const response = await fetch(CONTRIBUTIONS_API, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as ContributionsApiResponse;
    const contributions = json.contributions;

    if (!contributions?.length) {
      return null;
    }

    return {
      contributions,
      totalLastYear: json.total?.lastYear ?? 0,
    };
  } catch {
    return null;
  }
}
