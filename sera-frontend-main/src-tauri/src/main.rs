// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::process::Command;

fn main() {
  // Start Python backend FIRST
  Command::new("../../backend/.venv/Scripts/python.exe")
    .args(["../../backend/main.py"])
    .spawn()
    .expect("Failed to start Python backend");

  // Then start Tauri app
  sera_lib::run();
}
