# 玄战秘境（Web 2D 俯视角多人修仙乱斗）

> 当前进度：第二阶段（单机战斗闭环训练场）

## 技术栈

- **前端（client）**: Vite + TypeScript + Phaser 3
- **后端（server）**: Node.js + Colyseus + Express
- **共享模块（shared）**: TypeScript 常量与类型

## 项目结构

```text
.
├─ client/
│  ├─ src/
│  │  ├─ combat/ProjectileManager.ts
│  │  ├─ effects/DamageText.ts
│  │  ├─ entities/
│  │  │  ├─ Player.ts
│  │  │  └─ TrainingDummy.ts
│  │  ├─ scenes/MainScene.ts
│  │  ├─ ui/Hud.ts
│  │  └─ main.ts
│  ├─ index.html
│  ├─ package.json
│  └─ tsconfig.json
├─ server/
│  ├─ src/index.ts
│  ├─ src/rooms/BattleRoom.ts
│  ├─ package.json
│  └─ tsconfig.json
├─ shared/
│  ├─ src/index.ts
│  ├─ package.json
│  └─ tsconfig.json
├─ package.json
└─ tsconfig.base.json
```

## 安装与运行

```bash
npm install
npm run dev:client
```

打开 <http://localhost:5173>。

可选启动服务端：

```bash
npm run dev:server
```

## 第二阶段新增功能（单机战斗闭环）

- 地图中新增 3 个训练假人
- 假人拥有独立血条
- 飞剑命中假人可造成伤害
- `E` 范围攻击可命中范围内假人
- 假人受击反馈：闪烁 + 击退
- 飘字伤害数字
- 假人死亡后消失，3 秒后重生
- HUD 新增击杀计数
- `Q` 护盾新增清晰持续时间显示 + 冷却读数
- MainScene 逻辑拆分为 Player、ProjectileManager、TrainingDummy、DamageText 等类

## 操作说明

- **W/A/S/D**：移动
- **鼠标移动**：朝向
- **左键**：飞剑
- **Q**：护体灵盾
- **E**：范围震荡术

## 构建与检查

```bash
npm run build
```

建议手动验证：

1. 连续左键攻击 3 个假人，确认掉血、飘字、受击反馈；
2. `E` 在多个假人附近释放，确认群体伤害；
3. 击杀假人后等待 3 秒确认重生；
4. 观察 HUD 中护盾持续时间、冷却、击杀计数是否实时更新。

## IP 说明

当前版本全部为原创占位角色与占位图形，不包含《凡人修仙传》官方角色名、美术、台词、剧情设定，后续可在获得授权后替换资源层。
