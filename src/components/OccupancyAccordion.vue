<template>
  <div>
    <div v-for="(item, index) in props.itens" :key="index" class="accordion-item">
      <div
        class="accordion-header"
        :class="{ clickable: hasChildren(item) }"
        @click="toggle(index)"
      >
        <template v-if="item.link && !hasChildren(item)">
          <router-link :to="item.link" class="card-link">
            <OccupancyCard
              class="card-with-toggle"
              :title="item.title"
              :descricao="item.descricao"
              :ocupacao="true"
              :media="item.media"
            />
          </router-link>
        </template>
        <template v-else>
          <OccupancyCard
            class="card-with-toggle"
            :title="item.title"
            :media="item.media"
            :minima="item.minima"
            :maxima="item.maxima"
          />
        </template>

        <span
          v-if="hasChildren(item)"
          class="chevron"
          :class="{ rotated: expanded[index] }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" style="fill: #e8e6e3">
            <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"></path>
          </svg>
        </span>
      </div>

      <div v-if="expanded[index] && hasChildren(item)" class="accordion-children">
        <OccupancyAccordion :itens="item.children!" />
      </div>
    </div>
  </div>
</template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { RouterLink } from 'vue-router'
  import OccupancyCard from './OccupancyCard.vue'
  
  export interface AccordionItem {
    title: string
    media: number
    minima?: number
    maxima?: number
    descricao?: string
    link?: string
    children?: AccordionItem[]
  }
  
  const props = defineProps<{ itens: AccordionItem[] }>()
  const expanded = ref<boolean[]>(props.itens.map(() => false))

  const hasChildren = (item: AccordionItem) =>
    Array.isArray(item.children) && item.children.length > 0

  const toggle = (index: number) => {
    if (hasChildren(props.itens[index])) {
      expanded.value[index] = !expanded.value[index]
    }
  }
  </script>
  
  <style scoped>
  .accordion-item {
    width: 100%;
  }
  
  .accordion-header {
    position: relative;
    width: 100%;
  }

  .accordion-header a {
    text-decoration: none;
    background-color: transparent;
  }
  
  .accordion-header.clickable {
    cursor: pointer;
  }
  
  .card-with-toggle {
    padding-right: 32px;
  }
  
  .card-link {
    display: block;
    text-decoration: none;
    color: inherit;
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
  
  .accordion-children {
    margin-left: 32px;
    display: flex;
    flex-direction: column;
  }
  </style>
  