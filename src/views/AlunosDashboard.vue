<template>
    <div class="content">
        <div class="header">
            <BaseCard :title="student![0].id.toString()" :subtitle="student![0].name" header-align="space-between">
                <template #header-right>
                    <button class="page-icon-button">
                        <span class="material-icons" @click="openInfoModal">info</span>
                    </button>
                </template>
                <div class="metaBody">
                    <p>Horários <span :class="horarioStatus.class">{{ horarioStatus.text }}</span></p>
                    <div class="metaBodyRight">
                        <button class="custom-button" @click="goToLogoutPage">
                            <span class="material-icons">people</span>
                            Terminar sessão
                        </button>
                    </div>
                </div>
            </BaseCard>
            <BaseCard title="Pedidos">
                <div class="pedidosButtons">
                    <button class="custom-button" @click="goToPedidosPage">
                            <span class="material-icons">mail</span>
                            Lista de Pedidos
                    </button>
                    <button class="custom-button" @click="createPedido">
                            <span class="material-icons">mail</span>
                            Novo Pedido
                    </button>
                </div>
            </BaseCard>
        </div>
        <div class="calendario">
            <ShiftCalendar
                id="calendarioCard"
                height="auto"
                :shifts="studentShifts"
            />
        </div>
    </div>
    <ModalBase ref="infoModal">
		<InformationCard
			title="Informações"
			description="Esta página foi concebida para fornecer uma visão do horário e dos pedidos ao utilizador.."
			:topics="['Horário do utilizador.', 'Visualizar lista de pedidos.', 'Criar rapidamente um pedido.', 'Criar rapidamente uma troca de turno.', 'Terminar a sessão do utilizador.']"
		></InformationCard>
	</ModalBase>
</template>

<script setup lang="ts">
	import "@/assets/css/director.css";

	import { ref, computed } from "vue";
    import { useRouter } from "vue-router";
    import { ControlPublishedState, APIWrapper } from "../lib/api/index";
    import type { APIShift, APIStudent, APIClassroom, APICourse, APIBuilding, APIControl } from "../lib/api/index";
    
	import BaseCard from "@/components/BaseCard.vue";
    import ShiftCalendar from "@/components/ShiftCalendar.vue";
    import type { Shift } from "../components/ShiftCalendar.vue";
    import type { Time, Weekday } from "@/data/time";
    import { useAuthStore } from "@/data/store/auth";
    import InformationCard from "@/components/InformationCard.vue";
    import ModalBase from "@/components/ModalBase.vue";
    
    
    const authStore = useAuthStore()
    const studentId = authStore.getId()

    const studentAPI = APIWrapper.local<APIStudent[]>(3000, "students");
    const student = await studentAPI.fetch({filter: {id: "1"}});
    const studentShifts = ref<Shift[]>([]);
    if (student !== undefined && student.length > 0) {
        const shiftsAPI = APIWrapper.local<APIShift[]>(3000, "shifts");
        const classroomAPI = APIWrapper.local<APIClassroom[]>(3000, "classrooms");
        const courseAPI = APIWrapper.local<APICourse[]>(3000, "courses");
        const buildingAPI = APIWrapper.local<APIBuilding[]>(3000, "buildings");

        const shifts = await shiftsAPI.fetch({filter: {id: student[0].enrolled}});
        if (shifts !== undefined && shifts.length > 0) {
            for (const shift of shifts) {
                const classroom = await classroomAPI.fetch({filter: {id: shift.classroomId }});
                const course = await courseAPI.fetch({filter: {id: shift.courseId }});
                if ((classroom !== undefined && classroom.length > 0) && (course !== undefined && course.length > 0)) {
                    const building = await buildingAPI.fetch({filter: {id: classroom[0].buildingId}})
                    if (building !== undefined && building.length > 0) {
                        studentShifts.value.push({
                            day: shift.day as Weekday,
                            from: shift.from as Time,
                            to: shift.to as Time,
                            course: course[0].abbreviation,
                            name: shift.name,
                            classroom: `${building[0].abbreviation} - ${classroom[0].name}`
                        })
                    }
                }
            };
        }
    }

    const controlAPI = APIWrapper.local<APIControl[]>(3000, "_control");
    const control = await controlAPI.fetch({filter: {id: "0"}});
    const estadoHorario = ref<number>(0);
    if (control !== undefined && control.length > 0) {
        estadoHorario.value = control[0].published;
    }
    
    const horarioStatus = computed(() => {
        switch (estadoHorario.value) {
            case ControlPublishedState.TEMPORARY:
                return { text: 'provisórios', class: 'orange' };
            case ControlPublishedState.PUBLISHED:
                return { text: 'publicados', class: 'green' };
            default:
                    return { text: 'não publicados', class: 'red' };
        }
    })

	//#region -------------- Functions --------------
	const router = useRouter();
    const infoModal = ref<InstanceType<typeof ModalBase>>();

    function goToLogoutPage() {
        router.push('/logout');
    }

	function goToPedidosPage() {
		router.push("/alunos/pedidos");
	}

	function createPedido() {
		// TODO
	}

    function openInfoModal() {
		infoModal.value?.open();
	}

	//#endregion -------------- Functions --------------
</script>

<style scoped>
	.content {
		display: grid;
		grid-template-rows: auto 1fr;
		gap: 15px;
	}

	.header {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 15px;
	}

	.metaBody {
		display: grid;
		grid-template-columns: 1fr auto;
		height: 100%;
	}

	.metaBody p {
		font-size: 20px;
		font-weight: 600;
		color: white;
	}

	.metaBodyRight {
		display: flex;
		align-items: end;
	}

	.metaBodyRight .custom-button {
		padding: 5px 50px;
	}

	.pedidosButtons {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.pedidosButtons .custom-button {
		padding: 5px 200px;
	}

	:global(.body) {
		height: 95% !important;
	}

	#calendarioCard {
		overflow-y: hidden !important;
	}

	.calendario {
		height: 100%;
		overflow-y: auto;
	}

	.custom-button {
		display: flex;
		background-color: #5e779b;
		border: 1px solid #0af;
		border-radius: 5px;
		color: white;
		font-size: 18px;
		font-weight: 600;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 5px 10px;
		width: 100%;
		cursor: pointer;
	}

	.custom-button:hover {
		background-color: #456288;
	}

	/* .green {
		/* color: #22c55e; * /
		color: #23c65f;
		font-weight: 600;
	}

	.red {
		/* color: #ef4444; * /
		color: #fd8c8c;
		font-weight: 600;
	}

	.orange {
		color: #ffea00;
		font-weight: 600;
	} */
</style>
