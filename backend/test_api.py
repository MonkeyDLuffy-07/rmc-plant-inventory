"""
Simple test script to verify the API is working correctly
Run this after starting the server with: python test_api.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_login():
    print("Testing login...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")
    return response.json()

def test_get_materials():
    print("Testing get materials...")
    response = requests.get(f"{BASE_URL}/api/materials")
    print(f"Status: {response.status_code}")
    materials = response.json()
    print(f"Found {len(materials)} materials")
    if materials:
        print(f"First material: {materials[0]}\n")
    return materials

def test_get_suppliers():
    print("Testing get suppliers...")
    response = requests.get(f"{BASE_URL}/api/suppliers")
    print(f"Status: {response.status_code}")
    suppliers = response.json()
    print(f"Found {len(suppliers)} suppliers\n")
    return suppliers

def test_get_transactions():
    print("Testing get transactions...")
    response = requests.get(f"{BASE_URL}/api/transactions")
    print(f"Status: {response.status_code}")
    transactions = response.json()
    print(f"Found {len(transactions)} transactions\n")
    return transactions

def test_get_alerts():
    print("Testing get alerts...")
    response = requests.get(f"{BASE_URL}/api/alerts")
    print(f"Status: {response.status_code}")
    alerts = response.json()
    print(f"Found {len(alerts)} alerts\n")
    return alerts

if __name__ == "__main__":
    print("=" * 50)
    print("RMC Plant Inventory API Test Suite")
    print("=" * 50 + "\n")
    
    try:
        test_health()
        test_login()
        test_get_materials()
        test_get_suppliers()
        test_get_transactions()
        test_get_alerts()
        
        print("=" * 50)
        print("All tests completed!")
        print("=" * 50)
    except Exception as e:
        print(f"Error: {e}")
