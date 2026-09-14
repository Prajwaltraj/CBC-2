import re

with open('src/components/TeamSection.jsx', 'r') as f:
    content = f.read()

# Update categories
categories_replacement = """  const categories = [
    { id: "all", label: "All Crew" },
    { id: "leadership", label: "Leadership" },
    { id: "faculty", label: "Guidance" },
    { id: "leads", label: "Core Leads" },
    { id: "tech", label: "Tech & Dev" },
    { id: "ops", label: "Operations & Media" },
  ];"""
content = re.sub(r'const categories = \[.*?\];', categories_replacement, content, flags=re.DOTALL)

# Inject Leadership team members at the start of teamMembers
leadership_members = """    // Leadership
    {
      name: "Ms. Aisshwarya DKS Hegde",
      role: "Trustee Secretary",
      category: "leadership",
      badge: "CHIEF PATRON",
      color: "#00F3FF",
      dept: "NEF",
      image: "/team/aisshwarya.png"
    },
    {
      name: "Dr. Nagamani Nagaraj",
      role: "Chief of Strategy & Systems",
      category: "leadership",
      badge: "PATRON",
      color: "#00F3FF",
      dept: "GAT",
      image: "/team/nagamani.png"
    },
    {
      name: "Dr. H B Balakrishna",
      role: "Principal",
      category: "leadership",
      badge: "PATRON",
      color: "#00F3FF",
      dept: "GAT",
      image: "/team/balakrishna.png"
    },
"""
content = re.sub(r'(const teamMembers = \[\n)', r'\1' + leadership_members, content)

with open('src/components/TeamSection.jsx', 'w') as f:
    f.write(content)
