import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import axiosCliente from "../../../services/axiosCliente";
import NuevoTicketModal from "../components/NuevoTicketModal";
import UserAvatar from "../../../components/UserAvatar";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

const API_ORIGIN = "https://api.thebusinessticket.com";

function MisTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("todos");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [prioridadFiltro, setPrioridadFiltro] = useState("todos");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [vigenciaFiltro, setVigenciaFiltro] = useState("todos");
  const [situacionFiltro, setSituacionFiltro] = useState("todos");
  const [etiquetaFiltro, setEtiquetaFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openNuevoTicket, setOpenNuevoTicket] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    cargarTickets();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [
    busqueda,
    clienteFiltro,
    fechaFiltro,
    prioridadFiltro,
    estadoFiltro,
    vigenciaFiltro,
    situacionFiltro,
    etiquetaFiltro,
  ]);

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

  const abrirTicket = (ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const manejarTecladoTicket = (event, ticket) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      abrirTicket(ticket);
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
    } ${ticket.responsable.apellido_materno || ""}`
      .trim()
      .replace(/\s+/g, " ");
  };

  const responsableConAvatar = (ticket) => {
    const responsable = ticket?.responsable;

    if (!responsable) return null;

    let avatarUrl = responsable.avatar_url || null;

    if (!avatarUrl && responsable.avatar_path) {
      const avatarPath = String(responsable.avatar_path).replace(/^\/+/, "");

      avatarUrl = `${API_ORIGIN}/storage/${avatarPath}`;
    }

    return {
      ...responsable,
      avatar_url: avatarUrl,
    };
  };

  const nombreCliente = (ticket) => {
    if (!ticket.user) return "Sin cliente";

    return `${ticket.user.name || ""} ${
      ticket.user.apellido_paterno || ""
    } ${ticket.user.apellido_materno || ""}`
      .trim()
      .replace(/\s+/g, " ");
  };

  const clienteValor = (ticket) =>
    String(ticket.user?.id ?? nombreCliente(ticket));

  const fechaCreacionISO = (ticket) => {
    if (!ticket.created_at) return "";

    const fecha = new Date(ticket.created_at);

    if (Number.isNaN(fecha.getTime())) {
      return String(ticket.created_at).slice(0, 10);
    }

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatoFechaCreacion = (ticket) => {
    if (!ticket.created_at) return "Sin fecha";

    const fecha = new Date(ticket.created_at);

    if (Number.isNaN(fecha.getTime())) {
      return String(ticket.created_at);
    }

    const fechaTexto = fecha.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const horaTexto = fecha.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${fechaTexto} · ${horaTexto}`;
  };

  const esTicketPendiente = (ticket) => {
    const statusId = Number(ticket.status?.id ?? ticket.status_id ?? 0);

    if (statusId) {
      return [1, 2].includes(statusId) && !ticket.resolved_at;
    }

    const estado = String(nombreEstado(ticket)).toLowerCase();

    return (
      !ticket.resolved_at &&
      !estado.includes("cerr") &&
      !estado.includes("resuelto") &&
      !estado.includes("finalizado")
    );
  };

  const esTicketVigente = (ticket) =>
    ["normal", "warning", "due_today"].includes(ticket.due_status);

  const colorEstado = (ticket) => {
    const estado = String(nombreEstado(ticket)).toLowerCase();

    if (estado.includes("cerr") || estado.includes("resuelto")) {
      return "success";
    }

    if (estado.includes("proceso")) {
      return "warning";
    }

    if (
      estado.includes("abiert") ||
      estado.includes("reciente") ||
      estado.includes("nuevo")
    ) {
      return "info";
    }

    return "default";
  };

  const etiquetaVigencia = (ticket) =>
    ticket.due_label || ticket.due_date || "Sin vigencia";

  const colorVigencia = (ticket) => {
    switch (ticket.due_status) {
      case "overdue":
        return "error";

      case "due_today":
        return "error";

      case "warning":
        return "warning";

      case "normal":
        return "success";

      case "finalized":
        return "default";

      default:
        return "default";
    }
  };

  const clientesDisponibles = useMemo(() => {
    const mapa = new Map();

    tickets.forEach((ticket) => {
      const valor = clienteValor(ticket);
      const nombre = nombreCliente(ticket);

      if (!mapa.has(valor)) {
        mapa.set(valor, nombre);
      }
    });

    return Array.from(mapa.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [tickets]);

  const prioridadesDisponibles = useMemo(() => {
    const mapa = new Map();

    tickets.forEach((ticket) => {
      const nombre = nombrePrioridad(ticket);
      const valor = String(ticket.priority?.id ?? nombre);

      if (!mapa.has(valor)) {
        mapa.set(valor, nombre);
      }
    });

    return Array.from(mapa.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [tickets]);

  const estadosDisponibles = useMemo(() => {
    const estados = new Set();

    tickets.forEach((ticket) => {
      estados.add(nombreEstado(ticket));
    });

    return Array.from(estados)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "es"));
  }, [tickets]);

  const etiquetasDisponibles = useMemo(() => {
    const mapa = new Map();

    tickets.forEach((ticket) => {
      const tags = Array.isArray(ticket?.tags) ? ticket.tags : [];

      tags.forEach((tag) => {
        if (!tag?.id || !tag?.nombre) return;

        const value = String(tag.id);

        if (!mapa.has(value)) {
          mapa.set(value, tag.nombre);
        }
      });
    });

    return Array.from(mapa.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [tickets]);

  const hayFiltrosActivos =
    busqueda.trim() ||
    clienteFiltro !== "todos" ||
    fechaFiltro ||
    prioridadFiltro !== "todos" ||
    estadoFiltro !== "todos" ||
    vigenciaFiltro !== "todos" ||
    situacionFiltro !== "todos" ||
    etiquetaFiltro !== "todos";

  const limpiarFiltros = () => {
    setBusqueda("");
    setClienteFiltro("todos");
    setFechaFiltro("");
    setPrioridadFiltro("todos");
    setEstadoFiltro("todos");
    setVigenciaFiltro("todos");
    setSituacionFiltro("todos");
    setEtiquetaFiltro("todos");
  };

  const ticketsFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const estado = String(nombreEstado(ticket)).toLowerCase();
      const prioridadValor = String(
        ticket.priority?.id ?? nombrePrioridad(ticket),
      );

      const coincideTexto =
        !texto ||
        [ticket.folio, ticket.folio_prefijo, ticket.folio_numero, ticket.titulo]
          .join(" ")
          .toLowerCase()
          .includes(texto);

      const coincideCliente =
        clienteFiltro === "todos" || clienteValor(ticket) === clienteFiltro;

      const coincideFecha =
        !fechaFiltro || fechaCreacionISO(ticket) === fechaFiltro;

      const coincidePrioridad =
        prioridadFiltro === "todos" || prioridadValor === prioridadFiltro;

      const coincideEstado =
        estadoFiltro === "todos" || estado === estadoFiltro;

      const coincideVigencia =
        vigenciaFiltro === "todos" ||
        (vigenciaFiltro === "vigentes" && esTicketVigente(ticket)) ||
        (vigenciaFiltro === "vencidos" && ticket.due_status === "overdue") ||
        (vigenciaFiltro === "sin_vigencia" &&
          (!ticket.due_at || ticket.due_status === "unknown"));

      const pendiente = esTicketPendiente(ticket);

      const coincideSituacion =
        situacionFiltro === "todos" ||
        (situacionFiltro === "pendientes" && pendiente) ||
        (situacionFiltro === "finalizados" && !pendiente);

      const tags = Array.isArray(ticket?.tags) ? ticket.tags : [];

      const coincideEtiqueta =
        etiquetaFiltro === "todos" ||
        tags.some((tag) => String(tag?.id) === String(etiquetaFiltro));

      return (
        coincideTexto &&
        coincideCliente &&
        coincideFecha &&
        coincidePrioridad &&
        coincideEstado &&
        coincideVigencia &&
        coincideSituacion &&
        coincideEtiqueta
      );
    });
  }, [
    tickets,
    busqueda,
    clienteFiltro,
    fechaFiltro,
    prioridadFiltro,
    estadoFiltro,
    vigenciaFiltro,
    situacionFiltro,
    etiquetaFiltro,
  ]);

  const ticketsPaginados = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;

    return ticketsFiltrados.slice(start, end);
  }, [ticketsFiltrados, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

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
        onError={(event) => {
          event.currentTarget.style.display = "none";
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

  const VigenciaTicket = ({ ticket }) => (
    <Stack spacing={0.5} alignItems="flex-start">
      <Chip
        size="small"
        label={etiquetaVigencia(ticket)}
        color={colorVigencia(ticket)}
        sx={{
          fontWeight: 800,
          maxWidth: "100%",
          "& .MuiChip-label": {
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
      />

      {ticket.due_date && ticket.due_status !== "finalized" && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          Hasta {ticket.due_date}
        </Typography>
      )}
    </Stack>
  );

  const EtiquetasTicket = ({ ticket }) => {
    const tags = Array.isArray(ticket?.tags) ? ticket.tags : [];

    if (tags.length === 0) {
      return (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Sin etiquetas
        </Typography>
      );
    }

    return (
      <Stack
        direction="row"
        spacing={0.6}
        useFlexGap
        flexWrap="wrap"
        sx={{ mt: 0.8 }}
      >
        {tags.map((tag) => (
          <Chip
            key={tag.id}
            size="small"
            label={tag.nombre}
            variant="outlined"
            color={tag.estado ? "primary" : "default"}
            sx={{
              height: 24,
              fontWeight: 800,
              maxWidth: "100%",
              "& .MuiChip-label": {
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        ))}
      </Stack>
    );
  };

  const PaginacionTickets = () => (
    <TablePagination
      component="div"
      count={ticketsFiltrados.length}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={[5, 10, 25]}
      labelRowsPerPage="Filas por página"
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      sx={{
        borderTop: "1px solid #e5e7eb",
        bgcolor: "#ffffff",
        ".MuiTablePagination-toolbar": {
          flexWrap: { xs: "wrap", sm: "nowrap" },
          justifyContent: { xs: "center", sm: "flex-end" },
          rowGap: 1,
        },
      }}
    />
  );

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
            Consulta tickets, estado, prioridad, vigencia y agente asignado.
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
        <Box
          sx={{
            mb: 3,
            p: { xs: 1.25, sm: 1.5 },
            border: "1px solid #e5e7eb",
            borderRadius: 2.5,
            bgcolor: "#f8fafc",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1}
            sx={{ mb: 1.5 }}
          >
            <Box>
              <Typography fontWeight={900} sx={{ fontSize: 14 }}>
                Filtros
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Combina uno o varios filtros para localizar tickets.
              </Typography>
            </Box>

            <Button
              size="small"
              color="inherit"
              onClick={limpiarFiltros}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                alignSelf: { xs: "flex-start", sm: "center" },
              }}
            >
              Limpiar filtros
            </Button>
          </Stack>

          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} lg={4}>
              <TextField
                fullWidth
                size="small"
                label="Nombre o folio"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Ej. Error de acceso o TAE-..."
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Cliente"
                value={clienteFiltro}
                onChange={(event) => setClienteFiltro(event.target.value)}
              >
                <MenuItem value="todos">Todos los clientes</MenuItem>

                {clientesDisponibles.map((cliente) => (
                  <MenuItem key={cliente.value} value={cliente.value}>
                    {cliente.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: -7,
                    left: 10,
                    zIndex: 1,
                    px: 0.5,
                    bgcolor: "#f8fafc",
                    color: "text.secondary",
                    fontSize: 11,
                    lineHeight: 1,
                  }}
                >
                  Fecha de creación
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={fechaFiltro}
                  onChange={(event) => setFechaFiltro(event.target.value)}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Prioridad"
                value={prioridadFiltro}
                onChange={(event) => setPrioridadFiltro(event.target.value)}
              >
                <MenuItem value="todos">Todas</MenuItem>

                {prioridadesDisponibles.map((prioridad) => (
                  <MenuItem key={prioridad.value} value={prioridad.value}>
                    {prioridad.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Estado"
                value={estadoFiltro}
                onChange={(event) => setEstadoFiltro(event.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>

                {estadosDisponibles.map((estado) => (
                  <MenuItem key={estado} value={String(estado).toLowerCase()}>
                    {estado}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Vigencia"
                value={vigenciaFiltro}
                onChange={(event) => setVigenciaFiltro(event.target.value)}
              >
                <MenuItem value="todos">Todas</MenuItem>
                <MenuItem value="vigentes">Vigentes</MenuItem>
                <MenuItem value="vencidos">Vencidos</MenuItem>
                <MenuItem value="sin_vigencia">Sin vigencia</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Situación"
                value={situacionFiltro}
                onChange={(event) => setSituacionFiltro(event.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="pendientes">Pendientes</MenuItem>
                <MenuItem value="finalizados">Finalizados</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Etiqueta"
                value={etiquetaFiltro}
                onChange={(event) => setEtiquetaFiltro(event.target.value)}
              >
                <MenuItem value="todos">Todas las etiquetas</MenuItem>

                {etiquetasDisponibles.map((etiqueta) => (
                  <MenuItem key={etiqueta.value} value={etiqueta.value}>
                    {etiqueta.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography fontWeight={900} color="#0f172a">
              Lista de tickets
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Selecciona cualquier fila para abrir el detalle.
            </Typography>
          </Box>

          <Chip
            label={`${ticketsFiltrados.length} ticket(s)`}
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 800,
              alignSelf: { xs: "flex-start", sm: "center" },
            }}
          />
        </Stack>

        {ticketsFiltrados.length > 0 ? (
          <>
            {/* Escritorio */}
            <Paper
              sx={{
                display: { xs: "none", md: "block" },
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "none",
              }}
            >
              <TableContainer
                sx={{
                  maxHeight: 460,
                  overflowX: "auto",
                  overflowY: "auto",
                }}
              >
                <Table
                  size="small"
                  stickyHeader
                  sx={{
                    tableLayout: "fixed",
                    minWidth: 1080,
                    width: "100%",
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...headCell, width: 190 }}>
                        Folio
                      </TableCell>

                      <TableCell sx={{ ...headCell, width: 255 }}>
                        Problema
                      </TableCell>

                      <TableCell sx={{ ...headCell, width: 155 }}>
                        Sección
                      </TableCell>

                      <TableCell sx={{ ...headCell, width: 165 }}>
                        Prioridad / Estado
                      </TableCell>

                      <TableCell sx={{ ...headCell, width: 175 }}>
                        Vigencia
                      </TableCell>

                      <TableCell sx={{ ...headCell, width: 165 }}>
                        Agente
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {ticketsPaginados.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        hover
                        tabIndex={0}
                        role="button"
                        onClick={() => abrirTicket(ticket)}
                        onKeyDown={(event) =>
                          manejarTecladoTicket(event, ticket)
                        }
                        sx={{
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                          "&:focus-visible": {
                            outline: "2px solid",
                            outlineColor: "primary.main",
                            outlineOffset: -2,
                          },
                        }}
                      >
                        <TableCell sx={bodyCell}>
                          <Stack
                            direction="row"
                            spacing={1.2}
                            alignItems="center"
                            sx={{ minWidth: 0 }}
                          >
                            <LogoSistema ticket={ticket} size={36} />

                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                fontWeight={900}
                                color="primary"
                                sx={{
                                  lineHeight: 1.2,
                                  wordBreak: "break-word",
                                }}
                              >
                                {ticket.folio_prefijo || "TCK"}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  wordBreak: "break-word",
                                  fontWeight: 700,
                                }}
                              >
                                {ticket.folio_numero || ticket.id}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  mt: 0.35,
                                  fontSize: 10.5,
                                  lineHeight: 1.3,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Creado: {formatoFechaCreacion(ticket)}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell sx={bodyCell}>
                          <Typography
                            fontWeight={700}
                            sx={{
                              lineHeight: 1.35,
                              wordBreak: "break-word",
                            }}
                          >
                            {ticket.titulo}
                          </Typography>

                          <Chip
                            size="small"
                            label={nombreSistema(ticket)}
                            sx={{
                              mt: 0.7,
                              fontWeight: 700,
                              borderRadius: 2,
                              maxWidth: "100%",
                              "& .MuiChip-label": {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              },
                            }}
                          />

                          <EtiquetasTicket ticket={ticket} />
                        </TableCell>

                        <TableCell sx={bodyCell}>
                          {ticket.seccion_nombre || nombreProblema(ticket)}
                        </TableCell>

                        <TableCell sx={bodyCell}>
                          <Stack spacing={0.7}>
                            <Typography
                              variant="body2"
                              sx={{
                                wordBreak: "break-word",
                                lineHeight: 1.35,
                              }}
                            >
                              {nombrePrioridad(ticket)}
                            </Typography>

                            <Chip
                              size="small"
                              label={nombreEstado(ticket)}
                              color={colorEstado(ticket)}
                              sx={{
                                width: "fit-content",
                                fontWeight: 800,
                                maxWidth: "100%",
                              }}
                            />
                          </Stack>
                        </TableCell>

                        <TableCell sx={bodyCell}>
                          <VigenciaTicket ticket={ticket} />
                        </TableCell>

                        <TableCell>
                          {ticket.responsable ? (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{
                                minWidth: 0,
                              }}
                            >
                              <UserAvatar
                                user={responsableConAvatar(ticket)}
                                size={32}
                                fontSize={11}
                              />

                              <Typography
                                variant="body2"
                                sx={{
                                  wordBreak: "break-word",
                                  lineHeight: 1.35,
                                  fontWeight: 600,
                                  minWidth: 0,
                                }}
                              >
                                {nombreAgente(ticket)}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                lineHeight: 1.35,
                              }}
                            >
                              Sin asignar
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <PaginacionTickets />
            </Paper>

            {/* Móvil */}
            <Stack
              spacing={1.5}
              sx={{
                display: { xs: "flex", md: "none" },
              }}
            >
              {ticketsPaginados.map((ticket) => (
                <Paper
                  key={ticket.id}
                  variant="outlined"
                  tabIndex={0}
                  role="button"
                  onClick={() => abrirTicket(ticket)}
                  onKeyDown={(event) => manejarTecladoTicket(event, ticket)}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: "#ffffff",
                    borderColor: "#e5e7eb",
                    cursor: "pointer",
                    transition:
                      "border-color 0.15s ease, background-color 0.15s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "#f8fafc",
                    },
                    "&:focus-visible": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Stack spacing={1.4}>
                    <Stack direction="row" spacing={1.4} alignItems="center">
                      <LogoSistema ticket={ticket} size={48} />

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography fontWeight={900} color="primary" noWrap>
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

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            mt: 0.3,
                            fontSize: 10.5,
                            lineHeight: 1.3,
                          }}
                        >
                          Creado: {formatoFechaCreacion(ticket)}
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

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={800}
                        display="block"
                        sx={{ mb: 0.4 }}
                      >
                        Etiquetas
                      </Typography>

                      <EtiquetasTicket ticket={ticket} />
                    </Box>

                    <Divider />

                    <Grid container spacing={1.2}>
                      <Grid item xs={12} sm={6}>
                        <InfoItem
                          label="Sección"
                          value={
                            ticket.seccion_nombre || nombreProblema(ticket)
                          }
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <InfoItem
                          label="Prioridad"
                          value={nombrePrioridad(ticket)}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={800}
                            display="block"
                            sx={{ mb: 0.5 }}
                          >
                            Vigencia
                          </Typography>

                          <VigenciaTicket ticket={ticket} />
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={800}
                            display="block"
                            sx={{ mb: 0.5 }}
                          >
                            Agente
                          </Typography>

                          {ticket.responsable ? (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <UserAvatar
                                user={responsableConAvatar(ticket)}
                                size={30}
                                fontSize={10}
                              />

                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{
                                  wordBreak: "break-word",
                                  lineHeight: 1.3,
                                }}
                              >
                                {nombreAgente(ticket)}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={700}
                            >
                              Sin asignar
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    <Typography
                      variant="caption"
                      color="primary"
                      fontWeight={800}
                      textAlign="right"
                    >
                      Presiona para ver el ticket
                    </Typography>
                  </Stack>
                </Paper>
              ))}

              <Paper
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                }}
              >
                <PaginacionTickets />
              </Paper>
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
  bgcolor: "#f8fafc",
  borderBottom: "1px solid #e5e7eb",
};

const bodyCell = {
  verticalAlign: "top",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
};

export default MisTickets;
