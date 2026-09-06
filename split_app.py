import os
import re

with open("2nd-verse-of-CBC2.0/src/App.jsx", "r") as f:
    lines = f.readlines()

os.makedirs("2nd-verse-of-CBC2.0/src/components", exist_ok=True)

imports = "".join(lines[0:15])

boundaries = [
    (15, 63, "CustomCursor.jsx"),
    (63, 116, "NeuralBackground.jsx"),
    (116, 229, "NavigationBar.jsx"),
    (229, 259, "useCountdown.js"),
    (259, 298, "FixedTimer.jsx"),
    (298, 339, "TerminalWindow.jsx"),
    (339, 372, "TiltCard.jsx"),
    (372, 457, "HeroSection.jsx"),
    (457, 485, "StatsSection.jsx"),
    (485, 509, "AboutSection.jsx"),
    (509, 547, "ThemesSection.jsx"),
    (547, 840, "PrizesSection.jsx"),
    (840, 888, "TimelineSection.jsx"),
    (888, 923, "RulesSection.jsx"),
    (923, 992, "ProblemStatementsSection.jsx"),
    (992, 1059, "SponsorsSection.jsx"),
    (1059, 1187, "TeamTiltCard.jsx"),
    (1187, 1455, "TeamSection.jsx"),
    (1455, 1537, "Footer.jsx")
]

for start, end, filename in boundaries:
    content = imports + "\n"
    
    # Inject relative imports where necessary
    if filename == "HeroSection.jsx":
        content += "import NeuralBackground from './NeuralBackground';\nimport TerminalWindow from './TerminalWindow';\n"
    if filename == "TeamSection.jsx":
        content += "import TeamTiltCard from './TeamTiltCard';\n"
    if filename == "ThemesSection.jsx":
        content += "import TiltCard from './TiltCard';\n"
    if filename == "FixedTimer.jsx":
        content += "import { useCountdown } from './useCountdown';\n"
        
    content += "".join(lines[start:end])
    
    if filename == "useCountdown.js":
        content += f"\nexport {{ useCountdown }};\n"
    else:
        content += f"\nexport default {filename.split('.')[0]};\n"
        
    with open(f"2nd-verse-of-CBC2.0/src/components/{filename}", "w") as f:
        f.write(content)

app_content = imports + "\n"
for _, _, filename in boundaries:
    name = filename.split('.')[0]
    if name == "useCountdown" or name == "TeamTiltCard" or name == "NeuralBackground" or name == "TerminalWindow" or name == "TiltCard":
        continue
    app_content += f"import {name} from './components/{name}';\n"
app_content += "\n" + "".join(lines[1537:])

with open("2nd-verse-of-CBC2.0/src/App.jsx", "w") as f:
    f.write(app_content)
