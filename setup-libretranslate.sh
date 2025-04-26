#!/bin/bash

# Start LibreTranslate
echo "Starting LibreTranslate container..."
docker-compose up -d

# Wait for the service to initialize (approximately 30 seconds)
echo "Waiting for LibreTranslate to initialize..."
sleep 30

# Generate an API key
echo "Generating API key..."
CONTAINER_ID=$(docker ps -qf "name=libretranslate")
if [ -z "$CONTAINER_ID" ]; then
  echo "Error: LibreTranslate container not found"
  exit 1
fi

# Generate the API key with 120 requests per day
API_KEY=$(docker exec $CONTAINER_ID /app/venv/bin/ltmanage keys add 120)

if [[ $API_KEY =~ "API key:" ]]; then
  # Extract the key from the output
  KEY=$(echo $API_KEY | sed -n 's/.*API key: \([^ ]*\).*/\1/p')
  echo "Generated API key: $KEY"
  
  # Add to .env file if it exists, otherwise create it
  if [ -f .env ]; then
    # Check if LIBRETRANSLATE_API_KEY already exists
    if grep -q "LIBRETRANSLATE_API_KEY" .env; then
      # Replace existing line
      sed -i '' "s/LIBRETRANSLATE_API_KEY=.*/LIBRETRANSLATE_API_KEY=$KEY/" .env
    else
      # Add new line
      echo "LIBRETRANSLATE_API_KEY=$KEY" >> .env
    fi
  else
    # Create new .env file
    echo "LIBRETRANSLATE_API_KEY=$KEY" > .env
    echo "LIBRETRANSLATE_URL=http://localhost:5000" >> .env
  fi
  
  echo "API key has been added to .env file"
  echo "LibreTranslate is ready to use at http://localhost:5000"
else
  echo "Error: Failed to generate API key"
  echo "Output: $API_KEY"
  exit 1
fi 