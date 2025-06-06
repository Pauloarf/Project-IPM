<template>
    <div class="request-card">
        <div class="request-content">
            <div class="course-name">{{ courseName }}</div>
            <div class="current-shift">{{ currentShift }}</div>
            <div class="requested-shift">{{ requestedShift }}</div>
            <div class="status" :style="{ color: statusColor }">{{ status }}</div>
            <div class="date">{{ date }}</div>
            <button class="cancel-btn" @click="cancelRequest">
            <span class="material-icons">close</span>
            </button>
        </div>
    </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';

export enum STATUS {
  PENDENTE = 'PENDENTE',
  ACEITE = 'ACEITE',
  RECUSADO = 'RECUSADO'
}

export default defineComponent({
  name: 'ShiftRequestCard',
  props: {
    courseName: {
      type: String,
      required: true,
      default: 'Interface Pessoa Máquina',
    },
    currentShift: {
      type: String,
      required: true,
      default: 'TP3',
    },
    requestedShift: {
      type: String,
      required: true,
      default: 'TP6',
    },
    status: {
      type: String,
      required: true,
      default: STATUS.PENDENTE,
      validator: (value: string) =>
        Object.values(STATUS).includes(value as STATUS),
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date('2025-01-21'),
    },
    requestId: {
      type: Number,
      required: true,
    },
  },
  emits: ['cancel-request'],
  computed: {
    statusColor(): string {
      switch (this.status as STATUS) {
        case STATUS.ACEITE:
          return 'rgba(102, 255, 85, 0.6)';
        case STATUS.PENDENTE:
          return '#FFA500';
        case STATUS.RECUSADO:
          return '#FF5252';
        default:
          return '#FFFFFF';
      }
    },
  },
  methods: {
    cancelRequest() {
      this.$emit('cancel-request', this.requestId);
    },
  },
});
</script>
  
<style scoped>  
    .request-card {
        background-color: #09090b;
        width: 100%;
        height: 74px;
        border-radius: 8px;
        margin-bottom: 10px;
        overflow: hidden;
    }
    
    .request-content {
        background-color: #303446;
        height: 100%;
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
        align-items: center;
        padding: 0 24px;
        gap: 10px;
    }
    
    .course-name,
    .current-shift,
    .requested-shift,
    .status,
    .date {
        color: #ffffff;
        font-size: 24px;
        font-family: 'Inter', sans-serif;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .cancel-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #ffffff;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .cancel-btn:hover {
        color: #FF5252;
    }
    
    .material-icons {
        font-size: 32px;
    }
</style>