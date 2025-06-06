import type { APILogin } from "@/lib/api";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
	state: () => (<Pick<APILogin, "id" | "kind">>{
		id: -1,
		kind: "teachers"
	}),
	actions: {
		getId() {
			return this.id;
		},
		getKind() {
			return this.kind;
		},
		login(id: APILogin["id"], kind: APILogin["kind"]) {
			this.id = id;
			this.kind = kind;
		}
	}
});
