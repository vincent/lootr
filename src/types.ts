export interface ILootr {
  constructor(name: string): ILootr;
  items: string[];
  modifiers: Modifier[];
}

export type Modifier = {
  name?: string;
  [key: string]: string | number | CallableFunction;
};

export type Nesting = number;
export type Threshold = number;

export type Item = {
  name: string;
  stack?: boolean;
  modifier?: Modifier;
  [key: string]: any;
};

export type LootTable = LootTableRow[];

export type LootTableRow = {
  from: string;
  luck?: number;
  stack?: number;
  modify?: boolean;
  depth?: number;
};
