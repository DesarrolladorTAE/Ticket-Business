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
} from "@mui/material";

function MisTickets() {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("USUARIO") || "null");

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

  const nombreEstado = (ticket) =>
    ticket.status?.nombre || ticket.status?.name || ticket.status || "Abierto";

  const nombreSistema = (ticket) =>
    ticket.system?.nombre || ticket.sistema?.nombre || "Sin sistema";

  const nombreProblema = (ticket) =>
    ticket.category?.nombre || ticket.categoria?.nombre || "Sin problema";

  const nombrePrioridad = (ticket) =>
    ticket.priority?.nombre || ticket.prioridad?.nombre || "Sin prioridad";
  const obtenerLogoSistema = (ticket) => {
    const logo = ticket.system_logo || ticket.system?.logo;

    if (!logo) return null;

    if (logo.startsWith("http")) {
      return logo;
    }

    return `/${logo}`;
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
    if (estado.includes("abiert")) return "primary";

    return "default";
  };

  const puedeEliminar = (ticket) => {
    if (usuario?.role === "admin") return true;

    return usuario?.role === "client" && Number(ticket.status_id) === 1;
  };

  const puedeTomar = (ticket) => {
    return (
      (usuario?.role === "admin" || usuario?.role === "agent") &&
      !ticket.responsable_id &&
      Number(ticket.status_id) !== 3
    );
  };

  const puedeResolver = (ticket) => {
    return (
      (usuario?.role === "admin" || usuario?.role === "agent") &&
      Number(ticket.status_id) !== 3 &&
      (usuario?.role === "admin" ||
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
        justifyContent="space-between"
        alignItems="center"
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Tickets
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Consulta tickets, estado actual, problema, prioridad y agente
            asignado.
          </Typography>
        </Box>

        <Button variant="contained" onClick={() => setOpenNuevoTicket(true)}>
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
          p: { xs: 2, md: 3 },
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
              <MenuItem value="proceso">En proceso</MenuItem>
              <MenuItem value="cerr">Cerrados</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {ticketsFiltrados.length > 0 ? (
          <TableContainer
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              overflowX: "auto",
            }}
          >
            <Table size="small">
              <TableHead
                sx={{
                  bgcolor: "#f8fafc",
                }}
              >
                <TableRow>
                  <TableCell>Folio</TableCell>
                  <TableCell>Problema</TableCell>
                  <TableCell>Sección</TableCell>
                  <TableCell>Prioridad / Estado</TableCell>
                  <TableCell>Agente</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {ticketsFiltrados.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        {obtenerLogoSistema(ticket) && (
                          <Box
                            component="img"
                            src={obtenerLogoSistema(ticket)}
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2,
                              objectFit: "cover",
                              border: "1px solid #e5e7eb",
                            }}
                          />
                        )}

                        <Box>
                          <Typography fontWeight={800} color="primary">
                            {ticket.folio_prefijo || "TCK"}
                          </Typography>

                          <Typography variant="caption">
                            {ticket.folio_numero}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>{ticket.titulo}</Typography>

                      <Chip
                        size="small"
                        label={nombreSistema(ticket)}
                        sx={{ mt: 0.5 }}
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
                          sx={{ width: "fit-content" }}
                        />
                      </Stack>
                    </TableCell>

                    <TableCell>{nombreAgente(ticket)}</TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed #cbd5e1",
              borderRadius: 2,
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

export default MisTickets;
