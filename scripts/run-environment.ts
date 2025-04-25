/**
 * Script to set up and run the environment based on command-line arguments
 * Usage: deno run --allow-env --allow-run scripts/run-environment.ts [environment]
 * Where environment is one of: dev, staging, prod
 */

// Get the environment from the command line
const envArg = Deno.args[0]?.toLowerCase() || "dev";

// Validate the environment
if (!["dev", "staging", "prod"].includes(envArg)) {
  console.error(`Invalid environment: ${envArg}`);
  console.error("Valid environments are: dev, staging, prod");
  Deno.exit(1);
}

// Map the CLI arg to a task
const taskMap: Record<string, string> = {
  "dev": "start:dev",
  "staging": "start:staging",
  "prod": "start:prod",
};

console.log(`Starting server in ${envArg} environment...`);

// Run the appropriate task
const command = new Deno.Command("deno", {
  args: ["task", taskMap[envArg]],
  stdout: "inherit",
  stderr: "inherit",
});

const child = command.spawn();

// Wait for the process to complete
await child.status;
