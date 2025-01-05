import os


def summarize_structure(root_dir, output_file, level=0, max_depth=3, include_exts=None, exclude_dirs=None):
    if level > max_depth:
        return  # 최대 깊이를 초과하면 탐색 중지
    for entry in os.listdir(root_dir):
        path = os.path.join(root_dir, entry)

        if os.path.isdir(path):
            if exclude_dirs and entry in exclude_dirs:
                continue  # 제외할 디렉토리는 건너뜀
            output_file.write("  " * level + f"📁 {entry}\n")
            summarize_structure(path, output_file, level + 1, max_depth, include_exts, exclude_dirs)

        else:
            ext = os.path.splitext(entry)[1]
            if include_exts and ext not in include_exts:
                continue  # 특정 확장자만 포함
            output_file.write("  " * level + f"📄 {entry} ({ext})\n")


# 사용 예시: 특정 확장자만 포함하고, 일부 디렉토리 제외
root_directory = r"C:\Users\leo\pesticide"
output_path = os.path.join(root_directory, "filtered_directory_structure.txt")

with open(output_path, "w", encoding="utf-8") as output_file:
    summarize_structure(
        root_directory,
        output_file,
        max_depth=3,  # 최대 깊이 설정
        include_exts={'.py', '.txt'},  # 포함할 확장자 설정
        exclude_dirs={'node_modules', '.git'}  # 제외할 디렉토리 설정
    )
