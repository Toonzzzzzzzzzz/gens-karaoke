<template>
  <div>
    <main :style="{ paddingTop: showHeader ? headerHeight + 'px' : '0px' }">
      <Top v-if="showHeader" ref="header" />
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Top from '@/components/layout/Top.vue'
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const header = ref(null)
const headerHeight = ref(0)
const showHeader = computed(() => {
  return route.meta.showHeader !== false // ถ้าไม่ระบุหรือเป็น true จะแสดง
})

onMounted(async () => {
  await nextTick()
  if (header.value?.$el) {
    headerHeight.value = header.value.$el.offsetHeight
  }
})
</script>
<style>
body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
}
.swal-outline-confirm {
  background-color: #000 !important;
  color: #ffffff !important;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: bold;
  box-shadow: none !important;
  margin: 5px;
}

.swal-outline-cancel {
  background-color: #ff0000 !important;
  color: #ffffff !important;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: bold;
  box-shadow: none !important;
  margin: 5px;
}

</style>