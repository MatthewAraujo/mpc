import * as fs from "fs";
import * as path from "path";
import { AnalysisSummary, CommentStats } from "../types";
import { ensureDirectoryExists } from "../utils";


export class ReportGeneratorService {
  private readonly outputDir: string;
  private readonly thanksKeywords: readonly string[];

  constructor(outputDir: string, thanksKeywords: readonly string[]) {
    this.outputDir = outputDir;
    this.thanksKeywords = thanksKeywords;
  }


  generateMarkdownReport(
    repo: string,
    stats: CommentStats,
  ): string {
    ensureDirectoryExists(this.outputDir);

    const reportLines = this.buildReportLines(repo, stats);
    const reportContent = reportLines.join("\n");

    const filePath = path.join(this.outputDir, "report.md");
    fs.writeFileSync(filePath, reportContent, { encoding: "utf8" });

    return filePath;
  }


  generateJsonSummary(summary: AnalysisSummary): string {
    ensureDirectoryExists(this.outputDir);

    const filePath = path.join(this.outputDir, "summary.json");
    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2), { encoding: "utf8" });

    return filePath;
  }

  private buildReportLines(repo: string, stats: CommentStats): string[] {
    const reportLines: string[] = [];

    reportLines.push("# Relatório - Análise de comentários de Pull Requests");
    reportLines.push("");
    reportLines.push("**a) Número do Grupo e participantes**");
    reportLines.push("- Número do Grupo: **3**");
    reportLines.push("- Participantes: **Matthew Araujo, Edson Wander, Raphael Almeida, Camilla**");
    reportLines.push("");
    reportLines.push("**b) Repositório analisado (URL):**");
    reportLines.push(`- https://github.com/${repo}`);
    reportLines.push("");
    reportLines.push("**c) Quantos comentários foram obtidos no total?**");
    reportLines.push(`- Total de comentários coletados: **${stats.totalComments}**`);
    reportLines.push("");
    reportLines.push("**d) Número médio de comentários por pull request na amostra (50 PRs):**");
    reportLines.push(`- Média (comentários por PR): **${stats.avgCommentsPerPR.toFixed(4)}**`);
    reportLines.push("");
    reportLines.push("**e) Tamanho médio dos comentários na amostra:**");
    reportLines.push(`- Tamanho médio (caracteres): **${stats.avgChars.toFixed(2)}**`);
    reportLines.push(`- Tamanho médio (palavras): **${stats.avgWords.toFixed(2)}**`);
    reportLines.push("");
    reportLines.push("**f) Quantos comentários possuem alguma das palavras de agradecimento?**");
    reportLines.push(`- Palavras pesquisadas (case-insensitive): ${this.thanksKeywords.join(", ")}`);
    reportLines.push(`- Comentários com agradecimento: **${stats.thanksCount}**`);
    reportLines.push("");
    reportLines.push("---");
    reportLines.push("## Observações técnicas");
    reportLines.push("- Comentários coletados incluem: issue comments, review bodies (quando body existe) e comments em review threads.");
    reportLines.push(`- CSV (${"`results.csv`"}) tem duas colunas: pr_number, comments. Todos os comentários de um PR foram concatenados usando o separador \` ||| \` e o campo foi corretamente escapado com aspas duplas; quebras de linha internas foram transformadas em espaço para evitar linhas extras no CSV.`);

    return reportLines;
  }

  private calculateTotalComments(countsPerPR: Map<number, number>): number {
    let sum = 0;
    for (const count of countsPerPR.values()) {
      sum += count;
    }
    return sum;
  }
}
