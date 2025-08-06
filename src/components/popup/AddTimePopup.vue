<template>
    <v-dialog v-model="visible" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">เพิ่มเวลาให้สมาชิก {{ props.member.name }}</v-card-title>
  
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="handleSubmit">
            <v-text-field
              v-model="form.hours"
              label="จำนวนชั่วโมงที่ต้องการเพิ่ม"
              type="number"
              min="1"
              required
              variant="outlined"
            />
          </v-form>
        </v-card-text>
  
        <v-card-actions class="justify-end">
          <v-btn variant="outlined" color="red" @click="onCancel">ยกเลิก</v-btn>
          <v-btn variant="flat" color="black" @click="handleSubmit">เพิ่ม</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    modelValue: Boolean,
    member: Object,
  })
  const emit = defineEmits(['update:modelValue', 'add-time'])
  
  const visible = ref(props.modelValue)
  watch(() => props.modelValue, (val) => (visible.value = val))
  watch(visible, (val) => emit('update:modelValue', val))
  
  const formRef = ref(null)
  const form = ref({
    hours: 1
  })
  
  const onCancel = () => {
    resetForm()
    visible.value = false
  }
  
  const handleSubmit = () => {
    console.log('form.value', form.value)
    console.log('props.member', props.member)
    // if (form.value.hours >= 1) {
    //   emit('add-time', { member: props.member, hours: form.value.hours })
    //   resetForm()
    //   visible.value = false
    // }
  }
  
  const resetForm = () => {
    form.value.hours = 1
  }
  </script>
  