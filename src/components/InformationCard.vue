<template>
	<div class="popup-container">
		<img src="../assets/images/ajuda.png" class="popup-icon" alt="ajuda" />
		<div class="popup-header">
			<h2>{{ title }}</h2>
		</div>
		<div class="popup-message">
			<div class="left">
				{{ description }}
			</div>
			<div class="right">
				<ul>
					<li v-for="(topic, index) in topics" :key="index">{{ topic }}</li>
				</ul>
			</div>
		</div>
		<button class="popup-button" @click="$emit('confirm')" data-modal-action="close">OK</button>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		title: string;
		description: string;
		topics: string[];
	}>();

	defineEmits(["confirm"]);
</script>

<style scoped>
	.popup-container {
		background-color: #373a58;
		color: white;
		border-radius: 10px;
		width: 90%;
		max-width: 700px;
		text-align: center;
		border: 1px solid white;
		margin: 5% auto;
		position: relative;
		box-sizing: border-box;
		overflow-wrap: break-word;
	}

	.popup-header {
		border-radius: 15px;
		border-bottom: 1px solid white;
	}

	.popup-icon {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
	}

	h2 {
		color: white;
		font-size: 24px;
		font-weight: 600;
		margin: 0;
	}

	.popup-message {
		display: grid;
		grid-template-columns: 1fr 1fr;
		position: relative;
		font-size: 14px;
		font-weight: 600;
		padding: 5%;
		gap: 20px;
		color: #a1a1aa;
		box-sizing: border-box;
	}

	.popup-message::before {
		content: "";
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		width: 1px;
		background-color: white;
		transform: translateX(-0.5px);
	}

	.popup-message .left {
		text-align: left;
		padding-right: 10px;
	}

	.popup-message .right {
		text-align: left;
		padding-left: 10px;
	}

	.popup-message ul {
		list-style-type: disc;
		padding-left: 20px;
		margin: 0;
	}

	.popup-button {
		background-color: #4caf50;
		color: black;
		padding: 10px 30px;
		border: none;
		border-radius: 5px;
		font-weight: bold;
		cursor: pointer;
		position: absolute;
		bottom: -18px;
		left: 50%;
		transform: translateX(-50%);
	}
</style>
