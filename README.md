# 玄战秘境（Web 2D 俯视角多人修仙乱斗）

> 当前进度：第二阶段稳定性返修（单机战斗闭环）

## 技术栈

- 前端：Vite + TypeScript + Phaser 3
- 后端：Node.js + Colyseus + Express（仅骨架）
- 共享：`@xuanfight/shared`（统一数值配置）

## 安装与运行

```bash
npm install
npm run dev:client
```

构建：

```bash
npm run build
```

## 第二阶段战斗闭环（当前）

- WASD 移动、鼠标朝向
- 左键飞剑（从玩家前方生成，带尾迹，可命中）
- Q 护盾（持续+冷却显示）
- E 范围攻击（造成伤害，击退受控）
- 3 个训练假人（血条、受击反馈、死亡后 3 秒原点重生）
- 飘字伤害、击杀计数
- 地图边界可视化边框

## 关键实现说明

- 命中检测改为 `MainScene.update()` 中手动距离检测（projectile vs dummy），不依赖对象身份比较。
- 飞剑具备 Arcade body、尺寸、active/visible/depth，并在超时或出界时销毁。
- 假人具备 Arcade body、world bounds、damping/drag、位置边界夹紧，避免被震荡推飞出场外。

## 第二阶段验收测试清单

1. `npm install` 成功；
2. `npm run build` 成功；
3. `npm run dev:client` 可启动；
4. WASD 移动正常；
5. 鼠标指向假人，左键飞剑朝目标方向飞行；
6. 飞剑命中后假人血条减少；
7. 连续命中后假人死亡并消失；
8. 3 秒后假人在原始出生点重生；
9. E 技能可范围伤害假人；
10. E 技能不会把假人震到场外；
11. 击杀计数实时更新；
12. F12 Console 无红色报错；
13. 可看到命中调试日志：`[combat] sword hit dummy`。

## IP 说明

当前版本全部使用原创占位角色与占位图形，不包含《凡人修仙传》官方角色名、美术、台词与剧情设定。
