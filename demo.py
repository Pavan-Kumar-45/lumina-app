import os

project_path = r"C:\Users\pavan\OneDrive\Desktop\Project"

skip_dirs = {".pytest_cache", ".venv", "__pycache__", "node_modules"}

def print_tree(path, indent=""):
    items = [i for i in os.listdir(path) if i not in skip_dirs]
    items.sort()

    for i, item in enumerate(items):
        full_path = os.path.join(path, item)
        is_last = (i == len(items) - 1)

        branch = "└── " if is_last else "├── "
        print(indent + branch + item)

        if os.path.isdir(full_path):
            new_indent = indent + ("    " if is_last else "│   ")
            print_tree(full_path, new_indent)


# Run tree printing
print(project_path)
print_tree(project_path)
