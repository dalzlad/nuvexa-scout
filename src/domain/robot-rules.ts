import type { Command, Direction, Motion, RobotState } from "./robot-types";

export const SPEEDS: Record<Exclude<Motion, "stopped">, number> = { forward: 0.6, reverse: 0.35, left: 0.25, right: 0.25 };
export function directionAfter(direction: Direction, command: Command): Direction {
  if (command === "left") return ({ north: "west", west: "south", south: "east", east: "north" } as const)[direction];
  if (command === "right") return ({ north: "east", east: "south", south: "west", west: "north" } as const)[direction];
  return direction;
}
export function movementAllowed(state: RobotState, command: Command): string | null {
  if (!state.connected) return "Conexión simulada desconectada";
  if (command === "forward" && state.obstacle) return "Avance bloqueado: obstáculo crítico detectado";
  return null;
}
