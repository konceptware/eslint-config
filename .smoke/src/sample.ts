export const answer: number = 42;

export function leak(): void {
  Promise.resolve().then(() => undefined);
}

export * from "./other";
