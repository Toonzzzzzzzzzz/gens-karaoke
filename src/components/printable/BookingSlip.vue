<!-- SlipPrint.vue (route: #/print/slip/:id) -->
<template>
  <div class="slip-container" v-if="!isLoading && queue && setting">
    <div class="slip-header">
      <img
        v-if="setting.logo2"
        :src="setting.logo2"
        alt="Logo"
        class="logo"
        @load="onImageLoad"
      />
      <h2>{{ setting.shopName }}</h2>
      <p class="address">{{ setting.address }}</p>
    </div>

    <div class="slip-body">
      <p><strong>วันที่:</strong> {{ formattedDate }}</p>
      <p><strong>เวลาออกใบเสร็จ:</strong> {{ currentDateTime }}</p>
      <p><strong>ห้อง:</strong> {{ queue.room }}</p>
      <hr />
      <p><strong>ลูกค้า:</strong> {{ queue.name }}</p>
      <p><strong>เบอร์โทร:</strong> {{ queue.phone }}</p>
      <p><strong>จำนวน:</strong> {{ queue.count }} คน</p>
      <hr />
      <p><strong>เวลาเข้า:</strong> {{ queue.check_in }}</p>
      <p><strong>เวลาออก:</strong> {{ queue.check_out }}</p>
      <hr />
      <p><strong>พนักงาน:</strong> {{ queue.staff_name }}</p>
      <p class="payment-status" :class="{ paid: queue.pay_status }">
        {{ queue.pay_status ? 'ชำระเงินแล้ว' : 'ยังไม่ชำระเงิน' }}
      </p>
    </div>

    <div class="slip-footer">
      <p>ขอบคุณที่ใช้บริการ</p>
    </div>
  </div>

  <div v-else class="loading">
    <p>กำลังเตรียมใบเสร็จ...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isLoading = ref(true);
const queue = ref(null);
const setting = ref(null);

let imageLoadCount = 0;
let expectedImages = 0;

const waitForRenderComplete = async () => {
  await nextTick();
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch {}
  }
  // รอ 2 เฟรมให้ layout เสร็จ
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  // เช็กว่ามีความสูงเนื้อหาจริง
  for (let i = 0; i < 10; i++) {
    const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    if (h > 50) return;
    await new Promise(r => setTimeout(r, 100));
  }
};

const sendReadyToPrint = async () => {
  await waitForRenderComplete();
  window.api.send('ready-to-print');
};

const onImageLoad = async () => {
  imageLoadCount++;
  if (imageLoadCount >= expectedImages) {
    await sendReadyToPrint();
  }
};

const formattedDate = computed(() => {
  if (!queue.value || !queue.value.date) return '';
  const [y, m, d] = queue.value.date.split('-');
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
});

const currentDateTime = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

onMounted(async () => {
  const queueId = route.params.id;
  try {
    const [queueResult, settingResult] = await Promise.all([
      window.api.invoke('getQueueById', queueId),
      window.api.invoke('getSetting', 'gens'),
    ]);

    if (queueResult?.success) queue.value = queueResult.data;
    setting.value = settingResult || {};

    expectedImages = setting.value.logo2 ? 1 : 0;

    isLoading.value = false;

    // ถ้าไม่มีรูปให้รอ render แล้วส่งสั่งพิมพ์เลย
    if (expectedImages === 0) {
      await sendReadyToPrint();
    }
  } catch (err) {
    console.error('Failed to load slip data:', err);
    isLoading.value = false;
    await sendReadyToPrint(); // fallback ให้พิมพ์เท่าที่มี
  }
});
</script>

<!-- Global: รีเซ็ต + หน้ากระดาษยืดตามคอนเทนต์ -->
<style>
html, body {
  margin: 0;
  padding: 0;
  background: #fff;
}

@media print {
  @page {
    size: 80mm auto;  /* 58mm auto ถ้าเครื่อง 58mm */
    margin: 0;
  }
  html, body {
    width: 80mm;
  }
}
</style>

<!-- Scoped: เลย์เอาต์ภายในสลิป -->
<style scoped>
.slip-container {
  width: 72mm;     /* พื้นที่พิมพ์จริงของ 80mm */
  margin: 0;
  margin-top: 4mm;
  padding: 0;
  color: #000;
  box-sizing: border-box;
  font-family: -apple-system, system-ui, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif;
}

/* กันหัวโดนกินโดย hardware margin: เพิ่ม buffer ตอนพิมพ์เท่านั้น */
@media print {
  .slip-container { padding-top: 4mm; } /* ปรับ 3–6mm ตามเครื่อง */
}

.slip-header { text-align: center; margin: 0 0 6px 0; padding: 0; }
.logo { display: block; max-width: 80px; height: auto; margin: 0 auto 4px auto; }

h2 { margin: 0; font-size: 18px; line-height: 1.2; }
.address { font-size: 15px; color: #333; margin: 2px 0 0 0; white-space: pre-wrap; }

.slip-body p { margin: 4px 0; font-size: 16px; line-height: 1.3; }

hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }

.payment-status { font-weight: 700; text-align: left; margin-top: 8px; font-size: 16px; }
.payment-status.paid { }

.slip-footer { text-align: center; margin-top: 10px; font-size: 16px; padding-bottom: 10px;}

.loading {
  width: 72mm;
  text-align: center;
  padding: 10px 0;
  font-family: -apple-system, system-ui, "Noto Sans Thai", sans-serif;
}
</style>
