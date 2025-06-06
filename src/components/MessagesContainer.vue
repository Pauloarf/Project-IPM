<template>
  <div class="messages-container">
    <slot />
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.messages-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: rgba(9, 9, 11, 0.8);
  padding: 16px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}
</style>
