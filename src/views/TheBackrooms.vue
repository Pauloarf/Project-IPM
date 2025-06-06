<template>
	<div class="backrooms">
		<div class="content">
			<div class="img">
				<img
					src="https://i.pinimg.com/1200x/4d/a1/37/4da137610a614a24c970b01f35d04e4b.jpg"
					alt="The Field"
				/>
			</div>
			<div class="data">
				<h1>404</h1>
				<h3>Damn not found</h3>
			</div>
			<div class="goback">
				<a href="#" @click.prevent="goBack">Go back.</a>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useRouter } from "vue-router";

	console.log("Welcome to the backrooms.");

	const router = useRouter();

	function goBack() {
		router.replace("/goback");
	}
</script>

<style scoped>
	.backrooms {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.content .data {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		gap: 20px;
	}

	.goback {
		display: flex;
		flex-direction: row;
		justify-content: end;
		align-items: center;
		width: 100%;
	}
</style>
