import type { RobotController } from "../../application/robot-controller";
import { directionAfter, movementAllowed, SPEEDS } from "../../domain/robot-rules";
import { addEvent, initialState } from "../../domain/robot-state";
import type { Clock, Command, RobotState } from "../../domain/robot-types";

export class SimulatedRobot implements RobotController {
  private state: RobotState;
  private listeners = new Set<(state: RobotState) => void>();
  constructor(private readonly clock: Clock = () => new Date()) {
    this.state = addEvent(initialState(), "Simulación iniciada", clock);
  }
  getState(): RobotState { return this.state; }
  subscribe(listener: (state: RobotState) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  private commit(state: RobotState): RobotState { this.state = state; this.listeners.forEach((listener) => listener(state)); return state; }
  move(command: Command): { accepted: boolean; reason?: string; state: RobotState } {
    const reason = movementAllowed(this.state, command);
    if (reason) {
      const state = this.commit(addEvent(this.state, `Orden rechazada: ${reason}`, this.clock));
      return { accepted: false, reason, state };
    }
    const state = this.commit(addEvent({ ...this.state, motion: command, direction: directionAfter(this.state.direction, command), speed: SPEEDS[command] }, `Movimiento: ${labels[command]}`, this.clock));
    return { accepted: true, state };
  }
  stop(): RobotState {
    if (this.state.motion === "stopped") return this.state;
    return this.commit(addEvent({ ...this.state, motion: "stopped", speed: 0 }, "Robot detenido manualmente", this.clock));
  }
  setObstacle(active: boolean): RobotState {
    if (this.state.obstacle === active) return this.state;
    let state: RobotState = { ...this.state, obstacle: active, obstacleDistance: active ? 0.35 : null };
    if (active && state.motion === "forward") {
      state = { ...state, motion: "stopped", speed: 0 };
      state = addEvent(state, "Detención automática: obstáculo crítico detectado", this.clock);
    }
    return this.commit(addEvent(state, active ? "Obstáculo crítico activado (0,35 m)" : "Obstáculo retirado", this.clock));
  }
  setConnection(connected: boolean): RobotState {
    if (this.state.connected === connected) return this.state;
    let state = { ...this.state, connected };
    if (!connected && state.motion !== "stopped") state = { ...state, motion: "stopped", speed: 0 };
    return this.commit(addEvent(state, connected ? "Conexión simulada restablecida" : "Conexión simulada perdida; robot detenido", this.clock));
  }
  reset(): RobotState {
    return this.commit(addEvent(initialState(), "Simulación reiniciada", this.clock));
  }
}
const labels: Record<Command, string> = { forward: "avanzando", reverse: "retrocediendo", left: "giro a la izquierda", right: "giro a la derecha" };
