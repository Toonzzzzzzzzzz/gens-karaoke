<template>
  <div class="calendar-container">
    <div class="calendar-toolbar">
      <h3 class="year-label"></h3>
      <div class="calendar-header">
        <button class="nav-button" @click="changeMonth(-1)">
          <ChevronLeft class="w-5 h-5" />
        </button>

        <transition :name="transitionName" mode="out-in">
          <h2 class="month-label" :key="monthName">{{ monthName }}</h2>
        </transition>

        <button class="nav-button" @click="changeMonth(1)">
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
      <h3 class="year-label">{{ year + 543 }}</h3>
    </div>

    <transition :name="transitionName" mode="out-in">
      <div class="calendar-grid" :key="month + '-' + year">
        <div class="calendar-day" v-for="day in daysThai" :key="day">
          {{ day }}
        </div>

        <div
          v-for="(date, index) in flatDays"
          :key="index"
          class="calendar-cell"
          :class="{
            empty: date === 0,
            active: isSelectedDate(date),
            past: isPastDate(date),
            clickable: date !== 0 && !isPastDate(date),
            today: isToday(date),
          }"
          @click="handleDateClick(date)"
        >
          <span v-if="date !== 0">{{ date }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const month = ref(new Date().getMonth())
const year = ref(new Date().getFullYear())
const transitionName = ref('slide-left')

const daysThai = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์']

const monthName = computed(() => {
  return new Date(year.value, month.value).toLocaleString('th-TH', { month: 'long' })
})

const selectedFullDate = ref(null)

function handleDateClick(date) {
  if (date !== 0) {
    const m = String(month.value + 1).padStart(2, '0')
    const d = String(date).padStart(2, '0')
    selectedFullDate.value = `${year.value}-${m}-${d}`
    // console.log('เลือกวันที่:', selectedFullDate.value)
    router.push(`/karaoke/${selectedFullDate.value}`)
  }
}

function isSelectedDate(date) {
  if (date === 0 || !selectedFullDate.value) return false
  const m = String(month.value + 1).padStart(2, '0')
  const d = String(date).padStart(2, '0')
  const current = `${year.value}-${m}-${d}`
  return selectedFullDate.value === current
}

function isToday(date) {
  if (date === 0) return false
  const today = new Date()
  return (
    date === today.getDate() &&
    month.value === today.getMonth() &&
    year.value === today.getFullYear()
  )
}

function isPastDate(date) {
  if (date === 0) return false
  const selected = new Date(year.value, month.value, date)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // เคลียร์เวลา เพื่อเปรียบเทียบแบบไม่เอาเวลา
  return selected < today
}


function getMonthDays(year, month) {
  const result = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()

  let week = new Array(startDay).fill(0)

  for (let i = 1; i <= lastDay.getDate(); i++) {
    week.push(i)
    if (week.length === 7) {
      result.push(week)
      week = []
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(0)
    result.push(week)
  }

  return result
}

const flatDays = computed(() => getMonthDays(year.value, month.value).flat())

function changeMonth(direction) {
  transitionName.value = direction === 1 ? 'slide-left' : 'slide-right'
  if (direction === -1) {
    if (month.value === 0) {
      month.value = 11
      year.value--
    } else {
      month.value--
    }
  } else {
    if (month.value === 11) {
      month.value = 0
      year.value++
    } else {
      month.value++
    }
  }
}
</script>

<style scoped>
.calendar-container {
  padding: 20px;
  margin: 0 auto;
  font-family: sans-serif;
  width: 1000px;
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 10px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.nav-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: black;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.month-label {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
}

.year-label {
  font-size: 24px;
  font-weight: bold;
}

.room-selector {
  padding: 4px 8px;
  font-size: 16px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  background: black;
  color: white;
  text-align: center;
  font-weight: bold;
  padding: 8px 0;
  border-radius: 6px;
}

.calendar-cell {
  background-color: #ccc;
  min-height: 60px;
  border-radius: 12px;
  text-align: right;
  padding: 6px 8px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease-in-out;
  position: relative;
  user-select: none;
}

.calendar-cell.clickable {
  cursor: pointer;
}

.calendar-cell.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  background-color: #404040;
  color: #ffffff;
}

.calendar-cell.past {
  background-color: #ddd;
  color: #9ca3af;
  box-shadow: none;
  cursor: pointer;
}

.calendar-cell.today {
  background-color: #B3E5FC;
}
.calendar-cell.empty {
  background-color: transparent;
  box-shadow: none;
}

/* Slide Left */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s ease;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* Slide Right */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s ease;
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>
