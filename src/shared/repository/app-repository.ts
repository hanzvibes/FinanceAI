import type { AppState } from "@/shared/types/domain";

export interface AppRepository {
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<void>;
  clear(): Promise<void>;
}
