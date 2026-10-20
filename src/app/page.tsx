"use client";

import { useEffect, useState } from "react";
import { Activity, Battery, Bot, Cable, ChevronDown, CircleHelp, Gauge, LayoutDashboard, Map, Radio, RotateCcw, ShieldCheck, TriangleAlert, Wifi, WifiOff, Zap } from "lucide-react";
import { SimulatedRobot } from "@/infrastructure/simulation/simulated-robot";
import type { Command, RobotState } from "@/domain/robot-types";

const motionNames: Record<RobotState["motion"], string> = { stopped: "Detenido", forward: "Avanzando", reverse: "Retrocediendo", left: "Girando izquierda", right: "Girando derecha" };
const directions: Record<RobotState["direction"], string> = { north: "Norte", south: "Sur", east: "Este", west: "Oeste" };

export default function Dashboard() {
  const [robot] = useState(() => new SimulatedRobot());
  const [state, setState] = useState<RobotState>(() => robot.getState());
  const [notice, setNotice] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return robot.subscribe(setState);
  }, [robot]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      const mapping: Record<string, Command | "stop"> = { ArrowUp: "forward", ArrowDown: "reverse", ArrowLeft: "left", ArrowRight: "right", Escape: "stop" };
      const command = mapping[event.key]; if (!command) return;
      event.preventDefault();
      if (command === "stop") robot.stop(); else { const result = robot.move(command); if (!result.accepted) setNotice(result.reason ?? "Orden rechazada"); else setNotice(""); }
    };
    const stopOnBlur = () => robot.stop();
    window.addEventListener("keydown", handleKey); window.addEventListener("blur", stopOnBlur);
    return () => { window.removeEventListener("keydown", handleKey); window.removeEventListener("blur", stopOnBlur); };
  }, [robot]);
  const move = (command: Command) => { const result = robot.move(command); setNotice(result.accepted ? "" : result.reason ?? "Orden rechazada"); };
  const heading = ({ north: "rotate(0deg)", east: "rotate(90deg)", south: "rotate(180deg)", west: "rotate(-90deg)" } as const)[state.direction];
  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Bot size={22}/></div><div><strong>NUVEXA</strong><span>SCOUT</span></div></div>
      <div className="workspace-label">ESPACIO DE TRABAJO</div>
      <nav aria-label="Navegación principal"><a className="nav-link active" href="#dashboard"><LayoutDashboard size={18}/> Panel de control</a><a className="nav-link" href="#sensors"><Activity size={18}/> Sensores</a><a className="nav-link" href="#events"><Map size={18}/> Registro de eventos</a></nav>
      <div className="sidebar-bottom"><div className="help-card"><CircleHelp size={18}/><div><strong>Centro de ayuda</strong><span>Guía de simulación</span></div><ChevronDown size={15}/></div><div className="profile"><div className="avatar">NS</div><div><strong>Operador local</strong><span>Modo simulación</span></div><span className="online-dot"/></div></div>
    </aside>
    <section className="main-area" id="dashboard">
      <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>Panel de control</strong></div><div className="top-actions"><span className="simulation-badge"><span/> MODO SIMULACIÓN</span><span className={`connection-pill ${state.connected ? "" : "offline"}`}>{state.connected ? <Wifi size={14}/> : <WifiOff size={14}/>} Conexión {state.connected ? "activa" : "desconectada"}</span><button className="reset-button" onClick={() => { robot.reset(); setNotice("Simulación restablecida en estado seguro."); }}><RotateCcw size={15}/> Reiniciar</button></div></header>
      <div className="content"><div className="page-heading"><div><p className="eyebrow">SUPERVISIÓN LOCAL <span>•</span> ENTORNO DE PRUEBAS</p><h1>Panel de control</h1><p className="subtitle">Supervisa y controla tu unidad móvil en un entorno simulado.</p></div><div className="system-state"><span className="system-dot"/><span>Sistema operativo</span><small>SIMULADOR LOCAL</small></div></div>
        <div className="metrics-grid">
          <Metric icon={<Bot/>} label="Estado del robot" value={motionNames[state.motion]} detail={`Dirección ${directions[state.direction]}`} accent={state.motion !== "stopped"}/>
          <Metric icon={<Battery/>} label="Batería" value={`${state.battery}%`} detail="Nivel simulado" meter={state.battery}/>
          <Metric icon={<Gauge/>} label="Velocidad" value={`${state.speed.toFixed(2)} m/s`} detail="Velocidad simulada"/>
          <Metric icon={state.connected ? <Wifi/> : <WifiOff/>} label="Conexión" value={state.connected ? "Conectado" : "Desconectado"} detail="Estado simulado" accent={state.connected}/>
          <Metric icon={<TriangleAlert/>} label="Distancia obstáculo" value={state.obstacleDistance === null ? "—" : `${state.obstacleDistance.toFixed(2)} m`} detail={state.obstacle ? "Obstáculo detectado" : "Sin obstáculo"} warning={state.obstacle}/>
        </div>
        <div className="dashboard-grid">
          <section className="panel robot-panel"><div className="panel-header"><div><h2>Vista del entorno</h2><p>Representación visual del estado actual</p></div><span className="live-tag"><span/> EN VIVO</span></div>
            <div className="scene"><div className="scene-grid"/><span className="scene-label north">N</span><span className="scene-label east">E</span><span className="scene-label south">S</span><span className="scene-label west">O</span><div className="range-ring ring-one"/><div className="range-ring ring-two"/><div className="robot-position"><div className={`robot-illustration ${state.motion !== "stopped" ? "moving" : ""}`} style={{ transform: heading }}><div className="robot-nose"/><div className="robot-body"><div className="robot-eye left-eye"/><div className="robot-eye right-eye"/><div className="robot-center"/></div><div className="robot-wheel wheel-left"/><div className="robot-wheel wheel-right"/></div><span className="robot-caption">SCOUT-01</span></div>{state.obstacle && <div className="obstacle-marker"><TriangleAlert size={18}/><span>OBSTÁCULO<br/>0,35 m</span></div>}<div className="scene-coordinates">SIMULACIÓN 2D <span>•</span> ORIENTACIÓN {directions[state.direction].toUpperCase()}</div></div>
            <div className="scene-footer"><div className="legend"><span className="legend-robot"/> Unidad móvil <span className="legend-obstacle"/> Obstáculo crítico</div><div className="sensor-state"><span className={`sensor-dot ${state.obstacle ? "warning" : ""}`}/>{state.obstacle ? "Obstáculo detectado" : "Entorno despejado"}</div></div>
          </section>
          <section className="panel controls-panel"><div className="panel-header"><div><h2>Control de movimiento</h2><p>Usa los controles o las flechas del teclado</p></div><span className="keyboard-hint">⌘ CTRL</span></div><div className="control-pad" aria-label="Controles de movimiento"><button className={`direction-button forward ${state.motion === "forward" ? "selected" : ""}`} onClick={() => move("forward")} disabled={!state.connected || state.obstacle} aria-label="Avanzar"><span>↑</span></button><button className={`direction-button left ${state.motion === "left" ? "selected" : ""}`} onClick={() => move("left")} disabled={!state.connected} aria-label="Girar a la izquierda"><span>←</span></button><button className="direction-button stop" onClick={() => { robot.stop(); setNotice(""); }} aria-label="Detener robot"><span>■</span></button><button className={`direction-button right ${state.motion === "right" ? "selected" : ""}`} onClick={() => move("right")} disabled={!state.connected} aria-label="Girar a la derecha"><span>→</span></button><button className={`direction-button reverse ${state.motion === "reverse" ? "selected" : ""}`} onClick={() => move("reverse")} disabled={!state.connected} aria-label="Retroceder"><span>↓</span></button></div><div className="control-state"><span className="state-indicator"/><div><strong>{motionNames[state.motion]}</strong><span>Orden actual del simulador</span></div></div>{notice && <p role="status" className="notice">{notice}</p>}<p className="control-footnote"><ShieldCheck size={14}/> Detención siempre disponible</p></section>
        </div>
        <div className="lower-grid"><section className="panel sensor-panel" id="sensors"><div className="panel-header"><div><h2>Estado de sensores</h2><p>Lecturas generadas por el simulador</p></div><span className="sim-tag">SIMULADO</span></div><div className="sensor-reading"><div className={`sensor-icon ${state.obstacle ? "alert" : ""}`}><Radio size={20}/></div><div className="sensor-copy"><strong>Sensor frontal</strong><span>{state.connected ? "Activo · Sensor simulado" : "Sin conexión simulada"}</span></div><div className={`sensor-value ${state.obstacle ? "danger-text" : ""}`}>{state.obstacle ? "0,35 m" : "Libre"}</div></div><div className={`block-banner ${state.obstacle ? "blocked" : "clear"}`}><div>{state.obstacle ? <TriangleAlert size={17}/> : <ShieldCheck size={17}/>}<span>{state.obstacle ? "Avance bloqueado por obstáculo" : "Avance disponible"}</span></div><span className="mini-switch" aria-hidden="true"/></div><div className="sensor-actions"><button className={state.obstacle ? "secondary-button" : "primary-button"} onClick={() => robot.setObstacle(!state.obstacle)}><Zap size={15}/>{state.obstacle ? "Retirar obstáculo" : "Simular obstáculo"}</button><button className="text-button" onClick={() => robot.setConnection(!state.connected)}>{state.connected ? "Desconectar simulación" : "Reconectar simulación"}</button></div><p className="safety-note">La simulación no representa mediciones físicas ni evita colisiones reales.</p></section>
            <section className="panel events-panel" id="events"><div className="panel-header"><div><h2>Registro de eventos</h2><p>Actividad reciente de la simulación</p></div><span className="event-count">{state.events.length} eventos</span></div><div className="event-list">{state.events.length === 0 ? <div className="empty-events">Aún no hay eventos registrados.</div> : state.events.slice(0, 7).map((event, index) => <div className="event-row" key={event.id}><div className={`event-icon ${index === 0 ? "recent" : ""}`}><Activity size={14}/></div><div className="event-description"><span>{event.description}</span><time dateTime={event.timestamp}>{mounted ? new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(event.timestamp)) : "--:--:--"}</time></div><span className="event-status"/></div>)}</div><p className="history-note">Se conservan hasta 100 eventos durante esta sesión.</p></section></div>
        <footer className="page-footer"><span>NUVEXA SCOUT <span className="footer-separator">/</span> SIMULADOR LOCAL</span><span><Cable size={13}/> Sin conexión a hardware físico</span></footer>
      </div>
    </section>
  </main>;
}

function Metric({ icon, label, value, detail, meter, accent = false, warning = false }: { icon: React.ReactNode; label: string; value: string; detail: string; meter?: number; accent?: boolean; warning?: boolean }) {
  return <article className={`metric-card ${warning ? "warning-card" : ""}`}><div className="metric-top"><span className={`metric-icon ${warning ? "warning-icon" : ""}`}>{icon}</span>{meter !== undefined && <span className="metric-trend"><span/></span>}{accent && meter === undefined && <span className="metric-dot"/>}</div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-detail">{detail}</span>{meter !== undefined && <div className="battery-meter"><span style={{ width: `${meter}%` }}/></div>}</article>;
}
