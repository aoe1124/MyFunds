# MyFunds - 个人资产管理工具

一个简单易用的个人资产管理网页应用，帮助用户追踪和管理多个账户的资产变化。

## 功能特性

### 1. 资产总览（首页）
- 展示所有账户资产总和的趋势图
- 支持查看每月资产变化
- 图表数据点支持备注功能，重要的资产变动可以添加说明
- 图表提供美观的数据提示框，显示具体数值和备注信息

### 2. 数据管理
- 支持多账户管理（添加、编辑、删除账户）
- 按年份分组展示所有账户的月度数据
- 支持为每个账户设置起止时间
- 提供月度数据的编辑功能
- 自动计算每月资产总计
- 支持为每月添加备注信息
- 支持数据导入导出功能，方便数据备份和迁移

### 3. 账户历史（开发中）
- 展示各账户的历史变化趋势
- 支持账户间的数据对比
- 提供详细的数据分析报告

## 技术特性

- 纯前端实现，无需后端服务器
- 数据存储在浏览器的 localStorage 中，保护隐私
- 响应式设计，支持各种设备访问
- 使用 ApexCharts 提供专业的图表展示
- 现代化的 UI 设计，提供流畅的用户体验

## 使用说明

1. 首次使用时，系统会自动创建示例账户和数据
2. 在"数据管理"页面可以：
   - 添加新账户：点击"添加账户"按钮
   - 编辑账户：点击账户旁的编辑图标
   - 删除账户：点击账户旁的删除图标
   - 编辑月度数据：直接点击对应的数据格子
   - 添加月度备注：在备注行对应月份添加说明
   - 导出数据：点击左侧栏底部的"导出数据"按钮，将生成包含所有数据的JSON文件
   - 导入数据：点击"导入数据"按钮，选择之前导出的JSON文件（注意：导入会覆盖现有数据，但会自动创建备份）

## 数据安全

1. 所有数据均存储在浏览器本地，不会上传到任何服务器
2. 建议定期导出数据作为备份
3. 导入数据时会自动备份现有数据，以防导入错误
4. 备份文件采用标准JSON格式，易于查看和验证

## 开发计划

- [x] 基础框架搭建
- [x] 资产总览页面
- [x] 数据管理页面
- [x] 账户管理功能
- [x] 数据编辑功能
- [x] 备注功能
- [x] 数据导入导出功能
- [ ] 账户历史页面
- [ ] 数据可视化优化
- [ ] 移动端适配优化
- [ ] 数据分析报表功能
- [ ] 多主题支持
- [ ] 自定义图表配置

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- ApexCharts.js (图表库)

