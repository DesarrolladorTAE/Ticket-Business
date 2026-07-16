import { Routes, Route, Navigate } from "react-router-dom";

import IniciarSesion from "../auth/pages/IniciarSesion";
import Registro from "../auth/pages/Registro";

import Dashboard from "../modules/tickets/pages/Dashboard";

import TicketDetalle from "../modules/tickets/pages/TicketDetalle";
import MisTickets from "../modules/tickets/pages/MisTickets";

import CrearAgente from "../modules/agents/pages/CrearAgente";
import Agentes from "../modules/agents/pages/Agentes";

import Sistemas from "../modules/tickets/pages/Sistemas";
import Secciones from "../modules/tickets/pages/Secciones";
import TicketPublicoCrear from "../modules/tickets/pages/TicketPublicoCrear";
import TicketPublicoHistorial from "../modules/tickets/pages/TicketPublicoHistorial";
import ExternalApiLogs from "../modules/tickets/pages/ExternalApiLogs";
import ExternalApiTokens from "../modules/tickets/pages/ExternalApiTokens";
import ExternalApiDashboard from "../modules/tickets/pages/ExternalApiDashboard";
import GeneralMetricsDashboard from "../modules/metrics/pages/GeneralMetricsDashboard";

import GruposSoporte from "../modules/support-groups/pages/GruposSoporte";

import RutaProtegida from "./RutaProtegida";
import AdminLayout from "../layouts/AdminLayout";

const normalizarRol = (rol) => {
  return String(rol || "")
    .trim()
    .toLowerCase();
};

function RutaPorRol({ roles, children }) {
  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("USUARIO"));
  } catch (error) {
    usuario = null;
  }

  const token = localStorage.getItem("TOKEN");

  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  const rolesBase = Array.isArray(usuario?.roles) ? usuario.roles : [];

  const userRoles = [
    ...rolesBase,
    usuario?.role,
    usuario?.company_role,
  ]
    .filter(Boolean)
    .map((rol) => normalizarRol(rol));

  const rolesPermitidos = roles.map((rol) => normalizarRol(rol));

  const permitido = rolesPermitidos.some((rolPermitido) =>
    userRoles.includes(rolPermitido),
  );

  if (!permitido) {
    return <Navigate to="/mis-tickets" replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<IniciarSesion />} />
      <Route path="/registro" element={<Registro />} />

      <Route
        path="/public/s/:systemId/:prefix"
        element={<TicketPublicoCrear />}
      />

      <Route
        path="/public/tickets/:trackingCode"
        element={<TicketPublicoHistorial />}
      />

      {/* PROTEGIDO */}
      <Route
        element={
          <RutaProtegida>
            <AdminLayout />
          </RutaProtegida>
        }
      >
        {/* DASHBOARD */}
        <Route
          path="/paneladministrador"
          element={
            <RutaPorRol
              roles={[
                "Administrador",
                "admin",
                "Agente",
                "agent",
                "Supervisor",
                "supervisor",
              ]}
            >
              <Dashboard />
            </RutaPorRol>
          }
        />

        {/* MÉTRICAS GENERALES */}
        <Route
          path="/metricas-generales"
          element={
            <RutaPorRol
              roles={[
                "Administrador",
                "admin",
                "Supervisor",
                "supervisor",
                "Agente",
                "agent",
                "Cliente",
                "client",
              ]}
            >
              <GeneralMetricsDashboard />
            </RutaPorRol>
          }
        />

        {/* API EXTERNA - SOLO ADMINISTRADOR */}
        <Route
          path="/external-api"
          element={
            <RutaPorRol roles={["Administrador", "admin"]}>
              <ExternalApiDashboard />
            </RutaPorRol>
          }
        />

        <Route
          path="/external-api/logs"
          element={
            <RutaPorRol roles={["Administrador", "admin"]}>
              <ExternalApiLogs />
            </RutaPorRol>
          }
        />

        <Route
          path="/external-api/tokens"
          element={
            <RutaPorRol roles={["Administrador", "admin"]}>
              <ExternalApiTokens />
            </RutaPorRol>
          }
        />

        {/* MIS TICKETS */}
        <Route
          path="/mis-tickets"
          element={
            <RutaPorRol
              roles={[
                "Administrador",
                "admin",
                "Agente",
                "agent",
                "Supervisor",
                "supervisor",
                "Cliente",
                "client",
              ]}
            >
              <MisTickets />
            </RutaPorRol>
          }
        />

        {/* DETALLE TICKET */}
        <Route
          path="/tickets/:id"
          element={
            <RutaPorRol
              roles={[
                "Administrador",
                "admin",
                "Agente",
                "agent",
                "Supervisor",
                "supervisor",
                "Cliente",
                "client",
              ]}
            >
              <TicketDetalle />
            </RutaPorRol>
          }
        />

        {/* AGENTES - LISTADO */}
        <Route
          path="/agentes"
          element={
            <RutaPorRol
              roles={[
                "Administrador",
                "admin",
                "Supervisor",
                "supervisor",
              ]}
            >
              <Agentes />
            </RutaPorRol>
          }
        />

        {/* AGENTES - CREAR */}
        <Route
          path="/agents/nuevo"
          element={
            <RutaPorRol
              roles={[
                "Administrador",
                "admin",
                "Supervisor",
                "supervisor",
              ]}
            >
              <CrearAgente />
            </RutaPorRol>
          }
        />

        {/* SISTEMAS - SOLO ADMINISTRADOR */}
        <Route
          path="/sistemas"
          element={
            <RutaPorRol roles={["Administrador", "admin"]}>
              <Sistemas />
            </RutaPorRol>
          }
        />

        {/* SECCIONES - ADMINISTRADOR Y SUPERVISOR */}
        <Route
          path="/secciones"
          element={
            <RutaPorRol
              roles={[
                "Administrador",
                "admin",
                "Supervisor",
                "supervisor",
              ]}
            >
              <Secciones />
            </RutaPorRol>
          }
        />

        {/* GRUPOS SOPORTE - ADMINISTRADOR Y SUPERVISOR */}
        <Route
          path="/grupos-soporte"
          element={
            <RutaPorRol
              roles={[
                "Administrador",
                "admin",
                "Supervisor",
                "supervisor",
              ]}
            >
              <GruposSoporte />
            </RutaPorRol>
          }
        />
      </Route>

      {/* CATCH ALL */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;