import * as fs from "fs";
import * as path from "path";
import { Comment, PullRequest } from "../types";
import { escapeCsvField, ensureDirectoryExists } from "../utils";

/**
 * Service responsible for exporting data to CSV format
 * Follows Single Responsibility Principle
 */
export class CsvExporterService {
  private readonly outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  /**
   * Export comments to CSV format
   */
  exportCommentsToCSV(comments: Comment[], prs: PullRequest[]): string {
    ensureDirectoryExists(this.outputDir);

    const csvLines = this.buildCSVLines(comments, prs);
    const csvContent = csvLines.join("\n");

    const filePath = path.join(this.outputDir, "results.csv");
    fs.writeFileSync(filePath, csvContent, { encoding: "utf8" });

    return filePath;
  }

  private buildCSVLines(comments: Comment[], prs: PullRequest[]): string[] {
    const csvLines: string[] = [];
    csvLines.push("pr_number,comments"); // header

    const prCommentsMap = this.groupCommentsByPR(comments, prs);

    // Iterate PRs in same order as returned
    for (const pr of prs) {
      const prNumber = pr.number;
      const commentsArr = prCommentsMap.get(prNumber) || [];
      const joined = this.joinComments(commentsArr);
      csvLines.push(`${prNumber},${escapeCsvField(joined)}`);
    }

    return csvLines;
  }

  private groupCommentsByPR(comments: Comment[], prs: PullRequest[]): Map<number, string[]> {
    const prCommentsMap = new Map<number, string[]>();

    // Group comments by PR number
    for (const comment of comments) {
      const existing = prCommentsMap.get(comment.prNumber) || [];
      prCommentsMap.set(comment.prNumber, existing.concat([comment.body]));
    }

    // Ensure PRs without comments appear with empty array
    for (const pr of prs) {
      if (!prCommentsMap.has(pr.number)) {
        prCommentsMap.set(pr.number, []);
      }
    }

    return prCommentsMap;
  }

  private joinComments(comments: string[]): string {
    return comments
      .map(comment => comment.replace(/\r\n/g, " ").replace(/\n/g, " ").trim())
      .join(" ||| ");
  }
}
