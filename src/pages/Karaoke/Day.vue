<template>
  <div class="karaoke-page">
    <LoadingOverlay v-if="isLoading" />
    <div class="modal-overlay" v-show="showModal" v-if="selectedRoom">
      <BookingPopup
        :visible="showModal"
        :selectedRoom="selectedRoom"
        :staffs="staffs"
        :times="timeSlots"
        :date="dayParam"
        :editStatus="editStatus"
        :booking="selectedBooking"
        @close="showModal = false"
        @confirm="handleBooking"
        ref="bookingPopup"
      />
    </div>

    <div class="left-panel">
      <div class="date-header">
        <h1>{{ thaiDate }}</h1>
      </div>

      <div class="time-slots">
        <div class="time-slot" v-for="time in timeList" :key="time">
          <span class="time-label">{{ time }}</span>
          <div class="time-line"></div>
        </div>

        <div class="bookings-container">
          <div
            v-for="booking in queue?.data"
            :key="booking.id"
            class="booking-block"
            :style="getBookingStyle(booking)"
            @click="selectBooking(booking)"
            :class="{ selected: selectedBooking && selectedBooking.id === booking.id }"
          >
            <p class="booking-name">{{ booking.name }}</p>
            <p class="booking-time">{{ booking.check_in }} - {{ booking.check_out }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <div class="right-content-top">
        <h2 class="section-title">คิวของวันนี้</h2>
        <!-- <v-select
          v-model="selectedRoom"
          :items="rooms"
          item-title="name"
          return-object
          label="เลือกห้อง"
          variant="outlined"
          density="compact"
          style="max-width: 80px"
        ></v-select> -->
        <p>ห้อง : {{ selectedRoom }}</p>
        <div class="booking-section">
          <div class="button-left">
            <button class="back-button" @click="back"><ChevronLeft class="icon" /> <span>กลับไปเลือกห้อง</span></button>
          </div>
          <div class="button-right" v-if="isFutureOrToday">
            <button class="book-button" @click="book"><span>จอง</span><ClipboardEdit class="icon" /></button>
          </div>
        </div>
      </div>
      <div class="right-content-bottom">
        <div v-if="selectedBooking" class="booking-details">
          <div class="booking-header">
            <h2>รายละเอียดคิว</h2>
          </div>
          <div class="booking-body">
            <p><strong>ชื่อ:</strong> {{ selectedBooking.name }}</p>
            <p><strong>เบอร์โทร:</strong> {{ selectedBooking.phone }}</p>
            <p><strong>เวลา:</strong> {{ selectedBooking.check_in }} - {{ selectedBooking.check_out }}</p>
            <p><strong>จำนวนคน:</strong> {{ selectedBooking.count }}</p>
            <p>
            <strong>สถานะชำระเงิน:</strong>
            <span :class="selectedBooking.pay_status ? 'paid' : 'unpaid'">
              {{ selectedBooking.pay_status ? 'ชำระเงินแล้ว' : 'ยังไม่ชำระ' }}
            </span>
            </p>
            <p><strong>พนักงาน:</strong> {{ staffs.find((s) => s.id === selectedBooking.staff)?.name || 'ไม่ระบุ' }}</p>
            <p><strong>หมายเหตุ:</strong> {{ selectedBooking.note || '-' }}</p>
          </div>
          <div class="booking-footer">
            <button class="red-button" v-if="isFutureOrToday" @click="deleteQueue" style="margin-right: 10px;"><Trash class="icon" /><span>ลบ</span></button>
            <button class="back-button" v-if="isFutureOrToday" @click="editQueue"><ClipboardEdit class="icon" /><span>แก้ไข</span></button>
          </div>
        </div>
        <div v-else class="no-selection">
          <p>คลิกที่การจองในตารางเพื่อดูรายละเอียด</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft, ClipboardEdit, Trash } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted, toRaw, watch } from 'vue';
import { LoadingOverlay, BookingPopup } from '@/components';
import { generateTimeSlots } from '@/utils';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2'

const toast = useToast();
const router = useRouter();
const route = useRoute();
const dayParam = route.params.day;

const selectedRoom = ref(null);
const timeSlots = ref([]);
const timeList = ref([]);
const isLoading = ref(true);
const showModal = ref(false);
const setting = ref(null);
const staffs = ref([]);
const queue = ref(null);
const selectedBooking = ref(null);
const editStatus = ref(false);


onMounted(async () => {
  try {
    isLoading.value = true;
    // Fetch all data concurrently
    const [staffData, settingData] = await Promise.all([
      window.api.invoke('getStaffs'),
      window.api.invoke('getSetting', 'gens'),
    ]);

    setting.value = settingData;
    staffs.value = staffData;
    
    if (setting.value) {
      timeSlots.value = generateTimeSlots(setting.value.start, setting.value.end, 15);
    }

    if (route.params.room) {
      selectedRoom.value = route.params.room;
      queue.value = await window.api.invoke('getQueueByRoomAndDate', {
        room: selectedRoom.value,
        date: dayParam,
      });
      console.log(queue.value);
      if (queue.value.data?.length > 0) {
        timeList.value = generateTimeSlots(queue.value.data[0].check_in, setting.value.end, 15);
      } else {
        console.log(timeSlots.value);
        timeList.value = timeSlots.value;
      }
    }
  } catch (error) {
    toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลเริ่มต้น');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

// watch(selectedRoom, async (newRoom) => {
//   if (!newRoom) return;
//   try {
//     isLoading.value = true;
//     selectedBooking.value = null; // Reset selection on room change
//     queue.value = await window.api.invoke('getQueueByRoomAndDate', {
//       room: newRoom.name,
//       date: dayParam,
//     });
//   } catch (error) {
//     toast.error('ไม่สามารถโหลดข้อมูลคิวของห้องได้');
//     console.error(error);
//   } finally {
//     isLoading.value = false;
//   }
// });

const isFutureOrToday = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [y, m, d] = dayParam.split('-').map(Number)
  const selectedDate = new Date(y, m - 1, d)

  return selectedDate >= today
})


function selectBooking(booking) {
  selectedBooking.value = booking;
}

async function handleBooking(data) {
  isLoading.value = true;
  const safeData = toRaw(data);

  if (editStatus.value) {
    // Logic for editing an existing booking
    try {
      const result = await window.api.invoke('updateQueue', safeData);
      if (result.success) {
        showModal.value = false;
        toast.success('แก้ไขคิวสำเร็จ กำลังพิมพ์ใบเสร็จ...');

        // เรียกพิมพ์ใบเสร็จ (ใช้ id ของคิวที่แก้ไข)
        await window.api.invoke('printSlip', { queueId: safeData.id });

        // อัปเดตข้อมูลในตารางทันที
        const index = queue.value.data.findIndex(b => b.id === safeData.id);
        if (index !== -1) {
          const staff = staffs.value.find(s => s.id === safeData.staff);
          queue.value.data[index] = { ...safeData, staff_name: staff ? staff.name : 'ไม่ระบุ' };
        }
        selectedBooking.value = null;
        editStatus.value = false;
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการแก้ไขคิว');
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  } else {
    // Logic for adding a new booking
    try {
      const result = await window.api.invoke('addQueue', safeData);
      if (result.success && result.id) {
        showModal.value = false;
        toast.success('จองคิวสำเร็จ กำลังพิมพ์ใบเสร็จ...');

        // พิมพ์ใบเสร็จ
        await window.api.invoke('printSlip', { queueId: result.id });

        // ดึงข้อมูลใหม่มาอัปเดต
        const newBookingResult = await window.api.invoke('getQueueById', result.id);
        if (newBookingResult.success) {
          queue.value.data.push(newBookingResult.data);
        } else {
          window.location.reload();
        }

      } else {
        toast.error(result.error || 'ไม่สามารถจองคิวได้');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการจองคิว');
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  }

}

function back() {
  router.push(`/karaoke/${dayParam}`);
}

function book() {
  selectedBooking.value = null;
  editStatus.value = false
  setTimeout(() => {
    showModal.value = true;
  }, 100);
}

function editQueue() {
  editStatus.value = true
  setTimeout(() => {
    showModal.value = true;
  }, 100);
}

async function deleteQueue() {
  const result = await Swal.fire({
    title: 'คุณแน่ใจหรือไม่?',
    text: 'เมื่อลบแล้วจะไม่สามารถกู้คืนได้!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ยกเลิก',
    cancelButtonText: 'ลบ',
    customClass: {
      confirmButton: 'swal-outline-confirm',
      cancelButton: 'swal-outline-cancel'
    },
    buttonsStyling: false
  })
  if (!result.isConfirmed) {
    isLoading.value = true;
    try {
      const result = await window.api.invoke('deleteQueue', selectedBooking.value.id);
      if (result.success) {
        showModal.value = false;
        toast.success('ลบคิวสำเร็จ');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.error);
        isLoading.value = false;
      }
    } catch (error) {
      isLoading.value = false;
      toast.error('เกิดข้อผิดพลาดในการลบคิว');
      console.error(error);
    }
  }
}

const thaiDate = computed(() => {
  if (!dayParam) return '';
  const [y, m, d] = dayParam.split('-');
  const date = new Date(y, m - 1, d); // Month is 0-indexed
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

function getBookingStyle(booking) {
  if (!setting.value) return {};
  let startHour = parseInt(setting.value.start.split(':')[0], 10);
  if(queue.value.data.length > 0 && queue.value.data[0].check_in < setting.value.start) {
    startHour = parseInt(queue.value.data[0].check_in.split(':')[0], 10);
  }
  
  const slotHeight = 240; // Height of one hour slot in pixels
  const pixelsPerMinute = slotHeight / 60;

  // Calculate top position
  const [checkinHour, checkinMinute] = booking.check_in.split(':').map(Number);
  const totalMinutesFromStart = (checkinHour - startHour) * 60 + checkinMinute;
  const top = totalMinutesFromStart * pixelsPerMinute;

  // Calculate height
  const [checkoutHour, checkoutMinute] = booking.check_out.split(':').map(Number);
  const durationInMinutes = (checkoutHour * 60 + checkoutMinute) - (checkinHour * 60 + checkinMinute);
  const height = durationInMinutes * pixelsPerMinute;

  return {
    top: `${top}px`,
    height: `${height}px`,
  };
}
</script>

<style scoped>
.karaoke-page {
  display: flex;
  width: 100%;
  font-family: sans-serif;
  overflow: hidden;
}

.left-panel {
  width: 60%;
  border-right: 1px solid #ccc;
  padding: 20px;
  overflow-y: auto;
  max-height: 90vh;
}

.right-panel {
  display: flex;
  flex-direction: column;
  width: 40%;
}

.right-content-top {
  flex-shrink: 0;
  padding: 20px;
  border-bottom: 1px solid #ccc;
}

.right-content-bottom {
  padding: 20px;
  overflow-y: auto;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 20px;
}
.date-header {
  background: #f0f0f0;
  padding: 12px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border-radius: 6px;
  margin-bottom: 20px;
}

.time-slots {
  position: relative;
}

.time-slot {
  position: relative;
  height: 60px; /* 1 hour slot */
  display: flex;
  align-items: center;
}

.time-label {
  width: 60px;
  text-align: right;
  padding-right: 10px;
  font-weight: bold;
}

.time-line {
  position: absolute;
  top: 50%;
  left: 70px;
  right: 0;
  height: 1px;
  background-color: #ddd;
}

.bookings-container {
  position: absolute;
  top: 30px; /* Offset for the first half-hour mark */
  left: 70px;
  right: 0;
  bottom: 0;
  z-index: 10;
}

.booking-block {
  position: absolute;
  left: 5px;
  right: 5px;
  background-color: rgba(26, 188, 156, 0.8);
  border-left: 4px solid #16a085;
  border-bottom: 1px solid #16a085;
  border-radius: 4px;
  padding: 5px 10px;
  box-sizing: border-box;
  color: white;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.booking-block.selected {
  border-color: #0984e3;
  background-color: rgba(9, 132, 227, 0.8);
  box-shadow: 0 0 10px rgba(9, 132, 227, 0.7);
  transform: scale(1.02);
  z-index: 11;
}

.booking-name {
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
}

.booking-time {
  font-size: 0.8em;
  margin: 0;
  white-space: nowrap;
}

.booking-section {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

button {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-size: 16px;
  background-color: #000;
  color: #fff;
  border: none;
  gap: 8px;
  border-radius: 8px;
  cursor: pointer;
  line-height: 1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background 0.3s;
}

button .icon {
  width: 18px;
  height: 18px;
}

.back-button {
  padding-left: 10px;
}

.red-button {
  background-color: #c0392b;
  padding-left: 10px;
}

.booking-details {
  margin-top: 15px;
}

.booking-details p {
  margin: 10px 0;
  font-size: 16px;
  line-height: 1.5;
}

.booking-details .paid {
  color: #27ae60;
  font-weight: bold;
}
.booking-details .unpaid {
  color: #c0392b;
  font-weight: bold;
}

.no-selection {
  margin-top: 15px;
  color: #7f8c8d;
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.booking-header {
  background-color: #000000;
  color: #fff;
  padding: 16px 24px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.booking-header h2 {
  margin: 0;
  font-size: 20px;
}

.booking-body {
  background-color: #f9f9f9;
  padding: 20px 24px;
  line-height: 1.6;
  font-size: 16px;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
}

.booking-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 24px;
  background-color: #f9f9f9;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}


.icon {
  width: 16px;
  height: 16px;
}

</style>