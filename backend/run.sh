#!/bin/bash

echo "Starting backend setup..."

# Activate virtual environment
if [ ! -d "myenv" ]; then
    echo "Creating virtual environment..."
    python -m venv myenv
fi

echo "Activating virtual environment..."
source myenv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one with your ANTHROPIC_API_KEY"
    if [ -f ".env.example" ]; then
        echo "You can copy .env.example to .env and add your API key"
    fi
    exit 1
fi

# Start the server
echo "Starting FastAPI server..."
uvicorn main:app --reload