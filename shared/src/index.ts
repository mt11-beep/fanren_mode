export type SkillKey = "shield" | "burst";

export interface SkillConfig {
  key: SkillKey;
  cooldownMs: number;
  costMana: number;
}

export interface GameBalance {
  player: {
    maxHealth: number;
    maxMana: number;
    moveSpeed: number;
    regenManaPerSecond: number;
  };
  projectile: {
    speed: number;
    lifetimeMs: number;
    damage: number;
    cooldownMs: number;
    manaCost: number;
    hitRadius: number;
    spawnOffset: number;
  };
  trainingDummy: {
    maxHealth: number;
    respawnMs: number;
    knockbackForce: number;
    maxKnockbackSpeed: number;
    hitRadius: number;
  };
  skills: {
    shield: SkillConfig & {
      durationMs: number;
      absorbAmount: number;
    };
    burst: SkillConfig & {
      radius: number;
      damage: number;
      knockbackScale: number;
    };
  };
}

export const GAME_BALANCE: GameBalance = {
  player: {
    maxHealth: 120,
    maxMana: 100,
    moveSpeed: 220,
    regenManaPerSecond: 8
  },
  projectile: {
    speed: 660,
    lifetimeMs: 1500,
    damage: 18,
    cooldownMs: 220,
    manaCost: 6,
    hitRadius: 18,
    spawnOffset: 34
  },
  trainingDummy: {
    maxHealth: 100,
    respawnMs: 3000,
    knockbackForce: 130,
    maxKnockbackSpeed: 180,
    hitRadius: 22
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
      damage: 28,
      knockbackScale: 0.55
    }
  }
};

export type BalanceConfig = typeof GAME_BALANCE;
