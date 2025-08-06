const { ipcMain } = require('electron')
const db = require('../db')

function registerSettingApi() {
  ipcMain.removeHandler('getSetting')
  ipcMain.handle('getSetting', (event, key_id) => {
    const stmt = db.prepare('SELECT * FROM setting WHERE key_id = ?')
    return stmt.get(key_id)
  })
}

ipcMain.removeHandler('addSetting')
ipcMain.handle('addSetting', (_, data) => {
  const stmt = db.prepare('INSERT INTO setting (key_id, value) VALUES (?, ?)')
  stmt.run(data.key_id, data.value)
  return { success: true }
})

ipcMain.removeHandler('deleteSetting')
ipcMain.handle('deleteSetting', (_, id) => {
  const stmt = db.prepare('DELETE FROM setting WHERE id = ?')
  stmt.run(id)
  return { success: true }
})

ipcMain.removeHandler('updateSetting')
ipcMain.handle('updateSetting', (_, data) => {
  const stmt = db.prepare('UPDATE setting SET value = ? WHERE id = ?')
  stmt.run(data.value, data.id)
  return { success: true }
})

module.exports = registerSettingApi