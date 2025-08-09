const { ipcMain } = require('electron')
const dbPromise = require('../db')

async function registerStaffApi() {
  const { db, saveDatabase } = await dbPromise;

  ipcMain.removeHandler('getStaffs')
  ipcMain.handle('getStaffs', () => {
    const stmt = db.prepare('SELECT * FROM staff')
    return stmt.all()
  })

  ipcMain.removeHandler('addStaff')
  ipcMain.handle('addStaff', (_, data) => {
    const stmt = db.prepare('INSERT INTO staff (name, phone) VALUES (?, ?)')
    stmt.run(data.name, data.phone)
    saveDatabase()
    return { success: true }
  })

  ipcMain.removeHandler('deleteStaff')
  ipcMain.handle('deleteStaff', (_, id) => {
    const stmt = db.prepare('DELETE FROM staff WHERE id = ?')
    stmt.run(id)
    saveDatabase()
    return { success: true }
  })

  ipcMain.removeHandler('updateStaff')
  ipcMain.handle('updateStaff', (_, data) => {
    const stmt = db.prepare('UPDATE staff SET name = ?, phone = ? WHERE id = ?')
    stmt.run(data.name, data.phone, data.id)
    saveDatabase()
    return { success: true }
  })
}

module.exports = registerStaffApi
