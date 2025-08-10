<template>
    <v-dialog v-model="visible" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">เพิ่มสมาชิก</v-card-title>
        <v-card-text>
          <v-radio-group v-model="formMode" inline>
            <v-radio label="เข้าใช้งานทันที" value="active" />
            <v-radio label="จองล่วงหน้า" value="reserve" />
          </v-radio-group>
  
          <v-form ref="formRef" @submit.prevent="handleSubmit">
            <v-text-field v-model="form.name" label="ชื่อ" required variant="outlined"/>
  
            <template v-if="formMode === 'reserve'">
                <v-text-field
                    v-model="form.check_in"
                    label="เวลาเข้า"
                    type="time"
                    required
                    variant="outlined"
                />
                <v-switch
                    v-model="form.full_day"
                    label="เหมาวัน"
                    color="primary"
                    class="my-2"
                />

                <v-text-field
                    v-model="form.hours"
                    :disabled="form.full_day"
                    label="จำนวนชั่วโมงที่ต้องการจอง"
                    type="number"
                    min="1"
                    required
                    variant="outlined"
                />
            </template>
            <template v-else>
                <v-switch
                    v-model="form.full_day"
                    label="เหมาวัน"
                    color="primary"
                    class="my-2"
                />

                <v-text-field
                    v-model="form.hours"
                    :disabled="form.full_day"
                    label="จำนวนชั่วโมงที่ต้องการจอง"
                    type="number"
                    min="1"
                    required
                    variant="outlined"
                />
            </template>
          </v-form>
        </v-card-text>
  
        <v-card-actions class="justify-end">
          <v-btn color="red" variant="outlined" @click="onCancel">ยกเลิก</v-btn>
          <v-btn color="black" variant="flat" @click="handleSubmit">เพิ่ม</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { useToast } from 'vue-toastification';
  const toast = useToast();
  const props = defineProps({
    modelValue: Boolean,
    setting: Object,
  })
  const emit = defineEmits(['update:modelValue', 'add'])
  
  const visible = ref(props.modelValue)
  watch(() => props.modelValue, val => (visible.value = val))
  watch(visible, val => emit('update:modelValue', val))
  
  const formRef = ref(null)
  const formMode = ref('active') // 'active' or 'reserve'
  
  const form = ref({
    name: '',
    check_in: '',
    check_out: '',
    hours: 1
  })

  const onCancel = () => {
    resetForm()
    visible.value = false
  }
  
const handleSubmit = () => {
  const pad = (n) => n.toString().padStart(2, '0')
  const toTimeStr = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`
    
  if (!props.setting?.end) {
    toast.error('ยังไม่ได้ตั้งค่าเวลาสิ้นสุดในระบบ')
    return
  }
  if (form.value.name.trim() === '') {
    toast.error('กรุณากรอกชื่อ')
    return
  }
  let checkInDate, checkOutDate

  if (formMode.value === 'reserve') {
    const [h, m] = form.value.check_in.split(':').map(Number)
    checkInDate = new Date()
    checkInDate.setHours(h, m, 0, 0)

    if (form.value.full_day) {
      const [endH, endM] = props.setting.end.split(':').map(Number)
      checkOutDate = new Date(checkInDate)
      checkOutDate.setHours(endH, endM, 0, 0)
    } else {
      checkOutDate = new Date(checkInDate.getTime() + form.value.hours * 60 * 60 * 1000)
    }

  } else {
  // ✅ โหมด active → เวลาเข้า = เวลาปัจจุบัน
  checkInDate = new Date()

  if (form.value.full_day) {
    const [endH, endM] = props.setting.end.split(':').map(Number)
    checkOutDate = new Date(checkInDate)
    checkOutDate.setHours(endH, endM, 0, 0)
  } else {
    checkOutDate = new Date(checkInDate.getTime() + form.value.hours * 60 * 60 * 1000)
  }
}

  const member = {
    name: form.value.name,
    check_in: toTimeStr(checkInDate),
    check_out: toTimeStr(checkOutDate)
  }
  // console.log('member', member)

  emit('add', member)
  resetForm()
  visible.value = false
}

  const resetForm = () => {
    form.value = {
      name: '',
      check_in: '',
      check_out: '',
      hours: 1
    }
    formMode.value = 'active'
  }
  </script>
  