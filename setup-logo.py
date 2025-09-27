#!/usr/bin/env python3
"""
Script to help set up the logo for NFA documents
"""

import os
import shutil

def setup_logo():
    """Help user set up the logo file"""
    print("🎨 NFA Logo Setup Helper")
    print("=" * 50)
    
    # Check if logo file exists
    logo_path = "backend/uploads/header.png"
    
    if os.path.exists(logo_path):
        # Check if it's a real image file or just a placeholder
        with open(logo_path, 'r') as f:
            content = f.read()
            if content.startswith("# This is a placeholder"):
                print("⚠️  Found placeholder logo file")
                print(f"📁 Location: {logo_path}")
                print("\n📝 To fix this:")
                print("1. Find your RV University logo image file")
                print("2. Copy it to: backend/uploads/header.png")
                print("3. Make sure it's in PNG format")
                print("4. Recommended size: 800x200 pixels")
            else:
                print("✅ Logo file exists and appears to be a real image")
    else:
        print("❌ No logo file found")
        print(f"📁 Expected location: {logo_path}")
        print("\n📝 To fix this:")
        print("1. Find your RV University logo image file")
        print("2. Copy it to: backend/uploads/header.png")
        print("3. Make sure it's in PNG format")
        print("4. Recommended size: 800x200 pixels")
    
    print("\n🔧 Alternative solutions:")
    print("1. Use any logo image file and rename it to 'header.png'")
    print("2. Create a simple text-based header instead")
    print("3. Use the university name as text header (already implemented)")
    
    print("\n📋 Current logo search paths:")
    search_paths = [
        "backend/uploads/header.png",
        "backend/assets/header.png", 
        "backend/header.png",
        "public/header.png"
    ]
    
    for path in search_paths:
        if os.path.exists(path):
            print(f"✅ {path} - Found")
        else:
            print(f"❌ {path} - Not found")

if __name__ == "__main__":
    setup_logo()
