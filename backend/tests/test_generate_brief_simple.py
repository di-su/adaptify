"""Simple tests for the generate brief API endpoint"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)


def test_health_check():
    """Test the health check endpoint works"""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "Content Brief Generator API"}


def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Content Brief Generator API"}


def test_generate_brief_endpoint_exists():
    """Test that the generate brief endpoint exists and accepts POST requests"""
    # Send a request with minimal valid data
    response = client.post(
        "/api/generate-brief",
        json={"keyword": "test"}
    )
    # We expect 200 (success) or 500 (if API key is missing)
    assert response.status_code in [200, 500]
    

def test_generate_brief_validates_json():
    """Test that the endpoint validates JSON input"""
    response = client.post(
        "/api/generate-brief",
        content="invalid json",
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 422  # Unprocessable Entity