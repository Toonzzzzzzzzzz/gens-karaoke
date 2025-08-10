<template>
    <div class="tt-container">
        <LoadingOverlay v-if="isLoading" />
        <div class="date-header">
            <div class="date-left">
                <ChevronLeft class="chevron-icon" @click="goBack" />
            </div>
            <h1 class="date-title">{{ thaiDate }}</h1>
            <div class="date-right"></div>
        </div>

        <table class="tt-table">
            <thead>
                <tr>
                    <th class="tt-header" :colspan="10">รายการจองแต่ละห้อง</th>
                </tr>
            </thead>
        <tbody>
          <template v-for="(row, rowIndex) in schedule" :key="row.label">
            <tr v-for="(group, groupIndex) in chunk(row.slots, 9)" :key="groupIndex">
                <th
                    v-if="groupIndex === 0"
                    class="tt-row-label"
                    :rowspan="Math.ceil(row.slots.length / 9)"
                    >
                    <div class="tt-room-box">
                        <div class="tt-room-name">{{ row.label }}</div>
                        <v-btn @click="handleRoomClick(row.label)">
                        เลือก
                        </v-btn>
                    </div>
                </th>
                <td
                    v-for="(cell, idx) in group"
                    :key="idx"
                    :class="[
                        'tt-cell',
                        row.highlighted[groupIndex * 9 + idx]
                            ? 'tt-highlight ' + getBgClassForRoom(row.label)
                            : ''
                    ]"
                >
                    {{ cell }}
                </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { ChevronLeft } from 'lucide-vue-next';
import { LoadingOverlay } from '@/components';
import { generateTimeSlots } from '@/utils';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const dayParam = route.params.day;

const isLoading = ref(true);
const setting = ref(null);
const rooms = ref([]);
const queue = ref([]);
const thaiDate = computed(() => {
    if (!dayParam) return '';
    const [y, m, d] = dayParam.split('-');
    const date = new Date(y, m - 1, d); // Month is 0-indexed
    return date.toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
});

const schedule = computed(() => {
  if (!setting.value || !rooms.value || !queue.value) return [];


  let fullTimeSlots = [];

  if (queue.value?.length > 0 && queue.value[0].check_in < setting.value.start) {
    fullTimeSlots = generateTimeSlots(queue.value[0].check_in, setting.value.end, 15);
  } else {
    fullTimeSlots = generateTimeSlots(setting.value.start, setting.value.end, 15);
  }

  return rooms.value.map(room => {
    const roomQueue = queue.value.filter(q => q.room === room.name);

    const highlighted = fullTimeSlots.map(time => {
      const timeDate = new Date(`2000-01-01T${time}:00`);

      const isBooked = roomQueue.some(q => {
        const checkIn = new Date(`2000-01-01T${q.check_in}:00`);
        const checkOut = new Date(`2000-01-01T${q.check_out}:00`);
        return timeDate >= checkIn && timeDate <= checkOut;
      });

      return isBooked;
    });

    return {
      label: room.name,
      slots: fullTimeSlots,
      highlighted,
    };
  });
});

const bgClasses = ['bg-room-bg1', 'bg-room-bg2', 'bg-room-bg3', 'bg-room-bg4', 'bg-room-bg5'];

let usedClasses = [];
let lastClass = null;
const roomBgMapObj = loadBgMapFromStorage();
const roomBgMap = new Map(Object.entries(roomBgMapObj));

function getBgClassForRoom(roomName) {
  if (roomBgMap.has(roomName)) {
    return roomBgMap.get(roomName);
  }

  if (usedClasses.length === 0) {
    usedClasses = [...bgClasses];
    if (lastClass && usedClasses.length > 1) {
      usedClasses = usedClasses.filter(c => c !== lastClass);
    }
  }

  const index = Math.floor(Math.random() * usedClasses.length);
  const selected = usedClasses.splice(index, 1)[0];

  lastClass = selected;
  roomBgMap.set(roomName, selected);

  const saveObj = Object.fromEntries(roomBgMap);
  saveBgMapToStorage(saveObj);

  return selected;
}

const STORAGE_KEY = 'roomBgMap';

function loadBgMapFromStorage() {
  const json = localStorage.getItem(STORAGE_KEY);
  try {
    const obj = JSON.parse(json);
    return obj || {};
  } catch {
    return {};
  }
}

function saveBgMapToStorage(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}


onMounted(async () => {
  try {
    const [roomData, settingData, queueData] = await Promise.all([
      window.api.invoke('getRooms'),
      window.api.invoke('getSetting', 'gens'),
      window.api.invoke('getQueueByDate', dayParam),
    ]);

    setting.value = settingData;
    rooms.value = roomData;
    queue.value = queueData.data;
  } catch (error) {
    toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลเริ่มต้น');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

function goBack() {
    router.push(`/karaoke`);
}

function handleRoomClick(room) {
    router.push(`/karaoke/${room}/${dayParam}`);
}

function chunk(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
}
</script>
  
<style scoped>
.tt-container {
  padding: 20px;
  background-color: #fff;
  color: #000;
  font-family: 'Segoe UI', sans-serif;
}

.date-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0f0f0;
  color: #000;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.date-title {
  font-weight: bold;
  text-align: center;
  flex: 1;
}

.date-left, .date-right {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chevron-icon {
  width: 50px;
  height: 50px;
  cursor: pointer;
}


.tt-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.tt-header {
  background-color: #000;
  color: #fff;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #333;
}

.tt-row-label {
  background-color: #eee;
  border: 1px solid #aaa;
  text-align: center;
  vertical-align: middle;
  padding: 0;
}

.tt-room-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  height: 100%;
}

.tt-room-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.tt-cell {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
  background-color: #f3f3f3;
  color: #000;
  font-size: 13px;
}

.tt-highlight {
  background-size: cover;
  font-weight: bold;
  color: #fff;
  text-shadow:
    -1px -1px 0 #000,
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
}

.bg-room-bg1 {
  background-image: url('@/assets/images/room/room-bg1.png') !important;
}
.bg-room-bg2 {
  background-image: url('@/assets/images/room/room-bg2.png') !important;
}
.bg-room-bg3 {
  background-image: url('@/assets/images/room/room-bg3.png') !important;
}
.bg-room-bg4 {
  background-image: url('@/assets/images/room/room-bg4.png') !important;
}
.bg-room-bg5 {
  background-image: url('@/assets/images/room/room-bg5.png') !important;
}

.v-btn {
  background-color: #000;
  color: #fff;
  border: none;
  padding: 6px 14px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.v-btn:hover {
  background-color: #222;
}

</style>
  