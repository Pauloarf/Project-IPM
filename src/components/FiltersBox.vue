<template>
	<div class="filter-card">
		<div class="filter-header">
			<span class="material-icons filter-icon">filter_alt</span>
			<h2 class="filter-title">{{ title || "Filtros" }}</h2>
		</div>

		<div class="filter-options">
			<div v-for="(filterItems, groupName) in filterGroups" :key="groupName" class="filter-group">
				<div
					v-for="item in filterItems"
					:key="item.value"
					class="filter-item"
					:class="{ active: isSelected(groupName, item.value) }"
					@click="toggleFilter(groupName, item.value)"
				>
					{{ item.label }}
				</div>
			</div>
		</div>
	</div>
</template>

<!-- <script lang="ts">
	import { defineComponent } from "vue";

	interface FilterItem {
		value: string;
		label: string;
	}

	export default defineComponent({
		name: "FilterComponent",
		props: {
			title: String,
			filterGroups: {
				type: Object as () => Record<string, FilterItem[]>,
				required: true,
				default: () => ({
					group1: [
						{ value: "option1", label: "Option 1" },
						{ value: "option2", label: "Option 2" },
						{ value: "option3", label: "Option 3" },
					],
					group2: [
						{ value: "option1", label: "Option 1" },
						{ value: "option2", label: "Option 2" },
					],
				}),
			},
			multiSelect: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				selectedFilters: {} as Record<string, string[]>,
			};
		},
		methods: {
			isSelected(groupName: string, value: string): boolean {
				return this.selectedFilters[groupName]?.includes(value) || false;
			},
			toggleFilter(groupName: string, value: string): void {
				if (!this.selectedFilters[groupName]) {
					this.selectedFilters[groupName] = [];
				}

				const currentGroup = this.selectedFilters[groupName];
				const index = currentGroup.indexOf(value);

				if (this.multiSelect) {
					if (index > -1) {
						currentGroup.splice(index, 1);
					} else {
						currentGroup.push(value);
					}
				} else {
					this.selectedFilters[groupName] = index > -1 ? [] : [value];
				}

				this.$emit("filter-change", { ...this.selectedFilters });
				this.$emit("filter-change-diff", groupName, value, index === -1);
			},
			setActiveFilters(filters: Record<string, string[]>) {
				this.selectedFilters = filters;
			},
		},
		emits: ["filter-change", "filter-change-diff"],
	});
</script> -->

<script setup lang="ts">
	import { ref } from "vue";

	export interface FilterItem {
		value: string;
		label: string;
	}

	const props = defineProps({
		title: String,
		filterGroups: {
			type: Object as () => Record<string, FilterItem[]>,
			required: true,
			default: () => ({
				group1: [
					{ value: "option1", label: "Option 1" },
					{ value: "option2", label: "Option 2" },
					{ value: "option3", label: "Option 3" },
				],
				group2: [
					{ value: "option1", label: "Option 1" },
					{ value: "option2", label: "Option 2" },
				],
			}),
		},
		multiSelect: {
			type: Boolean,
			default: false,
		},
	});
	const emit = defineEmits(["filter-change", "filter-change-diff"]);

	const selectedFilters = ref<Record<string, string[]>>({});

	function isSelected(groupName: string, value: string): boolean {
		return selectedFilters.value[groupName]?.includes(value) || false;
	}

	function toggleFilter(groupName: string, value: string): void {
		if (!selectedFilters.value[groupName]) {
			selectedFilters.value[groupName] = [];
		}

		const currentGroup = selectedFilters.value[groupName];
		const index = currentGroup.indexOf(value);

		if (props.multiSelect) {
			if (index > -1) {
				currentGroup.splice(index, 1);
			} else {
				currentGroup.push(value);
			}
		} else {
			selectedFilters.value[groupName] = index > -1 ? [] : [value];
		}

		emit("filter-change", { ...selectedFilters.value });
		emit("filter-change-diff", groupName, value, index === -1);
	}

	function setActiveFilters(filters: Record<string, string[]>) {
		selectedFilters.value = filters;
	}

	defineExpose({ setActiveFilters });
</script>

<style scoped>
	.filter-card {
		background-color: #3c4059;
		width: 100%;
		min-height: 200px;
		border-radius: 8px;
		padding: 20px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		overflow-y: auto;
	}

	.filter-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
	}

	.filter-icon {
		color: #ffffff;
		font-size: 25px;
	}

	.filter-title {
		color: #ffffff;
		font-size: 24px;
		font-family: "Inter", sans-serif;
		margin: 0;
	}

	.filter-options {
		display: flex;
		flex-direction: column;
		gap: 15px;
		flex-grow: 1;
	}

	.filter-group {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.filter-item {
		background-color: #303446;
		color: #ffffff;
		font-family: "Inter", sans-serif;
		font-size: 24px;
		padding: 5px 15px;
		display: flex;
		align-items: center;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: center;
		border: 1px solid #a1a1aa;
		box-sizing: border-box;
	}

	.year-item {
		min-width: 125px;
	}

	.semester-item {
		min-width: 180px;
	}

	.filter-item:hover {
		background-color: #303446;
		border-color: #d4d4d8;
	}

	.filter-item.active {
		background-color: #303446;
		font-weight: bold;
		border-color: #ffffff;
		border: 5px solid #a1a1aa;
	}
</style>
