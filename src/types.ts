export type ZnForm = 'granule' | 'powder';

export type HClConcentration = 0.5 | 1.0 | 2.0;

export interface LabChemicalState {
  hasZn: boolean;
  znForm: ZnForm;
  znMass: number; // in grams (e.g. 1.0g initial)
  initialZnMass: number;
  hasHCl: boolean;
  hclVolume: number; // in mL (e.g. 10 mL)
  hclConcentration: HClConcentration;
  initialHClMoles: number;
  remainingHClMoles: number;
  temperature: number; // in Celsius (starts at 25°C)
  targetBurnerTemp: number; // target heat when burner is active (e.g. 65°C)
  isBurnerOn: boolean;
  isBurnerUnderTube: boolean;
  isStirring: boolean;
  reactionProgress: number; // 0 to 100%
  gasVolumeH2: number; // in mL
  reactionRate: number; // relative rate 0 to 100
  bubblesPerSec: number;
  timeElapsed: number; // in seconds
  isReactionFinished: boolean;
}

export interface SafetyState {
  goggles: boolean;
  gloves: boolean;
  labCoat: boolean;
  exhaustFan: boolean;
}

export interface SafetyAlert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  ruleCode?: string;
  time: string;
}

export interface DataPoint {
  time: number;
  gasVolume: number;
  rate: number;
  temp: number;
}

export interface MicroParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'H+' | 'Cl-' | 'Zn2+' | 'H2' | 'H2O';
  radius: number;
  color: string;
}
