// 手绘线描风类型图标 — 6 枚 24x24 SVG
// stroke: currentColor, fill: none, stroke-width: 1.5, round caps

export const typeIconsSvg: Record<string, string> = {
  // 古装人物侧影 — 发髻、侧脸、衣领弧线
  character: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="5.5" r="3"/>
    <path d="M8.5 8.5c-1 1.5-1.5 3-1.5 5 0 1 .2 2 .5 2.8"/>
    <path d="M15.5 8.5c1 1.5 1.5 3 1.5 5 0 1-.2 2-.5 2.8"/>
    <path d="M7.5 16.5c0 0 1.5 2 4.5 2s4.5-2 4.5-2"/>
    <path d="M9.5 3.5c.5-1 1.5-1.5 2.5-1.5s2 .5 2.5 1.5"/>
    <path d="M8 3c-.5-.8-1-2 0-2.5s2 .2 2.5 1"/>
  </svg>`,

  // 殿宇飞檐 — 中式建筑屋顶，斗拱简化
  faction: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 14l4-8h8l4 8"/>
    <path d="M3 14h18"/>
    <path d="M6 14v6h12v-6"/>
    <path d="M10 14v6"/>
    <path d="M14 14v6"/>
    <path d="M9 20v2"/>
    <path d="M15 20v2"/>
    <path d="M12 6v-2"/>
    <circle cx="12" cy="3" r="0.5" fill="currentColor" stroke="none"/>
  </svg>`,

  // 山峦叠嶂 — 三重远山 + 底部云纹
  location: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 18l5-8 4 5 3-6 4 7 4-10"/>
    <path d="M1 20c2-1 4 0 6-1s4 0 6-1 4 0 6-1"/>
    <path d="M12 6l1-2 1 2"/>
  </svg>`,

  // 古剑悬光 — 简化剑形 + 剑格放射线
  item: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2v14"/>
    <path d="M8 12h8"/>
    <path d="M10 16h4v2a2 2 0 01-4 0v-2z"/>
    <path d="M12 2l-1.5 3"/>
    <path d="M12 2l1.5 3"/>
    <path d="M9.5 8l-2-1"/>
    <path d="M14.5 8l2-1"/>
    <path d="M8 10l-2.5-.5"/>
    <path d="M16 10l2.5-.5"/>
  </svg>`,

  // 展开竹简 — 横向平行线 + 中轴卷轴
  lore: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 4c0 0 1-1 2-1s2 1 2 1v16s-1 1-2 1-2-1-2-1z"/>
    <path d="M16 4c0 0 1-1 2-1s2 1 2 1v16s-1 1-2 1-2-1-2-1z"/>
    <path d="M8 6h8"/>
    <path d="M8 9h8"/>
    <path d="M8 12h8"/>
    <path d="M8 15h8"/>
    <path d="M8 18h8"/>
  </svg>`,

  // 毛笔笔锋 — 竖笔锋 + 末端飞白
  chapter: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2c0 0-1 3-1 6s1 5 1 8"/>
    <path d="M12 16c0 2-.5 3.5-1 4.5"/>
    <path d="M12 16c0 2.5.5 3.5 1 4"/>
    <path d="M11 20c-.5.5-1.5.8-2 .5"/>
    <path d="M13 20c.5.5 1.5.8 2 .5"/>
    <path d="M10 3c1-.5 3-.5 4 0"/>
  </svg>`,
}
