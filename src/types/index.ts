export interface Comment {
  prNumber: number;
  body: string;
  author?: string;
  createdAt?: string;
  source: "issue" | "review" | "reviewThread";
}

export interface PullRequest {
  number: number;
  title: string;
  url: string;
  createdAt: string;
  comments: {
    nodes: Array<{
      id: string;
      body: string;
      createdAt: string;
      author?: { login: string };
    }>;
  };
  reviews: {
    nodes: Array<{
      id: string;
      body: string;
      createdAt: string;
      author?: { login: string };
    }>;
  };
  reviewThreads: {
    nodes: Array<{
      comments: {
        nodes: Array<{
          id: string;
          body: string;
          createdAt: string;
          author?: { login: string };
        }>;
      };
    }>;
  };
}

export interface GitHubGraphQLResponse {
  data: {
    repository: {
      pullRequests: {
        nodes: PullRequest[];
      };
    };
  };
  errors?: Array<{
    message: string;
  }>;
}

export interface AnalysisSummary {
  repo: string;
  prCount: number;
  totalComments: number;
  avgCommentsPerPR: number;
  avgChars: number;
  avgWords: number;
  thanksCount: number;
}

export interface CommentStats {
  totalComments: number;
  avgCommentsPerPR: number;
  avgChars: number;
  avgWords: number;
  thanksCount: number;
  countsPerPR: Map<number, number>;
}
