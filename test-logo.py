#!/usr/bin/env python3
"""
Test script to verify logo files are found correctly
"""

import os
import sys

def test_logo_paths():
    """Test if the logo files can be found"""
    print("🔍 Testing Logo File Detection")
    print("=" * 50)
    
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(current_dir, "backend")
    uploads_dir = os.path.join(backend_dir, "uploads")
    
    # Define the paths to check
    possible_header_paths = [
        os.path.join(uploads_dir, "header.png"),  # Your existing header.png
        os.path.join(current_dir, "public", "rv logo.jpeg"),  # Your RV logo
        os.path.join(current_dir, "public", "header.png"),
        os.path.join(backend_dir, "assets", "header.png"),
        os.path.join(backend_dir, "header.png"),
    ]
    
    print("📁 Checking logo files in these locations:")
    print()
    
    found_files = []
    for i, path in enumerate(possible_header_paths, 1):
        if os.path.exists(path):
            file_size = os.path.getsize(path)
            print(f"✅ {i}. {path}")
            print(f"   Size: {file_size:,} bytes")
            print(f"   Type: {'Image file' if file_size > 1000 else 'Text file (placeholder)'}")
            found_files.append(path)
        else:
            print(f"❌ {i}. {path} - Not found")
        print()
    
    if found_files:
        print(f"🎉 Found {len(found_files)} logo file(s):")
        for file_path in found_files:
            print(f"   📄 {file_path}")
        print()
        print("✅ Your NFA documents should now display logos correctly!")
    else:
        print("⚠️  No logo files found!")
        print("   The system will use the text header fallback instead.")
    
    print()
    print("🔧 Logo Priority Order:")
    print("1. backend/uploads/header.png (your header.png)")
    print("2. public/rv logo.jpeg (your RV logo)")
    print("3. public/header.png")
    print("4. Text header fallback (if no images found)")

if __name__ == "__main__":
    test_logo_paths()
