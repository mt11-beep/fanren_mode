# 玄战秘境（Web 2D 俯视角多人修仙乱斗）

> 第一阶段：先完成单机原型，后续可接入 Colyseus 房间同步。

## 技术栈

- **前端（client）**: Vite + TypeScript + Phaser 3
- **后端（server）**: Node.js + Colyseus + Express
- **共享模块（shared）**: TypeScript 常量与类型

## 项目结构

```text
.
├─ client/                 # Phaser 前端（当前阶段单机原型）
│  ├─ src/
│  │  ├─ scenes/MainScene.ts
│  │  ├─ ui/Hud.ts
│  │  └─ main.ts
│  ├─ index.html
│  ├─ package.json
│  └─ tsconfig.json
├─ server/                 # Colyseus 服务端骨架
│  ├─ src/index.ts
│  ├─ src/rooms/BattleRoom.ts
│  ├─ package.json
│  └─ tsconfig.json
├─ shared/                 # 共享平衡配置与类型
│  ├─ src/index.ts
│  ├─ package.json
│  └─ tsconfig.json
├─ package.json            # monorepo/workspaces
└─ tsconfig.base.json
```

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 启动前端原型

```bash
npm run dev:client
```

访问：<http://localhost:5173>

### 3) 启动服务端（可选）

```bash
npm run dev:server
```

服务默认地址：<http://localhost:2567>
健康检查：`/health`

### 4) 同时启动前后端

```bash
npm run dev
```

## 第一阶段已实现功能（单机）

- WASD 移动
- 鼠标控制朝向
- 鼠标左键发射飞剑弹道
- `Q` 释放护体灵盾
- `E` 释放范围攻击
- UI 显示气血条、灵力条、技能冷却
- 秘境风格占位地图（纯几何图形）
- 全部 TypeScript

## 操作说明

- **W/A/S/D**：移动
- **鼠标移动**：角色朝向
- **左键**：飞剑
- **Q**：护体灵盾（持续短时间）
- **E**：震荡范围术

## 授权与 IP 说明

当前原型使用**原创修仙角色**与占位美术，不包含任何《凡人修仙传》官方角色名、美术、台词、剧情设定，可在后续获得授权后替换资源层。

## 后续建议（第二阶段）

1. 将 `MainScene` 的输入与技能逻辑抽离为 deterministic 模块；
2. 用 Colyseus 房间状态同步玩家坐标、朝向、技能事件；
3. 增加命中检测与状态机（受击、护盾吸收、死亡重生）；
4. 做客户端预测 + 回滚（降低延迟体感）。
