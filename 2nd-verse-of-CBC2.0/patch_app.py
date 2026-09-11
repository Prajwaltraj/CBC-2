import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="w-full max-w-full overflow-x-hidden bg-[#010103] text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-white min-h-screen relative"',
    'className="w-full max-w-full overflow-x-hidden bg-[#F4F6F9] dark:bg-[#010103] text-gray-900 dark:text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-black dark:selection:text-white min-h-screen relative transition-colors duration-300"'
)

with open('src/App.jsx', 'w') as f:
    f.write(content)
print("Patched App.jsx")
