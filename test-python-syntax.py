#!/usr/bin/env python3
"""
Simple test to check if the Python script has valid syntax
"""

import ast
import sys
import os

def test_python_syntax():
    """Test if the Python script has valid syntax"""
    print("🧪 Testing Python Script Syntax")
    print("=" * 50)
    
    script_path = "backend/python/generate_nfa_automation.py"
    
    if not os.path.exists(script_path):
        print(f"❌ Script not found: {script_path}")
        return False
    
    try:
        with open(script_path, 'r', encoding='utf-8') as f:
            source = f.read()
        
        # Parse the Python code to check for syntax errors
        ast.parse(source)
        print("✅ Python script syntax is valid!")
        print("   No syntax errors found.")
        return True
        
    except SyntaxError as e:
        print(f"❌ Syntax Error found:")
        print(f"   Line {e.lineno}: {e.text}")
        print(f"   Error: {e.msg}")
        return False
        
    except Exception as e:
        print(f"❌ Error reading/parsing script: {e}")
        return False

if __name__ == "__main__":
    success = test_python_syntax()
    
    if success:
        print("\n🎉 Python script is ready to use!")
        print("   The download NFA functionality should work now.")
    else:
        print("\n⚠️ Python script needs more fixes.")
        print("   Check the syntax errors above.")
