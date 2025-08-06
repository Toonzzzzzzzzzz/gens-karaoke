<template>
  <header ref="headerRef" class="top-header">
    <div class="logo-container">
      <img src="@/assets/images/logo.png" alt="Logo" class="logo" />
    </div>

    <nav class="nav-menu">
      <RouterLink to="/" class="nav-link">Home</RouterLink>
      <RouterLink to="/karaoke" class="nav-link">Karaoke</RouterLink>
      <RouterLink to="/boardgame" class="nav-link">Boardgame</RouterLink>
      <RouterLink to="/settings" class="nav-link">Setting</RouterLink>
    </nav>
  </header>
</template>
<script setup>
import { ref } from 'vue'

const headerRef = ref(null)

defineExpose({ headerRef })
</script>
<style scoped>
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background-color: #000;
  flex-wrap: wrap;
  transition: transform 0.3s ease;
  box-sizing: border-box;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 48px;
  max-height: 60px;
  width: auto;
  object-fit: contain;
}

.nav-menu {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.nav-link {
  color: #bde0ff;
  font-weight: 600;
  font-size: 18px;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #ffffff;
}
</style>
