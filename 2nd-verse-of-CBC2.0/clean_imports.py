import glob
import os

files = glob.glob('src/components/*.jsx') + glob.glob('src/components/*.js')

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Check if the file starts with the boilerplate
    if "import { useState, useEffect, useRef, useCallback } from 'react';" in content[:500]:
        print(f"Cleaning {file}")
        lines = content.split('\n')
        # Skip the first 15 lines which are the boilerplate
        new_lines = lines[15:]
        
        # Now add back react import if needed
        # We'll just add standard imports that might be needed
        needs_react = 'React' in content
        needs_motion = 'motion' in content
        needs_lucide = 'lucide-react' in content
        
        header = ""
        if needs_react:
            header += "import React from 'react';\n"
            
        with open(file, 'w') as f:
            f.write(header + '\n'.join(new_lines))

