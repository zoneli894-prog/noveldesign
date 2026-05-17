<!-- 图谱空态：孤灯下的星图/命盘 -->
<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" class="empty-graph">
    <!-- 外圈 -->
    <circle cx="60" cy="60" r="45" stroke="var(--color-brand-border)" stroke-width="0.8" opacity="0.4" stroke-dasharray="3 5"/>
    <circle cx="60" cy="60" r="30" stroke="var(--color-brand-border)" stroke-width="0.6" opacity="0.3" stroke-dasharray="2 4"/>

    <!-- 十字线 -->
    <line x1="60" y1="15" x2="60" y2="105" stroke="var(--color-brand-border)" stroke-width="0.5" opacity="0.2"/>
    <line x1="15" y1="60" x2="105" y2="60" stroke="var(--color-brand-border)" stroke-width="0.5" opacity="0.2"/>

    <!-- 空心节点（待连接） -->
    <circle cx="60" cy="60" r="6" stroke="var(--color-brand-accent)" stroke-width="1.5" opacity="0.5"/>
    <circle cx="60" cy="60" r="2" fill="var(--color-brand-accent)" opacity="0.3"/>

    <circle cx="32" cy="42" r="4" stroke="var(--color-brand-accent)" stroke-width="1" opacity="0.3"/>
    <circle cx="88" cy="42" r="4" stroke="var(--color-brand-accent)" stroke-width="1" opacity="0.3"/>
    <circle cx="35" cy="80" r="4" stroke="var(--color-brand-accent)" stroke-width="1" opacity="0.3"/>
    <circle cx="85" cy="78" r="4" stroke="var(--color-brand-accent)" stroke-width="1" opacity="0.3"/>

    <!-- 极细虚线连接（若有若无） -->
    <line x1="60" y1="60" x2="32" y2="42" stroke="var(--color-brand-muted)" stroke-width="0.5" opacity="0.15" stroke-dasharray="2 3"/>
    <line x1="60" y1="60" x2="88" y2="42" stroke="var(--color-brand-muted)" stroke-width="0.5" opacity="0.15" stroke-dasharray="2 3"/>
    <line x1="60" y1="60" x2="35" y2="80" stroke="var(--color-brand-muted)" stroke-width="0.5" opacity="0.15" stroke-dasharray="2 3"/>
    <line x1="60" y1="60" x2="85" y2="78" stroke="var(--color-brand-muted)" stroke-width="0.5" opacity="0.15" stroke-dasharray="2 3"/>

    <!-- 四角小星装饰 -->
    <g opacity="0.2">
      <path d="M20 20l1 3-3-1 3-1-3 1z" fill="var(--color-brand-accent)" stroke="none"/>
      <path d="M100 25l1 2.5-2.5-1 2.5-.5-2.5.5z" fill="var(--color-brand-accent)" stroke="none"/>
      <path d="M15 95l1 2-2-.5 2-.5-2 .5z" fill="var(--color-brand-accent)" stroke="none"/>
    </g>
  </svg>
</template>

<style scoped>
.empty-graph {
  max-width: 120px;
  max-height: 120px;
  width: 100%;
  height: auto;
  margin: 0 auto;
}
</style>
