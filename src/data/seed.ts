import type { DocNode, InfoboxSnapshot, TimelineEvent } from '@/types'

export const seedDocs: DocNode[] = [
  {
    id: 'chronicle',
    title: '编年大事记',
    type: 'chronicle',
    tags: ['时间线', '大事记'],
    wordCount: 0,
    starred: false,
    updatedAt: Date.now(),
    parentId: null,
    children: [],
  },
  {
    id: 'world',
    title: '世界观总览',
    type: 'lore',
    tags: ['世界观', '核心设定'],
    wordCount: 3200,
    starred: true,
    updatedAt: Date.now() - 86400000,
    parentId: null,
    children: [
      {
        id: 'map',
        title: '地图与地理',
        type: 'lore',
        tags: ['地理', '世界观'],
        wordCount: 1800,
        starred: false,
        updatedAt: Date.now() - 172800000,
        parentId: 'world',
        children: [
          {
            id: 'loc-north',
            title: '北境·寒渊山脉',
            type: 'location',
            tags: ['北境', '危险区域'],
            wordCount: 2100,
            starred: true,
            updatedAt: Date.now() - 259200000,
            parentId: 'map',
            children: [],
          },
          {
            id: 'loc-capital',
            title: '中州·天枢城',
            type: 'location',
            tags: ['中州', '都城'],
            wordCount: 1500,
            starred: false,
            updatedAt: Date.now() - 345600000,
            parentId: 'map',
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'chars',
    title: '人物志',
    type: 'lore',
    tags: ['人物'],
    wordCount: 500,
    starred: false,
    updatedAt: Date.now() - 500000,
    parentId: null,
    children: [
      {
        id: 'char-mc',
        title: '凌夜寒',
        type: 'character',
        tags: ['主角', '剑修'],
        wordCount: 4200,
        starred: true,
        updatedAt: Date.now() - 3600000,
        parentId: 'chars',
        children: [],
      },
      {
        id: 'char-villain',
        title: '殷无殇',
        type: 'character',
        tags: ['反派', '魔修'],
        wordCount: 3800,
        starred: false,
        updatedAt: Date.now() - 7200000,
        parentId: 'chars',
        children: [],
      },
    ],
  },
  {
    id: 'factions',
    title: '势力与门派',
    type: 'lore',
    tags: ['势力'],
    wordCount: 400,
    starred: false,
    updatedAt: Date.now() - 600000,
    parentId: null,
    children: [
      {
        id: 'faction-sword',
        title: '天剑宗',
        type: 'faction',
        tags: ['正道', '剑修'],
        wordCount: 2600,
        starred: false,
        updatedAt: Date.now() - 10800000,
        parentId: 'factions',
        children: [],
      },
    ],
  },
  {
    id: 'items',
    title: '法宝与灵物',
    type: 'lore',
    tags: ['物品'],
    wordCount: 300,
    starred: false,
    updatedAt: Date.now() - 700000,
    parentId: null,
    children: [
      {
        id: 'item-sword',
        title: '霜华剑',
        type: 'item',
        tags: ['法宝', '冰属性'],
        wordCount: 1200,
        starred: false,
        updatedAt: Date.now() - 14400000,
        parentId: 'items',
        children: [],
      },
    ],
  },
  {
    id: 'chapters',
    title: '章节纲要',
    type: 'lore',
    tags: ['大纲'],
    wordCount: 200,
    starred: false,
    updatedAt: Date.now() - 800000,
    parentId: null,
    children: [
      {
        id: 'ch-1',
        title: '第一章·寒渊初醒',
        type: 'chapter',
        tags: ['第一卷', '开篇'],
        wordCount: 2800,
        starred: false,
        updatedAt: Date.now() - 43200000,
        parentId: 'chapters',
        children: [],
      },
    ],
  },
]

export const seedContent: Record<string, string> = {
  'chronicle': '<p>此词条以时间轴视图展示修仙世界的重大历史事件。请在左栏目录中选择"编年大事记"查看。</p>',

  'world': `<h1>世界观总览</h1>
<p>本作世界观以"灵气复苏"为核心设定，分为上古纪、中古纪和当世三大阶段。天地间的灵气浓度在不同时期有显著变化，直接影响了修行者的境界上限。</p>
<p>当前世界的主要矛盾围绕<a class="wiki-link" data-wiki-link data-target-id="faction-sword">天剑宗</a>与魔道势力的对抗展开，而主角<a class="wiki-link" data-wiki-link data-target-id="char-mc">凌夜寒</a>的身世秘密是推动剧情的暗线。</p>`,

  'map': `<h1>地图与地理</h1>
<p>世界大陆分为五大区域：中州、东荒、西漠、南泽、<a class="wiki-link" data-wiki-link data-target-id="loc-north">北境</a>。其中中州最为繁华，灵气充沛，是各大宗门的驻地所在。</p>
<p><a class="wiki-link" data-wiki-link data-target-id="loc-capital">天枢城</a>位于中州正中央，是王朝的政治与经济中心，也是修仙界与世俗权力交汇之地。</p>`,

  'loc-north': `<h1>北境·寒渊山脉</h1>
<p>寒渊山脉位于大陆最北端，终年冰雪覆盖，传说中封印着上古凶兽。山脉深处的寒渊潭水温极低，普通修士难以靠近，但其中蕴含的冰属性灵气极为精纯。</p>
<p><a class="wiki-link" data-wiki-link data-target-id="char-mc">凌夜寒</a>正是在此地苏醒，获得了<a class="wiki-link" data-wiki-link data-target-id="item-sword">霜华剑</a>的认可。此地也被<a class="wiki-link" data-wiki-link data-target-id="char-villain">殷无殇</a>视为突破境界的关键所在。</p>`,

  'loc-capital': `<h1>中州·天枢城</h1>
<p>天枢城建于三千年前，由当世最强的几位修士联合缔造。城墙以玄铁浇筑，内含阵法，可抵御渡劫期强者的全力一击。</p>
<p>城中设有"万法塔"，收录了修行界绝大部分功法典籍，由<a class="wiki-link" data-wiki-link data-target-id="faction-sword">天剑宗</a>与皇室共同管辖。</p>`,

  'char-mc': `<h1>凌夜寒</h1>
<p><strong>身份：</strong>天剑宗外门弟子，实际身世上古冰帝转世</p>
<p><strong>外貌：</strong>银白长发，瞳色浅蓝如冰晶，常穿青白色道袍</p>
<p><strong>性格：</strong>表面冷淡疏离，内心重情重义，对敌冷酷果断</p>
<p><strong>境界：</strong>筑基后期（开篇）→ 金丹中期（第一卷末）</p>
<p>在<a class="wiki-link" data-wiki-link data-target-id="loc-north">寒渊山脉</a>中意外觉醒前世记忆碎片，获得了上古法宝<a class="wiki-link" data-wiki-link data-target-id="item-sword">霜华剑</a>。此后拜入<a class="wiki-link" data-wiki-link data-target-id="faction-sword">天剑宗</a>，开始了修仙之路。</p>
<p>其觉醒引起了<a class="wiki-link" data-wiki-link data-target-id="char-villain">殷无殇</a>的注意，后者认为凌夜寒体内封存着突破渡劫期的关键力量。</p>`,

  'char-villain': `<h1>殷无殇</h1>
<p><strong>身份：</strong>魔道"冥渊殿"殿主，渡劫期大圆满</p>
<p><strong>外貌：</strong>黑发如墨，面容俊美而邪魅，身着玄黑色长袍</p>
<p><strong>性格：</strong>城府极深，为达目的不择手段，但对旧情人有执念</p>
<p>百年前曾与<a class="wiki-link" data-wiki-link data-target-id="faction-sword">天剑宗</a>宗主大战于<a class="wiki-link" data-wiki-link data-target-id="loc-capital">天枢城</a>外，两败俱伤后闭关疗伤。</p>
<p>察觉到<a class="wiki-link" data-wiki-link data-target-id="loc-north">寒渊山脉</a>的异动后出关，将目光投向了<a class="wiki-link" data-wiki-link data-target-id="char-mc">凌夜寒</a>。</p>`,

  'faction-sword': `<h1>天剑宗</h1>
<p><strong>性质：</strong>修仙界正道第一大宗</p>
<p><strong>驻地：</strong><a class="wiki-link" data-wiki-link data-target-id="loc-capital">天枢城</a>以东三千里·剑峰</p>
<p><strong>宗主：</strong>云无涯（渡劫期中期）</p>
<p><strong>核心功法：</strong>天剑诀、破虚剑法</p>
<p>天剑宗以剑修闻名天下，门下弟子皆以剑道为修行根本。宗门设内门、外门、真传三等，竞争激烈。</p>
<p>现任宗主云无涯与魔道殿主<a class="wiki-link" data-wiki-link data-target-id="char-villain">殷无殇</a>有宿怨，百年前一战至今未分胜负。</p>
<p><a class="wiki-link" data-wiki-link data-target-id="char-mc">凌夜寒</a>目前为外门弟子，但已引起宗门高层关注。</p>`,

  'item-sword': `<h1>霜华剑</h1>
<p><strong>品阶：</strong>上古仙器（残缺）</p>
<p><strong>属性：</strong>冰</p>
<p><strong>来历：</strong>上古冰帝的随身佩剑，冰帝陨落后沉入<a class="wiki-link" data-wiki-link data-target-id="loc-north">寒渊山脉</a>的深渊潭底</p>
<p>剑身通体冰蓝，蕴含极寒剑意，可冻伤修士元神。目前仅恢复三成威力，需要主人以冰属性灵气逐步温养修复。</p>
<p>与<a class="wiki-link" data-wiki-link data-target-id="char-mc">凌夜寒</a>产生共鸣，认其为主。</p>`,

  'ch-1': `<h1>第一章·寒渊初醒</h1>
<p><strong>时间线：</strong>开篇</p>
<p><strong>核心事件：</strong>凌夜寒在寒渊山脉苏醒，获得霜华剑，初遇天剑宗外门弟子</p>
<p>故事从<a class="wiki-link" data-wiki-link data-target-id="loc-north">北境·寒渊山脉</a>的一场暴风雪中开始。一名银发青年在冰封的洞窟中苏醒，脑海中零星闪过不属于自己的记忆片段。</p>
<p>他在洞窟深处发现了一柄散发着幽蓝光芒的长剑——<a class="wiki-link" data-wiki-link data-target-id="item-sword">霜华剑</a>。触碰剑身的瞬间，前世的记忆如潮水般涌来。</p>
<p>离开山脉后，他遇到了<a class="wiki-link" data-wiki-link data-target-id="faction-sword">天剑宗</a>的外门弟子，被带回宗门。而他不知道的是，这一幕已经落入了远方<a class="wiki-link" data-wiki-link data-target-id="char-villain">殷无殇</a>的法眼之中。</p>`,
}

// Infobox 快照数据 — 属性随章节变化
export const seedInfobox: Record<string, InfoboxSnapshot[]> = {
  'char-mc': [
    {
      chapter: '第一卷',
      fields: [
        { key: '姓名', value: '凌夜寒', type: 'text' },
        { key: '身份', value: '天剑宗外门弟子', type: 'text' },
        { key: '境界', value: '炼气期', type: 'text' },
        { key: '属性', value: '冰', type: 'text' },
        { key: '法宝', value: '霜华剑', type: 'link' },
        { key: '所属', value: '天剑宗', type: 'link' },
      ],
    },
    {
      chapter: '第二卷',
      fields: [
        { key: '姓名', value: '凌夜寒', type: 'text' },
        { key: '身份', value: '天剑宗内门弟子', type: 'text' },
        { key: '境界', value: '筑基后期', type: 'text' },
        { key: '属性', value: '冰', type: 'text' },
        { key: '法宝', value: '霜华剑', type: 'link' },
        { key: '所属', value: '天剑宗', type: 'link' },
        { key: '首次出场', value: '第一章·寒渊初醒', type: 'link' },
      ],
    },
    {
      chapter: '第三卷',
      fields: [
        { key: '姓名', value: '凌夜寒', type: 'text' },
        { key: '身份', value: '魔道散修', type: 'text' },
        { key: '境界', value: '金丹中期', type: 'text' },
        { key: '属性', value: '冰', type: 'text' },
        { key: '法宝', value: '霜华剑', type: 'link' },
        { key: '所属', value: '无', type: 'text' },
        { key: '首次出场', value: '第一章·寒渊初醒', type: 'link' },
      ],
    },
  ],
  'char-villain': [
    {
      chapter: '全部',
      fields: [
        { key: '姓名', value: '殷无殇', type: 'text' },
        { key: '身份', value: '冥渊殿殿主', type: 'text' },
        { key: '境界', value: '渡劫期大圆满', type: 'text' },
        { key: '属性', value: '暗', type: 'text' },
        { key: '敌对', value: '天剑宗', type: 'link' },
        { key: '目标', value: '凌夜寒', type: 'link' },
      ],
    },
  ],
  'loc-north': [
    {
      chapter: '全部',
      fields: [
        { key: '全称', value: '北境·寒渊山脉', type: 'text' },
        { key: '区域', value: '北境', type: 'text' },
        { key: '气候', value: '极寒·终年冰雪', type: 'text' },
        { key: '危险等级', value: '极高', type: 'text' },
        { key: '重要人物', value: '凌夜寒', type: 'link' },
      ],
    },
  ],
  'loc-capital': [
    {
      chapter: '全部',
      fields: [
        { key: '全称', value: '中州·天枢城', type: 'text' },
        { key: '区域', value: '中州', type: 'text' },
        { key: '建立时间', value: '三千年前', type: 'text' },
        { key: '管辖', value: '天剑宗、皇室', type: 'text' },
      ],
    },
  ],
  'faction-sword': [
    {
      chapter: '全部',
      fields: [
        { key: '名称', value: '天剑宗', type: 'text' },
        { key: '性质', value: '正道第一大宗', type: 'text' },
        { key: '驻地', value: '天枢城以东·剑峰', type: 'text' },
        { key: '宗主', value: '云无涯', type: 'text' },
        { key: '核心功法', value: '天剑诀、破虚剑法', type: 'list' },
      ],
    },
  ],
  'item-sword': [
    {
      chapter: '全部',
      fields: [
        { key: '名称', value: '霜华剑', type: 'text' },
        { key: '品阶', value: '上古仙器（残缺）', type: 'text' },
        { key: '属性', value: '冰', type: 'text' },
        { key: '持有者', value: '凌夜寒', type: 'link' },
        { key: '来历', value: '上古冰帝佩剑', type: 'text' },
      ],
    },
  ],
}

// 编年大事记
export const seedTimeline: TimelineEvent[] = [
  {
    id: 'evt-1',
    date: '上古纪·灵气复苏',
    dateSort: -10000,
    title: '天地灵气复苏',
    description: '上古时期，天地间灵气浓度骤增，凡人中开始出现修行者。此事件标志着修仙纪元的开端。',
    relatedDocs: [{ id: 'world', title: '世界观总览' }],
    category: 'discovery',
  },
  {
    id: 'evt-2',
    date: '上古纪·冰帝陨落',
    dateSort: -5000,
    title: '上古冰帝陨落',
    description: '冰帝在与天道的对抗中陨落，其佩剑霜华剑沉入寒渊山脉深渊潭底，冰帝的神魂碎片转世轮回。',
    relatedDocs: [
      { id: 'char-mc', title: '凌夜寒' },
      { id: 'item-sword', title: '霜华剑' },
      { id: 'loc-north', title: '北境·寒渊山脉' },
    ],
    category: 'catastrophe',
  },
  {
    id: 'evt-3',
    date: '三千年前',
    dateSort: -3000,
    title: '天枢城建立',
    description: '当世最强的几位修士联合缔造天枢城，以玄铁浇筑城墙，内含可抵御渡劫期强者的阵法。',
    relatedDocs: [{ id: 'loc-capital', title: '中州·天枢城' }],
    category: 'political',
  },
  {
    id: 'evt-4',
    date: '千年前',
    dateSort: -1000,
    title: '天剑宗崛起',
    description: '天剑宗以剑道崛起于中州，逐步发展为正道第一大宗，宗门设于天枢城以东三千里剑峰之上。',
    relatedDocs: [{ id: 'faction-sword', title: '天剑宗' }],
    category: 'political',
  },
  {
    id: 'evt-5',
    date: '百年前',
    dateSort: -100,
    title: '天枢城外大战',
    description: '冥渊殿殿主殷无殇与天剑宗宗主云无涯大战于天枢城外，两败俱伤，双方各自闭关疗伤。',
    relatedDocs: [
      { id: 'char-villain', title: '殷无殇' },
      { id: 'faction-sword', title: '天剑宗' },
      { id: 'loc-capital', title: '中州·天枢城' },
    ],
    category: 'war',
  },
  {
    id: 'evt-6',
    date: '天历元年·开篇',
    dateSort: 1,
    title: '凌夜寒寒渊初醒',
    description: '银发青年在寒渊山脉苏醒，获得霜华剑认可，被天剑宗外门弟子带回宗门。',
    relatedDocs: [
      { id: 'char-mc', title: '凌夜寒' },
      { id: 'loc-north', title: '北境·寒渊山脉' },
      { id: 'item-sword', title: '霜华剑' },
    ],
    category: 'personal',
  },
  {
    id: 'evt-7',
    date: '天历元年',
    dateSort: 2,
    title: '殷无殇出关',
    description: '殷无殇察觉寒渊山脉异动后出关，将目光投向凌夜寒，认为其体内封存着突破渡劫期的关键力量。',
    relatedDocs: [
      { id: 'char-villain', title: '殷无殇' },
      { id: 'char-mc', title: '凌夜寒' },
    ],
    category: 'personal',
  },
  {
    id: 'evt-8',
    date: '天历元年·第一卷末',
    dateSort: 3,
    title: '凌夜寒突破金丹',
    description: '经历宗门试炼与魔道袭击后，凌夜寒突破至金丹中期，但也因此被天剑宗高层视为异类，最终离开宗门成为散修。',
    relatedDocs: [
      { id: 'char-mc', title: '凌夜寒' },
      { id: 'faction-sword', title: '天剑宗' },
    ],
    category: 'personal',
  },
]

export const typeLabels: Record<string, string> = {
  character: '人物',
  faction: '势力',
  location: '地点',
  item: '物品',
  lore: '设定',
  chapter: '章节',
  chronicle: '编年',
}

export const typeColors: Record<string, string> = {
  character: '#E8A87C',
  faction: '#85CDCA',
  location: '#D5A6BD',
  item: '#C9B1FF',
  lore: '#87CEEB',
  chapter: '#FFD700',
  chronicle: '#E07A5F',
}
