<!-- ShiftChangeApprovalPopup.vue -->
<template>
	<BaseRequestPopup title="Pedido de Troca de Sala" @close="onClose">
		<template #default>
			<div class="cards">
				<InfoCard title="Sala Atual" :subtext="from.text" :barColor="from.barColor" />
				<span class="material-icons arrow-icon">arrow_forward</span>
				<InfoCard title="Sala Proposta" :subtext="to.text" :barColor="to.barColor" />
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
	import BaseRequestPopup from "./BasePopup.vue";
	import InfoCard from "../InfoBaseCard.vue";

	interface Props {
		from?: { text: string; barColor: string };
		to?: { text: string; barColor: string };
	}

	const props = withDefaults(defineProps<Props>(), {
		from: () => ({
			text: "Valor esquerda",
			barColor: "	#2E8B57",
		}),
		to: () => ({
			text: "Valor direita",
			barColor: "	#ADD8E6",
		}),
	});

	void props;

	const emit = defineEmits(["close", "approve", "reject"]);

	const onClose = () => emit("close");
	const onApprove = () => emit("approve");
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

	/* .approve-button,
.reject-button {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.approve-button {
  background-color: #22c55e;
  color: white;
}

.reject-button {
  background-color: #ef4444;
  color: white;
} */
</style>
