export function generateTimeSlots(startTime, endTime, interval) {
    const result = []
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
  
    const current = new Date()
    current.setHours(startHour, startMinute, 0, 0)
  
    const end = new Date()
    end.setHours(endHour, endMinute, 0, 0)
  
    while (current < end) {
      const h = String(current.getHours()).padStart(2, '0')
      const m = String(current.getMinutes()).padStart(2, '0')
      result.push(`${h}:${m}`)
      current.setMinutes(current.getMinutes() + interval)
    }
  
    // ✅ เพิ่มเวลาสุดท้าย 23:59 ด้วย
    result.push(endTime)
  
    return result
  }
  