<template>
	<div class="container">
		<div class="header" :style="{ justifyContent: props.headerAlign }">
			<h2 class="title">{{ title }} <span class="subtitle">{{ subtitle }}</span></h2>
			<slot name="header-right"></slot>
		</div>
		<div class="body">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
	const props = defineProps({
		title: { type: String, required: true },
		headerAlign: { type: String, default: "start" },
		subtitle: { type: String, required: false }
	});
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		background-color: #3C4059;
		border-radius: 10px;
		padding: 20px 20px;
	}

	.header {
		display: flex;
		justify-content: start;
		align-items: center;
		margin-bottom: 10px;
	}

	.subtitle {
		color: #A1A1AA;
		font-weight: 600;
	}

	.body {
		height: 100%;
	}

	h1,
	h2,
	h3 {
		font-weight: 600;
		color: white;
	}
</style>
