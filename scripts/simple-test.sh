#!/bin/bash
# Simple test script for health check

BASE_URL="http://localhost:8000/api/v1"
API_KEY="keliapi-default-development-key-2023"

echo "Testing health endpoint with API key..."
curl -v -X GET -H "X-API-Key: $API_KEY" "$BASE_URL/health"
echo

echo "Testing health endpoint without API key..."
curl -v -X GET "$BASE_URL/health"
echo
