import os
import glob
import re

for filepath in glob.glob("src/components/*.jsx") + glob.glob("src/components/*.js") + glob.glob("src/pages/*.jsx"):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove the standard block comments
    # // ------------------------------------------------------------------
    # // SOMETHING
    # // ------------------------------------------------------------------
    content = re.sub(r'// -+\n// [A-Z0-9 &]+\n// -+\n', '', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Cleaned")
