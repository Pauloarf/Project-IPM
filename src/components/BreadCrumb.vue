<template>
	<div class="breadcrumb-container">
		<span v-for="(item, index) in path" :key="index" class="breadcrumb-segment">
			<span :class="['breadcrumb-text', { last: index === path.length - 1 }]">
				<a v-if="index < path.length - 1" :href="item.link">
					{{ item.name.toUpperCase() }}
				</a>
				<span v-else>
					{{ item.name.toUpperCase() }}
				</span>
			</span>

			<span v-if="index < path.length - 1" class="breadcrumb-separator"> > </span>
		</span>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		path: {
			name: string;
			link: string;
		}[];
	}>();
</script>

<style scoped>
	.breadcrumb-container {
		display: inline-flex;
		background-color: #494e6c;
		border-top-left-radius: 15px;
		border-top-right-radius: 15px;
		padding: 0.5% 0.8% 0.2% 0.8%;
	}

	.breadcrumb-segment {
		display: flex;
		align-items: center;
	}

	.breadcrumb-text a {
		/* color: #a1a1aa; */
		color: #c1c1ca;
		font-weight: 600;
		font-size: 16px;
		text-decoration: none;
		background-color: transparent;
	}

	.breadcrumb-text.last {
		color: white;
		font-weight: 600;
		font-size: 16px;
	}

	.breadcrumb-separator {
		/* color: #e16b02; */
		color: #feb249;
		font-weight: 600;
		font-size: 16px;
		margin: 0 8px;
	}
</style>
