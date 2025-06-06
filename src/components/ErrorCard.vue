<template>
    <div class="popup-container">
      <img src="../assets/images/error.png" class="popup-icon"/>
      <div class="popup-header">
        <h2>Erro</h2>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
      <p class="popup-message">
        {{ description }}
      </p>
      <button class="popup-button" @click="$emit('confirm')">OK</button>
    </div>
</template>
  
<style scoped>
.popup-container {
  background-color: #373a58;
  color: white;
  border-radius: 10px;
  width: fit-content;
  text-align: center;
  border: 1px solid #f54f4f;
  margin: 5% auto;
  position: relative;
  padding: 10px 0px;
}

.popup-header {
  border-radius: 15px;
  border-bottom: 1px solid #f54f4f;
}

.popup-icon {
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  position: absolute;
  top: -10%;
  left: 50%;
  transform: translateX(-50%);
}

h2 {
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.subtitle {
  color: #A1A1AA;
  font-size: 14px;
  font-weight: 600;
}

.popup-message {
  color: #A1A1AA;
  font-size: 14px;
  font-weight: 600;
  max-width: 40rem;
  margin: 5% 5% 5% 5%;
}

.popup-button {
  background-color: #4CAF50;
  color: black;
  padding: 10px 30px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  position: absolute;
  bottom: -10%;
  transform: translateX(-50%);
}
</style>
  

<script setup lang="ts">
    defineProps(["subtitle", "description"]);
    defineEmits(["confirm"]);
</script>