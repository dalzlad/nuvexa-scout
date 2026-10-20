import type { Command, RobotState } from "../domain/robot-types";

export interface RobotController {
  getState(): RobotState;
  move(command: Command): { accepted: boolean; reason?: string; state: RobotState };
  stop(): RobotState;
  setObstacle(active: boolean): RobotState;
  setConnection(connected: boolean): RobotState;
  reset(): RobotState;
  subscribe(listener: (state: RobotState) => void): () => void;
}
