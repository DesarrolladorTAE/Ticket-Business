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
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const STORAGE_URL = "https://api.thebusinessticket.com/storage";

export default function TicketDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("USUARIO") || "{}");
  const roles = Array.isArray(usuario?.roles) ? usuario.roles : [];

  const isAdmin = roles.includes("Administrador");
  const isAgent = roles.includes("Agente");
  const isSupervisor = roles.includes("Supervisor");
  const isClient = roles.includes("Cliente");

  const puedeCambiarEstado = isAdmin || isSupervisor;
  const puedeMensajear = isAdmin || isAgent || isSupervisor || isClient;
  const puedeGestionar = isAdmin || isAgent || isSupervisor;
  const puedeResolver = isAdmin || isSupervisor;
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
  const [mostrarInfoTicket, setMostrarInfoTicket] = useState(false);

  const chatRef = useRef(null);

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
      setMessages(msgRes.data.data || []);
      setEstados(statusRes.data.data || statusRes.data || []);
    } catch (error) {
      console.log("ERROR CARGAR TICKET:", error.response?.data || error);
      setError("No se pudo cargar la información del ticket.");
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

      Swal.fire({
        icon: "error",
        title: "No se pudo cambiar el estado",
        text: error.response?.data?.message || "No se pudo cambiar el estado.",
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
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setText("");
      setArchivo(null);

      cargarTodo();
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
      cargarTodo();
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
      chatRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  const esMio = (msg) => Number(msg.user_id) === Number(usuario?.id);

  const inicial = (msg) => (msg.user?.name || "U").charAt(0).toUpperCase();

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

  const puedeEliminarMensaje = (msg) => {
    if (isAdmin || isSupervisor) return true;

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
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/mis-tickets")}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Volver
          </Button>

          <Button
            variant="contained"
            onClick={cargarTodo}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Actualizar
          </Button>
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

      <Paper
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

      {puedeMensajear && (
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
            archivo={archivo}
            setArchivo={setArchivo}
            puedeGestionar={puedeGestionar}
            enviando={enviando}
            enviarMensaje={enviarMensaje}
          />
        </Box>
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