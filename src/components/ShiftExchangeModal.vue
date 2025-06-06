<template>
  <ModalBase ref="modal">
    <div class="modal-content">
      <!-- Lado Esquerdo: Calendário -->
      <div class="calendar-pane">
        <ShiftCalendar name="calendar" :shifts="shifts" />
      </div>

      <!-- Lado Direito: Manual Allocation -->
      <div class="popup-pane">
        <ShiftExchange
          :from="from"
          :to="to"
          :availableShifts="availableShifts"
          @approve="onApprove"
          @reject="onReject"
          @close="onClose"
        />
      </div>
    </div>
  </ModalBase>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ModalBase from './ModalBase.vue';
import ShiftCalendar from './ShiftCalendar.vue';
import type { Shift } from './ShiftCalendar.vue';
import ShiftExchange from './popups/ShiftExchange.vue'; // The new manual allocation component

interface Option {
  title: string;
  subtext: string;
}

interface Props {
  shifts?: Shift[];
  from?: { text: string; barColor: string };
  to?: { barColor: string };
  availableShifts?: Option[];
}

const props = withDefaults(defineProps<Props>(), {
  shifts: () => [
    {
      weekday: "Segunda-Feira",
      from: 11,
      to: 14,
      course: "d",
      name: "d",
      classroom: "bida",
    },
  ],
  from: () => ({
    text: "TP1 - 08:00",
    barColor: "#2E8B57",
  }),
  to: () => ({
    barColor: "#ADD8E6",
  }),
  availableShifts: () => [
    { title: "TP2", subtext: "14:00 - 17:00" },
    { title: "TP3", subtext: "17:00 - 20:00" },
  ],
});

const emit = defineEmits(['close', 'approve', 'reject']);

void props;

const modal = ref<typeof ModalBase>();

const open = () => modal.value?.open();

defineExpose({ open });

const onClose = () => emit('close');
const onApprove = (selectedShift: Option) => emit('approve', selectedShift);
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