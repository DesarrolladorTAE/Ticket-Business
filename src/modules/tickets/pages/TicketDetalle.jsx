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
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const STORAGE_URL = "https://api.thebusinessticket.com/storage";

export default function TicketDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const usuario = JSON.parse(localStorage.getItem("USUARIO") || "null");

  const roles = usuario?.roles || [];
  const isAdmin      = roles.includes("Administrador");
  const isAgent      = roles.includes("Agente");
  const isSupervisor = roles.includes("Supervisor");
  const isClient     = roles.includes("Cliente");

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
  const [text, setText] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [visibility, setVisibility] = useState("external");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const chatRef = useRef(null);

  useEffect(() => { cargarTodo(); }, [id]);
  useEffect(() => { scrollBottom(); }, [messages]);

  const cargarTodo = async () => {
    setLoading(true);
    setError("");
    try {
      const ticketRes = await axiosCliente.get(`/tickets/${id}`);
      setTicket(ticketRes.data.data || ticketRes.data);

      const msgRes = await axiosCliente.get(`/tickets/${id}/messages`);
      setMessages(msgRes.data.data || []);
    } catch (error) {
      console.log(error);
      setError("No se pudo cargar la información del ticket");
    } finally {
      setLoading(false);
    }
  };

  const abrirArchivo = (file) => {
    const urlArchivo = `${STORAGE_URL}/${file.ruta}`;
    window.open(urlArchivo, "_blank");
  };

  const enviarMensaje = async () => {
    if (!text.trim() && !archivo) return;
    setEnviando(true);
    setError("");
    try {
      const res = await axiosCliente.post(`/tickets/${id}/messages`, {
        message: text.trim(),
        visibility: puedeGestionar ? visibility : "external",
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
      setError(error.response?.data?.message || "No se pudo eliminar el ticket");
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
  const estadoNombre = ticket?.status?.nombre || ticket?.status?.name || ticket?.status || "Abierto";
  const agenteAsignado = ticket?.responsable ? ticket.responsable.name : "Sin asignar";

  // ✅ Solo Admin puede eliminar mensajes
  const puedeEliminarMensaje = (item) => {
    if (!isAdmin) return false;
    if (Number(ticket?.status_id) === 3) return false;
    return true;
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
        <Typography variant="h5" fontWeight="bold">Detalle del ticket</Typography>
        <Typography variant="body2" color="text.secondary">
          Información, seguimiento y conversación.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Info del ticket */}
      <Paper sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        boxShadow: 1,
        border: "1px solid #e5e7eb",
        mb: 3,
      }}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
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
            <Chip label={estadoNombre} color="primary" />

            {/* ✅ Solo Admin y Supervisor pueden resolver */}
            {puedeResolver && (
              <Button variant="contained" color="success" onClick={resolverTicket}>
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
          </Grid>
          <Grid item xs={12}>
            <Info label="Detalle" value={ticket?.descripcion || "Sin descripción"} multiline />
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
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                justifyContent: esMio(msg) ? "flex-end" : "flex-start",
              }}
            >
              <Box
        sx={{
          maxWidth: "75%",
          p: 1.5,
          borderRadius: 3,
          bgcolor: esMio(msg)
            ? "#dbeafe"
            : "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: 1,
        }}
      >
              
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
                    {inicial(msg)}
                  </Avatar>
                  <Typography fontWeight="bold" variant="body2">
                    {msg.user?.name || "Usuario"}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 0.5 }} />

                {msg.message && (
                  <Typography sx={{ mt: 0.5 }}>{msg.message}</Typography>
                )}

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
                        <InsertDriveFileIcon fontSize="small" color="primary" />
                        <Typography variant="body2" color="primary" fontWeight={500}>
                          📎 {file.nombre_archivo}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* ✅ Solo Admin puede eliminar mensajes */}
                {puedeEliminarMensaje(msg) && (
                  <Button
                    size="small"
                    color="error"
                    variant="text"
                    onClick={() => eliminarMensaje(msg)}
                    sx={{ mt: 1, textTransform: "none", p: 0 }}
                  >
                    Eliminar mensaje
                  </Button>
                )}
              </Box>
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
              <Button size="small" color="error" onClick={() => setArchivo(null)} sx={{ ml: "auto" }}>
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

            <Button component="label" variant="outlined" startIcon={<AttachFileIcon />}>
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