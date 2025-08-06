<template>
    <v-alert
    v-if="visible"
    :text="text"
    :title="title"
    :type="type"
  ></v-alert>
</template>
<script setup>
import { ref } from 'vue'
const text = ref('')
const title = ref('')
const type = ref('')
const visible = ref(false)

function open(text, title, type) {
    visible.value = true
    text.value = text
    title.value = title
    type.value = type
}

function close() {
    visible.value = false
}

defineExpose({
  open,
  close
})
</script>
<style scoped>

</style>
