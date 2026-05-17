<!-- 中栏空态：书案古卷与灯烛 -->
<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" fill="none" class="empty-reading">
    <!-- 淡墨远山背景 -->
    <path d="M0 130c20-15 40-8 60-20s40-25 60-15 40 10 60 5 20-5 20-5v35H0z" fill="var(--color-brand-border)" opacity="0.2"/>
    <path d="M10 135c15-10 30-5 50-15s35-20 50-10 30 8 40 3 20-3 30-3v25H10z" fill="var(--color-brand-border)" opacity="0.12"/>

    <!-- 书案桌面 -->
    <path d="M35 110h130" stroke="var(--color-brand-muted)" stroke-width="1" opacity="0.3" stroke-linecap="round"/>

    <!-- 展开的竹简/古卷 -->
    <rect x="55" y="82" width="70" height="28" rx="2" stroke="var(--color-brand-accent)" stroke-width="1.2" opacity="0.6"/>
    <line x1="60" y1="88" x2="120" y2="88" stroke="var(--color-brand-accent)" stroke-width="0.6" opacity="0.3"/>
    <line x1="60" y1="92" x2="115" y2="92" stroke="var(--color-brand-accent)" stroke-width="0.6" opacity="0.3"/>
    <line x1="60" y1="96" x2="118" y2="96" stroke="var(--color-brand-accent)" stroke-width="0.6" opacity="0.3"/>
    <line x1="60" y1="100" x2="110" y2="100" stroke="var(--color-brand-accent)" stroke-width="0.6" opacity="0.3"/>
    <line x1="60" y1="104" x2="105" y2="104" stroke="var(--color-brand-accent)" stroke-width="0.6" opacity="0.3"/>

    <!-- 卷起的部分 -->
    <path d="M55 82c-3 0-5 2-5 14s2 14 5 14" stroke="var(--color-brand-accent)" stroke-width="1.2" opacity="0.5"/>
    <path d="M125 82c3 0 5 2 5 14s-2 14-5 14" stroke="var(--color-brand-accent)" stroke-width="1.2" opacity="0.5"/>

    <!-- 油灯/烛台 -->
    <g transform="translate(140, 65)" opacity="0.7">
      <!-- 灯座 -->
      <path d="M-6 35h12" stroke="var(--color-brand-text)" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M-4 35v-8h8v8" stroke="var(--color-brand-text)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M-3 27h6" stroke="var(--color-brand-text)" stroke-width="1" stroke-linecap="round"/>
      <!-- 灯芯 -->
      <path d="M0 27v-4" stroke="var(--color-brand-text)" stroke-width="0.8" stroke-linecap="round"/>
      <!-- 火焰 -->
      <path d="M0 23c-1-3 0-6 0-8s1 5 0 8z" stroke="var(--color-brand-accent)" stroke-width="1" stroke-linecap="round" fill="var(--color-brand-accent)" fill-opacity="0.15"/>
      <!-- 光晕 -->
      <circle cx="0" cy="19" r="8" fill="var(--color-brand-accent)" opacity="0.06"/>
      <circle cx="0" cy="19" r="4" fill="var(--color-brand-accent)" opacity="0.08"/>
    </g>

    <!-- 散落的毛笔 -->
    <g transform="translate(40, 90) rotate(-25)" opacity="0.4">
      <path d="M0 0v25" stroke="var(--color-brand-text)" stroke-width="1" stroke-linecap="round"/>
      <path d="M0 0l-1.5 4 1.5 1 1.5-1z" stroke="var(--color-brand-text)" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>
</template>

<style scoped>
.empty-reading {
  max-width: 200px;
  max-height: 160px;
  width: 100%;
  height: auto;
}
</style>
