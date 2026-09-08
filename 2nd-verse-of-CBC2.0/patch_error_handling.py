import re

def patch(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Find the loadTeam and markMeal error handlers
    content = content.replace("showToast('Network error — check your connection');", 
"""showToast(e.name === 'SyntaxError' ? 'Server error: Are you running locally via Vite? Try vercel dev.' : 'Network error — check your connection');""")

    with open(filename, 'w') as f:
        f.write(content)
        
patch('public/meals.html')
patch('public/attendance.html')
print("Patched")
