import { Comment, CommentStats, PullRequest } from "../types";
import { wordCount, createKeywordRegex } from "../utils";


export class CommentAnalyzerService {
  private readonly thanksKeywords: readonly string[];

  constructor(thanksKeywords: readonly string[]) {
    this.thanksKeywords = thanksKeywords;
  }

  extractComments(prs: PullRequest[]): Comment[] {
    const allComments: Comment[] = [];

    for (const pr of prs) {
      allComments.push(...this.extractCommentsFromPR(pr));
    }

    return allComments;
  }


  analyzeComments(comments: Comment[], prs: PullRequest[]): CommentStats {
    const totalComments = comments.length;
    const countsPerPR = this.calculateCommentsPerPR(comments, prs);
    const avgCommentsPerPR = this.calculateAverageCommentsPerPR(countsPerPR);
    const { avgChars, avgWords } = this.calculateAverageSizes(comments);
    const thanksCount = this.countThanksComments(comments);

    return {
      totalComments,
      avgCommentsPerPR,
      avgChars,
      avgWords,
      thanksCount,
      countsPerPR
    };
  }

  private extractCommentsFromPR(pr: PullRequest): Comment[] {
    const comments: Comment[] = [];
    const prNumber = pr.number;

    // Extract issue comments
    if (pr.comments?.nodes) {
      for (const comment of pr.comments.nodes) {
        if (comment?.body) {
          comments.push({
            prNumber,
            body: comment.body,
            author: comment.author?.login,
            createdAt: comment.createdAt,
            source: "issue"
          });
        }
      }
    }

    // Extract review comments
    if (pr.reviews?.nodes) {
      for (const review of pr.reviews.nodes) {
        if (review?.body) {
          comments.push({
            prNumber,
            body: review.body,
            author: review.author?.login,
            createdAt: review.createdAt,
            source: "review"
          });
        }
      }
    }

    // Extract review thread comments
    if (pr.reviewThreads?.nodes) {
      for (const thread of pr.reviewThreads.nodes) {
        if (thread?.comments?.nodes) {
          for (const comment of thread.comments.nodes) {
            if (comment?.body) {
              comments.push({
                prNumber,
                body: comment.body,
                author: comment.author?.login,
                createdAt: comment.createdAt,
                source: "reviewThread"
              });
            }
          }
        }
      }
    }

    return comments;
  }

  private calculateCommentsPerPR(comments: Comment[], prs: PullRequest[]): Map<number, number> {
    const countsPerPR = new Map<number, number>();

    for (const comment of comments) {
      countsPerPR.set(comment.prNumber, (countsPerPR.get(comment.prNumber) || 0) + 1);
    }

    for (const pr of prs) {
      if (!countsPerPR.has(pr.number)) {
        countsPerPR.set(pr.number, 0);
      }
    }

    return countsPerPR;
  }

  private calculateAverageCommentsPerPR(countsPerPR: Map<number, number>): number {
    if (countsPerPR.size === 0) return 0;

    let sumComments = 0;
    for (const count of countsPerPR.values()) {
      sumComments += count;
    }

    return sumComments / countsPerPR.size;
  }

  private calculateAverageSizes(comments: Comment[]): { avgChars: number; avgWords: number } {
    if (comments.length === 0) {
      return { avgChars: 0, avgWords: 0 };
    }

    let totalChars = 0;
    let totalWords = 0;

    for (const comment of comments) {
      const body = comment.body || "";
      totalChars += body.length;
      totalWords += wordCount(body);
    }

    return {
      avgChars: totalChars / comments.length,
      avgWords: totalWords / comments.length
    };
  }

  private countThanksComments(comments: Comment[]): number {
    const regex = createKeywordRegex(this.thanksKeywords);
    let thanksCount = 0;

    for (const comment of comments) {
      if (regex.test(comment.body)) {
        thanksCount++;
      }
    }

    return thanksCount;
  }
}
