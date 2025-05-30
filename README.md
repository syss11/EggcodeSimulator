# 《蛋仔派对》蛋码模拟器

## 项目简介

- 蛋码（图形化编程）模拟器，来源于《蛋仔派对》中的工坊功能。玩家可以在这个编辑器中模拟游戏里的形式，通过拼接积木来拼接蛋码，也可以分享给他人。

## 功能特点

- **图形化编程积木**：提供直观的图形化编程积木，还原蛋码。
- **编辑功能**：在编辑过程中可以进行复制粘贴，删除插入等功能。
- **作品保存功能**：可以将自己的作品保存下来，方便以后继续编辑或分享给他人。
- **自定义积木功能**：可以制作自己的蛋码积木。

## 技术栈

- **前端**：使用原生JavaScript、CSS和HTML开发，不需要库。
- **后端**：Python的flask框架与sqlite3数据库。
- **开源项目**：项目代码开源，欢迎各位开发者贡献代码、提出建议或参与改进。

## 运行方式
1. 安装python，依赖库
```bash 
pip install flask
```
2. 运行server.py,访问127.0.0.1:5000

# 配置文件文档
配置文件是json格式，包含所有可用蛋码与类型，分类。
**Accept-classes**：所有类型以及该类型的固定蛋码积木。固定积木是简化的蛋码积木。
**Sorts**：分类功能的所有分类。
**EggcodePrefab**：所有蛋码预设体的信息。



# 代码文档
## 类
**EggcodePrefab**：蛋码预设体（右侧栏目的选项们）

**Eggcode**：蛋码

**EggAssembly**：蛋码集合体（组织蛋码结构）

**Vacancy**：空缺格（没有填写的蛋码参数位置）

**EggcodeControl**：继承于蛋码，是嵌套结构的控制模块（紫色积木）

## 关键函数
**loadprefabs**：从配置文件加载蛋码预设体与分类。设置全局类型字典。

**construct**：用于从作品文件加载蛋码，是递归函数。

## 叠甲
我是新手，代码安排混乱，超级耦合，新功能没写注释，请多指教。
**QQ 3970771550**
