<template>
    <div class="occupancy-card">
      <div class="circle-wrapper">
        <CircleProgress :value="media.toString()" :max="'100'" :color="getProgressColor(media)" :show-text="false" />
      </div>
      <div class="conteudo">
        <h3>{{ title }}</h3>
        <p v-if="descricao" class="descricao">{{ descricao }}</p>
        <div class="stats">
          <span>
            Ocupação{{ ocupacao == false ? ' Média' : '' }}:
            <strong :style="{ color: getProgressColor(media) }">{{ media }}%</strong>
          </span>
          <span v-if="minima !== undefined">
            Ocupação Mínima:
            <strong :style="{ color: getProgressColor(minima) }">{{ minima }}%</strong>
          </span>
          <span v-if="maxima !== undefined">
            Ocupação Máxima:
            <strong :style="{ color: getProgressColor(maxima) }">{{ maxima }}%</strong>
          </span>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
  import CircleProgress from '../components/CircleProgress.vue'

  defineProps<{
    title: string;
    media: number;
    ocupacao?: boolean;
    minima?: number;
    maxima?: number;
    descricao?: string;
  }>();

  const getProgressColor = (value: number) => {
    if (value < 50) return '#22c55e';
    if (value < 80) return '#eab308';
    return '#ef4444';
  };
</script>

<style scoped>
  .occupancy-card {
    display: flex;
    align-items: center;
    background-color: #2f3147;
    border: 1px solid #6b6c82;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 12px;
    gap: 16px;
  }

  .circle-wrapper {
    flex-shrink: 0;
  }

  .conteudo h3 {
    color: white;
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 4px;
  }

  .descricao {
    color: #d4d4d8;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .stats {
    font-size: 14px;
    color: #a1a1aa;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
</style>