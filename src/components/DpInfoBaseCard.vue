<template>
    <div
      class="info-card"
      :style="{
        width: width,
        height: height,
        'max-width': maxWidth
      }"
    >
      <div class="color-bar" :style="{ backgroundColor: barColor }"></div>
      <div class="content">
        <!-- Optional external label -->
        <div v-if="label" class="label">{{ label }}</div>
  
        <!-- Header with toggle -->
        <div class="header" @click="toggle">
          <div class="text">
            <h3 class="title">{{ selectedOption?.title || title }}</h3>
            <p class="subtext">{{ selectedOption?.subtext || subtext }}</p>
          </div>
          <div class="icon">
            <span class="material-icons">
              {{ isOpen ? 'expand_less' : 'expand_more' }}
            </span>
          </div>
        </div>
  
        <!-- Dropdown options -->
        <div v-if="isOpen" class="dropdown-content">
          <div
            v-for="(option, index) in options"
            :key="index"
            class="dropdown-item"
            @click="selectOption(option)"
          >
            <h4 class="dropdown-title">{{ option.title }}</h4>
            <p class="dropdown-subtext">{{ option.subtext }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import type { PropType } from 'vue';
  
  interface Option {
    title: string;
    subtext: string;
  }
  
  export default defineComponent({
    name: 'DpInfoBaseCard',
    props: {
      title: { type: String, default: 'Title' },
      subtext: { type: String, default: 'Description text goes here' },
      label: { type: String, default: '' },
      barColor: { type: String, default: 'rgba(102, 255, 85, 0.6)' },
      width: { type: String, default: 'auto' },
      maxWidth: { type: String, default: '100%' },
      height: { type: String, default: 'auto' },
      minHeight: { type: String, default: 'auto' },
      options: {
        type: Array as PropType<Option[]>,
        default: () => []
      }
    },
    emits: ['updateCard'],
    setup(props, { emit }) {
      const isOpen = ref(false);
      const selectedOption = ref<Option | null>(null);
  
      const toggle = () => {
        isOpen.value = !isOpen.value;
      };
  
      const selectOption = (option: Option) => {
        selectedOption.value = option;
        isOpen.value = false;
        emit('updateCard', { title: option.title, subtext: option.subtext });
      };
  
      return {
        isOpen,
        selectedOption,
        toggle,
        selectOption
      };
    }
  });
  </script>
  
  <style scoped>
  .info-card {
    position: relative;
		background-color: #09090b;
		border-radius: 8px;
		border: 1px solid #a1a1aa;
		display: flex;
		overflow: hidden;
		min-width: 200px;
		width: auto;
		min-height: v-bind(minHeight);
  }
  
  .color-bar {
    width: 7px;
    flex-shrink: 0;
  }
  
  .content {
    background-color: #303446;
    flex-grow: 1;
    padding: 24px 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 6px;
		min-width: 0;
  }
  
  .label {
    font-size: 14px;
    color: #c9c9c9;
    margin-bottom: 4px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }
  
  .text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .title {
    color: #ffffff;
    font-size: 20px;
    font-family: 'Inter', sans-serif;
    margin: 0;
  }
  
  .subtext {
    color: #a1a1aa;
    font-size: 16px;
    margin: 0;
  }
  
  .icon {
    font-size: 18px;
    color: white;
  }
  
  .dropdown-content {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .dropdown-item {
    padding: 10px;
    border-bottom: 1px solid #a1a1aa;
    cursor: pointer;
    color: #ffffff;
  }
  
  .dropdown-item:hover {
    background-color: #484848;
  }
  
  .dropdown-title {
    font-size: 18px;
    margin: 0;
  }
  
  .dropdown-subtext {
    font-size: 14px;
    color: #a1a1aa;
    margin: 0;
  }
  </style>
  