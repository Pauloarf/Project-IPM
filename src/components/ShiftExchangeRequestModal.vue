<template>
	<ModalBase ref="modal">
		<div class="modal-content">
			<!-- Lado Esquerdo: Calendário -->
			<div class="calendar-pane">
				<ShiftCalendar name="calendar" :shifts="shifts" />
			</div>

			<!-- Lado Direito: Popup de troca -->
			<div class="popup-pane">
				<ShiftExchangeRequest
					:courses="courses"
					@submit="onApprove"
					@close="onClose"
					@courseSelected="onCourseSelected"
					@shiftSelected="onShiftSelected"
				/>
			</div>
		</div>
	</ModalBase>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import ModalBase from "./ModalBase.vue";
	import ShiftCalendar from "./ShiftCalendar.vue";
	import type { Shift } from "./ShiftCalendar.vue";
	import ShiftExchangeRequest from "./popups/ShiftExchangeRequest.vue";

	interface turno {
		dia: string,
		from: number,
		to: number,
		nome: string
	}
	
	interface Option {
		curso: string;
		turnoAtual: string;
		turnosExtra: turno[]
	}

	interface Props {
		shifts?: Shift[];
		courses?: Option[];
	}

	const props = withDefaults(defineProps<Props>(), {
	shifts: () => [
		{
		day: "Segunda-Feira",
		from: 11,
		to: 14,
		course: "d",
		name: "d",
		classroom: "bida",
		},
	],
	courses: () => [
		{ curso: "Curso A", turnoAtual: "Informática", turnosExtra: [{dia: "Segunda", from: 10, to: 12, nome:"PL5"}]},
		{ curso: "Curso B", turnoAtual: "matilde", turnosExtra: [{dia: "sexta", from: 13, to: 15, nome:"PL6"}]},
	],
	});

	void props;

	const emit = defineEmits(["close", "approve", "reject", "courseSelected", "shiftSelected"]);

	const modal = ref<typeof ModalBase>();
	const open = () => modal.value?.open();

	defineExpose({ open });

	const onClose = () => emit("close");
	const onApprove = (payload: unknown) => emit("approve", payload);
	const onCourseSelected = (course: string) => emit("courseSelected", course);
	const onShiftSelected = (shift: string) => emit("shiftSelected", shift)
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
