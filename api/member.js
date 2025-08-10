const { ipcMain } = require('electron')
const dbPromise = require('../db')

async function registerMemberApi() {
  const { db, saveDatabase } = await dbPromise;

  ipcMain.removeHandler('getMembers')
  ipcMain.handle('getMembers', () => {
    const stmt = db.prepare('SELECT * FROM member')
    return stmt.all()
  })

  ipcMain.removeHandler('addMember')
  ipcMain.handle('addMember', (event, member) => {
    const stmt = db.prepare('INSERT INTO member (name, check_in, check_out) VALUES (?, ?, ?)')
    const result = stmt.run(member.name, member.check_in, member.check_out)
    saveDatabase()
    return { success: true, id: result.lastInsertRowid }
  })

  ipcMain.removeHandler('deleteMember')
  ipcMain.handle('deleteMember', (event, id) => {
    const stmt = db.prepare('DELETE FROM member WHERE id = ?')
    stmt.run(id)
    saveDatabase()
    return { success: true }
  })

  ipcMain.removeHandler('updateMember')
  ipcMain.handle('updateMember', (event, member) => {
    const stmt = db.prepare('UPDATE member SET name = ?, check_in = ?, check_out = ? WHERE id = ?')
    stmt.run(member.name, member.check_in, member.check_out, member.id)
    saveDatabase()
    return { success: true }
  })

  ipcMain.removeHandler('getMemberById');
  ipcMain.handle('getMemberById', (_, id) => {
    const stmt = db.prepare('SELECT * FROM member WHERE id = ?');
    const member = stmt.get(id);

    if (!member) {
      return { success: false, error: 'ไม่พบผู้ใช้งาน' };
    }

    // No staff info for board game members
    member.staff_name = 'ไม่ระบุ';

    return { success: true, data: member };
  });
}

module.exports = registerMemberApi
