<template>
  <div class="container">
    <h1>Teste de DpInfoBaseCard</h1>

    <DpInfoBaseCard
      title="Escolha um Curso"
      :options="courses"
      :barColor="'#22c55e'"
      @updateCard="handleUpdate"
    />

    <div v-if="selected" class="result">
      <h3>Curso Selecionado:</h3>
      <p><strong>{{ selected.title }}</strong> - {{ selected.subtext }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DpInfoBaseCard from './DpInfoBaseCard.vue'; // ajuste o path se necessário

const selected = ref<{ title: string; subtext: string } | null>(null);

const courses = [
  { title: 'CS101', subtext: 'Introdução à Programação' },
  { title: 'CS201', subtext: 'Estruturas de Dados' },
  { title: 'CS301', subtext: 'Algoritmos Avançados' }
];

function handleUpdate(title: string, subtext: string) {
  selected.value = { title, subtext };
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  background: #1e1e2f;
  color: white;
  border-radius: 8px;
}

.result {
  margin-top: 20px;
  padding: 1rem;
  background-color: #2c2c3a;
  border-radius: 6px;
}
</style>
