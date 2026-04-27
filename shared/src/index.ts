export type SkillKey = "shield" | "burst";

export interface SkillConfig {
  key: SkillKey;
  cooldownMs: number;
  costMana: number;
}

export const GAME_BALANCE = {
  player: {
    maxHealth: 120,
    maxMana: 100,
    moveSpeed: 220,
    regenManaPerSecond: 8
  },
  projectile: {
    speed: 540,
    lifetimeMs: 1300,
    damage: 18,
    cooldownMs: 220,
    manaCost: 6
  },
  skills: {
    shield: {
      key: "shield",
      cooldownMs: 7000,
      costMana: 22,
      durationMs: 1800,
      absorbAmount: 35
    },
    burst: {
      key: "burst",
      cooldownMs: 6500,
      costMana: 30,
      radius: 120,
      damage: 28
    }
  }
} as const;

export type BalanceConfig = typeof GAME_BALANCE;
