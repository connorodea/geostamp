import type { License } from "./licensing/types";
import type { UsageState } from "./usage";

export interface Activation {
  license: License;
  usage: UsageState;
}

export interface ActivationStore {
  load(): Promise<Activation | null>;
  save(activation: Activation): Promise<void>;
  clear(): Promise<void>;
}

export class InMemoryActivationStore implements ActivationStore {
  constructor(private current: Activation | null = null) {}
  async load(): Promise<Activation | null> {
    return this.current;
  }
  async save(activation: Activation): Promise<void> {
    this.current = activation;
  }
  async clear(): Promise<void> {
    this.current = null;
  }
}
