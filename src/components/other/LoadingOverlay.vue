<!-- src/components/LoadingOverlay.vue -->
<template>
    <div class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">กำลังโหลด...</p>
    </div>
  </template>
  
  <style scoped>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  
  .spinner {
    width: 48px;
    height: 48px;
    border: 5px solid #ffffff33;
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    margin-top: 16px;
    color: #fff;
    font-size: 18px;
    font-weight: 500;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  </style>
  