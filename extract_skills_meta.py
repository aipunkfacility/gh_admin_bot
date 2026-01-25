import os
import yaml
import json

SKILLS_DIR = r"d:\Downloads\gh_site_adminka\.agent\antigravity-agentic-skills\skills"
OUTPUT_FILE = "skills_data.json"

def extract_meta(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                meta = yaml.safe_load(parts[1])
                if isinstance(meta, dict):
                    return {
                        "name": meta.get("name"),
                        "description": meta.get("description"),
                        "category": meta.get("metadata", {}).get("skillport", {}).get("category", "uncategorized"),
                        "path": filepath
                    }
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    return None

def main():
    all_skills = []
    for root, dirs, files in os.walk(SKILLS_DIR):
        for file in files:
            if file == "SKILL.md":
                data = extract_meta(os.path.join(root, file))
                if data:
                    all_skills.append(data)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_skills, f, ensure_ascii=False, indent=2)
    
    print(f"Extracted {len(all_skills)} skills to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
