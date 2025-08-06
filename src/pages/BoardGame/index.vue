<template>
  <v-container>
    <LoadingOverlay v-if="isLoading" />
    <AddMemberPopup v-model="addMemberPopupVisible" :setting="settingData" @add="onAddMember" />
    <AddTimePopup v-model="addTimePopupVisible" :member="selectedMember" @add-time="handleAddTime" />
    <v-row>
      <v-col cols="6">
        <h2 class="text-h5 mb-0">ผู้ใช้บอร์ดเกม</h2>
      </v-col>
      <v-col cols="3">
        
      </v-col>
      <v-col cols="3">
        <v-btn
          color="black"
          block
          class="text-none"
          @click="onAddUser"
        >
          <v-icon start>mdi-account-plus</v-icon>
          เพิ่ม
        </v-btn>
      </v-col>
      <v-col cols="12">
        <v-text-field v-model="search" label="ค้นหา" variant="outlined"></v-text-field>
      </v-col>
    </v-row>
    <v-row class="mb-4" dense>
      <v-col cols="12" md="3">
        <v-card class="status-card online" elevation="3" @click="clearFilter">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">ทั้งหมด</span>
            <span class="text-h6">{{ members.length }}</span>
          </v-card-title>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="status-card online" elevation="3" @click="onFilter('ออนไลน์อยู่')">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6"><v-icon size="24" color="green">mdi-account</v-icon> ออนไลน์</span>
            <span class="text-h6">{{ members.filter(m => getStatus(m) === 'ออนไลน์อยู่').length }}</span>
          </v-card-title>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="status-card expired" elevation="3" @click="onFilter('หมดเวลา')">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6"><v-icon size="24" color="red">mdi-account</v-icon> หมดเวลา</span>
            <span class="text-h6">{{ members.filter(m => getStatus(m) === 'หมดเวลา').length }}</span>
          </v-card-title>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="status-card reserved" elevation="3" @click="onFilter('จองล่วงหน้า')">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6"><v-icon size="24" color="blue">mdi-account</v-icon> จองล่วงหน้า</span>
            <span class="text-h6">{{ members.filter(m => getStatus(m) === 'จองล่วงหน้า').length }}</span>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col
        v-for="member in filteredMembers"
        :key="member.id"
        cols="12" sm="6" md="4"
      >
        <div class="custom-member-box">
          <div class="status-bar">
            <div :class="['status-dot', getStatusColor(member)]"></div>
          </div>
          <div class="name-section">
            <span class="member-name">{{ member.name }}</span>
            <span class="member-time">{{ member.check_in }} - {{ member.check_out }}</span>
          </div>
          <div class="action-buttons">
            <v-btn icon class="add-btn" @click="onAddTime(member)">
              <v-icon size="18">mdi-plus</v-icon>
            </v-btn>
            <v-btn icon class="delete-btn" @click="onRemoveMember(member)">
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { LoadingOverlay, AddMemberPopup, AddTimePopup } from '@/components';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';

const toast = useToast();
const isLoading = ref(true)
const now = ref(new Date())
const selectedMember = ref(null)
const addMemberPopupVisible = ref(false)
const addTimePopupVisible = ref(false)
const settingData = ref(null)

setInterval(() => {
  now.value = new Date()
}, 10000)

const search = ref('')
const filterStatus = ref(null)

const members = ref([])

const filteredMembers = computed(() => {
  return members.value.filter((m) => {
    const matchName = m.name.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = filterStatus.value
      ? getStatus(m) === filterStatus.value
      : true
    return matchName && matchStatus
  })
})

onMounted(async () => {
  try {
    const result = await window.api.invoke('getMembers')
    const settingResult = await window.api.invoke('getSetting', 'gens')
    members.value = result || []
    settingData.value = settingResult || {}
  } catch (error) {
    toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้')
    console.error(error)
  } finally {
    isLoading.value = false
  }
})


const onFilter = (status) => {
  filterStatus.value = status
}

const clearFilter = () => {
  filterStatus.value = null
}

const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

const getStatus = (member) => {
  const inTime = parseTime(member.check_in)
  const outTime = parseTime(member.check_out)
  if (now.value < inTime) return 'จองล่วงหน้า'
  if (now.value >= outTime) return 'หมดเวลา'
  return 'ออนไลน์อยู่'
}

const getStatusColor = (member) => {
  const status = getStatus(member)
  if (status === 'ออนไลน์อยู่') return 'green'
  if (status === 'จองล่วงหน้า') return 'blue'
  return 'red'
}

const onAddUser = () => {
  addMemberPopupVisible.value = true
}

const onAddMember = async (member) => {
  console.log(member)
  isLoading.value = true
  try {
    const result = await window.api.invoke('addMember', member)
    if (result.success) {
      toast.success('เพิ่มผู้ใช้สำเร็จ')
      addMemberPopupVisible.value = false
      setTimeout(() => {
        window.location.reload()
        isLoading.value = false
      }, 1000)
    } else {
      toast.error(result.error)
      isLoading.value = false
    }
  } catch (error) {
    isLoading.value = false
    toast.error('เกิดข้อผิดพลาดในการเพิ่มผู้ใช้')
    console.error(error)
  }
}

const onRemoveMember = async (member) => {
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
    isLoading.value = true
    try {
      const result = await window.api.invoke('deleteMember', member.id)
      if (result.success) {
        toast.success('ลบผู้ใช้สำเร็จ')
        setTimeout(() => {
          window.location.reload()
          isLoading.value = false
        }, 1000)
      } else {
        toast.error(result.error)
        isLoading.value = false
      }
    } catch (error) {
      isLoading.value = false
      toast.error('เกิดข้อผิดพลาดในการลบผู้ใช้')
      console.error(error)
    }
  }
}

const onAddTime = async (member) => {
  selectedMember.value = member
  if(member.check_out == settingData.value.end) {
    toast.error('ไม่สามารถเพิ่มเวลาได้อีก')
  }else{
    addTimePopupVisible.value = true
  }
}

const handleAddTime = async (data) => {
  isLoading.value = true
  try {
    // 👉 คำนวณเวลาใหม่จากเวลาออกเดิม
    const [h, m] = data.member.check_out.split(':').map(Number)
    const current = new Date()
    current.setHours(h, m, 0, 0)

    current.setTime(current.getTime() + data.hours * 60 * 60 * 1000)

    const pad = (n) => n.toString().padStart(2, '0')
    const newCheckOut = `${pad(current.getHours())}:${pad(current.getMinutes())}`

    console.log('newCheckOut', newCheckOut)
    // 👉 ส่ง member พร้อม check_out ใหม่ไปยัง API
    const updatedMember = {
      ...data.member,
      check_out: newCheckOut
    }

    const result = await window.api.invoke('updateMember', updatedMember)

    if (result.success) {
      toast.success('เพิ่มเวลาสำเร็จ')
      setTimeout(() => {
        window.location.reload()
        isLoading.value = false
      }, 1000)
      addTimePopupVisible.value = false
    } else {
      toast.error(result.error)
      isLoading.value = false
    }
  } catch (error) {
    toast.error('เกิดข้อผิดพลาดในการเพิ่มเวลา')
    console.error(error)
    isLoading.value = false
  }
}


</script>

<style scoped>
.custom-member-box {
  display: flex;
  align-items: center;
  border: 1px solid #000000;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  background-color: #eeeeee;
  height: 70px;
}

.status-bar {
  width: 70px;
  height: 100%;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.status-dot.green {
  background-color: #00ff00;
}

.status-dot.red {
  background-color: #ff0000;
}

.status-dot.blue {
  background-color: #00aeff;
}

.name-section {
  flex: 1;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.member-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 2px;
}

.member-time {
  font-size: 14px;
  color: #555;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  padding-right: 8px;
  padding-left: 8px;
  padding-top: 4px;
  padding-bottom: 4px;
}


.add-btn {
  background-color: #00c853;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}
::v-deep(.v-btn--icon.v-btn--density-default) {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
}
</style>