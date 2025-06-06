<template>
	<div class="login-page">
		<div class="left">
			<img src="../assets/images/uminho.png" alt="uminho-logo" class="logo-img" />
			<div class="prometeu-img-container">
				<img src="../assets/images/prometeu.png" alt="uminho-prometeu" class="prometeu-img" />
			</div>
		</div>

		<div class="right">
			<h1>Iniciar Sessão</h1>
			<form class="form" :class="{ error: !!authError }" @submit.prevent="handleForm">
				<label for="email">Email</label>
				<input type="email" id="email" v-model="authData!.email" @keydown="resetError" />

				<label for="password">Palavra-Passe</label>
				<input type="password" id="password" v-model="authData!.password" @keydown="resetError" />

				<button type="submit" class="form-button" ref="formBtn" :disabled="formBtnDisabled">
					Login
				</button>
				<div class="error-msg">{{ authError }}</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
	import "@/assets/css/form.css";
	import { authenticate } from "@/lib/api/auth";
	import { computed, ref } from "vue";
	import { useRouter } from "vue-router";
	const router = useRouter();

	const authData = ref<{ email: string; password: string }>({ email: "", password: "" });
	const authError = ref<string | undefined>(undefined);

	const formBtn = ref<HTMLButtonElement>();
	const formBtnDisabledOverride = ref(false);
	const formBtnDisabled = computed(
		() =>
			formBtnDisabledOverride.value ||
			authData.value.email === "" ||
			authData.value.password === "",
	);

	function resetError() {
		if (!formBtnDisabled.value) return;
		authError.value = undefined;
		formBtnDisabledOverride.value = false;
	}

	async function handleForm() {
		formBtnDisabledOverride.value = true;

		const authUser = await authenticate(authData.value.email, authData.value.password);
		if (!authUser) {
			authError.value = "Email ou palavra-passe inválidos.";
			formBtn.value!.dispatchEvent(new Event("pa11yerror"));
			return;
		} else {
			formBtnDisabledOverride.value = false;
		}

		const redirectURI = decodeURIComponent(
			new URLSearchParams(document.location.search).get("redirect_uri") ?? "",
		);
		if (redirectURI) {
			router.push(redirectURI);
		} else {
			switch (authUser.kind) {
				case "directors": {
					router.push("/diretor");
					break;
				}
				case "students": {
					router.push("/alunos");
					break;
				}
				case "teachers": {
					router.push("/404");
					break;
				}
			}
		}
	}
</script>

<style scoped>
	.login-page {
		position: relative;
		display: grid;
		grid-template-columns: 50% 50%;
		height: 100%;
		width: 100%;
	}

	.login-page::before {
		content: "";
		position: absolute;
		left: 50%;
		top: 0;
		width: 3px;
		height: 100%;
		background-color: white;
		transform: translateX(-50%);
	}

	/*#region ============== Left Pane ============== */
	.left {
		position: relative;
		display: grid;
		grid-template-columns: 100%;
		grid-template-rows: fit-content(30%) auto;
		gap: 20px;
		overflow: hidden;
		background-color: #e16b02;
	}

	.logo-img {
		max-width: 30%;
		max-height: auto;
		margin: 5%;
		object-fit: contain;
	}

	.prometeu-img-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.prometeu-img {
		position: absolute;
		bottom: 0;
		right: 0;
		max-height: 100%;
	}

	/*#endregion ============== Left Pane ============== */

	/*#region ============== Right Pane ============== */
	.right {
		display: flex;
		flex: 1;
		align-items: flex-start;
		justify-content: center;
		text-align: left;
		flex-direction: column;
		padding-left: 25%;
		gap: 1%;
		background-color: #232634;
	}

	/*#endregion ============== Right Pane ============== */

	/*#region ============== Responsivity ============== */
	@media screen and (max-width: 970px) {
		.login-page {
			grid-template-columns: 100%;
			grid-template-rows: auto 1fr;

			&::before {
				all: unset;
			}
		}

		.left {
			gap: 0;
			justify-content: center;
			justify-items: center;
		}

		.left::after {
			content: "";
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 3px;
			background-color: white;
			/* transform: translateX(-50%); */
		}

		.right {
			padding: 20px;
			/* align-items: center; */

			input,
			button {
				width: 100%;
			}
		}
	}
	/*#endregion ============== Responsivity ============== */
</style>
