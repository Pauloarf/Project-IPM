<!-- ShiftExchange.vue -->
<template>
	<BaseRequestPopup title="Alocação Manual" @close="onClose">
		<template #default>
			<div class="cards">
				<InfoCard title="Turno Atual" :subtext="from.text" :barColor="from.barColor" />
				<span class="material-icons arrow-icon">arrow_forward</span>
				<div class="field">
					<DpInfoBaseCard
						title="Turno Novo"
						:subtext="selectedShift?.title || 'Selecione um novo turno'"
						:options="availableShifts"
						@updateCard="updateShiftSelection"
						:barColor="to.barColor"
					/>
				</div>
			</div>
		</template>

		<template #actions>
			<!-- <button class="approve-button" @click="onApprove">Autorizar</button>
      <button class="reject-button" @click="onReject">Recusar</button> -->
			<button data-modal-action="close" class="button--approve" @click="onApprove">Autorizar</button>
			<button data-modal-action="close" class="button--reject" @click="onReject">Recusar</button>
		</template>
	</BaseRequestPopup>
</template>

<script setup lang="ts">
	import "@/assets/css/popup.css";
	import { ref } from "vue";

	import BaseRequestPopup from "./BasePopup.vue";
	import InfoCard from "../InfoBaseCard.vue";
	import DpInfoBaseCard from "../DpInfoBaseCard.vue";

	interface Option {
		title: string;
		subtext: string;
	}

	interface Props {
		from?: { text: string; barColor: string };
		to?: { barColor: string };
		availableShifts?: Option[];
	}

	const props = withDefaults(defineProps<Props>(), {
		from: () => ({
			text: "Valor esquerda",
			barColor: "#2E8B57",
		}),
		to: () => ({
			barColor: "#ADD8E6",
		}),
		availableShifts: () => [],
	});

	void props;

	const emit = defineEmits(["close", "approve", "reject"]);

	const selectedShift = ref<Option | null>(null);

	const updateShiftSelection = (title: string, subtext: string) => {
		selectedShift.value = { title, subtext };
	};

	const onClose = () => emit("close");
	const onApprove = () => {
		if (selectedShift.value) {
			emit("approve", selectedShift.value);
		}
	};
	const onReject = () => emit("reject");
</script>

<style scoped>
	.cards {
		display: flex;
		align-items: center;
		gap: 32px;
		margin-top: 16px;
	}

	.arrow-icon {
		font-size: 28px;
		color: #e4e4e7;
	}

	.approve-button,
	.reject-button {
		padding: 10px 20px;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		font-weight: 600;
	}

	/* .approve-button {
		background-color: #22c55e;
		color: white;
	}

	.reject-button {
		background-color: #ef4444;
		color: white;
	} */
</style>
