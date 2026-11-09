<template>
  <div class="card loading-card flex justify-center">
    <img src="/assets/images/logo.gif" alt="image" loading="lazy">
  </div>
</template>

<script setup>
// import Skeleton from 'primevue/skeleton';
</script>

<style lang="scss" scoped>
  .loading-card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    // background: rgba(#fff, 0.7);
    background: #fff;
    backdrop-filter: blur(10px);
    z-index: 99999 !important;
    img{
      width: 300px;
      // height: 200px;
      object-fit: contain;
      animation: spin 10s linear infinite alternate-reverse ;
    }
  }
  // @keyframes spin {
  //   0% {
  //     transform: rotate(0deg) scale(0.8);
  //   }
  //   100% {
  //     transform: rotate(-360deg) scale(1.2);
  //   }
  // }
</style>

