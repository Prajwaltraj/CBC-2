import re

with open('api/index.py', 'r') as f:
    content = f.read()

content = content.replace("from ._sheets import", "try:\n    from ._sheets import get_team_members, set_attendance, set_meal\nexcept ImportError:\n    from _sheets import get_team_members, set_attendance, set_meal")

with open('api/index.py', 'w') as f:
    f.write(content)
print("Import patched")
