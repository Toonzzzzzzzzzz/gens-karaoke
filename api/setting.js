const { ipcMain } = require('electron');
const db = require('../db');

function registerSettingApi() {
  ipcMain.removeHandler('getSetting');
  ipcMain.handle('getSetting', (event, key_id) => {
    const stmt = db.prepare('SELECT * FROM setting WHERE key_id = ?');
    const setting = stmt.get(key_id);
    // Map the 'name' column to 'shopName' to match the frontend
    if (setting) {
      return { ...setting, shopName: setting.name };
    }
    return null;
  });

  ipcMain.removeHandler('updateSetting');
  ipcMain.handle('updateSetting', (_, payload) => {
    const { key_id, shopName, address, logo1, logo2, start, end } = payload;

    // The logo1 and logo2 are now Base64 strings, so we can save them directly.
    const stmt = db.prepare(
      'UPDATE setting SET name = ?, address = ?, logo1 = ?, logo2 = ?, start = ?, end = ? WHERE key_id = ?'
    );
    
    try {
      stmt.run(shopName, address, logo1, logo2, start, end, key_id);
      return { success: true };
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Be more specific about the error in the response
      return { success: false, error: error.message };
    }
  });

  // These are not used by the setting page but are here. I'll leave them for now.
  ipcMain.removeHandler('addSetting');
  ipcMain.handle('addSetting', (_, data) => {
    const stmt = db.prepare('INSERT INTO setting (key_id, value) VALUES (?, ?)');
    stmt.run(data.key_id, data.value);
    return { success: true };
  });

  ipcMain.removeHandler('deleteSetting');
  ipcMain.handle('deleteSetting', (_, id) => {
    const stmt = db.prepare('DELETE FROM setting WHERE id = ?');
    stmt.run(id);
    return { success: true };
  });
}

module.exports = registerSettingApi;