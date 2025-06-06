<template>
  <div
    class="info-card"
    :class="{ selected: selected }"
    :style="{
      width: width,
      height: height,
      'max-width': maxWidth,
    }"
  >
    <div class="color-bar" :style="{ backgroundColor: barColor }"></div>
    <div class="content">
      <div class="left">
        <h3 class="title">{{ title }}</h3>
        <p v-if="subtext" class="subtext">{{ subtext }}</p>
      </div>
      <div class="right">
        <button
          v-if="buttonType === 'trocar' || buttonType === 'alocar'"
          @click.prevent="(e) => clickBtn(buttonType!, e)"
        >
          {{ buttonType === 'trocar' ? 'Trocar' : 'Alocar' }}
        </button>
        <span
          v-else-if="buttonType === 'dropdown'"
          class="chevron"
          :class="{ rotated: !!buttonState }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="60"
            height="60"
            viewBox="0 0 24 24"
            style="fill: #e8e6e3"
          >
            <path
              d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"
            ></path>
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { defineComponent } from 'vue'

// export default defineComponent({
//   name: 'InfoCard',
defineProps({
  title: {
    type: String,
    default: 'Title',
  },
  subtext: {
    type: String,
    // default: 'Description text goes hereee'
  },
  barColor: {
    type: String,
    default: 'rgba(102, 255, 85, 0.6)',
  },
  selected: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: 'auto',
  },
  maxWidth: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: 'auto',
  },
  minHeight: {
    type: String,
    default: 'auto',
  },
  buttonType: {
    type: String,
  },
  buttonState: {
    type: <never>undefined,
    default: undefined,
  },
})
// })

const emit = defineEmits<{
  buttonClick: ['trocar' | 'alocar' | 'dropdown', Event]
}>()

function clickBtn(btnType: string, e: Event) {
  emit('buttonClick', <Parameters<typeof emit>['1']>btnType, e)
}
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
  display: grid;
  height: 100%;
  grid-template-columns: 1fr 1fr;
  background-color: #303446;
}

.left {
  flex-grow: 1;
  padding: 5px 10px 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  min-width: 0;
}

.right {
  display: flex;
  flex-direction: column;
  align-items: end;
  justify-content: center;
}

.right button {
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 10px;
  border: 1px solid #0af;
  border-radius: 6px;
  background-color: #5e779b;
  cursor: pointer;
}

.title {
  color: #ffffff;
  font-size: 24px;
  font-family: 'Inter', sans-serif;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.subtext {
  color: #a1a1aa;
  font-size: 20px;
  font-family: 'Inter', sans-serif;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  white-space: pre-line;
}

.selected {
  border: 5px solid #a1aaa1;
}

.chevron {
  position: absolute;
  height: 60px;
  right: 16px;
  top: 50%;
  transform: translateY(-50%) rotate(180deg);
  transition: transform 0.2s ease;
  color: white;
  font-size: 2rem;
  pointer-events: none;
}

.chevron.rotated {
  transform: translateY(-50%) rotate(90deg);
}
</style>
