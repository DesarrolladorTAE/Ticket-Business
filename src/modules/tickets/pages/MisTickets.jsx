import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosCliente from "../../../services/axiosCliente";
import Swal from "sweetalert2";
import NuevoTicketModal from "../components/NuevoTicketModal";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Divider,
} from "@mui/material";

const API_ORIGIN = "https://api.thebusinessticket.com";

function MisTickets() {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("USUARIO") || "null");
  const roles = usuario?.roles || [];

  const [tickets, setTickets] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openNuevoTicket, setOpenNuevoTicket] = useState(false);

  useEffect(() => {
    cargarTickets();
  }, []);

  const cargarTickets = async () => {
    setLoading(true);

    try {
      setError("");

      const res = await axiosCliente.get("/tickets");

      setTickets(res.data.data || res.data || []);
    } catch (error) {
      console.log("ERROR CARGAR TICKETS:", error.response?.data || error);

      setError(
        error.response?.data?.message || "No se pudieron cargar los tickets",
      );
    } finally {
      setLoading(false);
    }
  };

  const eliminarTicket = async (ticket) => {
    const confirmar = await Swal.fire({
      title: "Eliminar ticket",
      text: `¿Seguro que deseas eliminar/cancelar el ticket ${
        ticket.folio || `#${ticket.id}`
      }?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!confirmar.isConfirmed) return;

    try {
      await axiosCliente.delete(`/tickets/${ticket.id}`);

      await Swal.fire({
        title: "Ticket eliminado",
        text: "El ticket fue eliminado correctamente.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      cargarTickets();
    } catch (error) {
      console.log("ERROR ELIMINAR TICKET:", error.response?.data || error);

      await Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          "No se pudo eliminar o cancelar el ticket",
        icon: "error",
      });
    }
  };

  const tomarTicket = async (ticket) => {
    try {
      await axiosCliente.post(`/tickets/${ticket.id}/take`);

      await Swal.fire({
        title: "Ticket tomado",
        text: "El ticket fue asignado correctamente.",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
      });

      cargarTickets();
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo tomar el ticket",
        icon: "error",
      });
    }
  };

  const resolverTicket = async (ticket) => {
    const confirmar = await Swal.fire({
      title: "Resolver ticket",
      text: `¿Seguro que deseas marcar como resuelto el ticket ${
        ticket.folio || `#${ticket.id}`
      }?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, resolver",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      await axiosCliente.post(`/tickets/${ticket.id}/resolve`);

      await Swal.fire({
        title: "Ticket resuelto",
        text: "El ticket fue cerrado correctamente.",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
      });

      cargarTickets();
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo resolver el ticket",
        icon: "error",
      });
    }
  };

  const tieneRol = (...permitidos) => {
    const roleDirecto = usuario?.role;

    return (
      permitidos.includes(roleDirecto) ||
      permitidos.some((rol) => roles.includes(rol))
    );
  };

  const nombreEstado = (ticket) =>
    ticket.status?.nombre || ticket.status?.name || ticket.status || "Abierto";

  const nombreSistema = (ticket) =>
    ticket.system?.nombre || ticket.sistema?.nombre || "Sin sistema";

  const nombreProblema = (ticket) =>
    ticket.category?.nombre || ticket.categoria?.nombre || "Sin problema";

  const nombrePrioridad = (ticket) =>
    ticket.priority?.nombre || ticket.prioridad?.nombre || "Sin prioridad";

  const obtenerFolio = (ticket) => {
    if (ticket.folio) return ticket.folio;

    const prefijo = ticket.folio_prefijo || "TCK";
    const numero = ticket.folio_numero || ticket.id;

    return `${prefijo}-${numero}`;
  };

  const obtenerLogoSistema = (ticket) => {
    const logo =
      ticket.system?.logo_url ||
      ticket.sistema?.logo_url ||
      ticket.system_logo_url ||
      ticket.logo_url ||
      ticket.system_logo ||
      ticket.system?.logo ||
      ticket.sistema?.logo;

    if (!logo) return null;

    if (logo.startsWith("http://") || logo.startsWith("https://")) {
      return logo;
    }

    if (logo.startsWith("storage/")) {
      return `${API_ORIGIN}/${logo}`;
    }

    if (logo.startsWith("systems/")) {
      return `${API_ORIGIN}/storage/${logo}`;
    }

    return `${API_ORIGIN}/${logo}`;
  };

  const nombreAgente = (ticket) => {
    if (!ticket.responsable) return "Sin asignar";

    return `${ticket.responsable.name || ""} ${
      ticket.responsable.apellido_paterno || ""
    } ${ticket.responsable.apellido_materno || ""}`.trim();
  };

  const colorEstado = (ticket) => {
    const estado = String(nombreEstado(ticket)).toLowerCase();

    if (estado.includes("cerr") || estado.includes("resuelto"))
      return "success";

    if (estado.includes("proceso")) return "warning";

    if (
      estado.includes("abiert") ||
      estado.includes("reciente") ||
      estado.includes("nuevo")
    ) {
      return "info";
    }

    return "default";
  };

  const puedeEliminar = (ticket) => {
    if (tieneRol("admin", "Administrador")) return true;

    return (
      tieneRol("client", "Cliente") &&
      Number(ticket.status_id) === 1
    );
  };

  const puedeTomar = (ticket) => {
    return (
      tieneRol("admin", "agent", "Administrador", "Agente") &&
      !ticket.responsable_id &&
      Number(ticket.status_id) !== 3
    );
  };

  const puedeResolver = (ticket) => {
    return (
      tieneRol("admin", "agent", "Administrador", "Agente") &&
      Number(ticket.status_id) !== 3 &&
      (tieneRol("admin", "Administrador") ||
        Number(ticket.responsable_id) === Number(usuario?.id))
    );
  };

  const ticketsFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const estado = String(nombreEstado(ticket)).toLowerCase();

      const coincideEstado =
        estadoFiltro === "todos" || estado.includes(estadoFiltro);

      const baseBusqueda = [
        ticket.folio,
        ticket.folio_prefijo,
        ticket.folio_numero,
        ticket.titulo,
        nombreSistema(ticket),
        nombreProblema(ticket),
        nombrePrioridad(ticket),
        nombreAgente(ticket),
      ]
        .join(" ")
        .toLowerCase();

      const coincideTexto = !texto || baseBusqueda.includes(texto);

      return coincideEstado && coincideTexto;
    });
  }, [tickets, busqueda, estadoFiltro]);

  const BotonesAccion = ({ ticket, compacto = false }) => (
    <Stack
      direction={compacto ? "column" : "row"}
      spacing={1}
      justifyContent="flex-end"
      alignItems={compacto ? "stretch" : "center"}
    >
      <Button
        size="small"
        variant="outlined"
        onClick={() => navigate(`/tickets/${ticket.id}`)}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 800,
          minWidth: compacto ? "100%" : 72,
        }}
      >
        Ver
      </Button>

      {puedeTomar(ticket) && (
        <Button
          size="small"
          variant="outlined"
          color="warning"
          onClick={() => tomarTicket(ticket)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            minWidth: compacto ? "100%" : 72,
          }}
        >
          Tomar
        </Button>
      )}

      {puedeResolver(ticket) && (
        <Button
          size="small"
          variant="outlined"
          color="success"
          onClick={() => resolverTicket(ticket)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            minWidth: compacto ? "100%" : 82,
          }}
        >
          Resolver
        </Button>
      )}

      {puedeEliminar(ticket) && (
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => eliminarTicket(ticket)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            minWidth: compacto ? "100%" : 82,
          }}
        >
          Eliminar
        </Button>
      )}
    </Stack>
  );

  const LogoSistema = ({ ticket, size = 42 }) => {
    const logo = obtenerLogoSistema(ticket);

    if (!logo) {
      return (
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            bgcolor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Typography variant="caption" fontWeight={900} color="text.secondary">
            {String(nombreSistema(ticket)).charAt(0)}
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        component="img"
        src={logo}
        alt={nombreSistema(ticket)}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
        sx={{
          width: size,
          height: size,
          borderRadius: 2,
          objectFit: "contain",
          border: "1px solid #e5e7eb",
          bgcolor: "#ffffff",
          p: 0.5,
          flexShrink: 0,
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        mb={3}
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={2}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ fontSize: { xs: 22, md: 26 } }}
          >
            Tickets
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Consulta tickets, estado actual, problema, prioridad y agente
            asignado.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setOpenNuevoTicket(true)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Nuevo ticket
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          p: { xs: 1.5, md: 3 },
          borderRadius: 3,
          boxShadow: 1,
          border: "1px solid #e5e7eb",
        }}
      >
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              size="small"
              label="Buscar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Folio, título, sistema, problema, prioridad o agente"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Estado"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="abiert">Abiertos</MenuItem>
              <MenuItem value="reciente">Recientes</MenuItem>
              <MenuItem value="proceso">En proceso</MenuItem>
              <MenuItem value="cerr">Cerrados</MenuItem>
              <MenuItem value="resuelto">Resueltos</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {ticketsFiltrados.length > 0 ? (
          <>
            {/* Escritorio */}
            <TableContainer
              sx={{
                display: { xs: "none", md: "block" },
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                overflowX: "auto",
              }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={headCell}>Folio</TableCell>
                    <TableCell sx={headCell}>Problema</TableCell>
                    <TableCell sx={headCell}>Sección</TableCell>
                    <TableCell sx={headCell}>Prioridad / Estado</TableCell>
                    <TableCell sx={headCell}>Agente</TableCell>
                    <TableCell sx={headCell} align="right">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {ticketsFiltrados.map((ticket) => (
                    <TableRow key={ticket.id} hover>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <LogoSistema ticket={ticket} />

                          <Box>
                            <Typography fontWeight={900} color="primary">
                              {ticket.folio_prefijo || "TCK"}
                            </Typography>

                            <Typography variant="caption">
                              {ticket.folio_numero || ticket.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={700}>
                          {ticket.titulo}
                        </Typography>

                        <Chip
                          size="small"
                          label={nombreSistema(ticket)}
                          sx={{
                            mt: 0.5,
                            fontWeight: 700,
                            borderRadius: 2,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        {ticket.seccion_nombre || nombreProblema(ticket)}
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.7}>
                          <Typography variant="body2">
                            {nombrePrioridad(ticket)}
                          </Typography>

                          <Chip
                            size="small"
                            label={nombreEstado(ticket)}
                            color={colorEstado(ticket)}
                            sx={{
                              width: "fit-content",
                              fontWeight: 800,
                            }}
                          />
                        </Stack>
                      </TableCell>

                      <TableCell>{nombreAgente(ticket)}</TableCell>

                      <TableCell align="right">
                        <BotonesAccion ticket={ticket} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Móvil */}
            <Stack
              spacing={1.5}
              sx={{
                display: { xs: "flex", md: "none" },
              }}
            >
              {ticketsFiltrados.map((ticket) => (
                <Paper
                  key={ticket.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: "#ffffff",
                    borderColor: "#e5e7eb",
                  }}
                >
                  <Stack spacing={1.4}>
                    <Stack direction="row" spacing={1.4} alignItems="center">
                      <LogoSistema ticket={ticket} size={48} />

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          fontWeight={900}
                          color="primary"
                          noWrap
                        >
                          {obtenerFolio(ticket)}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          display="block"
                        >
                          {nombreSistema(ticket)}
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={nombreEstado(ticket)}
                        color={colorEstado(ticket)}
                        sx={{
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      />
                    </Stack>

                    <Box>
                      <Typography
                        fontWeight={900}
                        sx={{
                          fontSize: 16,
                          lineHeight: 1.35,
                          wordBreak: "break-word",
                        }}
                      >
                        {ticket.titulo}
                      </Typography>
                    </Box>

                    <Divider />

                    <Grid container spacing={1.2}>
                      <Grid item xs={12} sm={6}>
                        <InfoItem
                          label="Sección"
                          value={ticket.seccion_nombre || nombreProblema(ticket)}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <InfoItem
                          label="Prioridad"
                          value={nombrePrioridad(ticket)}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <InfoItem label="Agente" value={nombreAgente(ticket)} />
                      </Grid>
                    </Grid>

                    <BotonesAccion ticket={ticket} compacto />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </>
        ) : (
          <Box
            sx={{
              minHeight: 180,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed #cbd5e1",
              borderRadius: 3,
              bgcolor: "#f8fafc",
              textAlign: "center",
              px: 2,
            }}
          >
            <Typography color="text.secondary">
              No hay tickets para mostrar.
            </Typography>
          </Box>
        )}
      </Paper>

      <NuevoTicketModal
        open={openNuevoTicket}
        onClose={() => setOpenNuevoTicket(false)}
        onCreated={cargarTickets}
      />
    </Box>
  );
}

function InfoItem({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={800}
        display="block"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ wordBreak: "break-word" }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

const headCell = {
  fontWeight: 900,
  color: "#334155",
  whiteSpace: "nowrap",
};

export default MisTickets;