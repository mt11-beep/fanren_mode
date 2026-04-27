# 玄战秘境（Web 2D 俯视角多人修仙乱斗）

> 当前进度：第二阶段（单机战斗闭环 + 稳定性返修）

## 技术栈

- 前端：Vite + TypeScript + Phaser 3
- 后端：Node.js + Colyseus + Express（仅骨架，暂不做联网）
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

## 第二阶段功能（当前）

- WASD 移动、鼠标朝向
- 左键飞剑：从玩家前方生成、朝鼠标方向飞行、拖尾、命中后销毁
- Q 护盾：持续时间 + 冷却显示
- E 震荡术：范围伤害、受控击退（不会把假人震出地图）
- 3 个训练假人：血条、受击反馈、死亡消散、3 秒后原点重生光圈
- 统一伤害结算：飞剑与 E 技能都走 `applyDamageToDummy(...)`
- 连击反馈：连续命中显示 Combo
- 战斗日志 UI
- 暂停/继续 与 重置训练场 按钮

## 关键实现说明

- 命中检测：`MainScene.update()` 调用 `checkProjectileHits()`，手动遍历 active projectiles 与 alive dummies，用距离判定命中。
- 伤害处理：飞剑/E 技能统一调用 `applyDamageToDummy(...)`，内部完成扣血、飘字、受击、击杀计数、日志。
- 假人稳定性：`setCollideWorldBounds(true)` + damping/drag + clamp，防止被击退到场外。

## 第二阶段验收测试清单

1. `npm install` 成功；
2. `npm run build` 成功；
3. `npm run dev:client` 可启动；
4. 进入网页后玩家可移动；
5. 鼠标指向假人，左键飞剑朝目标飞行；
6. 飞剑命中后假人血条减少；
7. 飞剑命中后飞剑消失；
8. 连续命中后假人死亡并消失；
9. 击杀数增加；
10. 3 秒后假人原地重生；
11. E 技能可范围伤害假人；
12. E 技能不会把假人击退到场外；
13. F12 Console 无红色报错（可见 debug hit 日志）；
14. 点击“暂停训练/继续训练”“重置训练场”按钮可正常工作。

## IP 说明

当前版本全部使用原创占位角色与占位图形，不包含《凡人修仙传》官方角色名、美术、台词与剧情设定。
