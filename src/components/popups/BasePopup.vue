<template>
	<div class="popup-overlay">
		<div class="request-popup">
			<!-- Header -->
			<div class="popup-header">
				<slot name="header">
					<h2 class="default-title">{{ title }}</h2>
				</slot>
				<span data-modal-action="close" class="close-icon material-icons" @click="$emit('close')"
					>close</span
				>
			</div>

			<hr class="separator" />

			<!-- Content -->
			<div v-if="keyValueList && Object.keys(keyValueList).length" class="key-value-container">
				<div v-for="(value, key) in keyValueList" :key="key" class="key-value-pair">
					<span class="key">{{ key }}:</span>
					<span class="value">{{ value }}</span>
				</div>
			</div>

			<!-- Content -->
			<div class="popup-content">
				<slot />
				<!-- Default slot for content passed from parent -->
			</div>

			<!-- Actions -->
			<div class="popup-actions">
				<slot name="actions">
					<!-- Only show these buttons if no custom 'actions' slot is provided -->
					<button data-modal-action="close" @click="$emit('approve')" v-if="!$slots.actions" class="button button--approve">
						Aprovar
					</button>
					<button data-modal-action="close" @click="$emit('reject')" v-if="!$slots.actions" class="button button--reject">
						Recusar
					</button>
				</slot>
			</div>

			<!-- Optional Footer Slot -->
			<slot name="footer" />
		</div>
	</div>
</template>

<script setup lang="ts">
	import "@/assets/css/popup.css";

	interface Props {
		title?: string;
		keyValueList?: Record<string, string>;
	}

	const props = withDefaults(defineProps<Props>(), {
		title: "Pedido",
		keyValueList: () => ({
			Chave: "A real chave",
			Valor: "O real valor",
		}),
	});

	void props;

	defineEmits(["close", "approve", "reject"]);
</script>

<style scoped>
	@import "@/assets/css/popup.css";

	.popup-overlay {
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.request-popup {
		height: 100%;
		width: 100%;
		/* background-color: #3c4059; */
		background-color: #333750;
		padding: 24px;
		border-radius: 12px;
		border: 1px solid #e16b02;
		max-width: 95vw;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.default-title {
		color: white;
		font-size: 1.2rem;
		font-weight: bold;
	}

	.separator {
		margin: 12px 0;
		border-top: 1px solid #a1a1aa;
	}

	.key-value-container {
		margin-bottom: 16px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.key-value-pair {
		display: flex;
		gap: 8px;
		font-size: 16px;
	}

	.key {
		color: white;
		font-weight: bold;
	}

	.value {
		color: #a1a1aa;
	}

	.popup-content {
		margin-bottom: 20px;
	}

	.popup-actions {
		display: flex;
		justify-content: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.close-icon {
		color: #a1a1aa;
		cursor: pointer;
	}

	strong {
		font-weight: bold;
	}
</style>
