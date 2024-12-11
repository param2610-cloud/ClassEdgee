import os

def count_lines_of_code(extension, directory):
    total_lines = 0
    for dirpath, dirnames, filenames in os.walk(directory):
        # Skip the node_modules and .vscode directories
        if 'node_modules' in dirpath or '.vscode' in dirpath or '.git' in dirpath or '.next' in dirpath:
            continue
            
        for filename in filenames:
            if filename.endswith(extension):
                file_path = os.path.join(dirpath, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = sum(1 for line in f)
                        total_lines += lines
                        print(f"Counted {lines} lines in {file_path}")
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
    return total_lines

if __name__ == "__main__":
    print('Starting...')
    project_directory = "./ClassEdgee"
    extensions = ['.js', '.ts', '.html', '.css', '.json', '.tsx', '.jsx']
    
    total = 0
    for ext in extensions:
        lines = count_lines_of_code(ext, project_directory)
        print(f"Found {lines} lines in *{ext} files")
        total += lines
    
    print(f"\nTotal lines of code: {total}")