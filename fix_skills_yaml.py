import os
import re

# Путь к папке с навыками
SKILLS_DIR = r"d:\Downloads\gh_site_adminka\.agent\antigravity-agentic-skills\skills"

# Регулярное выражение для поиска строки tags с мусором в конце
# Ищет: tags: [...] <мусор>
# Заменяет на: tags: [...]
REGEX_TAGS_FIX = re.compile(r"^(.*tags:\s*\[.*?\])\s+-\s+.*$", re.MULTILINE)

def fix_file(filepath):
    """Читает файл, исправляет строку tags, сохраняет обратно."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Проверяем, есть ли совпадение
        if REGEX_TAGS_FIX.search(content):
            new_content = REGEX_TAGS_FIX.sub(r"\1", content)
            
            # Сохраняем только если были изменения
            if new_content != content:
                print(f"Fixing: {filepath}")
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    return False

def main():
    count_fixed = 0
    print(f"Scanning {SKILLS_DIR}...")
    
    for root, dirs, files in os.walk(SKILLS_DIR):
        for file in files:
            if file == "SKILL.md":
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    count_fixed += 1
    
    print(f"\nDone! Fixed {count_fixed} files.")

if __name__ == "__main__":
    main()
