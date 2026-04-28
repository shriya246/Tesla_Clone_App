import {
  assertDeploymentEnv,
  formatEnvValidationReport,
  getEnvValidationReport,
} from "../src/lib/env";

function run() {
  try {
    assertDeploymentEnv();
    console.log("Environment validation passed for deployment readiness.");
  } catch {
    const report = getEnvValidationReport();
    console.error(formatEnvValidationReport(report));
    process.exitCode = 1;
  }
}

run();
