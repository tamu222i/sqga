export interface BddStep {
  type: 'GIVEN' | 'WHEN' | 'THEN';
  description: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export interface BddScenarioResult {
  title: string;
  featureName: string;
  passed: boolean;
  steps: BddStep[];
}

export class BddScenarioContext {
  public data: Record<string, unknown> = {};
  public steps: BddStep[] = [];

  public async step(type: 'GIVEN' | 'WHEN' | 'THEN', description: string, fn: () => void | Promise<void>) {
    const start = performance.now();
    try {
      await fn();
      this.steps.push({
        type,
        description,
        passed: true,
        durationMs: performance.now() - start,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.steps.push({
        type,
        description,
        passed: false,
        error: message,
        durationMs: performance.now() - start,
      });
      throw err;
    }
  }

  public given(description: string, fn: () => void | Promise<void>) {
    return this.step('GIVEN', description, fn);
  }

  public when(description: string, fn: () => void | Promise<void>) {
    return this.step('WHEN', description, fn);
  }

  public then(description: string, fn: () => void | Promise<void>) {
    return this.step('THEN', description, fn);
  }
}

export type ScenarioFn = (ctx: BddScenarioContext) => Promise<void> | void;

export interface BddFeature {
  name: string;
  description: string;
  scenarios: {
    title: string;
    run: ScenarioFn;
  }[];
}
