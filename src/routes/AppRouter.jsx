import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/context/AuthContext";

import IniciarSesion from "../auth/pages/IniciarSesion";
import Registro from "../auth/pages/Registro";
import OlvideContrasena from "../auth/pages/OlvideContrasena";
import RestablecerContrasena from "../auth/pages/RestablecerContrasena";
import VerificarCorreo from "../auth/pages/VerificarCorreo";


import Dashboard from "../modules/tickets/pages/Dashboard";

import TicketDetalle from "../modules/tickets/pages/TicketDetalle";
import MisTickets from "../modules/tickets/pages/MisTickets";
import TicketCompartido from "../modules/tickets/pages/TicketCompartido";

import CrearAgente from "../modules/agents/pages/CrearAgente";
import Agentes from "../modules/agents/pages/Agentes";
import Clientes from "../modules/clients/pages/Clientes";

import Sistemas from "../modules/tickets/pages/Sistemas";
import Secciones from "../modules/tickets/pages/Secciones";
import Etiquetas from "../modules/tickets/pages/Etiquetas";
import TicketPublicoCrear from "../modules/tickets/pages/TicketPublicoCrear";
import TicketPublicoHistorial from "../modules/tickets/pages/TicketPublicoHistorial";
import ExternalApiLogs from "../modules/tickets/pages/ExternalApiLogs";
import ExternalApiTokens from "../modules/tickets/pages/ExternalApiTokens";
import ExternalApiDashboard from "../modules/tickets/pages/ExternalApiDashboard";
import GeneralMetricsDashboard from "../modules/metrics/pages/GeneralMetricsDashboard";
import MiPerfil from "../modules/profile/pages/MiPerfil";

import GruposSoporte from "../modules/support-groups/pages/GruposSoporte";

import RutaProtegida from "./RutaProtegida";
import AdminLayout from "../layouts/AdminLayout";
import LandingPage from "../landing/pages/LandingPage";
import ComoFuncionaPage from "../landing/pages/ComoFuncionaPage";
import BeneficiosPage from "../landing/pages/BeneficiosPage";

const normalizarRol = (rol) => {
  return String(rol || "")
    .trim()
    .toLowerCase();
};

function RutaPorRol({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /*
   * El rol de la empresa actual tiene prioridad.
   *
   * Esto es importante porque un usuario puede tener roles generales,
   * pero dentro de la empresa actual debe respetarse company_role.
   */
  const companyRole = normalizarRol(
    user?.company_role || user?.role,
  );

  const rolesGlobales = Array.isArray(user?.roles)
    ? user.roles.map((rol) => normalizarRol(rol))
    : [];

  const userRoles = companyRole
    ? [companyRole]
    : rolesGlobales;

  const rolesPermitidos = roles.map((rol) =>
    normalizarRol(rol),
  );

  const permitido = rolesPermitidos.some(
    (rolPermitido) => userRoles.includes(rolPermitido),
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
      <Route path="/beneficios" element={<BeneficiosPage />} />
      <Route path="/como-funciona" element={<ComoFuncionaPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<IniciarSesion />} />
      <Route path="/registro" element={<Registro />} />

      <Route path="/olvide-contrasena" element={<OlvideContrasena />} />

      <Route
        path="/restablecer-contrasena"
        element={<RestablecerContrasena />}
      />

      <Route path="/verificar-correo" element={<VerificarCorreo />} />

      <Route
        path="/public/s/:systemId/:prefix"
        element={<TicketPublicoCrear />}
      />

      <Route
        path="/public/tickets/:trackingCode"
        element={<TicketPublicoHistorial />}
      />

      <Route
        path="/public/shared-tickets/:trackingCode"
        element={<TicketCompartido />}
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

        {/* ETIQUETAS - ADMINISTRADOR Y SUPERVISOR */}
        <Route
          path="/etiquetas"
          element={
            <RutaPorRol
              roles={["Administrador", "admin", "Supervisor", "supervisor"]}
            >
              <Etiquetas />
            </RutaPorRol>
          }
        />

        {/* MI PERFIL */}
        <Route
          path="/mi-perfil"
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
              <MiPerfil />
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
              roles={["Administrador", "admin", "Supervisor", "supervisor"]}
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
              roles={["Administrador", "admin", "Supervisor", "supervisor"]}
            >
              <CrearAgente />
            </RutaPorRol>
          }
        />

        {/* CLIENTES */}
        <Route
          path="/clientes"
          element={
            <RutaPorRol
              roles={[
                "Administrador",
                "admin",
                "Supervisor",
                "supervisor",
                "Agente",
                "agent",
              ]}
            >
              <Clientes />
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
              roles={["Administrador", "admin", "Supervisor", "supervisor"]}
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
              roles={["Administrador", "admin", "Supervisor", "supervisor"]}
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