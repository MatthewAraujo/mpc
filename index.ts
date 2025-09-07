import { PRAnalyzerApplication } from "./src/application";

/**
 * Main entry point for the PR Comments Analyzer application
 * 
 * This refactored version follows SOLID principles:
 * - Single Responsibility: Each class has one reason to change
 * - Open/Closed: Open for extension, closed for modification
 * - Liskov Substitution: Derived classes are substitutable for base classes
 * - Interface Segregation: Clients shouldn't depend on interfaces they don't use
 * - Dependency Inversion: Depend on abstractions, not concretions
 * 
 * Architecture benefits:
 * - DRY (Don't Repeat Yourself): Common functionality is extracted to utilities
 * - Separation of Concerns: Each service handles one specific responsibility
 * - Dependency Injection: Dependencies are injected rather than hard-coded
 * - Testability: Each component can be tested in isolation
 * - Maintainability: Changes to one component don't affect others
 * - Readability: Code is organized in logical, focused modules
 */
async function main(): Promise<void> {
  const app = new PRAnalyzerApplication();
  await app.run();
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
