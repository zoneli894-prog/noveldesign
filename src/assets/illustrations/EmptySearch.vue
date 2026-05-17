<!-- 命令面板空态：灯下翻阅 -->
<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="none" class="empty-search">
    <!-- 翻开的书页 -->
    <g transform="translate(15, 18)" opacity="0.5">
      <path d="M15 0C10 0 2 0 0 2v20c2-1 8-1.5 12-1.5H15" stroke="var(--color-brand-accent)" stroke-width="1" stroke-linecap="round"/>
      <path d="M15 0c5 0 13 0 15 2v20c-2-1-8-1.5-12-1.5H15" stroke="var(--color-brand-accent)" stroke-width="1" stroke-linecap="round"/>
      <line x1="4" y1="7" x2="12" y2="7" stroke="var(--color-brand-muted)" stroke-width="0.6" opacity="0.4"/>
      <line x1="4" y1="10" x2="11" y2="10" stroke="var(--color-brand-muted)" stroke-width="0.6" opacity="0.4"/>
      <line x1="4" y1="13" x2="12" y2="13" stroke="var(--color-brand-muted)" stroke-width="0.6" opacity="0.4"/>
      <line x1="18" y1="7" x2="26" y2="7" stroke="var(--color-brand-muted)" stroke-width="0.6" opacity="0.4"/>
      <line x1="19" y1="10" x2="26" y2="10" stroke="var(--color-brand-muted)" stroke-width="0.6" opacity="0.4"/>
      <line x1="18" y1="13" x2="25" y2="13" stroke="var(--color-brand-muted)" stroke-width="0.6" opacity="0.4"/>
    </g>

    <!-- 放大镜 -->
    <circle cx="42" cy="18" r="8" stroke="var(--color-brand-accent)" stroke-width="1.2" opacity="0.5"/>
    <line x1="48" y1="24" x2="54" y2="32" stroke="var(--color-brand-accent)" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>

    <!-- 光晕 -->
    <circle cx="42" cy="18" r="12" fill="var(--color-brand-accent)" opacity="0.04"/>
  </svg>
</template>

<style scoped>
.empty-search {
  max-width: 60px;
  max-height: 60px;
  width: 100%;
  height: auto;
  margin: 0 auto;
}
</style>
