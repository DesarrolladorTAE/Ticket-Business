import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import axiosCliente from "../../../services/axiosCliente";
import NuevoTicketModal from "../components/NuevoTicketModal";
import UserAvatar from "../../../components/UserAvatar";
import { useAuth } from "../../../auth/context/AuthContext";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import TuneIcon from "@mui/icons-material/Tune";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";

const API_ORIGIN = "https://api.thebusinessticket.com";

function MisTickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roles = user?.company_role || user?.role
    ? [user.company_role || user.role] : user?.roles || [];
  const puedeEditar = roles.some((rol) =>
    ["admin", "administrador", "supervisor"].includes(String(typeof rol === "string" ? rol : rol?.name).trim().toLowerCase()));
  const [ticketEdicion, setTicketEdicion] = useState(null);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  const [aviso, setAviso] = useState("");
  const editarTicket = async (event, ticket) => {
    event.stopPropagation();
    if (!puedeEditar || cargandoEdicion) return;
    setCargandoEdicion(true); setError(""); setAviso("");
    try {
      const res = await axiosCliente.get(`/tickets/${ticket.id}`);
      setTicketEdicion(res.data.data || res.data);
    } catch (error) {
      setError(error.response?.data?.message || "No se pudo cargar el ticket para editar.");
    } finally { setCargandoEdicion(false); }
  };
  const botonEditar = (ticket, compacto = false) => puedeEditar && (compacto ? (
    <Tooltip title="Editar ticket">
      <span>
        <IconButton
          size="small"
          color="primary"
          disabled={cargandoEdicion}
          onClick={(event) => editarTicket(event, ticket)}
          onKeyDown={(event) => event.stopPropagation()}
          aria-label={`Editar ticket ${ticket.folio || ticket.id}`}
          sx={{ width: 28, height: 28 }}
        >
          <EditOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </span>
    </Tooltip>
  ) : (
    <Button size="small" startIcon={<EditOutlinedIcon />} disabled={cargandoEdicion}
      onClick={(event) => editarTicket(event, ticket)}
      onKeyDown={(event) => event.stopPropagation()}
      aria-label={`Editar ticket ${ticket.folio || ticket.id}`}>
      Editar
    </Button>
  ));

  const [tickets, setTickets] = useState([]);
  const [catalogoPrioridades, setCatalogoPrioridades] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("todos");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [prioridadFiltro, setPrioridadFiltro] = useState("todos");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
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
    etiquetaFiltro,
  ]);

  const cargarTickets = async ({ silencioso = false } = {}) => {
    if (!silencioso) setLoading(true);

    try {
      setError("");

      const [res, clientesRes, prioridadesRes] = await Promise.all([
        axiosCliente.get("/tickets"),
        axiosCliente.get("/clients/summary").catch(() => null),
        axiosCliente.get("/ticket-priorities").catch(() => null),
      ]);

      const ticketsRecibidos = res.data.data || res.data || [];
      const clientesActuales = clientesRes?.data?.data || [];
      setCatalogoPrioridades(
        prioridadesRes?.data?.data || prioridadesRes?.data || [],
      );
      const clientesPorId = new Map(
        clientesActuales.map((cliente) => [String(cliente.id), cliente]),
      );

      const ticketsConClienteActual = ticketsRecibidos.map((ticket) => {
        const clienteId =
          ticket.client?.id ??
          ticket.cliente?.id ??
          ticket.client_id ??
          ticket.cliente_id;
        const clienteActual = clientesPorId.get(String(clienteId));

        if (!clienteActual) return ticket;

        const nombreActual = `${clienteActual.name || ""} ${
          clienteActual.apellido_paterno || ""
        } ${clienteActual.apellido_materno || ""}`
          .trim()
          .replace(/\s+/g, " ");

        return {
          ...ticket,
          client: clienteActual,
          cliente: clienteActual,
          cliente_nombre: nombreActual || ticket.cliente_nombre,
        };
      });

      setTickets(ticketsConClienteActual);
    } catch (error) {
      console.log("ERROR CARGAR TICKETS:", error.response?.data || error);

      setError(
        error.response?.data?.message || "No se pudieron cargar los tickets",
      );
    } finally {
      if (!silencioso) setLoading(false);
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

  const obtenerCliente = (ticket) =>
    ticket.client || ticket.cliente || ticket.user || null;

  const nombreCliente = (ticket) => {
    if (ticket.cliente_nombre) {
      return String(ticket.cliente_nombre).trim() || "Sin cliente";
    }

    const cliente = obtenerCliente(ticket);

    if (!cliente) return "Sin cliente";

    return `${cliente.name || ""} ${cliente.apellido_paterno || ""} ${
      cliente.apellido_materno || ""
    }`
      .trim()
      .replace(/\s+/g, " ");
  };

  const clienteValor = (ticket) => {
    const cliente = obtenerCliente(ticket);

    return String(cliente?.id ?? nombreCliente(ticket));
  };

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
      return String(ticket.created_at).slice(0, 10);
    }

    return fecha.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const fechaVencimientoTimestamp = (ticket) => {
    const valor = ticket.due_date || ticket.due_at;

    if (!valor) return Number.POSITIVE_INFINITY;

    const texto = String(valor).trim();
    const formatoISO = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

    if (formatoISO) {
      return new Date(
        Number(formatoISO[1]),
        Number(formatoISO[2]) - 1,
        Number(formatoISO[3]),
      ).getTime();
    }

    const partes = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);

    if (partes) {
      return new Date(
        Number(partes[3]),
        Number(partes[2]) - 1,
        Number(partes[1]),
      ).getTime();
    }

    const fecha = new Date(texto.replace(" ", "T"));

    if (!Number.isNaN(fecha.getTime())) {
      return new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
      ).getTime();
    }

    return Number.POSITIVE_INFINITY;
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

  const diasParaVencer = (ticket) => {
    const vencimiento = fechaVencimientoTimestamp(ticket);

    if (!Number.isFinite(vencimiento)) return null;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return Math.ceil((vencimiento - hoy.getTime()) / 86400000);
  };

  const etiquetaVigencia = (ticket) => {
    if (!esTicketPendiente(ticket)) return "Finalizado";

    const dias = diasParaVencer(ticket);

    if (dias === null) return "Sin fecha";
    if (dias === 0) return "Hoy";

    return `${dias} ${Math.abs(dias) === 1 ? "día" : "días"}`;
  };

  const colorVigencia = (ticket) => {
    if (!esTicketPendiente(ticket)) return "default";

    const dias = diasParaVencer(ticket);

    if (dias === null) return "success";
    if (dias <= 3) return "warning";
    return "success";
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

  const prioridadesDisponibles = useMemo(() => {
    const mapa = new Map();

    catalogoPrioridades.forEach((prioridad) => {
      if (prioridad?.id == null) return;

      mapa.set(
        String(prioridad.id),
        prioridad.nombre || prioridad.name || `Prioridad ${prioridad.id}`,
      );
    });

    tickets.forEach((ticket) => {
      const nombre = nombrePrioridad(ticket);
      const valor = String(ticket.priority?.id ?? nombre);

      if (!mapa.has(valor)) mapa.set(valor, nombre);
    });

    return Array.from(mapa.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => {
        const orden = { baja: 1, media: 2, alta: 3 };
        const nombreA = String(a.label).trim().toLowerCase();
        const nombreB = String(b.label).trim().toLowerCase();
        const posicionA = orden[nombreA] ?? 99;
        const posicionB = orden[nombreB] ?? 99;

        return posicionA - posicionB || a.label.localeCompare(b.label, "es");
      });
  }, [catalogoPrioridades, tickets]);

  const hayFiltrosActivos =
    busqueda.trim() ||
    clienteFiltro !== "todos" ||
    fechaFiltro ||
    prioridadFiltro !== "todos" ||
    estadoFiltro !== "todos" ||
    etiquetaFiltro !== "todos";

  const limpiarFiltros = () => {
    setBusqueda("");
    setClienteFiltro("todos");
    setFechaFiltro("");
    setPrioridadFiltro("todos");
    setEstadoFiltro("todos");
    setEtiquetaFiltro("todos");
  };

  const ticketsFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return tickets.filter((ticket) => {
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

      const prioridadValor = String(
        ticket.priority?.id ?? nombrePrioridad(ticket),
      );
      const coincidePrioridad =
        prioridadFiltro === "todos" || prioridadValor === prioridadFiltro;

      const pendiente = esTicketPendiente(ticket);
      const dias = diasParaVencer(ticket);
      const estadoVisual = !pendiente
        ? "finalizado"
        : dias !== null && dias <= 3
          ? "proximo"
          : "disponible";
      const coincideEstado =
        estadoFiltro === "todos" || estadoFiltro === estadoVisual;

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
        coincideEtiqueta
      );
    }).sort((ticketA, ticketB) => {
      const pendienteA = esTicketPendiente(ticketA);
      const pendienteB = esTicketPendiente(ticketB);
      const diasA = diasParaVencer(ticketA);
      const diasB = diasParaVencer(ticketB);
      const ordenA = !pendienteA ? 2 : diasA !== null && diasA <= 3 ? 0 : 1;
      const ordenB = !pendienteB ? 2 : diasB !== null && diasB <= 3 ? 0 : 1;

      if (ordenA !== ordenB) return ordenA - ordenB;

      if (pendienteA !== pendienteB) return pendienteA ? -1 : 1;

      if (pendienteA && pendienteB) {
        const diferenciaVencimiento =
          fechaVencimientoTimestamp(ticketA) -
          fechaVencimientoTimestamp(ticketB);

        if (diferenciaVencimiento !== 0) return diferenciaVencimiento;
      }

      const creadoA = new Date(ticketA.created_at || 0).getTime();
      const creadoB = new Date(ticketB.created_at || 0).getTime();

      return creadoA - creadoB;
    });
  }, [
    tickets,
    busqueda,
    clienteFiltro,
    fechaFiltro,
    prioridadFiltro,
    estadoFiltro,
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
        sx={{
          mt: 0.8,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {tags.slice(0, 4).map((tag) => (
          <Tooltip key={tag.id} title={tag.nombre} arrow enterTouchDelay={0}>
            <Box
              component="span"
              role="img"
              aria-label={`Etiqueta: ${tag.nombre}`}
              tabIndex={0}
              sx={{
                width: 30,
                height: 30,
                borderRadius: 2,
                display: "inline-grid",
                placeItems: "center",
                flexShrink: 0,
                color: tag.estado ? "#2563eb" : "#64748b",
                bgcolor: tag.estado ? "#eff6ff" : "#f1f5f9",
                border: "1px solid",
                borderColor: tag.estado ? "#bfdbfe" : "#cbd5e1",
                cursor: "help",
                "&:focus-visible": {
                  outline: "2px solid #2563eb",
                  outlineOffset: 2,
                },
              }}
            >
              <LocalOfferOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
          </Tooltip>
        ))}

        {tags.length > 4 && (
          <Chip
            size="small"
            label={`+${tags.length - 4}`}
            sx={{ height: 30, fontWeight: 900, bgcolor: "#e2e8f0" }}
          />
        )}
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
      <Paper
        variant="outlined"
        sx={{
          mb: 2.5,
          p: { xs: 1.75, sm: 2.25 },
          borderRadius: 3,
          borderColor: "#dbeafe",
          bgcolor: "#f8fbff",
          backgroundImage: "linear-gradient(120deg, #eff6ff 0%, #ffffff 72%)",
          boxShadow: "none",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: "#2563eb", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <ConfirmationNumberOutlinedIcon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={900} sx={{ fontSize: { xs: 21, md: 25 }, color: "#0f172a", lineHeight: 1.2 }}>
              Gestión de tickets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
              Prioriza pendientes y consulta su seguimiento en un solo lugar.
            </Typography>
          </Box>
        </Stack>
      </Paper>

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
            p: { xs: 1.5, md: 2 },
            border: "1px solid #dbeafe",
            borderRadius: 3,
            bgcolor: "#f8fbff",
            backgroundImage: "linear-gradient(135deg, #f8fbff 0%, #f8fafc 100%)",
            "& .MuiOutlinedInput-root": {
              bgcolor: "#ffffff",
              borderRadius: 2,
            },
          }}
        >
          <Box
            sx={{
              mb: 1.5,
              width: "100%",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) auto" },
              alignItems: "start",
              gap: 1.25,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: "#dbeafe", color: "#2563eb", display: "grid", placeItems: "center" }}>
                <TuneIcon fontSize="small" />
              </Box>
              <Box>
                <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                  Buscar y filtrar
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Encuentra tickets por datos, estado o clasificación.
                </Typography>
              </Box>
            </Stack>

            <Button
              size="small"
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={limpiarFiltros}
              disabled={!hayFiltrosActivos}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                justifySelf: { xs: "stretch", sm: "end" },
                alignSelf: "start",
                width: { xs: "100%", sm: "auto" },
                flexShrink: 0,
              }}
            >
              Limpiar filtros
            </Button>
          </Box>

          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Nombre o folio"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Ej. Error de acceso o TAE-..."
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
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

            <Grid item xs={12} sm={6} md={3}>
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
                    bgcolor: "#ffffff",
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

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Estado"
                value={estadoFiltro}
                onChange={(event) => setEstadoFiltro(event.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="proximo">Próximo</MenuItem>
                <MenuItem value="disponible">Disponible</MenuItem>
                <MenuItem value="finalizado">Finalizado</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Prioridad"
                value={prioridadFiltro}
                onChange={(event) => setPrioridadFiltro(event.target.value)}
              >
                <MenuItem value="todos">Todas las prioridades</MenuItem>
                {prioridadesDisponibles.map((prioridad) => (
                  <MenuItem key={prioridad.value} value={prioridad.value}>
                    {prioridad.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
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

        <Box
          sx={{
            mb: 2,
            width: "100%",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) auto" },
            alignItems: "start",
            gap: 1.25,
          }}
        >
          <Box>
            <Typography fontWeight={900} color="#0f172a">
              Lista de tickets
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Pendientes por vencimiento; después, los tickets más antiguos.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ justifySelf: { xs: "stretch", sm: "end" }, flexShrink: 0 }}
          >
            <Chip
              label={`${ticketsFiltrados.length} ticket(s)`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800, alignSelf: { xs: "flex-start", sm: "center" } }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNuevoTicket(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
                boxShadow: "none",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Nuevo ticket
            </Button>
          </Stack>
        </Box>

        {ticketsFiltrados.length > 0 ? (
          <>
            {/* Escritorio */}
            <Paper
              sx={{
                display: { xs: "none", lg: "block" },
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "none",
              }}
            >
              <TableContainer
                sx={{
                  maxHeight: "calc(100vh - 330px)",
                  minHeight: 320,
                  overflowX: "auto",
                  overflowY: "auto",
                }}
              >
                <Table
                  size="small"
                  stickyHeader
                  sx={{
                    tableLayout: "fixed",
                    minWidth: 1040,
                    width: "100%",
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...headCell, width: 330 }}>
                        Ticket
                      </TableCell>

                      <TableCell sx={{ ...headCell, width: 240 }}>
                        Clasificación
                      </TableCell>

                      <TableCell sx={{ ...headCell, width: 150 }}>
                        Prioridad / Estado
                      </TableCell>

                      <TableCell sx={{ ...headCell, width: 155 }}>
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
                          transition: "background-color 0.15s ease, box-shadow 0.15s ease",
                          "&:nth-of-type(even)": { bgcolor: "#fbfdff" },
                          "&:hover": {
                            bgcolor: "#eff6ff",
                            boxShadow: "inset 3px 0 0 #2563eb",
                          },
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
                            spacing={1.4}
                            alignItems="flex-start"
                            sx={{ minWidth: 0 }}
                          >
                            <LogoSistema ticket={ticket} size={36} />

                            <Box sx={{ minWidth: 0 }}>
                              <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
                                <Typography fontWeight={900} color="primary" sx={{ lineHeight: 1.2 }}>
                                  {obtenerFolio(ticket)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatoFechaCreacion(ticket)}
                                </Typography>
                                {botonEditar(ticket, true)}
                              </Stack>

                              <Typography
                                fontWeight={800}
                                sx={{
                                  mt: 0.65,
                                  lineHeight: 1.35,
                                  wordBreak: "break-word",
                                }}
                              >
                                {ticket.titulo}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  mt: 0.5,
                                  wordBreak: "break-word",
                                  fontWeight: 700,
                                }}
                              >
                                Cliente: {nombreCliente(ticket)}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell sx={bodyCell}>
                          <Stack spacing={0.45}>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{
                                lineHeight: 1.35,
                                wordBreak: "break-word",
                              }}
                            >
                              {ticket.seccion_nombre || nombreProblema(ticket)}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                lineHeight: 1.3,
                                wordBreak: "break-word",
                              }}
                            >
                              {nombreSistema(ticket)}
                            </Typography>

                            <EtiquetasTicket ticket={ticket} />
                          </Stack>
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
                display: { xs: "flex", lg: "none" },
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
                    {botonEditar(ticket)}
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
                          Cliente: {nombreCliente(ticket)}
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
                          maxWidth: "38%",
                          "& .MuiChip-label": {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
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

                    <Divider />

                    <Grid container spacing={1.2}>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={800}
                            display="block"
                          >
                            Sección / Categoría
                          </Typography>

                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{
                              wordBreak: "break-word",
                              lineHeight: 1.35,
                            }}
                          >
                            {ticket.seccion_nombre || nombreProblema(ticket)}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{
                              mt: 0.2,
                              lineHeight: 1.3,
                              wordBreak: "break-word",
                            }}
                          >
                            {nombreSistema(ticket)}
                          </Typography>

                          <EtiquetasTicket ticket={ticket} />
                        </Box>
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

      {aviso && <Alert severity="success" onClose={() => setAviso("")}>{aviso}</Alert>}
      <NuevoTicketModal
        key={ticketEdicion?.id || "editar"}
        open={Boolean(ticketEdicion)} ticket={ticketEdicion}
        onClose={() => setTicketEdicion(null)}
        onUpdated={() => {
          setAviso("Ticket actualizado correctamente.");
          cargarTickets({ silencioso: true });
        }}
      />
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
