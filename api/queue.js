const { ipcMain } = require('electron')
const db = require('../db')

function registerQueueApi() {
  ipcMain.removeHandler('getQueue')
  ipcMain.handle('getQueue', () => {
    const stmt = db.prepare('SELECT * FROM queue')
    return stmt.all()
  })

  ipcMain.removeHandler('addQueue')
  ipcMain.handle('addQueue', (_, data) => {
  if (!data) {
    console.error('❌ No data received');
    return { success: false, error: 'no data' };
  }

  const add = db.transaction((queueData) => {
    const checkStmt = db.prepare(`
      SELECT COUNT(*) as count FROM queue
      WHERE
        room = ? AND
        date = ? AND
        check_out > ? AND
        check_in < ?
    `);
    
    const conflict = checkStmt.get(
      queueData.room,
      queueData.date,
      queueData.check_in,
      queueData.check_out
    );

    if (conflict.count > 0) {
      return { success: false, error: 'ช่วงเวลานี้ถูกจองไปแล้ว กรุณาเลือกเวลาอื่น' };
    }

    const insertStmt = db.prepare(`
      INSERT INTO queue (
        room, name, phone, date,
        check_in, check_out, count,
        pay_status, staff, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertStmt.run(
      queueData.room,
      queueData.name,
      queueData.phone,
      queueData.date,
      queueData.check_in,
      queueData.check_out,
      queueData.count,
      queueData.pay_status ? 1 : 0,
      queueData.staff,
      queueData.note
    );
    
    return { success: true, id: result.lastInsertRowid };
  });

  try {
    const result = add(data);
    return result;
  } catch (err) {
    console.error('Error in addQueue transaction:', err.message);
    return { success: false, error: err.message };
  }
});

  
  

  ipcMain.removeHandler('deleteQueue')
  ipcMain.handle('deleteQueue', (_, id) => {
    const stmt = db.prepare('DELETE FROM queue WHERE id = ?')
    const result = stmt.run(id)
    return result
  })

  ipcMain.removeHandler('updateQueue')
  ipcMain.handle('updateQueue', (_, data) => {
    const stmt = db.prepare(`
      UPDATE queue
      SET room = ?, name = ?, phone = ?, date = ?,
          check_in = ?, check_out = ?, count = ?, pay_status = ?, staff = ?, note = ?
      WHERE id = ?
    `)
    const result = stmt.run(
      data.room,
      data.name,
      data.phone,
      data.date,
      data.check_in,
      data.check_out,
      data.count,
      data.pay_status ? 1 : 0,
      data.staff,
      data.note,
      data.id
    )
    return result
  })

  ipcMain.handle('getQueueByRoomAndDate', (_, { room, date }) => {
    if (!room || !date) {
      return { success: false, error: 'room และ date ต้องระบุ' };
    }

    const stmt = db.prepare(`
      SELECT * FROM queue
      WHERE room = ? AND date = ?
      ORDER BY check_in
    `);

    const result = stmt.all(room, date);
    return { success: true, data: result };
  });

  ipcMain.removeHandler('getQueueByDate')
  ipcMain.handle('getQueueByDate', (_, date) => {
    if (!date) {
      return { success: false, error: 'date ต้องระบุ' };
    }

    const stmt = db.prepare(`
      SELECT * FROM queue
      WHERE date = ?
      ORDER BY check_in
    `);

    const result = stmt.all(date);
    return { success: true, data: result };
  });

  ipcMain.removeHandler('updateQueue')
  ipcMain.handle('updateQueue', (_, data) => {
    const stmt = db.prepare(`
      UPDATE queue
      SET room = ?, name = ?, phone = ?, date = ?,
          check_in = ?, check_out = ?, count = ?, pay_status = ?, staff = ?, note = ?
      WHERE id = ?
    `)
    const result = stmt.run(
      data.room,
      data.name,
      data.phone,
      data.date,
      data.check_in,
      data.check_out,
      data.count,
      data.pay_status ? 1 : 0,
      data.staff,
      data.note,
      data.id
    )
    if (result.changes === 0) {
      return { success: false, error: 'ไม่พบข้อมูลที่ต้องการอัปเดต' };
    }

    return { success: true };
  });

  ipcMain.removeHandler('deleteQueue')
  ipcMain.handle('deleteQueue', (_, id) => {
    const stmt = db.prepare('DELETE FROM queue WHERE id = ?')
    const result = stmt.run(id)
    if (result.changes === 0) {
      return { success: false, error: 'ไม่พบข้อมูลที่ต้องการลบ' };
    }
    return { success: true, data: result }
  })
}

module.exports = registerQueueApi
