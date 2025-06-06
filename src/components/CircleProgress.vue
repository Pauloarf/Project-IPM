<template>
    <svg :width="size" :height="size">
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        class="circle-bg"
      />
      <circle
        :cx="center"
        :cy="center"
        :r="radius + 2"
        class="progress-ring"
        :stroke="color"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
      <text
        v-if="showText"
        :x="center"
        :y="center"
        text-anchor="middle"
        dominant-baseline="middle"
        class="progress-text"
      >
        <tspan :fill="color">{{ value }}</tspan><tspan fill="#ffffff">/{{ max }}</tspan>
      </text>
    </svg>
</template>

<script lang="ts">
export default {
  name: 'RadialProgress',
  props: {
    value: { type: [String, Number], required: true },
    max: { type: [String, Number], required: true },
    showText: { type: Boolean, default: true },
    color: { type: String, default: "#e6d313" },
    size: { type: Number, default: 120 }
  },
  computed: {
    center(): number {
      return this.size / 2;
    },
    radius(): number {
      return this.center - 4;
    },
    circumference(): number {
      return 2 * Math.PI * this.radius;
    },
    dashOffset(): number {
      const percent = -Math.min(Number(this.value) / Number(this.max), 1);
      return this.circumference * (1 - percent);
    }
  }
}
</script>

<style scoped>
.circle-bg {
  fill: #5e779b;
}

.progress-ring {
  fill: none;
  stroke-width: 4;
  transform: rotate(-90deg);
  transform-box: fill-box;
  transform-origin: center;
}

.progress-text {
  font-size: 22px;
  font-weight: bold;
}
</style>
