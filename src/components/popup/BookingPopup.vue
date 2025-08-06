<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal-content">
      <div class="title">กรุณากรอกข้อมูล</div>

      <!-- ชื่อ & จำนวน -->
      <div class="form-row">
        <v-text-field v-model="form.name" label="ชื่อ" variant="outlined"></v-text-field>
        <div class="counter-field">
          <span class="label">จำนวน</span>
          <v-btn size="small" @click="form.count--" :disabled="form.count <= 0" variant="flat" color="black">
            <v-icon>mdi-minus</v-icon>
          </v-btn>

          <input
            v-model.number="form.count"
            type="number"
            min="0"
            class="pure-input"
          />

          <v-btn size="small" @click="form.count++" variant="flat" color="black">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <span class="unit">คน</span>
        </div>

      </div>

      <!-- เบอร์โทร & ห้อง -->
      <div class="form-row">
        <v-text-field v-model="form.phone" label="เบอร์โทร" variant="outlined"></v-text-field>
        <v-text-field :model-value="selectedRoom" label="ห้อง" variant="solo-filled" readonly></v-text-field>
      </div>

      <!-- เวลาเข้า & ออก -->
      <div class="form-row">
        <v-select v-model="form.check_in" :items="times" label="เวลาเข้า" variant="outlined"></v-select>
        <v-select v-model="form.check_out" :items="times" label="เวลาออก" variant="outlined"></v-select>
      </div>

      <!-- พนักงาน & ชำระเงิน -->
      <div class="form-row">
        <v-select v-model="selectedStaff" :items="staffs" item-title="name" item-value="id" label="พนักงาน" variant="outlined"></v-select>
        <v-switch v-model="payStatus" label="ชำระเงิน" color="success"></v-switch>
      </div>

      <!-- หมายเหตุ -->
      <v-textarea v-model="form.note" label="หมายเหตุ" variant="outlined" class="mb-4"></v-textarea>

      <!-- ปุ่ม -->
      <div class="actions">
        <v-btn color="red" variant="outlined" @click="close">ยกเลิก</v-btn>
        <v-btn color="black" variant="flat" @click="confirm">จอง</v-btn>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const props = defineProps({
  visible: Boolean,
  selectedRoom: String,
  times: Array,
  staffs: Array,
  date: String,
  booking: Object,
  editStatus: Boolean,
})
const emit = defineEmits(['close', 'confirm'])

const form = ref({
  name: '',
  phone: '',
  count: 0,
  check_in: '',
  check_out: '',
  pay_status: 0,
  staff: null,
  note: '',
  room: '',
  date: '',
})


const selectedStaff = ref(null)
const payStatus = ref(false)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  form.value.check_in = props.times[0]
  form.value.check_out = props.times[props.times.length - 1]
  selectedStaff.value = props.staffs[0].id
  form.value.staff = props.staffs[0].id
  form.value.room = props.selectedRoom
  form.value.date = props.date
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watch(() => props.visible, (val) => {
  if (val) {
    if (!props.editStatus) {
      resetForm()
    }
  }
})

watch(() => selectedStaff.value, (staff) => {
  form.value.staff = staff
})

watch(() => props.booking, (booking) => {
  if (booking) {
    form.value = booking
    selectedStaff.value = booking.staff
    payStatus.value = booking.pay_status === 1
  }
})

function handleKeydown(event) {
  if (event.key === 'Escape') {
    close()
  }
}


function close() {
  emit('close')
}

function confirm() {
  form.value.pay_status = payStatus.value ? 1 : 0
  if(checkForm()) {
    emit('confirm', form.value)
  }
}

function checkForm() {
  const missingFields = []

  if (!form.value.name) missingFields.push('ชื่อ')
  if (!form.value.phone) missingFields.push('เบอร์โทร')
  if (!form.value.count || form.value.count <= 0) missingFields.push('จำนวนคน')
  if (!form.value.check_in) missingFields.push('เวลาเข้า')
  if (!form.value.check_out) missingFields.push('เวลาออก')
  if (!form.value.staff) missingFields.push('พนักงาน')
  if (!form.value.room) missingFields.push('ห้อง')
  if (!form.value.date) missingFields.push('วันที่')

  // ✅ ตรวจสอบรูปแบบเบอร์โทรเพิ่มเติม
  const phoneRegex = /^[0-9]{9,10}$/
  if (form.value.phone && !phoneRegex.test(form.value.phone)) {
    toast.error('กรุณากรอกเบอร์โทรให้ถูกต้อง (9-10 หลัก)')
    return false
  }

  if (missingFields.length > 0) {
    toast.error(`กรุณากรอกข้อมูลให้ครบ ${missingFields.join(', ')}`)
    return false
  }

  const inTime = new Date(`2000-01-01T${form.value.check_in}:00`);
  const outTime = new Date(`2000-01-01T${form.value.check_out}:00`);

  if (inTime >= outTime) {
    toast.error('เวลาเข้าออกผิดพลาด');
    return false;
  }

  return true
}


function resetForm() {
  form.value = {
    name: '',
    phone: '',
    count: 0,
    check_in: props.times[0],
    check_out: props.times[props.times.length - 1],
    pay_status: 0,
    staff: props.staffs[0].id,
    note: '',
    room: props.selectedRoom,
    date: props.date,
  }
}

defineExpose({
  resetForm
})
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 24px;
  width: 600px;
  max-width: 95%;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.counter-field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: -20px;
}


.pure-input {
  width: 60px;
  padding: 6px 8px;
  font-size: 16px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}


input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 🔒 ซ่อน spinner บน Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
