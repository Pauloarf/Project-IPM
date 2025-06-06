<template>
    <ModalBase ref='modal'>
      <div class='modal-content'>
        <!-- Lado Esquerdo: Calendário -->
        <div class="calendar-pane">
          <ShiftCalendar name='calendar' :shifts="shifts" />
        </div>
        <!-- Lado Direito: Popup de troca -->
        <div class="popup-pane">
          <ShiftExchangeResponse
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
  import ShiftExchangeResponse from './popups/ShiftExchangeResponse.vue';
  import ShiftCalendar from './ShiftCalendar.vue';
  import type { Shift } from './ShiftCalendar.vue';
  import ModalBase from './ModalBase.vue'; // o componente com o horário
  import { ref } from "vue";

  interface Props {
    keyValueList?: Record<string, string>;
    from?: { text: string; barColor: string };
    to?: { text: string; barColor: string };
    shifts?: Shift[];
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
    shifts: () => [{
      day: "Segunda-Feira",
      from: 11,
      to: 14,
      name: "d",
      course: "d",
      classroom: "bida",
    }]
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
  width: 100%; /* Make sure modal content takes full width */
  height: 100%; /* Ensure the height is also 100% */
}

.calendar-pane {
  flex: 1; /* Make the calendar pane grow to take remaining space */
  max-width: 800px; /* Optional: maximum width */
  min-width: 50%; /* Make the calendar take up at least 50% of the width */
  height: 100%; /* Ensure it takes full height available */
  padding: 16px;
  color: var(--color-text);
}

.popup-pane {
  flex: 1; /* This will allow the popup to take up the remaining space */
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:global([name="calendar"] > div) {
  border-radius: 12px;
  border: 1px solid #e16b02;
}

</style>
  