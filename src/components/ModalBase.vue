<template>
	<dialog ref="dialog" class="modal-container" @click="handleModalClick">
		<div ref="content" class="modal-content" @click="handleModalClick">
			<div class="innerContent">
				<slot></slot>
			</div>
		</div>
	</dialog>
</template>

<script setup lang="ts">
	/**
	 * Base component for modal elements. Modals should be placed outside of the regular page hierarchy,
	 * preferrably as a direct sibling of the document's body, or inside a special modals hierarchy.
	 *
	 * Inside a modal, any buttons with a `data-modal-action` can trigger an `open` or `close` event.
	 */
	import { provide, ref } from "vue";

	//#region -------------- References --------------
	const dialog = ref<HTMLDialogElement>();
	const content = ref<HTMLDivElement>();
	//#endregion -------------- References --------------

	//#region -------------- Builtins --------------
	const props = defineProps({
		closeOnClickOverlay: { type: Boolean, default: true },
	});

	const emit = defineEmits(["open", "close"]);
	//#endregion -------------- Builtins --------------

	//#region -------------- Private --------------
	function handleModalClick(e: MouseEvent) {
		if (!e.target) return;

		if (props.closeOnClickOverlay && (e.target === content.value || e.target === dialog.value)) {
			close();
			return;
		}

		let actionHandled = true;
		const action = (<HTMLElement>e.target)?.getAttribute("data-modal-action");
		switch (action) {
			case "open": {
				open();
				break;
			}
			case "close": {
				close();
				break;
			}
			default: {
				actionHandled = false;
			}
		}

		if (actionHandled) e.stopImmediatePropagation();
	}

	function waitForAnim(elem: Element | undefined | null, callback: () => void) {
		if (!elem) return;
		elem.addEventListener("animationend", callback, { once: true });
	}
	//#endregion -------------- Private --------------

	//#region -------------- Public --------------
	function open() {
		emit("open");
		dialog.value?.classList.add("show-dialog");
		dialog.value?.classList.remove("hide-dialog");
		dialog.value?.showModal();
	}

	function close() {
		emit("close");

		dialog.value?.classList.add("hide-dialog");
		dialog.value?.classList.remove("show-dialog");
		waitForAnim(dialog.value, () => {
			dialog.value?.close();
		});
	}
	//#endregion -------------- Public --------------

	defineExpose({
		open,
		close,
	});

	provide("modalOpen", open);
	provide("modalClose", close);
</script>

<style scoped>
	dialog {
		border: none !important;
		border-radius: calc(5px * var(--ratio));
		box-shadow:
			0 0 #0000,
			0 0 #0000,
			0 25px 50px -12px rgba(0, 0, 0, 0.25);
		padding: 0;
		background: transparent;
		height: 100%;
		width: 100%;
		max-width: 100%;
		max-height: 100%;

		&::backdrop {
			background: rgb(0 0 0 / 50%);
		}
	}

	.modal-content {
		display: flex;
		height: 100%;
		width: 100%;
		align-content: center;
		justify-content: center;
		align-items: center;
	}

	@keyframes show-dialog {
		0% {
			opacity: 0;
			display: none;

			&::backdrop {
				background: rgb(0 0 0 / 0%);
			}
		}
		100% {
			opacity: 1;
			display: block;

			&::backdrop {
				background: rgb(0 0 0 / 50%);
			}
		}
	}

	@keyframes hide-dialog {
		0% {
			opacity: 1;
			display: block;
		}
		100% {
			opacity: 0;
			display: none;
		}
	}

	@keyframes show-dialog-backdrop {
		0% {
			background: rgb(0 0 0 / 0%);
		}
		100% {
			background: rgb(0 0 0 / 50%);
		}
	}

	@keyframes hide-dialog-backdrop {
		0% {
			background: rgb(0 0 0 / 50%);
		}
		100% {
			background: rgb(0 0 0 / 0%);
		}
	}

	.show-dialog {
		--_duration: var(--show-anim-duration, var(--anim-duration, 0.5s));
		animation: show-dialog var(--_duration) forwards;

		&::backdrop {
			animation: show-dialog-backdrop var(--_duration) forwards;
		}
	}

	.hide-dialog {
		--_duration: var(--hide-anim-duration, var(--anim-duration, 0.5s));
		animation: hide-dialog var(--_duration) forwards;

		&::backdrop {
			animation: hide-dialog-backdrop var(--_duration) forwards;
		}
	}
</style>
