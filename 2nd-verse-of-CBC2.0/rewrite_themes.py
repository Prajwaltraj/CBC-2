import re
import glob

replacements = {
    r'\btext-white\b': 'text-black dark:text-white',
    r'\btext-gray-400\b': 'text-gray-600 dark:text-gray-400',
    r'\btext-gray-300\b': 'text-gray-700 dark:text-gray-300',
    r'\btext-[#F0F0F0]\b': 'text-gray-900 dark:text-[#F0F0F0]',
    r'\bbg-black/40\b': 'bg-white/60 dark:bg-black/40',
    r'\bbg-black/60\b': 'bg-white/80 dark:bg-black/60',
    r'\bbg-black\b': 'bg-white dark:bg-black',
    r'\bbg-white/5\b': 'bg-black/5 dark:bg-white/5',
    r'\bbg-white/10\b': 'bg-black/10 dark:bg-white/10',
    r'\bborder-white/5\b': 'border-black/10 dark:border-white/5',
    r'\bborder-white/10\b': 'border-black/20 dark:border-white/10',
    r'\bborder-white/20\b': 'border-black/30 dark:border-white/20',
    r'\bbg-\[\#010103\]\b': 'bg-[#F4F6F9] dark:bg-[#010103]',
    r'\bbg-\[\#000000\]\b': 'bg-white dark:bg-[#000000]',
    r'\bbg-\[\#0F1014\]\b': 'bg-white dark:bg-[#0F1014]',
    r'\bfrom-\[\#010103\]\b': 'from-[#F4F6F9] dark:from-[#010103]',
    r'\bto-\[\#010103\]\b': 'to-[#F4F6F9] dark:to-[#010103]',
    r'\bvia-\[\#010103\]\b': 'via-[#F4F6F9] dark:via-[#010103]',
    r'\bfrom-black\b': 'from-white dark:from-black',
    r'\bto-black\b': 'to-white dark:to-black',
    r'\bvia-black\b': 'via-white dark:via-black',
    r'\bbg-\[\#121212\]\b': 'bg-gray-100 dark:bg-[#121212]',
    r'\bborder-\[\#222\]\b': 'border-gray-300 dark:border-[#222]',
}

def convert_file(path):
    with open(path, 'r') as f:
        content = f.read()
    
    # Simple deduplication trick to avoid repeatedly applying if script is run twice
    # Actually I should be careful not to match 'dark:text-white' when replacing 'text-white'
    # By using negative lookbehind, we can ensure we don't replace if it's already dark:
    
    for old, new in replacements.items():
        # Match old, but only if it is not preceded by dark: and not followed by (like in dark:text-white)
        # Also, negative lookbehind for ':' to avoid matching hover:text-white etc, UNLESS the regex specifically wants hover:
        if old.startswith(r'\b'):
            # Only replace if not prefixed by dark: or hover: or focus: etc?
            # Actually, `hover:text-white` should become `hover:text-black dark:hover:text-white`!
            pass
            
    # To handle hover/focus prefixes, let's do a more robust regex.
    # regex: (?<![:a-zA-Z0-9-])(hover:|focus:|active:|group-hover:|)?(text-white)
    
    robust_replacements = {}
    for old, new in replacements.items():
        # old looks like \btext-white\b
        clean_old = old.replace(r'\b', '')
        
        # Split new into base and dark e.g. text-black dark:text-white
        base_new, dark_new = new.split(' dark:')
        
        # Regex to find an optional prefix, then the exact class, NOT preceded by 'dark:'
        pattern = r'(?<!dark:)(?<![:a-zA-Z0-9-])((?:hover:|focus:|group-hover:|)?)\b' + re.escape(clean_old) + r'\b'
        
        def replacer(match):
            prefix = match.group(1)
            # return `hover:text-black dark:hover:text-white`
            return f"{prefix}{base_new} dark:{prefix}{dark_new}"
        
        content = re.sub(pattern, replacer, content)

    with open(path, 'w') as f:
        f.write(content)
    print(f"Patched {path}")

files = glob.glob('src/components/**/*.jsx', recursive=True) + glob.glob('src/pages/**/*.jsx', recursive=True) + ['src/App.jsx']
for file in files:
    convert_file(file)

