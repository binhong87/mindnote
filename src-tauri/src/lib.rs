use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
struct DirEntry {
    name: String,
    path: String,
    is_dir: bool,
    children: Option<Vec<DirEntry>>,
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_directory(path: String) -> Result<Vec<DirEntry>, String> {
    fn read_dir_recursive(dir: &Path) -> Result<Vec<DirEntry>, String> {
        let mut entries = Vec::new();
        let read_dir = fs::read_dir(dir).map_err(|e| e.to_string())?;
        for entry in read_dir {
            let entry = entry.map_err(|e| e.to_string())?;
            let meta = entry.metadata().map_err(|e| e.to_string())?;
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with('.') {
                continue;
            }
            let path_str = entry.path().to_string_lossy().to_string();
            if meta.is_dir() {
                let children = read_dir_recursive(&entry.path())?;
                entries.push(DirEntry {
                    name,
                    path: path_str,
                    is_dir: true,
                    children: Some(children),
                });
            } else if name.ends_with(".md") {
                entries.push(DirEntry {
                    name,
                    path: path_str,
                    is_dir: false,
                    children: None,
                });
            }
        }
        entries.sort_by(|a, b| {
            b.is_dir.cmp(&a.is_dir).then(a.name.cmp(&b.name))
        });
        Ok(entries)
    }
    read_dir_recursive(Path::new(&path))
}

#[tauri::command]
fn create_note(path: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, "# New Note\n").map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_note(path: String) -> Result<(), String> {
    fs::remove_file(&path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            list_directory,
            create_note,
            delete_note,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
