#!/usr/bin/env python3
"""
Script to fix Python syntax errors in generate_nfa_automation.py
This script will restore proper Python syntax without changing functionality
"""

import re
import os

def fix_python_file(file_path):
    """Fix Python syntax errors in the file"""
    print(f"Fixing Python syntax in: {file_path}")
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove any remaining merge conflict markers
    content = re.sub(r'<<<<<<< HEAD\n?', '', content)
    content = re.sub(r'=======\n?', '', content)
    content = re.sub(r'>>>>>>> [^\n]+\n?', '', content)
    
    # Fix common Python syntax issues
    # Remove lines that start with text that should be in strings/comments
    lines = content.split('\n')
    fixed_lines = []
    
    in_string = False
    string_char = None
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check if we're in a string
        if not in_string:
            # Look for string starts
            if '"""' in line or "'''" in line:
                # Simple check - if line starts with assignment and has triple quotes
                if '=' in line and ('"""' in line or "'''" in line):
                    in_string = True
                    string_char = '"""' if '"""' in line else "'''"
                    fixed_lines.append(line)
                    i += 1
                    continue
            # Check for lines that look like they should be in comments or strings
            elif (line.strip() and 
                  not line.strip().startswith('#') and 
                  not line.strip().startswith('import') and
                  not line.strip().startswith('from') and
                  not line.strip().startswith('def ') and
                  not line.strip().startswith('class ') and
                  not line.strip().startswith('if ') and
                  not line.strip().startswith('else:') and
                  not line.strip().startswith('elif ') and
                  not line.strip().startswith('for ') and
                  not line.strip().startswith('while ') and
                  not line.strip().startswith('try:') and
                  not line.strip().startswith('except') and
                  not line.strip().startswith('finally:') and
                  not line.strip().startswith('with ') and
                  not line.strip().startswith('return ') and
                  not line.strip().startswith('print(') and
                  not line.strip().startswith('=') and
                  not line.strip().startswith('pass') and
                  not line.strip().startswith('break') and
                  not line.strip().startswith('continue') and
                  not line.strip() == '' and
                  not line.strip().startswith('}') and
                  not line.strip().startswith(']') and
                  not line.strip().startswith(')') and
                  line.strip()[0].isupper()):  # Lines starting with capital letters that aren't code
                # This looks like it should be in a string or comment, skip it
                i += 1
                continue
        else:
            # We're in a string, look for the end
            if string_char in line:
                in_string = False
                string_char = None
        
        fixed_lines.append(line)
        i += 1
    
    # Join the lines back
    fixed_content = '\n'.join(fixed_lines)
    
    # Write the fixed content back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print(f"Fixed Python syntax in: {file_path}")

if __name__ == "__main__":
    file_path = "backend/python/generate_nfa_automation.py"
    if os.path.exists(file_path):
        fix_python_file(file_path)
        print("Python syntax fixed!")
    else:
        print(f"File not found: {file_path}")
