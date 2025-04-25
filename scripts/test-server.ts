/**
 * Simple script to test the server health endpoint
 */

// Wait for server to start
await new Promise((resolve) => setTimeout(resolve, 1000));

try {
  const response = await fetch("http://localhost:8000/api/v1/health", {
    headers: {
      "X-API-Key": "7b6acf9d51554ae4a480bd843a979942",
    },
  });

  if (response.ok) {
    console.log("✅ Server health check successful!");
    console.log("Status:", response.status);
    console.log("Response:", await response.text());
  } else {
    console.error("❌ Server health check failed!");
    console.error("Status:", response.status);
    console.error("Response:", await response.text());
  }
} catch (error: unknown) {
  console.error(
    "❌ Error connecting to server:",
    error instanceof Error ? error.message : String(error),
  );
}
