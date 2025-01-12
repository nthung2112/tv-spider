import { getRequest, groupBy } from "../shared";

export interface Match {
  id: string;
  match_status: string;
  tournament: {
    name: string;
    priority: number;
  };
}

export interface MatchData {
  play_urls: Array<{
    name: string;
    url: string;
  }>;
  commentators?: Array<{
    name: string;
  }>;
}

export interface MatchMeta {
  away?: {
    name: string;
  };
  home: {
    name: string;
  };
  scores: {
    away: number;
    home: number;
  };
  tournament: {
    name: string;
    logo: string;
  };
  name: string;
}

export const STATUS_MAPPING: Record<string, string> = {
  featured: "Nổi bật",
  live: "Đang diễn ra",
  pending: "Sắp diễn ra",
};

export const STATUS_ORDER: Record<string, number> = {
  featured: 0,
  live: 1,
  pending: 2,
};

export async function fetchMatchData(url: string): Promise<[Match[], Match[]]> {
  try {
    const [featuredData, matchData] = await Promise.all([
      getRequest<string>(`${url}/api/match/featured`),
      getRequest<string>(`${url}/api/match/featured/mt`),
    ]);
    return [JSON.parse(featuredData).data, JSON.parse(matchData).data];
  } catch (error) {
    console.error("Error fetching match data:", error);
    return [[], []];
  }
}

export function createFilterTag(matches: Match[]): FilterItem {
  const tours = groupBy(
    matches.sort((a, b) => b.tournament.priority - a.tournament.priority),
    "tournament.name"
  );

  return {
    key: "tag",
    name: "Type",
    init: Object.keys(tours)[0] || "",
    value: Object.keys(tours).map((tourName) => ({
      n: tourName,
      v: tourName,
    })),
  };
}
