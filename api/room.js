const { ipcMain } = require('electron')
const dbPromise = require('../db')

async function registerRoomApi() {
  const { db, saveDatabase } = await dbPromise;

  ipcMain.removeHandler('getRooms')
  ipcMain.handle('getRooms', () => {
    const stmt = db.prepare('SELECT * FROM room')
    return stmt.all()
  })

  ipcMain.removeHandler('addRoom')
  ipcMain.handle('addRoom', (_, data) => {
    const stmt = db.prepare('INSERT INTO room (name) VALUES (?)')
    stmt.run(data.name)
    saveDatabase()
    return { success: true }
  })

  ipcMain.removeHandler('deleteRoom')
  ipcMain.handle('deleteRoom', (_, id) => {
    const stmt = db.prepare('DELETE FROM room WHERE id = ?')
    stmt.run(id)
    saveDatabase()
    return { success: true }
  })

  ipcMain.removeHandler('updateRoom')
  ipcMain.handle('updateRoom', (_, data) => {
    const stmt = db.prepare('UPDATE room SET name = ? WHERE id = ?')
    stmt.run(data.name, data.id)
    saveDatabase()
    return { success: true }
  })
}

module.exports = registerRoomApi
