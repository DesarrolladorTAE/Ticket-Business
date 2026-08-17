import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axiosCliente from "../../../services/axiosCliente";
import { useAuth } from "../../../auth/context/AuthContext";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import TicketHeader from "../components/TicketHeader";
import AttachmentPreview from "../components/AttachmentPreview";
import TicketInfoItem from "../components/TicketInfoItem";
import TicketSharedAccessPanel from "../components/TicketSharedAccessPanel";

import Swal from "sweetalert2";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const STORAGE_URL = "https://api.thebusinessticket.com/storage";
const PUBLIC_TICKET_BASE_PATH = "/public/tickets";

export default function TicketDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const rolesBase = Array.isArray(user?.roles) ? user.roles : [];

  const rolEmpresa = user?.company_role || user?.role || null;

  const rolesNormalizados = rolEmpresa
    ? [String(rolEmpresa).trim().toLowerCase()]
    : rolesBase
        .map((role) => String(role).trim().toLowerCase())
        .filter(Boolean);

  const isAdmin =
    rolesNormalizados.includes("administrador") ||
    rolesNormalizados.includes("admin");

  const isAgent =
    rolesNormalizados.includes("agente") || rolesNormalizados.includes("agent");

  const isSupervisor = rolesNormalizados.includes("supervisor");

  const isClient =
    rolesNormalizados.includes("cliente") ||
    rolesNormalizados.includes("client");

  const puedeCambiarEstado = isAdmin || isSupervisor;
  const puedeMensajear = isAdmin || isAgent || isSupervisor || isClient;
  const puedeGestionar = isAdmin || isAgent || isSupervisor;
  const tipoMensajePredeterminado =
    user?.default_internal_note === true
      ? "private"
      : user?.default_internal_note === false
        ? "public"
        : "";
  const puedeResolver = isAdmin || isSupervisor;
  const puedeEliminar = isAdmin;
  const puedeAsignarResponsable = isAdmin || isSupervisor;

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [estados, setEstados] = useState([]);
  const [text, setText] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [mostrarInfoTicket, setMostrarInfoTicket] = useState(false);

  const [agentesDisponibles, setAgentesDisponibles] = useState([]);
  const [responsableSeleccionadoId, setResponsableSeleccionadoId] =
    useState("");
  const [cargandoAgentes, setCargandoAgentes] = useState(false);
  const [asignandoResponsable, setAsignandoResponsable] = useState(false);

  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState([]);
  const [etiquetasAsignadas, setEtiquetasAsignadas] = useState([]);
  const [etiquetaSeleccionadaId, setEtiquetaSeleccionadaId] = useState("");
  const [cargandoEtiquetas, setCargandoEtiquetas] = useState(false);
  const [asignandoEtiqueta, setAsignandoEtiqueta] = useState(false);

  const ticketCerrado =
    Number(ticket?.status_id || ticket?.status?.id || 0) === 4;

  const creadorTicketId = ticket?.user?.id ?? null;

  const esCreadorDelTicket =
    creadorTicketId !== null &&
    user?.id != null &&
    Number(creadorTicketId) === Number(user.id);

  const puedeTomarTicket = puedeGestionar && !(isAgent && esCreadorDelTicket);

  const chatRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!id || Number.isNaN(Number(id))) {
      navigate("/mis-tickets", { replace: true });
      return;
    }

    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    scrollBottom();
  }, [messages]);

  useEffect(() => {
    if (ticketCerrado) {
      setText("");
      setArchivos([]);
    }
  }, [ticketCerrado]);

  const cargarTodo = async () => {
    setLoading(true);
    setError("");

    try {
      const [ticketRes, msgRes, statusRes] = await Promise.all([
        axiosCliente.get(`/tickets/${id}`),
        axiosCliente.get(`/tickets/${id}/messages`),
        axiosCliente.get("/ticket-statuses"),
      ]);

      const ticketData = ticketRes.data.data || ticketRes.data;
      const responsableActualId =
        ticketData?.responsable?.id || ticketData?.responsable_id || "";

      setTicket(ticketData);
      setMessages(msgRes.data.data || []);
      setEstados(statusRes.data.data || statusRes.data || []);
      setResponsableSeleccionadoId(
        responsableActualId ? String(responsableActualId) : "",
      );

      if (puedeAsignarResponsable) {
        await cargarAgentesDisponibles();
      }

      if (puedeGestionar) {
        await cargarEtiquetasTicket();
      }
    } catch (error) {
      console.log("ERROR CARGAR TICKET:", error.response?.data || error);
      setError("No se pudo cargar la información del ticket.");
    } finally {
      setLoading(false);
    }
  };

  const cargarMensajes = async () => {
    if (!id) return;

    try {
      const response = await axiosCliente.get(`/tickets/${id}/messages`);

      setMessages(response.data.data || []);
    } catch (error) {
      console.log("ERROR CARGAR MENSAJES:", error.response?.data || error);

      setError("No se pudieron actualizar los mensajes.");
    }
  };

  const cargarAgentesDisponibles = async () => {
    if (!id || !puedeAsignarResponsable) return;

    setCargandoAgentes(true);

    try {
      const response = await axiosCliente.get(
        `/tickets/${id}/available-agents`,
      );

      setAgentesDisponibles(response.data.data || []);
    } catch (error) {
      console.log(
        "ERROR CARGAR AGENTES DISPONIBLES:",
        error.response?.data || error,
      );

      setAgentesDisponibles([]);
    } finally {
      setCargandoAgentes(false);
    }
  };

  const cargarEtiquetasTicket = async () => {
    if (!id || !puedeGestionar) return;

    setCargandoEtiquetas(true);

    try {
      const [catalogoRes, asignadasRes] = await Promise.all([
        axiosCliente.get("/ticket-tags"),
        axiosCliente.get(`/tickets/${id}/tags`),
      ]);

      setEtiquetasDisponibles(catalogoRes.data?.data || []);
      setEtiquetasAsignadas(asignadasRes.data?.data || []);
    } catch (error) {
      console.log("ERROR CARGAR ETIQUETAS:", error.response?.data || error);

      setEtiquetasDisponibles([]);
      setEtiquetasAsignadas([]);
    } finally {
      setCargandoEtiquetas(false);
    }
  };

  const asignarEtiqueta = async () => {
    if (!etiquetaSeleccionadaId) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona una etiqueta",
        text: "Debes seleccionar una etiqueta para asignarla.",
      });

      return;
    }

    setAsignandoEtiqueta(true);

    try {
      await axiosCliente.post(`/tickets/${id}/tags`, {
        ticket_tag_id: Number(etiquetaSeleccionadaId),
      });

      setEtiquetaSeleccionadaId("");
      await cargarEtiquetasTicket();

      Swal.fire({
        icon: "success",
        title: "Etiqueta asignada",
        text: "La etiqueta fue asignada correctamente.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("ERROR ASIGNAR ETIQUETA:", error.response?.data || error);

      Swal.fire({
        icon: "error",
        title: "No se pudo asignar",
        text:
          error.response?.data?.message ||
          "No fue posible asignar la etiqueta.",
      });
    } finally {
      setAsignandoEtiqueta(false);
    }
  };

  const quitarEtiqueta = async (etiqueta) => {
    if (!etiqueta?.id) return;

    const confirmar = await Swal.fire({
      title: "Quitar etiqueta",
      text: `¿Quitar la etiqueta "${etiqueta.nombre}" de este ticket?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, quitar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      await axiosCliente.delete(`/tickets/${id}/tags/${etiqueta.id}`);

      if (String(etiquetaSeleccionadaId) === String(etiqueta.id)) {
        setEtiquetaSeleccionadaId("");
      }

      await cargarEtiquetasTicket();

      Swal.fire({
        icon: "success",
        title: "Etiqueta retirada",
        text: "La etiqueta fue retirada del ticket.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("ERROR QUITAR ETIQUETA:", error.response?.data || error);

      Swal.fire({
        icon: "error",
        title: "No se pudo quitar",
        text:
          error.response?.data?.message ||
          "No fue posible retirar la etiqueta.",
      });
    }
  };

  const etiquetasParaAsignar = etiquetasDisponibles.filter(
    (etiqueta) =>
      Boolean(etiqueta?.estado) &&
      !etiquetasAsignadas.some(
        (asignada) => String(asignada.id) === String(etiqueta.id),
      ),
  );

  const asignarResponsable = async () => {
    if (!responsableSeleccionadoId) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un agente",
        text: "Debes seleccionar un agente responsable.",
      });

      return;
    }

    const agenteSeleccionado = agentesDisponibles.find(
      (agente) => String(agente.id) === String(responsableSeleccionadoId),
    );

    const confirmar = await Swal.fire({
      title: "Asignar responsable",
      text: `¿Asignar este ticket a ${
        agenteSeleccionado?.name || "este agente"
      }?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, asignar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    setAsignandoResponsable(true);

    try {
      await axiosCliente.patch(`/tickets/${id}/assign-responsible`, {
        responsable_id: Number(responsableSeleccionadoId),
      });

      await cargarTodo();

      Swal.fire({
        icon: "success",
        title: "Responsable asignado",
        text: "El responsable fue asignado correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("ERROR ASIGNAR RESPONSABLE:", error.response?.data || error);

      Swal.fire({
        icon: "error",
        title: "No se pudo asignar",
        text:
          error.response?.data?.message ||
          "No fue posible asignar el responsable.",
      });
    } finally {
      setAsignandoResponsable(false);
    }
  };

  const cambiarEstado = async (statusId) => {
    try {
      await axiosCliente.patch(`/tickets/${id}/status`, {
        status_id: statusId,
      });

      cargarTodo();
    } catch (error) {
      console.log("ERROR CAMBIAR ESTADO:", error.response?.data || error);

      Swal.fire({
        icon: "error",
        title: "No se pudo cambiar el estado",
        text: error.response?.data?.message || "No se pudo cambiar el estado.",
      });
    }
  };

  const normalizarUrlPublica = (url) => {
    if (!url) return "";

    const cleanUrl = String(url).trim();

    if (!cleanUrl) return "";

    if (/^https?:\/\//i.test(cleanUrl)) {
      return cleanUrl;
    }

    return `${window.location.origin}${cleanUrl.startsWith("/") ? "" : "/"}${cleanUrl}`;
  };

  const obtenerLinkPublicoTicket = () => {
    const urlDirecta =
      ticket?.public_url ||
      ticket?.publicUrl ||
      ticket?.link_publico ||
      ticket?.public_link ||
      ticket?.publicLink;

    if (urlDirecta) {
      return normalizarUrlPublica(urlDirecta);
    }

    const tokenPublico =
      ticket?.public_tracking_code ||
      ticket?.public_token ||
      ticket?.token_publico ||
      ticket?.public_uuid ||
      ticket?.uuid_publico ||
      ticket?.token ||
      ticket?.uuid;

    if (!tokenPublico) {
      return "";
    }

    return `${window.location.origin}${PUBLIC_TICKET_BASE_PATH}/${tokenPublico}`;
  };

  const copiarTextoPortapapeles = async (texto) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = texto;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const abrirVistaPublica = () => {
    const linkPublico = obtenerLinkPublicoTicket();

    if (!linkPublico) {
      Swal.fire({
        icon: "warning",
        title: "Link público no disponible",
        text: "El ticket no tiene token público disponible.",
      });

      return;
    }

    window.open(linkPublico, "_blank", "noopener,noreferrer");
  };

  const copiarLinkPublico = async () => {
    const linkPublico = obtenerLinkPublicoTicket();

    if (!linkPublico) {
      Swal.fire({
        icon: "warning",
        title: "Link público no disponible",
        text: "El ticket no tiene token público disponible.",
      });

      return;
    }

    try {
      await copiarTextoPortapapeles(linkPublico);

      Swal.fire({
        icon: "success",
        title: "Link copiado",
        text: "El link público fue copiado correctamente.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("ERROR COPIAR LINK:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo copiar",
        text: "No fue posible copiar el link público.",
      });
    }
  };

  const abrirArchivo = (file) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const cerrarPreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
  };

  const getArchivoUrl = (file) => {
    if (file?.url) {
      return file.url;
    }

    if (file?.ruta) {
      return `${STORAGE_URL}/${file.ruta}`;
    }

    return "";
  };

  const getFileExtension = (file) => {
    return file?.nombre_archivo?.split(".").pop()?.toLowerCase() || "";
  };

  const esImagenArchivo = (file) => {
    return ["jpg", "jpeg", "png", "webp", "gif", "jfif"].includes(
      getFileExtension(file),
    );
  };

  const esVideoArchivo = (file) => {
    return ["mp4", "mov", "avi", "webm"].includes(getFileExtension(file));
  };

  const esPdfArchivo = (file) => {
    return getFileExtension(file) === "pdf";
  };

  const descargarArchivo = (file) => {
    const url = file?.download_url || getArchivoUrl(file);

    if (!url) {
      setError("No fue posible obtener el archivo adjunto.");
      return;
    }

    const link = document.createElement("a");

    link.href = url;
    link.download = file?.nombre_archivo || "archivo";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calcularTiempoResolucion = () => {
    if (!ticket?.created_at || !ticket?.resolved_at) {
      return "No resuelto";
    }

    const inicio = new Date(ticket.created_at);
    const fin = new Date(ticket.resolved_at);
    const diffMs = fin - inicio;

    if (diffMs <= 0) return "No disponible";

    const minutos = Math.floor(diffMs / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) {
      return `${dias} día(s), ${horas % 24} hora(s)`;
    }

    if (horas > 0) {
      return `${horas} hora(s), ${minutos % 60} minuto(s)`;
    }

    return `${minutos} minuto(s)`;
  };

  const colorVigencia = () => {
    switch (ticket?.due_status) {
      case "overdue":
      case "due_today":
        return "error";

      case "warning":
        return "warning";

      case "normal":
        return "success";

      case "finalized":
      default:
        return "default";
    }
  };

  const estiloVigencia = () => {
    switch (ticket?.due_status) {
      case "overdue":
      case "due_today":
        return {
          borderColor: "#fecaca",
          bgcolor: "#fff7f7",
          iconBg: "#fee2e2",
          iconColor: "#dc2626",
        };

      case "warning":
        return {
          borderColor: "#fed7aa",
          bgcolor: "#fffaf5",
          iconBg: "#ffedd5",
          iconColor: "#ea580c",
        };

      case "normal":
        return {
          borderColor: "#bbf7d0",
          bgcolor: "#f7fff9",
          iconBg: "#dcfce7",
          iconColor: "#16a34a",
        };

      case "finalized":
        return {
          borderColor: "#e5e7eb",
          bgcolor: "#f8fafc",
          iconBg: "#e2e8f0",
          iconColor: "#64748b",
        };

      default:
        return {
          borderColor: "#e5e7eb",
          bgcolor: "#ffffff",
          iconBg: "#f1f5f9",
          iconColor: "#64748b",
        };
    }
  };
  const enviarMensaje = async (visibility = "public") => {
    if (ticketCerrado) {
      await Swal.fire({
        icon: "info",
        title: "Ticket cerrado",
        text: "Este ticket está cerrado. Para continuar, un administrador o supervisor debe cambiarlo a En proceso.",
        confirmButtonText: "Entendido",
      });

      return;
    }

    if (!text.trim() && archivos.length === 0) return;

    setEnviando(true);
    setError("");

    try {
      /*
       * Primero se crea un solo mensaje.
       * Todos los archivos seleccionados quedarán
       * asociados a este mismo message_id.
       */
      const res = await axiosCliente.post(`/tickets/${id}/messages`, {
        message: text.trim(),
        visibility,
      });

      const messageId = res.data.data.id;

      const archivosFallidos = [];

      /*
       * Cada archivo se sube mediante el endpoint
       * existente. Si uno falla, continuamos con
       * los demás para no perder los que sí pueden
       * guardarse.
       */
      for (const archivo of archivos) {
        try {
          const formData = new FormData();

          formData.append("ticket_id", id);
          formData.append("message_id", messageId);
          formData.append("archivo", archivo);

          await axiosCliente.post("/ticket-attachments", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } catch (errorArchivo) {
          console.log(
            `ERROR SUBIR ARCHIVO ${archivo.name}:`,
            errorArchivo.response?.data || errorArchivo,
          );

          archivosFallidos.push(archivo.name);
        }
      }

      /*
       * Limpiamos el formulario porque el mensaje
       * ya fue creado correctamente.
       */
      setText("");
      setArchivos([]);

      /*
       * Solamente actualizamos la conversación.
       * No se vuelve a cargar todo el ticket.
       */
      await cargarMensajes();

      /*
       * Si uno o más archivos fallaron, informamos
       * claramente que el mensaje sí fue enviado.
       */
      if (archivosFallidos.length > 0) {
        await Swal.fire({
          icon: "warning",
          title: "Mensaje enviado",
          html: `
          <div style="text-align:left;">
            <p>El mensaje fue enviado, pero algunos archivos no pudieron adjuntarse:</p>
            <ul>
              ${archivosFallidos.map((nombre) => `<li>${nombre}</li>`).join("")}
            </ul>
          </div>
        `,
          confirmButtonText: "Entendido",
        });
      }
    } catch (error) {
      console.log("ERROR ENVIAR MENSAJE:", error.response?.data || error);

      setError(
        error.response?.data?.message || "No se pudo enviar el mensaje.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const eliminarTicket = async () => {
    const confirmar = await Swal.fire({
      title: "Eliminar ticket",
      text: "¿Seguro que deseas eliminar este ticket?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!confirmar.isConfirmed) return;

    try {
      await axiosCliente.delete(`/tickets/${id}`);
      navigate("/mis-tickets");
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo eliminar el ticket.",
      );
    }
  };

  const eliminarMensaje = async (mensaje) => {
    const confirmar = await Swal.fire({
      title: "Eliminar mensaje",
      text: "¿Seguro que deseas eliminar este mensaje?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!confirmar.isConfirmed) return;

    try {
      await axiosCliente.delete(`/ticket-messages/${mensaje.id}`);
      await cargarMensajes();
    } catch (error) {
      setError(error.response?.data?.message || "No se pudo eliminar mensaje.");
    }
  };

  const tomarTicket = async () => {
    try {
      await axiosCliente.post(`/tickets/${id}/take`);
      await cargarTodo();

      Swal.fire({
        icon: "success",
        title: "Ticket tomado",
        text: "El ticket fue asignado correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No fue posible tomar el ticket",
        text:
          error.response?.data?.message || "No fue posible tomar el ticket.",
      });
    }
  };

  const resolverTicket = async () => {
    const confirmar = await Swal.fire({
      title: "Resolver ticket",
      text: "¿Marcar ticket como resuelto?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Resolver",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      await axiosCliente.post(`/tickets/${id}/resolve`);
      cargarTodo();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo resolver",
        text: error.response?.data?.message || "No se pudo resolver el ticket.",
      });
    }
  };

  const scrollBottom = () => {
    setTimeout(() => {
      const contenedor = chatContainerRef.current;

      if (!contenedor) return;

      contenedor.scrollTo({
        top: contenedor.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const esMio = (msg) => Number(msg.user_id) === Number(user?.id);

  const inicial = (msg) => (msg.user?.name || "U").charAt(0).toUpperCase();

  const esMensajeSistema = (msg) => {
    return (
      msg?.type === "system" ||
      msg?.tipo === "system" ||
      msg?.is_system === true ||
      msg?.message?.startsWith("Ticket creado") ||
      msg?.message?.includes("tomó el ticket") ||
      msg?.message?.startsWith("Estado cambiado") ||
      msg?.message?.includes("fue eliminado por") ||
      msg?.message?.startsWith("Responsable asignado")
    );
  };

  const puedeEliminarMensaje = (msg) => {
    /*
     * Los mensajes del acceso compartido viven en
     * ticket_public_messages, no en ticket_messages.
     *
     * Todavía no tenemos endpoint de eliminación
     * para ellos.
     */
    if (msg?.source === "public_access" || msg?.author_type === "external") {
      return false;
    }

    if (isAdmin || isSupervisor) {
      return true;
    }

    if (isAgent || isClient) {
      return Number(msg.user_id) === Number(user?.id);
    }

    return false;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box>
        <Alert severity="error">
          No se encontró la información del ticket.
        </Alert>

        <Button
          variant="outlined"
          onClick={() => navigate("/mis-tickets")}
          sx={{
            mt: 2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          Volver a mis tickets
        </Button>
      </Box>
    );
  }

  const estadoNombre =
    ticket?.status?.nombre ||
    ticket?.status?.name ||
    ticket?.status ||
    "Abierto";

  const agenteAsignado = ticket?.responsable
    ? ticket.responsable.name
    : "Sin asignar";

  const responsableSelectValue = agentesDisponibles.some(
    (agente) => String(agente.id) === String(responsableSeleccionadoId),
  )
    ? String(responsableSeleccionadoId)
    : "";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1300px",
        mx: "auto",
      }}
    >
      <Box
        mb={3}
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={1.5}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              fontSize: { xs: 22, md: 26 },
              lineHeight: 1.2,
            }}
          >
            Detalle del ticket
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Información, seguimiento y conversación.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          justifyContent={{ xs: "flex-start", sm: "flex-end" }}
          alignItems="center"
          sx={{
            "& .MuiButton-root": {
              minHeight: 40,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              whiteSpace: "nowrap",
            },
            "& .MuiButton-startIcon": {
              mr: { xs: 0, sm: 1 },
            },
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/mis-tickets")}
            sx={{
              minWidth: { xs: 44, sm: "auto" },
              px: { xs: 1.3, sm: 2 },
            }}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Volver
            </Box>

            <Box
              component="span"
              sx={{ display: { xs: "inline", sm: "none" } }}
            >
              ←
            </Box>
          </Button>

          <Button
            variant="contained"
            onClick={cargarTodo}
            sx={{
              minWidth: { xs: 44, sm: "auto" },
              px: { xs: 1.3, sm: 2 },
            }}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Actualizar
            </Box>

            <Box
              component="span"
              sx={{ display: { xs: "inline", sm: "none" } }}
            >
              ↻
            </Box>
          </Button>

          {puedeGestionar && (
            <>
              <Button
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                onClick={abrirVistaPublica}
                sx={{
                  minWidth: { xs: 44, sm: "auto" },
                  px: { xs: 1.3, sm: 2 },
                }}
              >
                <Box
                  component="span"
                  sx={{ display: { xs: "none", sm: "inline" } }}
                >
                  Vista pública
                </Box>
              </Button>

              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={copiarLinkPublico}
                sx={{
                  minWidth: { xs: 44, sm: "auto" },
                  px: { xs: 1.3, sm: 2 },
                }}
              >
                <Box
                  component="span"
                  sx={{ display: { xs: "none", sm: "inline" } }}
                >
                  Copiar link
                </Box>
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box mb={2}>
        <TicketHeader
          ticket={ticket}
          estados={estados}
          estadoNombre={estadoNombre}
          agenteAsignado={agenteAsignado}
          puedeCambiarEstado={puedeCambiarEstado}
          puedeResolver={puedeResolver}
          puedeEliminar={puedeEliminar}
          puedeGestionar={puedeGestionar}
          puedeTomarTicket={puedeTomarTicket}
          mostrarInfoTicket={mostrarInfoTicket}
          setMostrarInfoTicket={setMostrarInfoTicket}
          cambiarEstado={cambiarEstado}
          tomarTicket={tomarTicket}
          resolverTicket={resolverTicket}
          eliminarTicket={eliminarTicket}
          calcularTiempoResolucion={calcularTiempoResolucion}
          Info={TicketInfoItem}
        />
      </Box>

      {puedeGestionar && <TicketSharedAccessPanel ticketId={id} />}

      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: estiloVigencia().borderColor,
          bgcolor: estiloVigencia().bgcolor,
          boxShadow: "none",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: estiloVigencia().iconBg,
                color: estiloVigencia().iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AccessTimeIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                  lineHeight: 1.25,
                }}
              >
                Vigencia del ticket
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.25,
                }}
              >
                {ticket?.due_status === "finalized"
                  ? `Fecha límite original: ${ticket?.due_date || "Sin fecha"}`
                  : `Fecha límite: ${ticket?.due_date || "Sin fecha"}`}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={ticket?.due_label || "Sin vigencia"}
            color={colorVigencia()}
            sx={{
              alignSelf: { xs: "flex-start", sm: "center" },
              fontWeight: 900,
              borderRadius: 2,
              maxWidth: "100%",
            }}
          />
        </Stack>
      </Paper>

      {puedeAsignarResponsable && (
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2,
            borderRadius: 3,
            border: "1px solid #dbeafe",
            bgcolor: "#f8fbff",
            boxShadow: "none",
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                Asignación de responsable
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                }}
              >
                Responsable actual: <strong>{agenteAsignado}</strong>
              </Typography>
            </Box>

            {!ticket?.supportGroup && !ticket?.support_group_id && (
              <Alert severity="warning">
                Este ticket no tiene grupo de soporte asignado.
              </Alert>
            )}

            {!cargandoAgentes &&
              agentesDisponibles.length === 0 &&
              (ticket?.supportGroup || ticket?.support_group_id) && (
                <Alert severity="warning">
                  No hay agentes activos disponibles para el grupo de soporte de
                  este ticket.
                </Alert>
              )}

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <FormControl
                size="small"
                fullWidth
                disabled={
                  cargandoAgentes ||
                  asignandoResponsable ||
                  agentesDisponibles.length === 0
                }
              >
                <InputLabel id="responsable-select-label">
                  Agente responsable
                </InputLabel>

                <Select
                  labelId="responsable-select-label"
                  label="Agente responsable"
                  value={responsableSelectValue}
                  onChange={(event) =>
                    setResponsableSeleccionadoId(event.target.value)
                  }
                >
                  <MenuItem value="">
                    <em>Selecciona un agente</em>
                  </MenuItem>

                  {agentesDisponibles.map((agente) => (
                    <MenuItem key={agente.id} value={String(agente.id)}>
                      {agente.name} · {agente.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={asignarResponsable}
                disabled={
                  cargandoAgentes ||
                  asignandoResponsable ||
                  !responsableSelectValue
                }
                sx={{
                  minWidth: { xs: "100%", md: 190 },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  boxShadow: "none",
                  bgcolor: "#2563eb",
                  "&:hover": {
                    bgcolor: "#1d4ed8",
                    boxShadow: "none",
                  },
                }}
              >
                {asignandoResponsable ? "Guardando..." : "Guardar asignación"}
              </Button>

              <Button
                variant="outlined"
                onClick={cargarAgentesDisponibles}
                disabled={cargandoAgentes || asignandoResponsable}
                sx={{
                  minWidth: { xs: "100%", md: 150 },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {cargandoAgentes ? "Cargando..." : "Recargar agentes"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {puedeGestionar && (
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2,
            borderRadius: 3,
            border: "1px solid #e0e7ff",
            bgcolor: "#fafbff",
            boxShadow: "none",
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1}
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalOfferIcon fontSize="small" sx={{ color: "#2563eb" }} />

                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 900,
                      color: "#0f172a",
                    }}
                  >
                    Etiquetas del ticket
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    mt: 0.35,
                  }}
                >
                  Clasifica el ticket usando las etiquetas disponibles.
                </Typography>
              </Box>

              <Button
                size="small"
                variant="text"
                onClick={cargarEtiquetasTicket}
                disabled={cargandoEtiquetas || asignandoEtiqueta}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {cargandoEtiquetas ? "Cargando..." : "Actualizar etiquetas"}
              </Button>
            </Stack>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
                display="block"
                sx={{ mb: 0.75 }}
              >
                Asignadas
              </Typography>

              {cargandoEtiquetas ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Cargando etiquetas...
                  </Typography>
                </Stack>
              ) : etiquetasAsignadas.length > 0 ? (
                <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                  {etiquetasAsignadas.map((etiqueta) => (
                    <Chip
                      key={etiqueta.id}
                      label={etiqueta.nombre}
                      onDelete={() => quitarEtiqueta(etiqueta)}
                      color={etiqueta.estado ? "primary" : "default"}
                      variant={etiqueta.estado ? "filled" : "outlined"}
                      sx={{
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
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Este ticket todavía no tiene etiquetas asignadas.
                </Typography>
              )}
            </Box>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <FormControl
                size="small"
                fullWidth
                disabled={
                  cargandoEtiquetas ||
                  asignandoEtiqueta ||
                  etiquetasParaAsignar.length === 0
                }
              >
                <InputLabel id="etiqueta-select-label">Etiqueta</InputLabel>

                <Select
                  labelId="etiqueta-select-label"
                  label="Etiqueta"
                  value={etiquetaSeleccionadaId}
                  onChange={(event) =>
                    setEtiquetaSeleccionadaId(event.target.value)
                  }
                >
                  <MenuItem value="">
                    <em>Selecciona una etiqueta</em>
                  </MenuItem>

                  {etiquetasParaAsignar.map((etiqueta) => (
                    <MenuItem key={etiqueta.id} value={String(etiqueta.id)}>
                      {etiqueta.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={asignarEtiqueta}
                disabled={
                  cargandoEtiquetas ||
                  asignandoEtiqueta ||
                  !etiquetaSeleccionadaId
                }
                sx={{
                  minWidth: { xs: "100%", md: 170 },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  boxShadow: "none",
                  bgcolor: "#2563eb",
                  "&:hover": {
                    bgcolor: "#1d4ed8",
                    boxShadow: "none",
                  },
                }}
              >
                {asignandoEtiqueta ? "Asignando..." : "Asignar etiqueta"}
              </Button>
            </Stack>

            {!cargandoEtiquetas && etiquetasDisponibles.length === 0 && (
              <Alert severity="info">
                No hay etiquetas activas disponibles. Un administrador o
                supervisor debe crearlas desde el apartado Etiquetas.
              </Alert>
            )}

            {!cargandoEtiquetas &&
              etiquetasDisponibles.length > 0 &&
              etiquetasParaAsignar.length === 0 &&
              etiquetasAsignadas.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Todas las etiquetas activas disponibles ya están asignadas a
                  este ticket.
                </Typography>
              )}
          </Stack>
        </Paper>
      )}

      <Paper
        ref={chatContainerRef}
        sx={{
          height: {
            xs: "58dvh",
            sm: 460,
            md: 560,
          },
          minHeight: {
            xs: 360,
            md: 480,
          },
          overflowY: "auto",
          p: { xs: 1, sm: 1.5, md: 2 },
          mb: 2,
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          boxShadow: 1,
          bgcolor: "#efeae2",
          backgroundImage:
            "radial-gradient(rgba(17, 24, 39, 0.06) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        <ChatMessages
          messages={messages}
          chatRef={chatRef}
          esMensajeSistema={esMensajeSistema}
          esMio={esMio}
          inicial={inicial}
          abrirArchivo={abrirArchivo}
          getArchivoUrl={getArchivoUrl}
          puedeEliminarMensaje={puedeEliminarMensaje}
          eliminarMensaje={eliminarMensaje}
        />
      </Paper>

      {ticketCerrado ? (
        <Alert
          severity="info"
          variant="outlined"
          sx={{
            mb: 2,
            borderRadius: 2,
            bgcolor: "#f8fafc",
            borderColor: "#94a3b8",
            color: "#334155",
            alignItems: "center",
            "& .MuiAlert-icon": {
              color: "#475569",
            },
          }}
        >
          <Typography
            component="div"
            sx={{
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            <strong>Este ticket está cerrado.</strong> Para continuar, un
            administrador o supervisor debe cambiarlo a{" "}
            <strong>En proceso</strong>.
          </Typography>
        </Alert>
      ) : puedeMensajear ? (
        <Box
          sx={{
            position: { xs: "sticky", md: "static" },
            bottom: { xs: 0, md: "auto" },
            zIndex: 5,
            bgcolor: "#f5f6fa",
            pt: { xs: 1, md: 0 },
            pb: { xs: 1, md: 0 },
          }}
        >
          <ChatInput
            text={text}
            setText={setText}
            archivos={archivos}
            setArchivos={setArchivos}
            puedeGestionar={puedeGestionar}
            defaultTipoMensaje={tipoMensajePredeterminado}
            enviando={enviando}
            enviarMensaje={enviarMensaje}
          />
        </Box>
      ) : null}

      <AttachmentPreview
        previewOpen={previewOpen}
        previewFile={previewFile}
        cerrarPreview={cerrarPreview}
        esImagenArchivo={esImagenArchivo}
        esVideoArchivo={esVideoArchivo}
        esPdfArchivo={esPdfArchivo}
        getArchivoUrl={getArchivoUrl}
        descargarArchivo={descargarArchivo}
      />
    </Box>
  );
}
