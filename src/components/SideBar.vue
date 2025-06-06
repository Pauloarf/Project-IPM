<template>
	<aside :class="`${is_expanded ? 'is-expanded' : ''}`">
		<div class="top-bar">
			<button class="menu-toggle" @click="ToggleMenu">
				<span class="material-icons">menu</span>
			</button>

			<!-- <div class="vertical-separator"></div> -->

			<!-- <h3 v-if="is_expanded">TURNOSexpress</h3> -->
			<h3>TURNOSexpress</h3>
		</div>

		<div class="menu">
			<router-link to="/diretor" class="button">
				<span class="material-icons">home</span>
				<span class="text">Painel Principal</span>
			</router-link>
			<router-link to="/diretor/turnos" class="button">
				<span class="material-icons">menu_book</span>
				<span class="text">Turnos</span>
			</router-link>
			<router-link to="/diretor/pedidos" class="button">
				<span class="material-icons">email</span>
				<span class="text">Pedidos</span>
			</router-link>
			<router-link to="/diretor/alunos" class="button">
				<span class="material-icons">people</span>
				<span class="text">Alunos</span>
			</router-link>
		</div>

		<div class="flex"></div>

		<div class="menu">
			<router-link to="/die" class="button">
				<span class="material-icons">meeting_room</span>
				<span class="text">Sair</span>
			</router-link>
		</div>
	</aside>
</template>

<script setup lang="ts">
	import { ref } from "vue";

	const is_expanded = ref(false);
	const ToggleMenu = () => {
		is_expanded.value = !is_expanded.value;
	};
</script>

<style>
	aside {
		display: flex;
		flex-direction: column;
		background-color: #303446;
		color: #ffffff;
		width: calc(2rem + 32px);
		overflow: hidden;
		min-height: 100vh;
		padding: 0rem 1rem 1rem 1rem;
		transition: 0.2s ease-in-out;
		position: fixed;
		left: 0;
		border-right: 1px solid #ffffff;
		z-index: 1000;
		/* Borda lateral branca */
	}

	aside .top-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 1px solid #ffffff;
		/* Borda inferior branca */
		margin: 0 -1rem 1rem -1rem;
		padding: 0rem 1rem;
		/* height: 100%; */
		height: var(--header-size, 100%);
		/* Isso garante que a top-bar ocupe toda a altura disponível */
		position: relative;
		/* Isso permite o uso de posicionamento absoluto para a barra vertical */
	}

	aside .top-bar .vertical-separator {
		width: 1px;
		background-color: white;
		height: 5vh;
		/* Isso garante que a barra vertical ocupe toda a altura da top-bar */
		margin: 0 1.5rem;
	}

	aside .top-bar h3 {
		color: #ffffff;
		font-size: 16px;
		font-weight: 500;
		margin: 0;
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
	}

	.menu-toggle {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
	}

	.menu-toggle::after {
		content: "";
		width: 1px;
		background-color: white;
		height: var(--header-size, 100%);
		/* Isso garante que a barra vertical ocupe toda a altura da top-bar */
		margin: 0 0.5rem 0 1rem;
	}

	.menu-toggle .material-icons {
		font-size: 2rem;
		color: #ffffff;
		transition: 0.2s;
	}

	.menu-toggle:hover .material-icons {
		color: #e16b02;
	}

	aside .flex {
		flex: 1 1 0%;
	}

	aside .menu {
		margin: 0 -1rem;
	}

	aside .menu .button {
		display: flex;
		align-items: center;
		text-decoration: none;
		transition: 0.2s ease-in-out;
		padding: 0.5rem 1rem;
	}

	aside .menu .button .material-icons {
		font-size: 2rem;
		color: #ffffff;
		transition: 0.2s ease-in-out;
	}

	aside .menu .button .text {
		color: #ffffff;
		transition: 0.2s ease-in-out;
		opacity: 0;
		overflow: hidden;
		white-space: nowrap;
	}

	aside .menu .button:hover {
		background-color: #2a2d3a;
	}

	aside .menu .button:hover .material-icons,
	aside .menu .button:hover .text {
		color: #e16b02;
	}

	aside .menu .button.router-link-exact-active {
		background-color: #2a2d3a;
		border-right: 5px solid #e16b02;
	}

	aside .menu .button.router-link-exact-active .material-icons,
	aside .menu .button.router-link-exact-active .text {
		color: #cccccc;
	}

	aside .footer {
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
	}

	aside .footer p {
		font-size: 0.875rem;
		color: #aaaaaa;
	}

	/* Expansão da sidebar */
	aside.is-expanded {
		width: 250px;
	}

	aside.is-expanded .top-bar h3,
	aside.is-expanded .button .text {
		opacity: 1;
	}

	aside.is-expanded .button .material-icons {
		margin-right: 1rem;
	}

	aside.is-expanded .footer {
		opacity: 0;
	}

	@media (max-width: 1024px) {
		aside {
			position: absolute;
			z-index: 99;
		}
	}
</style>
