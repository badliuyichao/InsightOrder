# InsightOrder - 工单分析系统

> 多维度数据可视化分析平台

## 项目简介

InsightOrder 是一个基于 Vue 3 + TypeScript + ECharts 的工单数据可视化分析系统。通过读取 Excel 工单数据，提供多维度、炫酷的数据展示和分析能力。

## 主要功能

- 📊 **数据概览** - 8 个关键指标卡片，一目了然掌握整体情况
- 📈 **趋势分析** - 时间维度分析，掌握工单动态
- 👥 **人员分析** - 经办人工作量分布和效率对比
- 🏷️ **问题分析** - 领域模块和问题类型分布
- 🏢 **客户分析** - 高频客户和项目规模分析
- ⚡ **效率分析** - 处理时长分布和状态转化
- 🎨 **炫酷视觉** - 暗黑主题 + 玻璃态效果 + 动画

## 技术栈

- **前端框架**: Vue 3 + TypeScript + Vite
- **UI 组件**: Element Plus + UnoCSS
- **数据可视化**: Apache ECharts 5
- **Excel 处理**: SheetJS (xlsx)
- **状态管理**: Pinia
- **动画效果**: GSAP

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
InsightOrder/
├── docs/                   # 项目文档
│   ├── 需求文档.md
│   ├── 技术方案手册.md
│   └── 开发计划.md
├── orders/                 # Excel 数据文件夹
├── src/                    # 源代码
│   ├── assets/            # 静态资源
│   ├── components/        # 组件
│   ├── composables/       # 组合式函数
│   ├── router/            # 路由
│   ├── stores/            # 状态管理
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   └── views/             # 页面
├── package.json
├── vite.config.ts
└── README.md
```

## 使用说明

1. 将 Excel 工单数据文件放入 `orders` 文件夹
2. 启动项目后，点击"选择 Excel 文件"按钮
3. 系统自动解析并展示数据分析结果
4. 支持刷新数据功能，实时更新分析结果

## 开发计划

详见 [开发计划文档](docs/开发计划.md)

- ✅ Day 1-3: 项目初始化与基础架构
- 🔄 Day 4-7: 核心功能开发
- 📅 Day 8-14: 图表组件开发
- 📅 Day 15-17: 交互与优化
- 📅 Day 18-20: 视觉美化
- 📅 Day 21-22: 测试与部署

## 文档

- [需求文档](docs/需求文档.md)
- [技术方案手册](docs/技术方案手册.md)
- [开发计划](docs/开发计划.md)

## 许可证

MIT

## 作者

Claude Sonnet 4.6
