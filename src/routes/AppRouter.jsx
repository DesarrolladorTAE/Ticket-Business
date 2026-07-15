import { Routes, Route, Navigate } from "react-router-dom";

import IniciarSesion from "../auth/pages/IniciarSesion";
import Registro from "../auth/pages/Registro";

import Dashboard from "../modules/tickets/pages/Dashboard";

import TicketDetalle from "../modules/tickets/pages/TicketDetalle";
import MisTickets from "../modules/tickets/pages/MisTickets";

import CrearAgente from "../modules/agents/pages/CrearAgente";

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

function RutaPorRol({ roles, children }) {
  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("USUARIO"));
  } catch (e) {
    usuario = null;
  }

  const userRoles = usuario?.roles || [];

  const permitido =
    Array.isArray(userRoles) && roles.some((r) => userRoles.includes(r));

  if (!usuario || !permitido) {
    return <Navigate to="/login" replace />;
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
            <RutaPorRol roles={["Administrador", "Agente", "Supervisor"]}>
              <Dashboard />
            </RutaPorRol>
          }
        />
        <Route path="/external-api" element={<ExternalApiDashboard />} />
        <Route path="/external-api/logs" element={<ExternalApiLogs />} />
        <Route path="/external-api/tokens" element={<ExternalApiTokens />} />
        <Route path="/metricas-generales" element={<GeneralMetricsDashboard />} />

        {/* MIS TICKETS */}
        <Route
          path="/mis-tickets"
          element={
            <RutaPorRol
              roles={["Administrador", "Agente", "Supervisor", "Cliente"]}
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
              roles={["Administrador", "Agente", "Supervisor", "Cliente"]}
            >
              <TicketDetalle />
            </RutaPorRol>
          }
        />

        {/* AGENTES */}
        <Route
          path="/agents/nuevo"
          element={
            <RutaPorRol roles={["Administrador", "Supervisor"]}>
              <CrearAgente />
            </RutaPorRol>
          }
        />

        {/* SISTEMAS */}
        <Route
          path="/sistemas"
          element={
            <RutaPorRol roles={["Administrador"]}>
              <Sistemas />
            </RutaPorRol>
          }
        />

        {/* SECCIONES */}
        <Route
          path="/secciones"
          element={
            <RutaPorRol roles={["Administrador"]}>
              <Secciones />
            </RutaPorRol>
          }
        />

        {/* GRUPOS SOPORTE */}
        <Route
          path="/grupos-soporte"
          element={
            <RutaPorRol roles={["Administrador"]}>
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
