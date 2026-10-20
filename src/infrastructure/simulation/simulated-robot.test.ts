import { describe, expect, it } from "vitest";
import { MAX_EVENTS, initialState } from "../../domain/robot-state";
import { SimulatedRobot } from "./simulated-robot";

describe("SimulatedRobot", () => {
  it("starts safely and supports one active movement at a time", () => {
    const robot = new SimulatedRobot();
    expect(robot.getState()).toMatchObject({ motion: "stopped", speed: 0, battery: 86, connected: true });
    expect(robot.move("forward").accepted).toBe(true);
    expect(robot.move("left").state).toMatchObject({ motion: "left", speed: 0.25, direction: "west" });
    expect(robot.stop()).toMatchObject({ motion: "stopped", speed: 0 });
  });
  it("stops on obstacle, blocks forward, and does not resume automatically", () => {
    const robot = new SimulatedRobot(); robot.move("forward");
    robot.setObstacle(true);
    expect(robot.getState()).toMatchObject({ motion: "stopped", speed: 0, obstacleDistance: 0.35 });
    expect(robot.move("forward").accepted).toBe(false);
    robot.setObstacle(false);
    expect(robot.getState().motion).toBe("stopped");
    expect(robot.move("reverse").accepted).toBe(true);
  });
  it("stops on simulated disconnect, allows stop, and reset restores safe state", () => {
    const robot = new SimulatedRobot(); robot.move("forward"); robot.setConnection(false);
    expect(robot.getState()).toMatchObject({ motion: "stopped", speed: 0, connected: false });
    expect(robot.move("reverse").accepted).toBe(false);
    expect(robot.stop().speed).toBe(0);
    const reset = robot.reset();
    expect(reset).toMatchObject({ ...initialState(), events: [expect.objectContaining({ description: "Simulación reiniciada" })], nextEventId: 2 });
  });
  it("records timestamped events and caps history at 100", () => {
    const robot = new SimulatedRobot(() => new Date("2026-01-01T00:00:00Z"));
    for (let i = 0; i < 120; i++) robot.move(i % 2 ? "left" : "right");
    expect(robot.getState().events).toHaveLength(MAX_EVENTS);
    expect(robot.getState().events[0].timestamp).toBe("2026-01-01T00:00:00.000Z");
    expect(robot.getState().events.some((event) => event.description.includes("rechazada"))).toBe(false);
  });
  it("clamps battery in the initial model", () => { expect(initialState().battery).toBeGreaterThanOrEqual(0); expect(initialState().battery).toBeLessThanOrEqual(100); });
});
