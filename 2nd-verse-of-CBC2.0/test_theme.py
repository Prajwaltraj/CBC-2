import re
import glob

def convert_to_dark_mode(content):
    replacements = {
        r'\btext-white\b': 'text-black dark:text-white',
        r'\btext-gray-400\b': 'text-gray-600 dark:text-gray-400',
        r'\btext-gray-300\b': 'text-gray-700 dark:text-gray-300',
        r'\btext-gray-500\b': 'text-gray-500 dark:text-gray-500',
        r'\bbg-black/40\b': 'bg-white/60 dark:bg-black/40',
        r'\bbg-black/60\b': 'bg-white/80 dark:bg-black/60',
        r'\bbg-black\b': 'bg-white dark:bg-black',
        r'\bbg-white/5\b': 'bg-black/5 dark:bg-white/5',
        r'\bbg-white/10\b': 'bg-black/10 dark:bg-white/10',
        r'\bborder-white/5\b': 'border-black/10 dark:border-white/5',
        r'\bborder-white/10\b': 'border-black/20 dark:border-white/10',
        r'\bborder-white/20\b': 'border-black/30 dark:border-white/20',
        r'\bbg-\[\#010103\]\b': 'bg-gray-50 dark:bg-[#010103]',
        r'\bbg-\[\#0F1014\]\b': 'bg-white dark:bg-[#0F1014]',
        r'\bfrom-\[\#010103\]\b': 'from-gray-50 dark:from-[#010103]',
        r'\bto-\[\#010103\]\b': 'to-gray-50 dark:to-[#010103]',
        r'\bvia-\[\#010103\]\b': 'via-gray-50 dark:via-[#010103]',
        r'\bfrom-black\b': 'from-white dark:from-black',
        r'\bto-black\b': 'to-white dark:to-black',
        r'\bvia-black\b': 'via-white dark:via-black',
    }
    
    for old, new in replacements.items():
        content = re.sub(old, new, content)
        
    return content

with open('src/components/AboutSection.jsx', 'r') as f:
    orig = f.read()
    
new_content = convert_to_dark_mode(orig)
print("Changes in AboutSection.jsx:")
for orig_line, new_line in zip(orig.splitlines(), new_content.splitlines()):
    if orig_line != new_line:
        print(f"- {orig_line.strip()}\n+ {new_line.strip()}\n")
