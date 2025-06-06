<template>
    <div class="popup-container">
      <img src="../assets/images/warning.png" class="popup-icon"/>
      <div class="popup-header">
        <h2>Aviso</h2>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
      <p class="popup-message">
        {{ description }}
        <br/>
        Tem a certeza que deseja prosseguir com a ação?
      </p>
      <div class="popup-actions">
        <button class="popup-button cancel" @click="$emit('cancel')">CANCELAR</button>
        <button class="popup-button confirm" @click="$emit('confirm')">OK</button>
      </div>
    </div>
</template>
  

<style scoped>
.popup-container {
  background-color: #373a58;
  color: white;
  border-radius: 10px;
  width: fit-content;
  min-width: 25%;
  text-align: center;
  border: 1px solid #E16B02;
  margin: 5% auto;
  position: relative;
  padding: 10px 0px;
}

.popup-header {
  border-radius: 15px;
  border-bottom: 1px solid #E16B02;
}

.popup-icon {
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
  padding-top: 2%;
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

.popup-actions {
  position: absolute;
  bottom: calc(-10% + 5px);
  left: 50%;
  transform: translateX(-52%);
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.popup-button {
  padding: 10px 30px;
  min-width: 120px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}

.popup-button.cancel {
  background-color: #B14D57;
  color: black;
}

.popup-button.confirm {
  background-color: #4CAF50;
  color: black;
}
</style>

<script setup lang="ts">
    defineProps(["subtitle", "description"]);
    defineEmits(["confirm", "cancel"]);
</script>