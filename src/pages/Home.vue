<template>
  <div class="home-container">
    <!-- Logo -->
    <img src="@/assets/images/logo.png" alt="Gens Logo" class="logo" />

    <!-- Menu buttons -->
    <button class="menu-button" @click="goTo('karaoke')">
      Karaoke <img class="menu-icon" src="@/assets/images/karaicon.png" alt="Karaoke" />
    </button>

    <button class="menu-button" @click="goTo('boardgame')">
      Boardgame <img class="menu-icon" src="@/assets/images/boardicon.png" alt="Boardgame" />
    </button>

    <!-- Settings icon -->
    <button class="settings-button" @click="goTo('settings')">
      <img src="@/assets/images/setting.png" alt="Settings" class="icon-img" />
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(page) {
  router.push(`/${page}`)
}

</script>

<style scoped>
.home-container {
  font-family: "Pixelify Sans", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  position: relative;
  background-color: transparent;
  padding-top: 50px;
  background-image: url('@/assets/images/home_bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
}

.logo {
  height: 240px;
  width: auto;
  margin-bottom: 40px;
}

.menu-button {
  font-family: "Pixelify Sans", sans-serif;
  font-size: 40px;
  padding: 16px 32px;
  margin: 20px 0;
  border: 2px solid black;
  border-radius: 16px;
  background-color: white;
  cursor: pointer;
  box-shadow: 4px 4px 0px black;
  transition: all 0.2s ease;
}
.menu-button:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 0px black;
}
.menu-icon {
  width: 40px;
  height: 40px;
  transform: translateY(8px);
}
.settings-button {
  position: absolute;
  height: 40px;
  width: 40px;
  top: 20px;
  right: 20px;
  border: none;
  cursor: pointer;
  padding: 0;
  background: none;
  transition: transform 0.3s;
}

.settings-button:hover {
  transform: rotate(90deg);
}

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

</style>
