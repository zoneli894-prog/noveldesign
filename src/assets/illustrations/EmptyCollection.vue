<!-- 侧栏空态：空的博古架 -->
<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" class="empty-collection">
    <!-- 博古架框架 -->
    <rect x="15" y="10" width="50" height="60" rx="2" stroke="var(--color-brand-border)" stroke-width="1" opacity="0.5"/>

    <!-- 横隔板 -->
    <line x1="15" y1="30" x2="65" y2="30" stroke="var(--color-brand-border)" stroke-width="0.8" opacity="0.4"/>
    <line x1="15" y1="50" x2="65" y2="50" stroke="var(--color-brand-border)" stroke-width="0.8" opacity="0.4"/>

    <!-- 竖隔板 -->
    <line x1="40" y1="10" x2="40" y2="30" stroke="var(--color-brand-border)" stroke-width="0.8" opacity="0.4"/>
    <line x1="40" y1="30" x2="40" y2="50" stroke="var(--color-brand-border)" stroke-width="0.8" opacity="0.4"/>

    <!-- 底座 -->
    <rect x="12" y="70" width="56" height="3" rx="1.5" stroke="var(--color-brand-border)" stroke-width="0.8" opacity="0.4"/>

    <!-- 微弱光影 -->
    <ellipse cx="35" cy="40" rx="6" ry="8" fill="var(--color-brand-border)" opacity="0.08"/>
    <ellipse cx="52" cy="20" rx="5" ry="5" fill="var(--color-brand-border)" opacity="0.06"/>
  </svg>
</template>

<style scoped>
.empty-collection {
  max-width: 80px;
  max-height: 80px;
  width: 100%;
  height: auto;
  margin: 0 auto;
  opacity: 0.6;
}
</style>
