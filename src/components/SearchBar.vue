<template>
	<div class="search-container">
	  	<div class="search-background">
			<input 
				type="text" 
				class="search-input" 
				placeholder="Pesquise por uma unidade curricular"
				v-model="searchQuery"
				@keyup.enter="handleSearch"
			/>
		</div>
		<div class="search-icon-container">
			<span class="material-icons search-icon">search</span>
	  	</div>
	  	<div class="divider"></div>
	</div>
</template>
  
<script lang="ts">
export default {
	name: 'SearchBar',
	data() {
		return {
		searchQuery: ''
		}
	},
	methods: {
		handleSearch() {
		this.$emit('search', this.searchQuery);
		}
	}
}
</script>  
  
<style scoped>
	.search-container {
		position: relative;
		background-color: #09090b;
		height: 50px;
		width: 374px;
		border-radius: 8px;
		display: flex;
		align-items: center;
	}
  
	.search-background {
		background-color: #303446;
		height: 100%;
		width: 100%;
		border-radius: 8px;
		padding: 0 24px 0 60px;
		display: flex;
		align-items: center;
	}
	
	.search-input {
		color: white;
		font-size: 16px;
		font-family: 'Inter', sans-serif;
		border: none;
		outline: none;
		background: transparent;
		width: 100%;
	}
	
	.search-input::placeholder {
		color: #a8a8a8;
	}
	
	.search-icon-container {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		height: 24px;
		width: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.search-icon {
		left: 10px;
		font-size: 34px;
		color: #a8a8a8; /* Match the placeholder color */
	}
	
	.divider {
		position: absolute;
		left: 48px;
		top: 8px;
		bottom: 8px;
		width: 1px;
		background-color: #a8a8a8;
	}
</style>