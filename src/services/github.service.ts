import fetch from "cross-fetch";
import { GitHubGraphQLResponse, PullRequest } from "../types";

export class GitHubService {
  private readonly token: string;
  private readonly baseUrl = "https://api.github.com/graphql";

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Fetch pull requests with their comments, reviews, and review threads
   */
  async fetchPullRequests(owner: string, name: string, limit: number): Promise<PullRequest[]> {
    const query = this.buildGraphQLQuery();

    const response = await this.makeGraphQLRequest(query, {
      owner,
      name,
      prLimit: limit
    });

    if (response.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(response.errors, null, 2)}`);
    }

    return response.data.repository.pullRequests.nodes;
  }

  private buildGraphQLQuery(): string {
    return `
      query($owner:String!, $name:String!, $prLimit:Int!) {
        repository(owner:$owner, name:$name) {
          pullRequests(first:$prLimit, orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              number
              title
              body
              url
              createdAt
              comments(first: 50) {
                nodes {
                  id
                  body
                  createdAt
                  author {
                    login
                  }
                }
              }
              reviews(first: 50) {
                nodes {
                  id
                  body
                  createdAt
                  author {
                    login
                  }
                }
              }
              reviewThreads(first: 50) {
                nodes {
                  comments(first: 50) {
                    nodes {
                      id
                      body
                      createdAt
                      author {
                        login
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
  }

  private async makeGraphQLRequest(query: string, variables: Record<string, any>): Promise<GitHubGraphQLResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Authorization": `bearer ${this.token}`,
        "Content-Type": "application/json",
        "User-Agent": "gh-pr-comments-analyzer"
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${response.statusText} ${text}`);
    }

    return response.json();
  }
}
