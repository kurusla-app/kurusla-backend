import { RoundUpStep } from '@prisma/client';

export const ALLOWED_ROUND_UP_VALUES = [5, 10, 50] as const;
export type AllowedRoundUpValue = (typeof ALLOWED_ROUND_UP_VALUES)[number];

export function roundUpStepToNumber(step: RoundUpStep): AllowedRoundUpValue {
  switch (step) {
    case RoundUpStep.STEP_5:
      return 5;
    case RoundUpStep.STEP_50:
      return 50;
    case RoundUpStep.STEP_10:
    default:
      return 10;
  }
}

export function numberToRoundUpStep(value: number): RoundUpStep {
  if (value === 5) return RoundUpStep.STEP_5;
  if (value === 50) return RoundUpStep.STEP_50;
  return RoundUpStep.STEP_10;
}

export function isAllowedRoundUpValue(value: number): value is AllowedRoundUpValue {
  return value === 5 || value === 10 || value === 50;
}
