# 中国入境游B端平台 - 需求拆解文档

## 产品概述

- **产品类型**: 移动端工具应用
- **场景类型**: app
- **目标用户**: 入境游B端客户，包括旅行社、渠道合作方、采购与产品经理等商务用户
- **核心价值**: 为入境游B端客户提供平台介绍、费用测算、数据存储与个人中心的一站式移动端访问体验
- **界面语言**: 中文
- **主题偏好**: 浅色
- **导航模式**: 路径导航
- **导航布局**: Bottom Tab

---

## 页面结构总览

> **说明**：此表为页面生成的唯一数据源，包含所有页面（一级+二级）

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 首页 | `HomePage.tsx` | `/` | 一级 | 导航 |
| 测算 | `EstimatePage.tsx` | `/estimate` | 一级 | 导航 |
| 我的 | `ProfilePage.tsx` | `/profile` | 一级 | 导航 |

> **页面类型说明**：
> - **一级页面**：出现在导航中，用户可直接访问
> - **二级页面**：不在导航中，从一级页面跳转进入

---

## 导航配置

> **说明**：此表为导航生成的数据源，路由需与页面结构总览一致

- **导航布局**: Bottom Tab
- **导航项**（仅一级页面）:

| 导航文字 | 路由 | 图标(可选) |
|---------|------|-----------|
| 首页 | `/` | Home |
| 测算 | `/estimate` | Calculator |
| 我的 | `/profile` | User |

---

## 功能列表

- **页面/区块**: 首页
  - **页面目标**: 通过高辨识度的中国文化视觉与平台内容展示，建立入境游B端平台的专业可信形象
  - **功能点**:
    - Hero主视觉展示: 首页顶部固定展示高质量天坛背景图，完整呈现建筑主体，并叠加中国红渐变蒙层
    - 平台介绍区: 展示平台定位、核心服务内容与一站式定制能力
    - 数据背书区: 展示平台业务实力、服务规模、合作成果等关键信息卡片
    - 客户群体区: 展示目标客户类型，如旅行社、地接社、企业客户、渠道伙伴等
    - 固定背景优化: 移除背景轮播、切换按钮与指示器，统一为单一静态主视觉方案

- **页面/区块**: 测算
  - **页面目标**: 帮助B端用户快速完成入境游方案的基础费用测算
  - **功能点**:
    - 费用测算表单: 支持输入核心测算参数，如人数、天数、目的地城市、酒店档次、用车需求等
    - 测算结果展示: 基于表单输入输出总价、单人均价或分项费用结果，支持手动录入对客总价
    - 分项费用说明: 展示交通、住宿、导游、门票等费用构成说明
    - 表单信息分组: 将输入项按行程基础信息、服务标准、附加需求分组呈现，提升移动端填写效率

- **页面/区块**: 我的
  - **页面目标**: 为用户提供个人身份展示与常用账户信息入口
  - **功能点**:
    - 个人信息卡片: 展示头像、姓名/机构名称、身份标签等基础信息
    - 平台服务入口展示: 展示与个人账户相关的常用功能入口位
    - 历史测算入口: 提供查看过往测算记录的入口信息位
    - 商务支持信息: 展示客服、顾问或商务对接方式等支持内容

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `travel_app_record` | 存储用户资料与最近一次测算结果的数据库表 | 测算页、我的页 |

```ts
interface IEstimateForm {
  travelers: number;
  days: number;
  destination: string;
  hotelLevel: '经济型' | '舒适型' | '高端型' | '豪华型';
  transportNeeds?: string;
  guideService?: boolean;
  ticketBudget?: number;
  extraNotes?: string;
}

interface IEstimateResult {
  totalCost: number;
  perPersonCost: number;
  hotelCost?: number;
  transportCost?: number;
  guideCost?: number;
  ticketCost?: number;
  otherCost?: number;
}

interface IUserProfile {
  id: string;
  name: string;
  company?: string;
  role?: string;
  avatar?: string;
  phone?: string;
}

-------

# UI 设计指南

> **场景类型**: `prototype`（应用架构设计）
> **确认检查**: 本指南适用于可交互的移动端应用/工具。本项目为三 Tab 移动端 B 端 APP，采用 Bottom Tab 导航，而非 dashboard / info_viz / presentation。

> ℹ️ Section 1-2 为设计意图与决策上下文。Code agent 实现时以 Section 3 及之后的具体参数为准。

## 1. Design Archetype (设计原型)

### 1.1 内容理解
- **目标用户**: 入境游 B 端客户，包括旅行社、渠道合作方、采购、产品经理、商务拓展人员；使用场景多发生在移动端沟通、客户拜访、方案初筛、碎片化测算。
- **核心目的**: 建立平台专业可信的第一印象，并让用户能快速完成费用测算、查看账户与商务支持信息。
- **期望情绪**: 信任、稳重、熟悉、可成交。
- **需避免的感受**: 廉价旅游感、政务化过重、信息嘈杂、过度喜庆、操作负担大。

### 1.2 设计语言
- **Aesthetic Direction**: 以"中国红商务风"为主轴，但不是节庆海报感，而是"文化地标 + 商务可信 + 移动端高效表单"的现代化表达。
- **Visual Signature**:
  1. 首页 Hero 固定使用高质量天坛照片，完整展示建筑主体，取消轮播、切换按钮与指示器。
  2. 全局采用中国红到深绛红的纵向渐变作为品牌识别层，仅在 Hero、主按钮、重点标签中高强度出现。
  3. 卡片采用暖白底 + 细描边 + 轻阴影，形成"红色主品牌 + 克制商务界面"的平衡。
  4. 底部 Tab 使用稳定的浅底高对比方案，激活态以中国红强调，不做夸张发光。
  5. 表单分组采用"章节标题 + 卡片段落 + 胶囊选项"的移动端友好结构。
- **Emotional Tone**: 沉稳、礼序。既要传达中国目的地识别度，也要让 B 端客户感到专业、可靠、可落地。
- **Design Style**: **Soft Blocks 柔色块 + Editorial 经典排版** — 需要兼顾文化气质与商务可信度：前者提供温润层次，后者提供标题权重与内容秩序。
- **Application Type**: `Tool / App`（移动端多页面工具应用，Bottom Tab 导航）

## 2. Design Principles (设计理念)

1. **文化识别必须聚焦，不做堆砌**
   - 中国感由"天坛 + 中国红"两大强记忆点承担，不再叠加龙纹、灯笼、金边等符号，避免俗套化。

2. **商务可信优先于视觉热闹**
   - 红色只负责品牌识别和重点行动，不让整页都被高饱和红覆盖；信息区必须保持清晰、可读、可扫描。

3. **首页负责建立信任，测算页负责降低阻力**
   - 首页以品牌与数据背书构建信任；测算页以清晰分组、低认知负担帮助用户快速完成输入。

4. **移动端优先，单手操作友好**
   - 核心操作区、CTA、Tab、表单输入都应符合拇指热区；避免复杂顶部导航和深层结构。

5. **红色系统要有层级，而不是单一满版**
   - 深红用于主操作与品牌锚点，浅绯红用于 hover/focus/选中背景，暖白与米灰用于大面积信息承载。

## 3. Color System (色彩系统)

> 基于内容理解自主推导，不使用预设配色方案库。  
> **App 场景规则**：已遵循自主生成配色体系。

**配色设计理由**: 本产品需要"中国红商务风格"，但目标用户是 B 端商务客户，因此主色必须偏深、偏稳，不走鲜艳节庆红；背景与卡片需要暖白化，避免医疗白或科技冷蓝，让文化气质更自然。

### 3.1 主题颜色

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|-----|---------|----------------|--------|---------|
| bg | `--background` | `bg-background` | `hsl(28 25% 97%)` | 暖米白背景，降低纯白刺眼感，适合中国红搭配 |
| surface | `--card` | `bg-card` | `hsl(0 0% 100%)` | 主要卡片背景，保证表单与内容区清晰 |
| text | `--foreground` | `text-foreground` | `hsl(8 28% 16%)` | 深棕黑正文，较纯黑更柔和且有文化温度 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | `hsl(12 12% 44%)` | 次要说明、辅助文案、标签描述 |
| primary | `--primary` | `bg-primary` | `hsl(2 72% 42%)` | 主品牌红，稳重、饱满，用于主按钮/激活态 |
| primary-foreground | `--primary-foreground` | `text-primary-foreground` | `hsl(0 0% 100%)` | 主色上的文字图标，确保高对比 |
| accent | `--accent` | `bg-accent` | `hsl(6 65% 95%)` | 次级交互反馈底色，浅绯红，用于 hover/focus/选中 |
| accent-foreground | `--accent-foreground` | `text-accent-foreground` | `hsl(4 58% 32%)` | accent 背景上的文字颜色 |
| border | `--border` | `border-border` | `hsl(18 18% 88%)` | 暖灰描边，保持商务界面整洁 |

> **Color Token 语义速查（供 code agent 参考）**:
> - `primary` → 主行动：按钮填充、Tab 激活图标/文字、关键 CTA
> - `accent` → 状态反馈：Ghost/Outline hover、Segment 选中底、表单 focus 背景、Skeleton 占位
> - `muted` → 静态非交互：说明文字、禁用背景、弱提示

### 3.2 Bottom Tab / 顶部区域补充颜色

> 本项目主导航为 Bottom Tab，无 Sidebar。  
> 不编造不存在的 `--topbar-*` 变量；如有页面顶部栏，直接使用以下色值。

| 用途 | 建议样式 |
|-----|---------|
| 顶部栏背景 | `bg-[hsl(28_25%_97%)]` 或 `bg-[hsl(0_0%_100%/0.92)] backdrop-blur-md` |
| 顶部栏文字 | `text-[hsl(8_28%_16%)]` |
| Bottom Tab 背景 | `bg-[hsl(0_0%_100%/0.94)] backdrop-blur-xl` |
| Bottom Tab 边框 | `border-[hsl(18_18%_88%)]` |
| Bottom Tab 激活态 | `text-primary` + `bg-[hsl(6_65%_95%)]` |

### 3.3 语义颜色（测算结果与状态提示）

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|-----|---------|----------------|--------|---------|
| success | `--success` | `text-[var(--success)]` | `hsl(145 55% 34%)` | 正向提示、已完成、优势结果 |
| success-bg | `--success-bg` | `bg-[var(--success-bg)]` | `hsl(145 45% 94%)` | 成功浅背景 |
| warning | `--warning` | `text-[var(--warning)]` | `hsl(32 78% 38%)` | 预算提醒、信息待补充 |
| warning-bg | `--warning-bg` | `bg-[var(--warning-bg)]` | `hsl(38 100% 94%)` | 警示浅背景 |
| danger | `--destructive` | `text-destructive` | `hsl(0 68% 46%)` | 错误、校验失败 |
| danger-bg | `--destructive-bg` | `bg-[var(--destructive-bg)]` | `hsl(0 75% 95%)` | 错误浅背景 |

## 4. Typography (字体排版)
- **Heading**: `-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Segoe UI", sans-serif`
- **Body**: `-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Segoe UI", sans-serif`
- **字体导入**: 不引入 Google Fonts，全部使用系统字体栈
- **数字补充**: `ui-monospace, "SFMono-Regular", "Roboto Mono", "Menlo", monospace` 用于测算结果数字、价格拆分、统计数字

**排版策略**
- 页面主标题：`text-2xl font-bold tracking-tight`
- Hero 标题：`text-3xl font-black tracking-tight`
- 分区标题：`text-lg font-semibold`
- 卡片标题：`text-base font-semibold`
- 正文：`text-sm leading-6`
- 辅助说明：`text-xs leading-5`
- 价格/结果数字：`text-3xl font-black tabular-nums`

## 5. Global Layout Structure (全局布局结构)

### 5.1 Page Content Zones (页面区块配置)

**Standard Content Zone（全页面统一）**:
- **Maximum Width**: `max-w-md`
- **Padding**: `px-4 pt-4 pb-24`
- **Alignment**: `mx-auto`
- **Vertical Spacing**: `space-y-5`

**宽内容溢出策略**:
- 表格型结果或分项费用列表如超宽，外层使用 `overflow-x-auto rounded-xl`
- 禁止为了表单或表格放大整页容器

**Hero/Banner 区块**:
- **Width**: `w-full`
- **Padding**: `0`
- **Background**: 固定天坛高质量照片 + 中国红渐变遮罩
- **Height**: `h-[320px]`（小屏可降至 `h-[280px]`）
- **Image Strategy**: 建筑主体完整呈现，优先居中偏下构图，避免顶部裁掉祈年殿屋顶

### 5.2 导航策略
- **Navigation Type**: `Bottom Tab`
- **理由**: 三个一级页面均为高频切换，移动端工具应用无需 Sidebar/Topbar 导航体系。
- **规则**:
  - Tab 固定底部
  - 仅保留三个入口：首页 / 测算 / 我的
  - 不增加二级导航栏
  - 页面内部如需返回，仅在二级页中使用顶部返回，不影响一级 Tab 结构

### 5.3 页面模式
- **首页**: 品牌展示 + 内容卡片流
- **测算页**: 分组表单 + 结果卡片
- **我的页**: 用户信息头卡 + 服务入口列表 + 历史记录入口

## 6. Visual Effects & Motion (视觉效果与动效)

- **Header/Hero 视觉方案**: 首页 Hero 使用"高质量天坛照片 + `bg-gradient-to-b from-[hsla(2,72%,42%,0.22)] via-[hsla(4,78%,38%,0.52)] to-[hsla(8,70%,18%,0.78)]`"的纵向叠加，底部加暗部强化文字可读性。
- **装饰手法**: 无额外传统纹样；仅使用半透明柔光色块、细描边、浅红胶囊标签作为装饰。
- **圆角**:
  - 页面主卡片：`rounded-2xl`
  - 次级卡片/表单分组：`rounded-xl`
  - 按钮：`rounded-xl`
  - 胶囊标签：`rounded-full`
- **阴影**:
  - 主卡片：`shadow-[0_10px_30px_rgba(120,32,24,0.08)]`
  - Hero 浮层卡：`shadow-[0_18px_40px_rgba(90,20,20,0.18)]`
  - 底部 Tab：`shadow-[0_-6px_20px_rgba(60,20,20,0.08)]`
- **复杂背景文字处理**:
  - 渐变背景: Hero 文字加 `text-shadow: 0 2px 10px rgba(0,0,0,0.22)`
  - 图片背景: 必须叠加遮罩层，建议 `bg-black/20` + 红色渐变混合
  - 有色背景: 文字使用 `hsl(0 0% 100%)`，对比度满足标题可读性要求
- **缓动函数**: `cubic-bezier(0.22, 1, 0.36, 1)`
- **关键动效**:
  1. **按钮按压**: `transform scale(0.98)`，`duration-150`
  2. **卡片浮起**: hover/press 时 `translateY(-1px)` + 阴影增强，`duration-200`
  3. **Tab 切换**: 激活态背景淡入 + 图标轻微上浮 `translateY(-1px)`，`duration-180`

## 7. Components (组件指南)

> 必须引用 Color System 中的颜色角色。  
> 所有组件需覆盖 Default / Hover / Active / Focus / Disabled。

### Buttons

#### Primary
- **Default**: 背景 `bg-primary` / 文字 `text-primary-foreground`
- **Hover**: `bg-[hsl(2_72%_38%)]`
- **Active**: `bg-[hsl(2_75%_34%)] scale-[0.98]`
- **Focus**: `ring-2 ring-[hsl(2_72%_42%)] ring-offset-2 ring-offset-background`
- **Disabled**: `bg-[hsl(10_18%_80%)] text-[hsl(10_10%_55%)]`

#### Secondary
- **Default**: `bg-card text-foreground border border-border`
- **Hover**: `bg-[hsl(28_20%_95%)]`
- **Active**: `bg-[hsl(24_18%_92%)]`
- **Focus**: `ring-2 ring-[hsl(6_65%_85%)] ring-offset-2`
- **Disabled**: `bg-[hsl(30_12%_96%)] text-[hsl(12_10%_62%)] border-[hsl(20_12%_90%)]`

#### Ghost
- **Default**: `bg-transparent text-foreground`
- **Hover**: `bg-accent text-accent-foreground`
- **Active**: `bg-[hsl(6_65%_91%)] text-[hsl(4_58%_28%)]`
- **Focus**: `ring-2 ring-[hsl(6_65%_85%)]`
- **Disabled**: `text-[hsl(12_10%_62%)]`

#### Outline
- **Default**: `bg-transparent border border-border text-foreground`
- **Hover**: `bg-accent text-accent-foreground`
- **Active**: `bg-[hsl(6_65%_91%)] border-[hsl(8_30%_82%)]`
- **Focus**: `ring-2 ring-[hsl(6_65%_85%)]`
- **Disabled**: `border-[hsl(20_12%_90%)] text-[hsl(12_10%_62%)]`

### Form Elements

#### 输入框 / 数字输入
- **Default**: `bg-card border border-border text-foreground rounded-xl`
- **Hover**: `border-[hsl(8_22%_78%)]`
- **Focus**: `border-[hsl(2_72%_42%)] ring-4 ring-[hsla(2,72%,42%,0.12)] bg-[hsl(6_65%_98%)]`
- **Error**: `border-[hsl(0_68%_46%)] ring-4 ring-[hsla(0,68%,46%,0.10)]`
- **Disabled**: `bg-[hsl(30_12%_96%)] text-[hsl(12_10%_62%)]`
- **Placeholder**: `text-muted-foreground`

#### Select / 选择器
- **Default**: 同输入框
- **Open**: 边框主色高亮，选项面板 `bg-card border border-border shadow-lg`
- **Option Hover**: `bg-accent text-accent-foreground`
- **Option Selected**: `bg-[hsl(6_65%_92%)] text-[hsl(4_58%_28%)]`

#### Switch / Checkbox
- **Off**: `bg-[hsl(20_14%_86%)]`
- **On**: `bg-primary`
- **Thumb**: `bg-[hsl(0_0%_100%)]`
- **Focus**: `ring-4 ring-[hsla(2,72%,42%,0.14)]`

### Cards

#### 首页内容卡 / 测算结果卡 / 我的信息卡
- **Default**: `bg-card border border-border rounded-2xl`
- **Shadow**: `shadow-[0_10px_30px_rgba(120,32,24,0.08)]`
- **Hover**: `translate-y-[-1px] shadow-[0_14px_34px_rgba(120,32,24,0.10)]`
- **Active**: `translate-y-0`
- **Padding**: `p-5`

### Menu / List Item
- **默认**: `text-foreground bg-transparent`
- **Hover/Press**: `bg-accent text-accent-foreground`
- **Chevron/Icon**: 使用 `text-[hsl(12_12%_44%)]`

### Skeleton
- **加载占位**: `bg-[hsl(12_20%_92%)] animate-pulse rounded-xl`

### Bottom Tab Bar
- **容器**: `fixed bottom-0 left-0 right-0 border-t border-border bg-[hsl(0_0%_100%/0.94)] backdrop-blur-xl`
- **内层**: `max-w-md mx-auto grid grid-cols-3 gap-1 px-3 py-2`
- **默认项**: 图标和文字 `text-[hsl(12_12%_44%)]`
- **激活项**: `text-primary bg-[hsl(6_65%_95%)] rounded-xl`
- **按压态**: `scale-[0.98]`

### Hero（首页核心组件）
- **背景**: 固定高质量天坛图，不轮播
- **禁止元素**: 背景切换按钮、轮播指示器、自动轮播逻辑
- **图片处理**:
  - `object-cover`
  - 焦点区域对准天坛主体
  - 优先完整展示建筑，不做激进裁切
- **遮罩层**:
  - 图片上方添加红色渐变叠层
  - 底部增加暗化层，确保标题可读
- **文案层**:
  - 主标题白色粗体
  - 副标题白色 85% 透明度
  - CTA 按钮可使用白底红字或红底白字，两种方案二选一，优先白底红字以提高首屏对比

## 8. Flexibility Note (灵活性说明)

> **一致性优先原则**：三 Tab 移动端应用中，所有页面必须使用统一的内容宽度、圆角、阴影和色彩逻辑。

**允许的微调范围**（code agent 可自行判断）：
- 响应式断点适配，小屏缩短 Hero 高度
- 各页面局部卡片数量按内容增减
- 测算表单字段可按逻辑分组折叠或展开
- 我的页服务入口可用列表或九宫格简化，但需保留同一风格

**禁止的随意变更**：
- ❌ 不同页面使用不同 max-width
- ❌ 首页改回轮播或增加背景切换控件
- ❌ 把整站主背景改成大面积纯红，导致内容区压迫
- ❌ 使用冷蓝、科技紫等偏离中国红商务调性的强调色
- ❌ 底部 Tab 做成重度拟物或游戏化发光样式

## 9. Signature & Constraints (设计签名与禁区)

### DO (视觉签名)
1. **首页 Hero 固定天坛图**
   - CSS 方向:
   - `class="relative overflow-hidden rounded-[0_0_28px_28px]"`
   - 图片层：`class="absolute inset-0 h-full w-full object-cover"`
   - 遮罩层：`class="absolute inset-0 bg-gradient-to-b from-[hsla(2,72%,42%,0.22)] via-[hsla(4,78%,38%,0.52)] to-[hsla(8,70%,18%,0.78)]"`

2. **中国红商务按钮**
   - `class="bg-[hsl(2_72%_42%)] text-white rounded-xl shadow-[0_8px_20px_rgba(160,30,30,0.18)] active:scale-[0.98] transition-all duration-150"`

3. **暖白卡片体系**
   - `class="bg-[hsl(0_0%_100%)] border border-[hsl(18_18%_88%)] rounded-2xl shadow-[0_10px_30px_rgba(120,32,24,0.08)]"`

4. **底部 Tab 激活样式**
   - `class="text-[hsl(2_72%_42%)] bg-[hsl(6_65%_95%)] rounded-xl"`

5. **测算结果数字强化**
   - `class="text-3xl font-black tabular-nums text-[hsl(2_72%_42%)] tracking-tight"`

### DON'T (禁止做法)
> 通用约束参见「通用约束」。以下为 Prototype 特有：

- ❌ 首页 Hero 使用轮播、自动切换、分页点或左右切换按钮
- ❌ 使用节庆化高饱和金色描边、大面积龙纹/祥云铺满界面
- ❌ 表单页出现过多装饰图片，影响输入效率
- ❌ 使用透明底 Bottom Tab 导致内容穿透、可读性下降
- ❌ 将"我的"页做成社交化炫技页面，偏离商务账户中心定位

## 10. 页面级补充说明

### 首页 Home
- 首屏重点是"固定天坛图 + 平台定位 + 一个明确 CTA"
- 下方区块顺序建议：
  1. 平台介绍
  2. 数据背书
  3. 客户群体
- 数据背书建议用 3 张卡片，不超过 4 张，数字大、说明短
- 客户群体建议用标签卡或图标卡，不要复杂横滑组件

### 测算 Estimate
- 当前实现采用设计图驱动的分步卡片结构：基础信息 / 住宿标准 / 用餐标准 / 景点选择 / 用车情况 / 快速校准 / 结果摘要
- 基础信息中的人数与天数使用圆形增减步进器，目的地城市采用双列选项卡
- 住宿、用餐、用车均使用浅粉底选项卡，选中态以中国红描边和浅红底突出
- 景点选择支持分类标签、关键词搜索与带图片的多选卡片；景点图片使用 `Image` 组件渲染
- 结果区新增总价卡、利润率滑杆、费用构成列表与报价说明提醒
- 结果区支持手动输入对客总价，并可生成适合截图导出的对客报价单图片
- 表单默认值优先读取用户最近一次已保存的测算记录
- 结果卡优先展示：总价、人均报价、基础成本、分项费用
- 提交按钮保留在内容流中，不使用悬浮遮挡输入

### 我的 Profile
- 顶部信息卡突出姓名 / 公司 / 身份标签
- 用户资料与历史测算摘要优先展示数据库中最近一次保存结果
- 服务入口建议控制在 4 个以内：
  - 历史测算
  - 商务支持
  - 联系顾问
  - 账户信息
- 商务支持区应有强信任感，可用电话、微信、顾问名片式布局

## 11. 推荐首页 Hero 骨架

```html
<section class="relative overflow-hidden rounded-b-[28px] h-[320px]">
  <img
    src="[高质量天坛图片]"
    alt="天坛"
    class="absolute inset-0 w-full h-full object-cover"
  />
  <div class="absolute inset-0 bg-gradient-to-b from-[hsla(2,72%,42%,0.22)] via-[hsla(4,78%,38%,0.52)] to-[hsla(8,70%,18%,0.78)]"></div>
  <div class="absolute inset-0 bg-black/10"></div>

  <div class="relative h-full max-w-md mx-auto px-4 pt-14 pb-6 flex flex-col justify-between">
    <div class="inline-flex self-start rounded-full bg-white/16 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/14">
      中国入境游B端平台
    </div>

    <div>
      <h1 class="text-3xl font-black tracking-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.22)]">
        一站式定制中国入境游方案
      </h1>
      <p class="mt-2 text-sm leading-6 text-white/85">
        面向旅行社、渠道伙伴与采购团队，快速完成产品了解与费用测算。
      </p>

      <div class="mt-5 flex gap-3">
        <button class="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[hsl(2_72%_42%)]">
          立即测算
        </button>
        <button class="rounded-xl border border-white/24 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm">
          了解平台
        </button>
      </div>
    </div>
  </div>
</section>
```

以上即当前最佳设计指南。