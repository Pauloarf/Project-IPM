<template>
  <div class="content">
    <div class="baseCard">
      <div class="header">
        <div class="headerLeft">
          <h2>Lista de Pedidos</h2>
          <button class="custom-button" @click="openModal">
            <span class="material-icons">mail</span>
            Novo Pedido
          </button>
        </div>
        <div class="headerFilters">
          <FiltersBox
            :filterGroups="courseFilterGroups"
            :multiSelect="true"
            @filter-change="onFilterChange"
          />
        </div>
        <div class="headerRight">
          <button class="page-icon-button">
            <span class="material-icons" @click="openInfoModal">info</span>
          </button>
          <button class="page-icon-button">
            <span class="material-icons" @click="goToDashboard">subdirectory_arrow_left</span>
          </button>
        </div>
      </div>
      <div class="body">
        <div class="bodyTitle">
          <p>Unidade Curricular</p>
          <p>Turno Origem</p>
          <p>Turno Destino</p>
          <p>Estado</p>
          <p>Data de criação</p>
          <p>Cancelar</p>
        </div>
        <div class="bodyList">
          <RequestCardList
            v-for="request in filteredRequests"
            :key="request.id"
            :courseName="request.courseName"
            :currentShift="request.currentShift"
            :requestedShift="request.requestedShift"
            :status="request.status"
            :date="request.date"
            :requestId="request.id"
            @cancel-request="handleCancel"
          />
        </div>
      </div>
    </div>
  </div>
	<ShiftExchangeRequestModal
			ref="shiftModal"
      :courses="courseOptions"
      :shifts="studentShifts"
      @close="onModalClose"
      @submit="handleNewRequest"
      @course-selected="showCourse"
      @shift-selected="showShift"
			@approve="createRequest"
	/>
  <ModalBase ref="infoModal">
		<InformationCard
			title="Ajuda"
			description="Esta página foi concebida para mostrar ao utilizador uma lista com os seus pedidos. Um pedido poderá estar num dos seguintes estados: ACEITE, PENDENTE, ALTERADO, RECUSADO."
			:topics="['Visualizar os pedidos.', 'Filtrar pelas UCs com inscrição.', 'Criar novo pedido.', 'Cancelar um pedido pendente.']"
		></InformationCard>
	</ModalBase>
</template>

<script setup lang="ts">
import '@/assets/css/director.css'

import FiltersBox from '@/components/FiltersBox.vue'
import RequestCardList from '@/components/RequestCardList.vue'
import ShiftExchangeRequestModal from '@/components/ShiftExchangeRequestModal.vue'
import ModalBase from '@/components/ModalBase.vue'
import InformationCard from '@/components/InformationCard.vue'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { APIWrapper } from '@/lib/api'
import type { Time, Weekday } from "@/data/time"
import type { Shift } from '@/components/ShiftCalendar.vue'
import type {
  APIRequest,
  APICourse,
  APIShift,
  APIClassroom,
  APIBuilding,
  APIStudent,
} from "@/lib/api"

interface FilteredRequest {
  id: number,
  courseName: string,
  currentShift: string,
  requestedShift: string,
  status: string,
  date: Date
}

interface Option {
  curso: string;
  turnoAtual: string;
  turnosExtra: {
    dia: string;
    from: number;
    to: number;
    nome: string;
  }[];
}

const requestApi = APIWrapper.local<APIRequest[]>(3000, "requests");
const coursesApi = APIWrapper.local<APICourse[]>(3000, "courses");
const shiftsApi = APIWrapper.local<APIShift[]>(3000, "shifts");
const studentApi = APIWrapper.local<APIStudent[]>(3000, "students");
const classroomApi = APIWrapper.local<APIClassroom[]>(3000, "classrooms");
const buildingsApi = APIWrapper.local<APIBuilding[]>(3000, "buildings");

const infoModal = ref<InstanceType<typeof ModalBase>>();
const shiftModal = ref<InstanceType<typeof ShiftExchangeRequestModal>>();
const studentShifts = ref<Shift[]>([]); // Initialize as empty array
const requests = ref<FilteredRequest[]>([]);
const courseOptions = ref<Option[]>([]);
const selectedCourseName = ref<string | null>(null);
const selectedShiftName = ref<string | null>(null);


onMounted(() => {
  fetchRequests();
});

const fetchRequests = async () => {
  const rawRequests = await requestApi.fetch({
    filter: {
      studentId: "1",
    },
  });

  const fixedRequests: FilteredRequest[] = await Promise.all(
    (rawRequests ?? []).map(async (req) => {
      const course = await coursesApi.fetch(`${req.kind == 0 ? 0 : req.fromShiftId}`);
      const fromShift = await shiftsApi.fetch(`${req.kind == 0 ? 0 : req.fromShiftId}`);
      const toShift = await shiftsApi.fetch(`${req.kind == 0 ? 0 : req.toShiftId}`);

      return {
        id: req.id,
        courseName: course?.name ?? 'Desconhecido',
        currentShift: fromShift?.name ?? 'Desconhecido',
        requestedShift: toShift?.name ?? 'Desconhecido',
        status: getStatus(req),
        date: new Date(req.requestTimestamp),
      };
    })
  );

  requests.value = fixedRequests;
};

function getStatus(req: APIRequest): string {
  if (req.response === null) return 'PENDENTE';
  if (req.response === true) return 'ACEITE';
  if (req.response === false) return 'RECUSADO';
  return "";
}

const getStudentShifts = async (): Promise<Shift[]> => {
		const student = await studentApi.fetch(`1`);
		const studentShifts: Shift[] = [];

		if (student) {
			const shifts = await shiftsApi.fetch({ filter: { id: student.enrolled } });
			if (shifts && shifts.length > 0) {
				for (const shift of shifts) {
					const classroom = await classroomApi.fetch({ filter: { id: shift.classroomId } });
					const course = await coursesApi.fetch({ filter: { id: shift.courseId } });

					if (classroom?.length && course?.length) {
						const building = await buildingsApi.fetch({ filter: { id: classroom[0].buildingId } });
						if (building?.length) {
							studentShifts.push({
								day: shift.day as Weekday,
								from: shift.from as Time,
								to: shift.to as Time,
								name: course[0].abbreviation,
								course: shift.name,
								classroom: `${building[0].abbreviation} - ${classroom[0].name}`,
							});
						}
					}
				}
			}
		}
  return studentShifts;
}

// Função chamada quando o curso é selecionado no modal
async function showCourse(course: Option) {
  selectedCourseName.value = course.curso;
}

const createRequest = async () => {
  if (!selectedCourseName.value || !selectedShiftName.value) {
    console.warn("Curso ou turno de destino não selecionado.");
    return;
  }

  const courseData = await coursesApi.fetch({ filter: { name: selectedCourseName.value } });
  const course = courseData?.[0];
  if (!course) return;

  const toShifts = await shiftsApi.fetch({ filter: { courseId: course.id, name: selectedShiftName.value } });
  const toShift = toShifts?.[0];
  if (!toShift) return;

  const currentShifts = studentShifts.value.filter(s => s.name === course.abbreviation);
  if (!currentShifts.length) return;

  const fromShiftName = currentShifts[0].course;
  const fromShiftData = await shiftsApi.fetch({ filter: { courseId: course.id, name: fromShiftName } });
  const fromShift = fromShiftData?.[0];
  if (!fromShift) return;

  const newRequest: APIRequest = {
    id: 2,
		kind: 0,
    fromClassroomId: fromShift.classroomId,
    toClassroomId: toShift.classroomId,
    shiftId: fromShift.id,
    teacherId: 1,
    requestSeen: false,
    requestTimestamp: Date.now(),
    response: null,
    responseSeen: false,
  };
	//TODO O IDDDDDD é preciso o fucking id
};


// Atualizado: quando o turno é selecionado
async function showShift(shift: string) {
  selectedShiftName.value = shift;

  if (!selectedCourseName.value || !selectedShiftName.value) return;

  const courseData = await coursesApi.fetch({ filter: { name: selectedCourseName.value } });
  const course = courseData?.[0];
  if (!course) return;

  const shifts = await shiftsApi.fetch({ filter: { courseId: course.id, name: selectedShiftName.value } });
  const foundShift = shifts?.[0];
  if (!foundShift) return;

  const classroom = await classroomApi.fetch({ filter: { id: foundShift.classroomId } });
  const courseInfo = await coursesApi.fetch({ filter: { id: foundShift.courseId } });

  if (!classroom?.[0] || !courseInfo?.[0]) return;

  const building = await buildingsApi.fetch({ filter: { id: classroom[0].buildingId } });

  if (!building?.[0]) return;

  // Adiciona shift com cor (podes mudar "red" para o que quiseres)
  const newShift: Shift = {
    day: foundShift.day as Weekday,
    from: foundShift.from as Time,
    to: foundShift.to as Time,
    name: courseInfo[0].abbreviation,
    course: foundShift.name,
    classroom: `${building[0].abbreviation} - ${classroom[0].name}`,
    color: "red"
  };

  // Remove versões antigas do mesmo turno (caso já tenha sido selecionado antes)
  studentShifts.value = [
    ...(studentShifts.value?.filter(s => s.course !== newShift.course) ?? []),
    newShift
  ];
}

async function openModal() {
  studentShifts.value = await getStudentShifts();
  shiftModal.value?.open();
  courseOptions.value = [];

	const groupedByCourse = new Map<string, { course: APICourse, studentShifts: Shift[], allShifts: APIShift[] }>();

	for (const shift of studentShifts.value) {
		const courseData = await coursesApi.fetch({ filter: { abbreviation: shift.name } });
		const course = courseData?.[0];
		if (!course) continue;

		if (!groupedByCourse.has(course.name)) {
			const allShifts = await shiftsApi.fetch({ filter: { courseId: course.id } }) ?? [];
			groupedByCourse.set(course.name, { course, studentShifts: [], allShifts });
		}

		groupedByCourse.get(course.name)!.studentShifts.push(shift);
	}

	courseOptions.value = Array.from(groupedByCourse.values()).map(({ course, studentShifts, allShifts }) => {
		const turnoAtual = studentShifts.map(s => s.course); // ex: ["TP1", "PL2"]
		const currentShiftNames = new Set(turnoAtual);
		
		const turnosExtra = allShifts
			.filter(s => !currentShiftNames.has(s.name)) // só os que o aluno *não tem*
			.map(s => ({
				nome: s.name,
				dia: s.day,
				from: s.from,
				to: s.to
			}));

		return {
			curso: course.name,
			turnoAtual: turnoAtual.join(', '), // ou deixa como array se preferires
			turnosExtra
		};
	});
}

function onModalClose() {
  // Só refaz se houver seleções feitas
  if (selectedCourseName.value && selectedShiftName.value) {
    showShift(selectedShiftName.value);
  }
}

function handleNewRequest(newRequest: {
  course: { title: string };
  from: string;
  to: { title: string };
}) {
  requests.value.push({
    id: Number(Math.random().toString()),
    courseName: newRequest.course.title,
    currentShift: newRequest.from,
    requestedShift: newRequest.to.title,
    status: "PENDENTE",
    date: new Date(),
  });
}

const courseFilterGroups = ref({
  status: [
    { value: 'ipm', label: 'IPM' },
    { value: 'cg', label: 'CG' },
    { value: 'ew', label: 'EW' },
    { value: 'ssi', label: 'SSI' },
    { value: 'pl', label: 'PL' },
    { value: 'adi', label: 'ADI' },
    { value: 'ap', label: 'AP' },
    { value: 'li3', label: 'LI3' },
    { value: 'pi', label: 'PI' },
    { value: 'pf', label: 'PF' },
    { value: 'rc', label: 'RC' },
  ],
});

const selectedFilters = ref<{ status: string[] }>({ status: [] });

function onFilterChange(newFilters: { status: string[] }) {
  selectedFilters.value = newFilters;
}

const filteredRequests = computed(() => {
  if (selectedFilters.value.status.length === 0) {
    return requests.value;
  }
  return requests.value.filter((request) =>
    selectedFilters.value.status.includes(request.courseName.toLowerCase())
  );
});

const router = useRouter()

function handleCancel(id: string) {
  // se quiseres cancelar pedidos no frontend
}

function openInfoModal() {
  infoModal.value?.open();
}

function goToDashboard() {
  router.push('/alunos');
}
</script>


<style scoped>
.baseCard {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  width: 100%;
  background-color: #3c4059;
  padding: 20px 20px;
  border-radius: 10px;
  gap: 30px;
}

.header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
}

.header h2 {
  font-size: 24px;
  font-weight: 600;
  color: white;
}

.headerLeft {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 15px;
}

.headerFilters {
  border: 2px solid black;
  border-radius: 10px;
  max-width: 600px;
  padding: 10px;
}

.headerRight {
  display: flex;
  flex-direction: row;
  align-items: start;
  justify-content: end;
}

.body {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 15px;
  height: 100%;
  overflow: hidden;
}

.bodyTitle {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
}

.bodyTitle p {
  font-size: 24px;
  color: white;
  font-weight: 600;
}

.bodyList {
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
  padding: 5px 100px;
  cursor: pointer;
}

.custom-button:hover {
  background-color: #456288;
}
</style>
