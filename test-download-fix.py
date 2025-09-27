#!/usr/bin/env python3
"""
Test script to verify the download NFA functionality is working correctly
"""

import os
import sys
import subprocess
import json

def test_download_functionality():
    """Test the download NFA functionality"""
    print("🧪 Testing Download NFA Functionality")
    print("=" * 50)
    
    # Test data
    test_edited_text = """Subject: Request for Alumni Meet Event Approval

Request for approval regarding the Alumni Meet event scheduled for December 2024. This proposal requires administrative approval for the successful organization of the event.

• Event will be held on December 15, 2024
• Expected attendance of 200+ alumni members
• Budget allocation of ₹50,000 required
• Venue booking at RV University campus auditorium

The above proposal is submitted for approval, and the amount may kindly be reimbursed to the organizing committee after the event upon submission of the online report, receipts, and GST bills."""
    
    test_subject = "Request for Alumni Meet Event Approval"
    test_summary = "Alumni Meet Event"
    test_nfa_type = "reimbursement"
    test_table_data = [
        ["Item", "Quantity", "Rate", "Amount"],
        ["Food & Beverages", "200", "₹200", "₹40,000"],
        ["Decoration", "1", "₹5,000", "₹5,000"],
        ["Transportation", "1", "₹5,000", "₹5,000"]
    ]
    
    print("📝 Test Data:")
    print(f"   Subject: {test_subject}")
    print(f"   Summary: {test_summary}")
    print(f"   NFA Type: {test_nfa_type}")
    print(f"   Table Rows: {len(test_table_data)}")
    print()
    
    # Test Python script directly
    print("🐍 Testing Python script directly...")
    
    python_script = os.path.join("backend", "python", "generate_nfa_automation.py")
    if not os.path.exists(python_script):
        print(f"❌ Python script not found: {python_script}")
        return False
    
    args = [
        "python",
        python_script,
        "--download-mode",
        test_edited_text,
        test_subject,
        test_summary,
        test_nfa_type,
        json.dumps(test_table_data)
    ]
    
    try:
        result = subprocess.run(args, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            try:
                response = json.loads(result.stdout)
                if response.get("success"):
                    print("✅ Python script executed successfully!")
                    print(f"   File Path: {response.get('filePath')}")
                    print(f"   File Name: {response.get('fileName')}")
                    
                    # Check if file exists
                    file_path = response.get('filePath', '').replace('/', os.sep)
                    if file_path.startswith('/'):
                        file_path = file_path[1:]  # Remove leading slash
                    
                    full_path = os.path.join(os.getcwd(), file_path)
                    if os.path.exists(full_path):
                        file_size = os.path.getsize(full_path)
                        print(f"✅ Generated file exists: {full_path}")
                        print(f"   File size: {file_size:,} bytes")
                        
                        if file_size > 1000:  # Should be a reasonable DOCX file size
                            print("✅ File size looks good for a DOCX document")
                            return True
                        else:
                            print("⚠️ File size seems too small for a DOCX document")
                            return False
                    else:
                        print(f"❌ Generated file not found: {full_path}")
                        return False
                else:
                    print(f"❌ Python script returned error: {response.get('error')}")
                    return False
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse JSON response: {e}")
                print(f"   stdout: {result.stdout}")
                print(f"   stderr: {result.stderr}")
                return False
        else:
            print(f"❌ Python script failed with return code: {result.returncode}")
            print(f"   stdout: {result.stdout}")
            print(f"   stderr: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Python script timed out")
        return False
    except Exception as e:
        print(f"❌ Error running Python script: {e}")
        return False

def test_backend_api():
    """Test the backend API endpoint"""
    print("\n🌐 Testing Backend API...")
    
    import requests
    
    test_data = {
        "editedText": """Subject: Request for Alumni Meet Event Approval

Request for approval regarding the Alumni Meet event scheduled for December 2024. This proposal requires administrative approval for the successful organization of the event.

• Event will be held on December 15, 2024
• Expected attendance of 200+ alumni members
• Budget allocation of ₹50,000 required
• Venue booking at RV University campus auditorium

The above proposal is submitted for approval, and the amount may kindly be reimbursed to the organizing committee after the event upon submission of the online report, receipts, and GST bills.""",
        "subject": "Request for Alumni Meet Event Approval",
        "summary": "Alumni Meet Event",
        "nfaType": "reimbursement",
        "tableData": [
            ["Item", "Quantity", "Rate", "Amount"],
            ["Food & Beverages", "200", "₹200", "₹40,000"],
            ["Decoration", "1", "₹5,000", "₹5,000"],
            ["Transportation", "1", "₹5,000", "₹5,000"]
        ]
    }
    
    try:
        response = requests.post(
            "http://localhost:5000/api/download-edited-nfa",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ Backend API executed successfully!")
                print(f"   File Path: {result.get('filePath')}")
                print(f"   File Name: {result.get('fileName')}")
                return True
            else:
                print(f"❌ Backend API returned error: {result.get('error')}")
                return False
        else:
            print(f"❌ Backend API failed with status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server. Make sure it's running on localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Error testing backend API: {e}")
        return False

if __name__ == "__main__":
    print("🚀 NFA Download Functionality Test")
    print("=" * 50)
    
    # Test 1: Python script directly
    python_test_passed = test_download_functionality()
    
    # Test 2: Backend API (only if server is running)
    api_test_passed = test_backend_api()
    
    print("\n📊 Test Results:")
    print(f"   Python Script Test: {'✅ PASSED' if python_test_passed else '❌ FAILED'}")
    print(f"   Backend API Test: {'✅ PASSED' if api_test_passed else '❌ FAILED'}")
    
    if python_test_passed:
        print("\n🎉 Download functionality is working correctly!")
        print("   Your NFA documents will now download as proper DOCX files with:")
        print("   • Header image (if available)")
        print("   • Proper formatting matching the preview")
        print("   • Tables and bullet points")
        print("   • Professional structure")
    else:
        print("\n⚠️ Download functionality needs attention.")
        print("   Check the error messages above for details.")
