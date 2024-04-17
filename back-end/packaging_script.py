from cx_Freeze import setup, Executable

# Specify your Flask app module
flask_app_module = "main"

# Specify the directory containing your front-end files (HTML, JS, CSS, etc.)
front_end_directory = "../front-end/dist"

build_exe_options = {
    "packages": ["flask", flask_app_module],
    "include_files": [(front_end_directory, "front_end_directory")]
}

setup(
    name="ChapterSense",
    version="1.0",
    description="Created By RaqmWave Team",
    options={"build_exe": build_exe_options},
    executables=[Executable("main.py", base="Console")]
)
