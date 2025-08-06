<template>
  <v-container>
    <LoadingOverlay v-if="isLoading" />
    <h2 class="text-h5 mb-4">ตั้งค่า</h2>

    <v-row>
      <v-col cols="12" md="6">

        <!-- หมวดทั่วไป -->
        <v-card class="mb-4" v-if="setting">
          <v-card-title> 
            <v-row>
              <v-col cols="12" md="6" style="margin-bottom: 10px;">
                <v-icon>mdi-cog</v-icon>
                ตั้งค่าทั่วไป
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="12">
                <v-img :src="logo1Preview" v-if="logo1Preview" class="mt-4" max-height="150" style="margin-bottom: 20px;"></v-img>
                <v-file-input
                  label="Logo 1"
                  accept="image/*"
                  @change="onLogo1Selected"
                  variant="outlined"
                ></v-file-input>
              </v-col>
              <v-col cols="12" md="12">
                <v-img :src="logo2Preview" v-if="logo2Preview" class="mt-4" max-height="150" style="margin-bottom: 20px;"></v-img>
                <v-file-input
                  label="Logo 2"
                  accept="image/*"
                  @change="onLogo2Selected"
                  variant="outlined"
                ></v-file-input>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="ชื่อร้าน"
                  v-model="shopName"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="ที่อยู่"
                  v-model="address"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  label="เวลาเข้า"
                  v-model="setting.start"
                  :items="times"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  label="เวลาออก"
                  v-model="setting.end"
                  :items="times"
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="d-flex justify-end">
                <v-btn color="black" @click="saveSettings">บันทึก</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">

        <!-- หมวดพนักงาน -->
        <v-card class="mb-4" v-if="staffs">
          <v-card-title>
            <v-row>
              <v-col cols="12" md="6">
                <v-icon>mdi-account</v-icon>
                พนักงาน
              </v-col>
              <v-col cols="12" md="6" class="d-flex justify-end" style="margin-bottom: 10px;">
                <v-btn color="black" @click="dialogAddStaff = true">เพิ่มพนักงาน</v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-row >
              <v-col
                v-for="(staff, index) in staffs"
                :key="index"
                cols="12"
                sm="6"
              >
                <v-card class="d-flex align-center justify-space-between pa-2">
                  <span class="text-h6">{{ staff.name }}</span>
                  <v-btn icon color="error" size="small" @click="removeStaff(staff.id)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- หมวดห้องคาราโอเกะ -->
        <v-card class="mb-4" v-if="rooms">
          <v-card-title>
            <v-row>
              <v-col cols="12" md="6">
                <v-icon>mdi-microphone-variant</v-icon>
                ห้องคาราโอเกะ
              </v-col>
              <v-col cols="12" md="6" class="d-flex justify-end" style="margin-bottom: 10px;">
                <v-btn color="black" @click="dialogAddRoom = true">เพิ่มห้อง</v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="(room, index) in rooms"
                :key="index"
                cols="12"
                sm="6"
              >
                <v-card class="d-flex align-center justify-space-between pa-2">
                  <span class="text-h6">{{ room.name }}</span>
                  <v-btn icon color="error" size="small" @click="removeRoom(room.id)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog เพิ่มพนักงาน -->
    <v-dialog v-model="dialogAddStaff" max-width="400">
      <v-card>
        <v-card-title>เพิ่มพนักงาน</v-card-title>
        <v-card-text>
          <v-text-field
            label="ชื่อพนักงาน"
            v-model="newStaffName"
            variant="outlined"
          />
          <v-text-field
            label="เบอร์โทรศัพท์"
            v-model="newStaffPhone"
            variant="outlined"
            type="number"
          />
          
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogAddStaff = false" variant="outlined" color="red">ยกเลิก</v-btn>
          <v-btn color="black" variant="flat" :disabled="!newStaffName" @click="addStaff">บันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog เพิ่มห้อง -->
    <v-dialog v-model="dialogAddRoom" max-width="400">
      <v-card>
        <v-card-title>เพิ่มห้องคาราโอเกะ</v-card-title>
        <v-card-text>
          <v-text-field
            label="ชื่อห้อง"
            v-model="newRoomName"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogAddRoom = false" variant="outlined" color="red">ยกเลิก</v-btn>
          <v-btn color="black" variant="flat" :disabled="!newRoomName" @click="addRoom">บันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LoadingOverlay } from '@/components'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification';
import { generateTimeSlots } from '@/utils';

const toast = useToast();
const isLoading = ref(true)

const staffs = ref(null)
const rooms = ref(null)
const setting = ref(null)
const times = ref(null)

const dialogAddStaff = ref(false)
const dialogAddRoom = ref(false)

const newStaffName = ref('')
const newStaffPhone = ref('')
const newRoomName = ref('')

const logo1File = ref<File | null>(null)
const logo2File = ref<File | null>(null)
const shopName = ref('')
const address = ref('')
const logo1Preview = ref<string | null>(null)
const logo2Preview = ref<string | null>(null)

const onLogo1Selected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    logo1File.value = target.files[0];
    logo1Preview.value = URL.createObjectURL(target.files[0]);
  }
};

const onLogo2Selected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    logo2File.value = target.files[0];
    logo2Preview.value = URL.createObjectURL(target.files[0]);
  }
};

const saveSettings = async () => {
  try {
    await window.api.invoke('saveSettings', {
      shopName: shopName.value,
      address: address.value,
      logo1: logo1File.value,
      logo2: logo2File.value,
    });
    toast.success('บันทึกการตั้งค่าสำเร็จ');
  } catch (error) {
    toast.error('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    console.error(error);
  }
};

const addStaff = () => {
  if (newStaffName.value.trim()) {
    window.api.invoke('addStaff', { name: newStaffName.value, phone: newStaffPhone.value })
    staffs.value?.push({ name: newStaffName.value, phone: newStaffPhone.value })
    newStaffName.value = ''
    newStaffPhone.value = ''
    dialogAddStaff.value = false
  }
}

const removeStaff = async (id: number) => {
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
      const result = await window.api.invoke('deleteStaff', id);
      if (result.success) {
        toast.success('ลบพนักงานสำเร็จ');
        staffs.value?.splice(staffs.value.findIndex(staff => staff.id === id), 1)
        isLoading.value = false;
      } else {
        toast.error(result.error);
        isLoading.value = false;
      }
    } catch (error) {
      isLoading.value = false;
      toast.error('เกิดข้อผิดพลาดในการลบพนักงาน');
      console.error(error);
    }
  }
}

const addRoom = () => {
  if (newRoomName.value.trim()) {
    window.api.invoke('addRoom', { name: newRoomName.value })
    rooms.value?.push({ name: newRoomName.value })
    newRoomName.value = ''
    dialogAddRoom.value = false
  }
}

const removeRoom = async (id: number) => {
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
      const result = await window.api.invoke('deleteRoom', id);
      if (result.success) {
        toast.success('ลบห้องสำเร็จ');
        rooms.value?.splice(rooms.value.findIndex(room => room.id === id), 1)
        isLoading.value = false;
      } else {
        toast.error(result.error);
        isLoading.value = false;
      }
    } catch (error) {
      isLoading.value = false;
      toast.error('เกิดข้อผิดพลาดในการลบห้อง');
      console.error(error);
    }
  }
}

onMounted( async () => {
  const [staffData, settingData, roomData] = await Promise.all([
    window.api.invoke('getStaffs'),
    window.api.invoke('getSetting', 'gens'),
    window.api.invoke('getRooms'),
  ])

  staffs.value = staffData
  setting.value = settingData
  rooms.value = roomData
  
  isLoading.value = false

  if (setting.value) {
    shopName.value = setting.value.shopName;
    address.value = setting.value.address;
    times.value = generateTimeSlots('00:00', '23:59', 15);
    if (setting.value.logo1) {
      logo1Preview.value = `../assets/uploadImg/${setting.value.logo1}`;
    }
    if (setting.value.logo2) {
      logo2Preview.value = `../assets/uploadImg/${setting.value.logo2}`;
    }
  }
})

</script>