import { defineStore } from "pinia";

export const useDiretorSelectedRoomStore = defineStore("diretorSelectedRoom", {
	state: () => ({
		selectedRoomId: 0
	}),
	actions: {
		get() {
			return this.selectedRoomId;
		},
		set(roomId: number) {
			this.selectedRoomId = roomId;
		}
	}
});
