import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axiosCliente from "../../../services/axiosCliente";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import TicketHeader from "../components/TicketHeader";
import AttachmentPreview from "../components/AttachmentPreview";
import TicketInfoItem from "../components/TicketInfoItem";

import Swal from "sweetalert2";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

const STORAGE_URL = "https://api.thebusinessticket.com/storage";

export default function TicketDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const usuario = JSON.parse(localStorage.getItem("USUARIO") || "{}");

  // Roles garantizados como array
  const roles = Array.isArray(usuario?.roles) ? usuario.roles : [];

  const isAdmin = roles.includes("Administrador");
  const isAgent = roles.includes("Agente");
  const isSupervisor = roles.includes("Supervisor");
  const isClient = roles.includes("Cliente");

  const puedeCambiarEstado = isAdmin || isSupervisor;

  // ✅ Puede mensajear
  const puedeMensajear = isAdmin || isAgent || isSupervisor || isClient;

  // ✅ Puede ver selector interno/externo
  const puedeGestionar = isAdmin || isAgent || isSupervisor;

  // ✅ Solo Admin y Supervisor pueden resolver/finalizar
  const puedeResolver = isAdmin || isSupervisor;

  // ✅ Solo Admin puede eliminar
  const puedeEliminar = isAdmin;

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [estados, setEstados] = useState([]);
  const [text, setText] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarInfoTicket, setMostrarInfoTicket] = useState(false);

  // ✅ Solo staff puede enviar mensajes internos
  const canSendPrivate =
    roles.includes("Administrador") ||
    roles.includes("Supervisor") ||
    roles.includes("Agente");

  const chatRef = useRef(null);

  useEffect(() => {
    cargarTodo();
  }, [id]);
  useEffect(() => {
    scrollBottom();
  }, [messages]);

  useEffect(() => {
    if (!id || Number.isNaN(Number(id))) {
      navigate("/mis-tickets", { replace: true });
      return;
    }

    cargarTodo();
  }, [id]);

  const cargarTodo = async () => {
    setLoading(true);
    setError("");
    try {
      const [ticketRes, msgRes, statusRes] = await Promise.all([
        axiosCliente.get(`/tickets/${id}`),
        axiosCliente.get(`/tickets/${id}/messages`),
        axiosCliente.get("/ticket-statuses"),
      ]);

      setTicket(ticketRes.data.data || ticketRes.data);
      console.log("TICKET:", ticketRes.data.data || ticketRes.data);
      setMessages(msgRes.data.data || []);
      setEstados(statusRes.data.data || statusRes.data || []);
    } catch (error) {
      console.log(error);
      setError("No se pudo cargar la información del ticket");
    } finally {
      setLoading(false);
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

      alert(error.response?.data?.message || "No se pudo cambiar el estado.");
    }
  };

  const abrirArchivo = (file) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const getArchivoUrl = (file) => {
    return `${STORAGE_URL}/${file.ruta}`;
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

  const cerrarPreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
  };

  const descargarArchivo = (file) => {
    const url = getArchivoUrl(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = file.nombre_archivo || "archivo";
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
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

  const enviarMensaje = async (visibility = "public") => {
    if (!text.trim() && !archivo) return;

    setEnviando(true);
    setError("");

    try {
      const res = await axiosCliente.post(`/tickets/${id}/messages`, {
        message: text.trim(),
        visibility,
      });

      const messageId = res.data.data.id;

      if (archivo) {
        const formData = new FormData();

        formData.append("ticket_id", id);
        formData.append("message_id", messageId);
        formData.append("archivo", archivo);

        await axiosCliente.post("/ticket-attachments", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setText("");
      setArchivo(null);
      cargarTodo();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo enviar mensaje");
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
    });
    if (!confirmar.isConfirmed) return;
    try {
      await axiosCliente.delete(`/tickets/${id}`);
      navigate("/mis-tickets");
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo eliminar el ticket",
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
    });
    if (!confirmar.isConfirmed) return;
    try {
      await axiosCliente.delete(`/ticket-messages/${mensaje.id}`);
      cargarTodo();
    } catch (error) {
      setError(error.response?.data?.message || "No se pudo eliminar mensaje");
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
    });
    if (!confirmar.isConfirmed) return;
    await axiosCliente.post(`/tickets/${id}/resolve`);
    cargarTodo();
  };

  const scrollBottom = () => {
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const esMio = (msg) => Number(msg.user_id) === Number(usuario?.id);
  const inicial = (msg) => (msg.user?.name || "U").charAt(0).toUpperCase();
  const estadoNombre =
    ticket?.status?.nombre ||
    ticket?.status?.name ||
    ticket?.status ||
    "Abierto";

const esMensajeSistema = (msg) => {
  return (
    msg?.type === "system" ||
    msg?.tipo === "system" ||
    msg?.is_system === true ||
    msg?.message?.startsWith("Ticket creado") ||
    msg?.message?.includes("tomó el ticket") ||
    msg?.message?.startsWith("Estado cambiado") ||
    msg?.message?.includes("fue eliminado por")
  );
};
  const agenteAsignado = ticket?.responsable
    ? ticket.responsable.name
    : "Sin asignar";

  // Permisos para eliminar mensajes
  const puedeEliminarMensaje = (msg) => {
    // Administrador y Supervisor pueden eliminar cualquier mensaje
    if (isAdmin || isSupervisor) return true;

    // Agente y Cliente solo pueden eliminar sus propios mensajes
    if (isAgent || isClient) {
      return Number(msg.user_id) === Number(usuario?.id);
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

  return (
    <Box
      sx={{
        maxWidth: "1300px",
        mx: "auto",
      }}
    >
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Detalle del ticket
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Información, seguimiento y conversación.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TicketHeader
        ticket={ticket}
        estados={estados}
        estadoNombre={estadoNombre}
        agenteAsignado={agenteAsignado}
        puedeCambiarEstado={puedeCambiarEstado}
        puedeResolver={puedeResolver}
        puedeEliminar={puedeEliminar}
        puedeGestionar={puedeGestionar}
        mostrarInfoTicket={mostrarInfoTicket}
        setMostrarInfoTicket={setMostrarInfoTicket}
        cambiarEstado={cambiarEstado}
        tomarTicket={tomarTicket}
        resolverTicket={resolverTicket}
        eliminarTicket={eliminarTicket}
        calcularTiempoResolucion={calcularTiempoResolucion}
        Info={TicketInfoItem}
      />

      {/* Chat */}
      <Paper
        sx={{
          height: { xs: 420, md: 560 },
          overflowY: "auto",
          p: 2,
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

      {/* Enviar mensaje */}
      {puedeMensajear && (
        <ChatInput
          text={text}
          setText={setText}
          archivo={archivo}
          setArchivo={setArchivo}
          puedeGestionar={puedeGestionar}
          enviando={enviando}
          enviarMensaje={enviarMensaje}
        />
      )}

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
