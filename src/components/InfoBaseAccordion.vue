<template>
  <div class="accordion-item">
    <div class="accordion-header" :class="{ clickable: hasChildren }" @click="toggle">
      <InfoBaseCard
        class="card-with-toggle"
        :title="item.title"
        :subtext="item.subtext"
        :buttonType="item.buttonType"
        :buttonState="expanded"
        @buttonClick="headerButtonClick"
      />
    </div>

    <div v-if="expanded && hasChildren" class="accordion-children">
      <InfoBaseAccordion
        v-for="(child, index) in item.children"
        :key="index"
        :item="child"
        @headerButtonClick="childButtonClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import InfoBaseCard from './InfoBaseCard.vue'

export interface AccordionItem {
  title: string
  subtext: string
  buttonType?: 'trocar' | 'alocar' | 'dropdown'
  children?: AccordionItem[]
}

const expanded = ref(false)
const props = defineProps<{ item: AccordionItem }>()
const hasChildren = computed(
  () => Array.isArray(props.item.children) && props.item.children.length > 0,
)

const emit = defineEmits<{
  headerButtonClick: ['trocar' | 'alocar' | 'dropdown', Event]
  childButtonClick: ['trocar' | 'alocar' | 'dropdown', Event]
}>()

const toggle = () => {
  if (hasChildren.value) expanded.value = !expanded.value
}

function headerButtonClick(btnType: Parameters<typeof emit>[1], e: Event) {
  emit('headerButtonClick', btnType, e)
}

function childButtonClick(btnType: Parameters<typeof emit>[1], e: Event) {
  emit('childButtonClick', btnType, e)
}
</script>

<style scoped>
.accordion-item {
  width: 100%;
  padding-bottom: 15px;
}

.accordion-header.clickable {
  cursor: pointer;
}

.accordion-children {
  margin-left: 25px;
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  /* padding-bottom: 15px; */
  /* gap: 15px; */
}
</style>
