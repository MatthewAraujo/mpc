import { config, validateConfig } from "../config";
import { GitHubService, CommentAnalyzerService, CsvExporterService, ReportGeneratorService } from "../services";
import { AnalysisSummary } from "../types";

export class PRAnalyzerApplication {
  private readonly githubService: GitHubService;
  private readonly commentAnalyzer: CommentAnalyzerService;
  private readonly csvExporter: CsvExporterService;
  private readonly reportGenerator: ReportGeneratorService;

  constructor() {
    validateConfig();

    this.githubService = new GitHubService(config.githubToken!);
    this.commentAnalyzer = new CommentAnalyzerService(config.thanksKeywords);
    this.csvExporter = new CsvExporterService(config.outputDir);
    this.reportGenerator = new ReportGeneratorService(config.outputDir, config.thanksKeywords);
  }

  async run(): Promise<void> {
    try {
      console.log(`Iniciando Repo: ${config.targetRepo} — buscando ${config.prLimit} PRs (GraphQL)`);


      const [owner, name] = config.targetRepo.split("/");
      const prs = await this.githubService.fetchPullRequests(owner, name, config.prLimit);

      const comments = this.commentAnalyzer.extractComments(prs);

      const stats = this.commentAnalyzer.analyzeComments(comments, prs);

      this.csvExporter.exportCommentsToCSV(comments, prs);

      this.reportGenerator.generateMarkdownReport(
        config.targetRepo,
        stats,
      );

      const summary: AnalysisSummary = {
        repo: `https://github.com/${config.targetRepo}`,
        prCount: prs.length,
        totalComments: stats.totalComments,
        avgCommentsPerPR: stats.avgCommentsPerPR,
        avgChars: stats.avgChars,
        avgWords: stats.avgWords,
        thanksCount: stats.thanksCount
      };

      this.reportGenerator.generateJsonSummary(summary);

    } catch (error) {
      console.error("Erro durante a execução:", error);
      throw error;
    } finally {
      console.log("Finalizando análise do repositório");
    }
  }
}
