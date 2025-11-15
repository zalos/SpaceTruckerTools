export interface YieldDestination {
  location: string;
  price: number;
}

export interface YieldItem {
  name: string;
  destinations: YieldDestination[];
}

export interface ItemColor {
  item: string;
  color: string;
}

export interface JumpRoute {
  from: string;
  to: string;
  range: string;
  notes?: string;
}

export interface YieldRowState {
  itemName: string;
  destinations: YieldDestination[];
  yield: number;
  scu: number;
  selectedDestination: string;
  pricePerScu: number;
  total: number;
  color?: string;
}

export interface RockMaterialInput {
  name: string;
  percentage: number;
}

export interface RockCompositionSnapshot {
  id: string;
  rockSize: number;
  inertFilter: number;
  materials: RockMaterialInput[];
  savedAt: string;
}
