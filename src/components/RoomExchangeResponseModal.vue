<template>
    <ModalBase ref='modal'>
      <div class='modal-content'>
        <!-- Lado Esquerdo: Calendário -->
        <!-- Lado Direito: Popup de troca -->
        <div class="popup-pane">
          <RoomExchangeResponse
            :keyValueList="keyValueList"
            :from="from"
            :to="to"
            @close="onClose"
            @approve="onApprove"
            @reject="onReject"
          />
        </div>
      </div>
    </ModalBase>
  </template>
  
<script setup lang="ts">
  import RoomExchangeResponse from './popups/RoomExchangeResponse.vue';
  import ModalBase from './ModalBase.vue'; // o componente com o horário
  import { ref } from "vue";

  interface Props {
    keyValueList?: Record<string, string>;
    from?: { text: string; barColor: string };
    to?: { text: string; barColor: string };
}

  const props = withDefaults(defineProps<Props>(), {
    keyValueList: () => ({
      Chave: 'Default',
      Valor: 'Default',
    }),
    from: () => ({
      text: 'Valor esquerda',
      barColor: '	#2E8B57',
    }),
    to: () => ({
      text: 'Valor direita',
      barColor: '	#ADD8E6',
    }),
  });

  void props;
  
  const emit = defineEmits(['close', 'approve', 'reject']);
  
  const modal = ref<typeof ModalBase>();

  const open = () => modal.value!.open();

  defineExpose({
		open,
	});

  const onClose = () => emit('close');
  const onApprove = () => emit('approve');
  const onReject = () => emit('reject');
</script>
  
<style scoped>
.modal-content {
  display: flex; 
  border-radius: 8px;
  overflow: hidden;
}

.calendar-pane {
  max-width: 1000px;
  width: 50vw;
  flex: 1;
  padding: 16px;
  color: var(--color-text);
}

:global([name="calendar"] > div) {
  border-radius: 12px;
  border: 1px solid #e16b02;
}

.popup-pane {
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;  /* Prevents overflow inside the pane */
}
</style>
  