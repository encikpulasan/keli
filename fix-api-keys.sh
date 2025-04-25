#!/bin/bash
# Script to fix API key issues

# Check for any running server instances and stop them
echo "Stopping any running server instances..."
pkill -f "deno run" || true

echo "Creating data directory if it doesn't exist..."
mkdir -p data

echo "Setting up API key in .env file..."
# Check if API_KEY exists in .env
if grep -q "API_KEY" .env; then
    echo "API_KEY already exists in .env"
else
    echo -e "\n# API Key Configuration" >>.env
    echo 'API_KEY="keliapi-default-development-key-2023"' >>.env
    echo "Added API_KEY to .env file"
fi

echo "Running the API key check script..."
deno run --allow-env --allow-read --allow-write --unstable-kv scripts/check-api-key.ts

echo "Starting the server in the background..."
deno task start &
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 3

echo "Testing health endpoint with API key..."
curl -s -H "X-API-Key: keliapi-default-development-key-2023" http://localhost:8000/api/v1/health

echo -e "\n\nRunning the test script..."
./test_endpoints.sh

echo "Stopping the server..."
kill $SERVER_PID || true
