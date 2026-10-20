import type { Clock, RobotEvent, RobotState } from "./robot-types";

export const MAX_EVENTS = 100;
export function initialState(): RobotState {
  return { motion: "stopped", direction: "north", connected: true, battery: 86, speed: 0, obstacle: false, obstacleDistance: null, events: [], nextEventId: 1 };
}
export function addEvent(state: RobotState, description: string, clock: Clock): RobotState {
  const event: RobotEvent = { id: state.nextEventId, timestamp: clock().toISOString(), description };
  return { ...state, events: [event, ...state.events].slice(0, MAX_EVENTS), nextEventId: state.nextEventId + 1 };
}
