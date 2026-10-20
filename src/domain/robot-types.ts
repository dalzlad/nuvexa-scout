export type Motion = "stopped" | "forward" | "reverse" | "left" | "right";
export type Direction = "north" | "south" | "east" | "west";
export type Command = Exclude<Motion, "stopped">;
export type RobotEvent = { id: number; timestamp: string; description: string };
export type RobotState = {
  motion: Motion;
  direction: Direction;
  connected: boolean;
  battery: number;
  speed: number;
  obstacle: boolean;
  obstacleDistance: number | null;
  events: RobotEvent[];
  nextEventId: number;
};
export type Clock = () => Date;
