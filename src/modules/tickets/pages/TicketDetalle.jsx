import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosCliente from "../../../services/axiosCliente";
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
  const [visibility, setVisibility] = useState("public"); // cambiar de "external"
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [isInternal, setIsInternal] = useState(false);

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
    const urlArchivo = `${STORAGE_URL}/${file.ruta}`;
    window.open(urlArchivo, "_blank");
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

  const abrirPreview = (file) => {
    setPreviewFile(file);
    setPreviewOpen(true);
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

  const enviarMensaje = async () => {
    if (!text.trim() && !archivo) return;
    setEnviando(true);
    setError("");
    try {
      const res = await axiosCliente.post(`/tickets/${id}/messages`, {
        message: text.trim(),
        visibility: isInternal ? "private" : "public",
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
    msg.type === "system" ||
    msg.tipo === "system" ||
    msg.is_system === true ||
    msg.message?.startsWith("Estado cambiado") ||
    msg.message?.startsWith("El mensaje de")
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

      {/* Info del ticket */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          boxShadow: 1,
          border: "1px solid #e5e7eb",
          mb: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Chip
              label={ticket?.folio}
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                bgcolor: "#eff6ff",
                color: "#1d4ed8",
              }}
            />
            <Typography>{ticket?.titulo}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {puedeCambiarEstado ? (
              <TextField
                select
                size="small"
                label="Estado"
                value={ticket?.status_id || ""}
                onChange={(e) => cambiarEstado(e.target.value)}
                sx={{ minWidth: 180 }}
              >
                {estados.map((estado) => (
                  <MenuItem key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Chip
                label={ticket?.status?.nombre || "Sin estado"}
                color="primary"
                size="small"
              />
            )}

            {/* ✅ Solo Admin y Supervisor pueden resolver */}
            {puedeResolver && (
              <Button
                variant="contained"
                color="success"
                onClick={resolverTicket}
              >
                Resolver
              </Button>
            )}

            {/* ✅ Solo Admin puede eliminar */}
            {puedeEliminar && (
              <Button color="error" variant="outlined" onClick={eliminarTicket}>
                Eliminar
              </Button>
            )}
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Info label="Estado" value={estadoNombre} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Info label="Agente asignado" value={agenteAsignado} />
            <Grid item xs={12} md={4}>
              <Info
                label="Resuelto por"
                value={ticket?.resolved_by?.name || "No resuelto"}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Info
                label="Tiempo de resolución"
                value={calcularTiempoResolucion()}
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Info
              label="Detalle"
              value={ticket?.descripcion || "Sin descripción"}
              multiline
            />
          </Grid>
        </Grid>
      </Paper>
    

    
      {/* Chat */}
      <Paper
        sx={{
          height: { xs: 420, md: 520 },
          overflowY: "auto",
          p: 2,
          mb: 2,
          bgcolor: "#f8fafc",
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          boxShadow: 1,
        }}
      >
        <Stack spacing={2}>
          {(messages ?? []).map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                justifyContent: esMensajeSistema(msg)
                  ? "center"
                  : esMio(msg)
                    ? "flex-end"
                    : "flex-start",
                mb: 1,
              }}
            >
              {esMensajeSistema(msg) ? (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    my: 1,
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 0.8,
                      bgcolor: "#e9edef",
                      borderRadius: 3,
                      textAlign: "center",
                      maxWidth: "80%",
                      color: "#54656f",
                      fontSize: 12,
                      boxShadow: "0 1px 2px rgba(0,0,0,.08)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {msg.message}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.3,
                        fontSize: 10.5,
                        color: "#8696a0",
                      }}
                    >
                      {new Date(msg.created_at).toLocaleString("es-MX", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    position: "relative",
                    maxWidth: "75%",
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: esMio(msg)
                      ? "#dbeafe"
                      : msg.visibility === "private"
                        ? "#fef3c7"
                        : "#ffffff",
                    border: "1px solid #e5e7eb",
                    boxShadow: 1,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={0.5}
                  >
                    <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
                      {inicial(msg)}
                    </Avatar>
                    <Typography fontWeight="bold" variant="body2">
                      {msg.user?.name || "Usuario"}
                    </Typography>
                    {msg.visibility === "private" && (
                      <Chip
                        label="Interno"
                        size="small"
                        color="warning"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Stack>

                  <Divider sx={{ my: 0.5 }} />

                  {msg.message && (
                    <Typography sx={{ mt: 0.5 }}>{msg.message}</Typography>
                  )}

                  <Typography sx={{ fontSize: "10px", color: "#999", mt: 0.5 }}>
                    {new Date(msg.created_at).toLocaleString()}
                  </Typography>

                  {msg.attachments?.length > 0 && (
                    <Box mt={1}>
                      {msg.attachments.map((file) => (
                        <Box
                          key={file.id}
                          onClick={() => abrirArchivo(file)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: "rgba(0,0,0,0.05)",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
                          }}
                        >
                          <InsertDriveFileIcon
                            fontSize="small"
                            color="primary"
                          />
                          <Typography
                            variant="body2"
                            color="primary"
                            fontWeight={500}
                          >
                            📎 {file.nombre_archivo}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {puedeEliminarMensaje(msg) && (
                    <IconButton
                      className="delete-btn"
                      size="small"
                      color="error"
                      onClick={() => eliminarMensaje(msg)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>
          ))}
          <div ref={chatRef} />
        </Stack>
      </Paper>

      {/* Enviar mensaje */}
      {puedeMensajear && (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          {archivo && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
                p: 1,
                bgcolor: "#f0f0f0",
                borderRadius: 1,
              }}
            >
              <InsertDriveFileIcon fontSize="small" />
              <Typography variant="body2">{archivo.name}</Typography>
              <Button
                size="small"
                color="error"
                onClick={() => setArchivo(null)}
                sx={{ ml: "auto" }}
              >
                Quitar
              </Button>
            </Box>
          )}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {puedeGestionar && (
              <TextField
                select
                label="Tipo"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                sx={{ minWidth: { xs: "100%", md: 190 } }}
              >
                <MenuItem value="external">Mensaje externo</MenuItem>
                <MenuItem value="internal">Nota interna</MenuItem>
              </TextField>
            )}

            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder={
                visibility === "internal"
                  ? "Escribe una nota interna..."
                  : "Escribe un mensaje..."
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachFileIcon />}
            >
              Archivo
              <input
                hidden
                type="file"
                accept="*/*"
                onChange={(e) => setArchivo(e.target.files[0] || null)}
              />
            </Button>

            <Button
              variant="contained"
              disabled={enviando || (!text.trim() && !archivo)}
              onClick={enviarMensaje}
            >
              {enviando ? "Enviando..." : "Enviar"}
            </Button>
          </Stack>
        </Paper>
      )}

      <Dialog
        open={previewOpen}
        onClose={cerrarPreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography fontWeight={800} noWrap>
            {previewFile?.nombre_archivo || "Vista previa"}
          </Typography>

          <IconButton onClick={cerrarPreview}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {previewFile && esImagenArchivo(previewFile) && (
            <Box
              component="img"
              src={getArchivoUrl(previewFile)}
              alt={previewFile.nombre_archivo}
              sx={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          )}

          {previewFile && esVideoArchivo(previewFile) && (
            <Box
              component="video"
              src={getArchivoUrl(previewFile)}
              controls
              sx={{
                width: "100%",
                maxHeight: "70vh",
                borderRadius: 2,
              }}
            />
          )}

          {previewFile && esPdfArchivo(previewFile) && (
            <Box
              component="iframe"
              src={getArchivoUrl(previewFile)}
              sx={{
                width: "100%",
                height: "70vh",
                border: "none",
                borderRadius: 2,
              }}
            />
          )}

          {previewFile &&
            !esImagenArchivo(previewFile) &&
            !esVideoArchivo(previewFile) &&
            !esPdfArchivo(previewFile) && (
              <Box textAlign="center" py={4}>
                <InsertDriveFileIcon color="primary" sx={{ fontSize: 60 }} />

                <Typography fontWeight={800} mt={2}>
                  Este archivo no tiene vista previa.
                </Typography>

                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                  onClick={() => descargarArchivo(previewFile)}
                >
                  Descargar archivo
                </Button>
              </Box>
            )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function Info({ label, value, multiline = false }) {
  return (
    <Box
      sx={{
        border: "1px solid #e5e7eb",
        p: 2,
        borderRadius: 2,
        minHeight: multiline ? 100 : 70,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        fontWeight={600}
        sx={{ whiteSpace: multiline ? "pre-line" : "normal" }}
      >
        {value}
      </Typography>
    </Box>
  );
}
