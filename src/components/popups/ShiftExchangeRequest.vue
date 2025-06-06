<template>
	<BaseRequestPopup title="Pedido de Troca de Turno" @close="closePopup">
	  <template #default>
		<div class="card-layout">
		  <!-- Curso -->
		  <div class="field">
			<DpInfoBaseCard
			  title=""
			  :subtext="selectedCourse?.curso || 'Escolha um Curso'"
			  :options="props.courses.map((c) => ({ title: c.curso, subtext: '' }))"
			  @updateCard="updateCourseSelection"
			/>
		  </div>
  
		  <!-- Turno Atual -->
		  <div class="field">
			<InfoBaseCard
			  title=""
			  :subtext="selectedCourse ? selectedCourse.turnoAtual : 'Selecione um curso'"
			  :barColor="'rgba(255,255,255,0.3)'"
			/>
		  </div>
  
		  <!-- Turno Alternativo -->
		  <div class="field">
			<DpInfoBaseCard
			  title=""
			  :subtext="selectedShiftName || 'Escolha um Turno'"
			  :options="availableShiftOptions"
			  @updateCard="updateShiftSelection"
			  :disabled="!selectedCourse"
			/>
		  </div>
		</div>
	  </template>
  
	  <template #actions>
		<div class="popup-actions">
		  <button
			data-modal-action="close"
			class="button button--approve"
			:disabled="!isFormValid"
			:class="{ 'button--disabled': !isFormValid }"
			@click="submitRequest"
		  >
			Enviar
		  </button>
		  <button data-modal-action="close" class="button button--reject" @click="closePopup">Cancelar</button>
		</div>
	  </template>
	</BaseRequestPopup>
  </template>

<script setup lang="ts">
import "@/assets/css/popup.css";
import { ref, computed, onMounted } from "vue";
import BaseRequestPopup from "./BasePopup.vue";
import DpInfoBaseCard from "../DpInfoBaseCard.vue";
import InfoBaseCard from "../InfoBaseCard.vue";

interface turno {
  dia: string;
  from: number;
  to: number;
  nome: string;
}

interface Option {
  curso: string;
  turnoAtual: string;
  turnosExtra: turno[];
}

interface Props {
  courses?: Option[];
}

const props = withDefaults(defineProps<Props>(), {
  courses: () => [],
});

const emit = defineEmits(["close", "submit", "courseSelected", "shiftSelected"]);


const selectedCourse = ref<Option | null>(null);
const selectedShiftName = ref<string | null>(null);


const isFormValid = computed(() => selectedCourse.value !== null && selectedShiftName.value !== null);

const availableShiftOptions = computed(() => {
  if (!selectedCourse.value || !Array.isArray(selectedCourse.value.turnosExtra)) return [];
  return selectedCourse.value.turnosExtra.map((t) => ({
    title: t.nome,
    subtext: `[${t.from} - ${t.to}] ${t.dia}`,
  }));
});

onMounted(() => {
  console.log("Cursos recebidos:", props.courses);
});

const closePopup = () => {
  emit("close");
};

const submitRequest = () => {
  if (!isFormValid.value) return;
  emit("submit", {
    curso: selectedCourse.value?.curso,
    turnoAtual: selectedCourse.value?.turnoAtual,
    novoTurno: selectedShiftName.value,
  });
};

const updateCourseSelection = (selected: { title: string; subtext: string }) => {
  const course = props.courses.find((c) => c.curso === selected.title);
  if (!course) {
    console.warn("Curso não encontrado:", selected.title);
    selectedCourse.value = null;
    selectedShiftName.value = null;
    return;
  }
  selectedCourse.value = course;
  selectedShiftName.value = null;
  emit("courseSelected", course);
};

const updateShiftSelection = (selected: { title: string; subtext: string }) => {
  selectedShiftName.value = selected.title;
  
  emit("shiftSelected", selected.title);
};

</script>

<style scoped>
	.key-value-container {
		margin-bottom: 16px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.key-value-pair {
		display: flex;
		gap: 8px;
		font-size: 16px;
	}

	.key {
		color: white;
		font-weight: bold;
	}

	.value {
		color: #a1a1aa;
	}

	.separator {
		border: 0;
		border-top: 1px solid #3d3d3d;
		margin: 16px 0;
	}

	.card-layout {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.popup-actions {
		display: flex;
		justify-content: center;
		gap: 16px;
		margin-top: 24px;
	}

	.button {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.3s;
	}

	/* .button--approve {
  background-color: #4CAF50;
  color: white;
}

.button--approve:hover {
  background-color: #45a049;
}

.button--reject {
  background-color: #f44336;
  color: white;
}

.button--reject:hover {
  background-color: #e53935;
}

.button--disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
} */
</style>
