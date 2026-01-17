// config.js - Configuration management
const fs = require('fs').promises;
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'config.json');

const DEFAULT_CONFIG = {
  libraryPath: process.env.LIBRARY_PATH || '/path/to/your/library'
};

async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch (err) {
    // Config file doesn't exist, create it with defaults
    await saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
}

async function saveConfig(config) {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving config:', err);
    return false;
  }
}

async function getLibraryPath() {
  const config = await loadConfig();
  return config.libraryPath;
}

async function setLibraryPath(newPath) {
  const config = await loadConfig();
  config.libraryPath = newPath;
  return await saveConfig(config);
}

module.exports = {
  loadConfig,
  saveConfig,
  getLibraryPath,
  setLibraryPath
};