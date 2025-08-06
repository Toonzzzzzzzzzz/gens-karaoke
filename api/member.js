const { ipcMain } = require('electron')
const db = require('../db')

function registerMemberApi() {
  ipcMain.removeHandler('getMembers')
  ipcMain.handle('getMembers', () => {
    const stmt = db.prepare('SELECT * FROM member')
    return stmt.all()
  })

  ipcMain.removeHandler('addMember')
  ipcMain.handle('addMember', (event, member) => {
    const stmt = db.prepare('INSERT INTO member (name, check_in, check_out) VALUES (?, ?, ?)')
    stmt.run(member.name, member.check_in, member.check_out)
    return { success: true }
  })

  ipcMain.removeHandler('deleteMember')
  ipcMain.handle('deleteMember', (event, id) => {
    const stmt = db.prepare('DELETE FROM member WHERE id = ?')
    stmt.run(id)
    return { success: true }
  })

  ipcMain.removeHandler('updateMember')
  ipcMain.handle('updateMember', (event, member) => {
    const stmt = db.prepare('UPDATE member SET name = ?, check_in = ?, check_out = ? WHERE id = ?')
    stmt.run(member.name, member.check_in, member.check_out, member.id)
    return { success: true }
  })
}

module.exports = registerMemberApi
