import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";

function PublicTicketTopBanner({
  system,
  color,
  titulo,
  subtitulo,
  descripcion,
}) {
  const logoUrl = system?.logo_url || "";

  return (
    <Box
      component="header"
      sx={{
        width: "100vw",
        maxWidth: "none",
        mx: "calc(50% - 50vw)",
        overflow: "hidden",
        position: "relative",
        background: `linear-gradient(135deg, #111827 0%, #0f172a 58%, ${color} 100%)`,
        color: "#ffffff",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.28,
          backgroundImage:
            "radial-gradient(circle at 18% 28%, rgba(255,255,255,0.85) 0 2px, transparent 3px), radial-gradient(circle at 72% 35%, rgba(255,255,255,0.65) 0 2px, transparent 3px), linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "120px 120px, 160px 160px, 34px 34px, 34px 34px",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.02), rgba(15,23,42,0.72))",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1168,
          mx: "auto",
          minHeight: { xs: 190, sm: 230, md: 285 },
          px: { xs: 2, sm: 3, md: 5 },
          py: { xs: 3, sm: 4, md: 5 },
          display: "flex",
          alignItems: "flex-end",
          boxSizing: "border-box",
        }}
      >
        <Stack spacing={1.3} sx={{ width: "100%" }}>
          <Chip
            label="The Business Ticket"
            size="small"
            sx={{
              width: "fit-content",
              bgcolor: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.28)",
              color: "#ffffff",
              fontWeight: 900,
              backdropFilter: "blur(8px)",
            }}
          />

          <Stack
            direction="row"
            spacing={{ xs: 1.4, md: 2 }}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            {logoUrl ? (
              <Box
                component="img"
                src={logoUrl}
                alt={system?.nombre || "Logo del sistema"}
                sx={{
                  width: { xs: 58, sm: 70, md: 86 },
                  height: { xs: 58, sm: 70, md: 86 },
                  objectFit: "contain",
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.96)",
                  p: { xs: 0.7, md: 1 },
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: { xs: 58, sm: 70, md: 86 },
                  height: { xs: 58, sm: 70, md: 86 },
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ImageIcon />
              </Box>
            )}

            <Box sx={{ minWidth: 0 }}>
              <Typography
                fontWeight={900}
                sx={{
                  fontSize: { xs: 26, sm: 34, md: 44 },
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                  textShadow: "0 4px 18px rgba(0,0,0,0.28)",
                  wordBreak: "break-word",
                }}
              >
                {titulo}
              </Typography>

              <Typography
                fontWeight={800}
                sx={{
                  mt: 0.6,
                  opacity: 0.94,
                  fontSize: { xs: 13, sm: 15, md: 17 },
                  lineHeight: 1.25,
                  display: "-webkit-box",
                  WebkitLineClamp: { xs: 2, md: 2 },
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {subtitulo}
              </Typography>
            </Box>
          </Stack>

          <Typography
            sx={{
              maxWidth: 760,
              opacity: 0.9,
              fontSize: { xs: 13, sm: 14, md: 15 },
              lineHeight: 1.55,
              display: { xs: "none", sm: "block" },
            }}
          >
            {descripcion}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

function PublicTicketFooter({ system, color, titulo }) {
  const logoUrl = system?.logo_url || "";

  return (
    <Box
      component="footer"
      sx={{
        width: "100vw",
        mx: "calc(50% - 50vw)",
        mt: { xs: 2, md: 4 },
        mb: 0,
        color: "#ffffff",
        px: { xs: 2, sm: 4, md: 8 },
        py: { xs: 4, sm: 5, md: 6 },
        background: `linear-gradient(135deg, #0f172a 0%, #111827 58%, ${color} 100%)`,
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 920,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography
          fontWeight={900}
          sx={{
            width: "100%",
            textAlign: "center",
            fontSize: { xs: 24, md: 32 },
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            mb: 1.5,
          }}
        >
          Gracias por contactarnos
        </Typography>

        <Typography
          sx={{
            width: "100%",
            maxWidth: 720,
            mx: "auto",
            textAlign: "center",
            opacity: 0.92,
            fontSize: { xs: 13, md: 15 },
            lineHeight: 1.55,
            mb: 3,
          }}
        >
          Tu solicitud será revisada por el equipo de soporte. Conserva el folio
          de tu ticket para consultar el seguimiento público cuando lo necesites.
        </Typography>

        <Box
          sx={{
            width: 74,
            height: 74,
            borderRadius: 4,
            bgcolor: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 1,
            mb: 2,
          }}
        >
          {logoUrl ? (
            <Box
              component="img"
              src={logoUrl}
              alt={system?.nombre || "Logo del sistema"}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <ImageIcon sx={{ color }} />
          )}
        </Box>

        <Typography
          fontWeight={900}
          sx={{
            width: "100%",
            textAlign: "center",
            fontSize: { xs: 13, md: 14 },
          }}
        >
          {system?.nombre || titulo} | The Business Ticket
        </Typography>
      </Box>
    </Box>
  );
}

function normalizarEstadoVisual(ticket) {
  const nombre = String(
    ticket?.status?.nombre ||
      ticket?.status_nombre ||
      ticket?.estado ||
      ""
  )
    .trim()
    .toLowerCase();

  const id = Number(ticket?.status_id || ticket?.status?.id || 0);

  if (nombre.includes("cerr")) {
    return {
      label: "Cerrado",
      bg: "#334155",
      color: "#ffffff",
      border: "#334155",
    };
  }

  if (nombre.includes("resuelto") || id === 3) {
    return {
      label: "Resuelto",
      bg: "#dcfce7",
      color: "#166534",
      border: "#86efac",
    };
  }

  if (nombre.includes("proceso") || id === 2) {
    return {
      label: "En proceso",
      bg: "#ffedd5",
      color: "#9a3412",
      border: "#fdba74",
    };
  }

  if (nombre.includes("pendiente")) {
    return {
      label: "Pendiente",
      bg: "#fef9c3",
      color: "#854d0e",
      border: "#fde047",
    };
  }

  if (nombre.includes("abierto") || nombre.includes("reciente") || id === 1) {
    return {
      label: nombre.includes("reciente") ? "Abierto" : "Abierto",
      bg: "#dbeafe",
      color: "#1d4ed8",
      border: "#93c5fd",
    };
  }

  return {
    label: ticket?.status?.nombre || ticket?.status_nombre || `Estado ${id || "-"}`,
    bg: "#f1f5f9",
    color: "#334155",
    border: "#cbd5e1",
  };
}

function PublicTicketInfoItem({ label, value, badge }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        p: { xs: 1.1, md: 1.3 },
        borderRadius: 2.5,
        bgcolor: "#f8fafc",
        border: "1px solid #e5e7eb",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={900}
        sx={{
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontSize: { xs: 10.5, md: 11 },
        }}
      >
        {label}
      </Typography>

      {badge ? (
        <Chip
          label={badge.label}
          size="small"
          sx={{
            mt: 0.6,
            maxWidth: "100%",
            fontWeight: 900,
            bgcolor: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
            "& .MuiChip-label": {
              px: 1.1,
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        />
      ) : (
        <Typography
          fontWeight={900}
          sx={{
            mt: 0.5,
            color: "#0f172a",
            fontSize: { xs: 12.5, md: 14 },
            lineHeight: 1.25,
            wordBreak: "break-word",
          }}
        >
          {value || "-"}
        </Typography>
      )}
    </Box>
  );
}

function TicketPublicoHistorial() {
  const { trackingCode } = useParams();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const query = new URLSearchParams(location.search);
  const accessToken = query.get("access_token");

  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [ticket, setTicket] = useState(null);
  const [system, setSystem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [archivoPreview, setArchivoPreview] = useState(null);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingCode, accessToken]);

  useEffect(() => {
    scrollAlFinal();
  }, [messages]);

  const cargarHistorial = async () => {
    setLoading(true);
    setError("");
    setOk("");

    try {
      const res = await axiosCliente.get(construirUrlHistorial());

      setTicket(res.data.ticket);
      setSystem(res.data.system || null);
      setMessages(res.data.messages || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo cargar el historial del ticket.",
      );
    } finally {
      setLoading(false);
    }
  };

  const recargarHistorial = async () => {
    setRefrescando(true);
    setError("");
    setOk("");

    try {
      const res = await axiosCliente.get(construirUrlHistorial());

      setTicket(res.data.ticket);
      setSystem(res.data.system || null);
      setMessages(res.data.messages || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo actualizar el historial.",
      );
    } finally {
      setRefrescando(false);
    }
  };

  const seleccionarArchivos = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setArchivos((prev) => [...prev, ...files]);

    e.target.value = "";
  };

  const quitarArchivo = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const enviarMensaje = async () => {
    if (!message.trim() && archivos.length === 0) return;

    setEnviando(true);
    setError("");
    setOk("");

    try {
      const formData = new FormData();

      if (accessToken) {
        formData.append("access_token", accessToken);
      }

      formData.append("message", message.trim());

      archivos.forEach((archivo) => {
        formData.append("attachments[]", archivo);
      });

      await axiosCliente.post(
        `/public/tickets/${trackingCode}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setMessage("");
      setArchivos([]);

      await recargarHistorial();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo enviar el mensaje.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const copiarTexto = async (texto, mensajeOk) => {
    if (!texto) return;

    try {
      await navigator.clipboard.writeText(texto);
      setOk(mensajeOk);
      setError("");
    } catch (error) {
      setError("No se pudo copiar la información.");
    }
  };

  const scrollAlFinal = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  const manejarEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };


  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const parsed = new Date(String(fecha).replace(" ", "T"));

    if (Number.isNaN(parsed.getTime())) {
      return fecha;
    }

    return parsed.toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const formatoPeso = (bytes) => {
    if (!bytes) return "";

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const esImagen = (archivo) => {
    const nombre =
      archivo?.nombre_archivo || archivo?.ruta || archivo?.url || "";

    return /\.(jpg|jpeg|png|webp|gif)$/i.test(nombre);
  };

  const abrirPreview = (archivo) => {
    setArchivoPreview(archivo);
  };

  const cerrarPreview = () => {
    setArchivoPreview(null);
  };

  const construirUrlHistorial = () => {
    const params = new URLSearchParams();

    if (accessToken) {
      params.append("access_token", accessToken);
    }

    const queryString = params.toString();

    return queryString
      ? `/public/tickets/${trackingCode}?${queryString}`
      : `/public/tickets/${trackingCode}`;
  };

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="#f8fafc"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !ticket) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="#f8fafc"
        p={2}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const estado = normalizarEstadoVisual(ticket);
  const color = system?.color_hex || "#23388B";
  const portada = system?.dato_portada || {};

  const tituloPortada = portada.titulo || system?.nombre || "Soporte";
  const subtituloPortada = portada.subtitulo || "Historial público del ticket";
  const descripcionPortada =
    portada.descripcion ||
    "Consulta el seguimiento de tu solicitud y responde al equipo de soporte.";

  const sistemaNombre = system?.nombre || ticket?.system?.nombre || "Sin sistema";
  const seccionNombre =
    ticket?.category?.nombre ||
    ticket?.seccion_nombre ||
    ticket?.section?.nombre ||
    "Sin sección";
  const fechaCreacion = formatearFecha(ticket?.created_at);
  const fechaActualizacion = formatearFecha(ticket?.updated_at);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: "100%",
        bgcolor: "#eef2f7",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: { xs: 2, md: 3 },
        px: 0,
        pt: 0,
        pb: 0,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <PublicTicketTopBanner
        system={system}
        color={color}
        titulo={tituloPortada}
        subtitulo={subtituloPortada}
        descripcion={descripcionPortada}
      />

      <Paper
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", md: 920 },
          mx: "auto",
          height: { xs: "calc(100dvh - 32px)", md: 720 },
          borderRadius: { xs: 0, md: 4 },
          border: { xs: "none", md: "1px solid #e5e7eb" },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f8fafc",
          boxShadow: { xs: "none", md: 4 },
        }}
      >
        <Box
          sx={{
            px: { xs: 1.6, sm: 2.2, md: 3 },
            py: { xs: 1.5, md: 2 },
            bgcolor: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "flex-start" }}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                fontWeight={900}
                sx={{
                  color,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Historial público del ticket
              </Typography>

              <Typography
                fontWeight={900}
                sx={{
                  mt: 0.5,
                  color: "#0f172a",
                  fontSize: { xs: 18, sm: 21, md: 24 },
                  lineHeight: 1.15,
                  wordBreak: "break-word",
                }}
              >
                {ticket?.titulo}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.6,
                  fontSize: { xs: 12.5, md: 14 },
                  lineHeight: 1.45,
                }}
              >
                Consulta el avance del ticket y las respuestas públicas del
                cliente y del área de soporte.
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{ xs: "space-between", sm: "flex-end" }}
              sx={{ flexShrink: 0 }}
            >


              <Stack direction="row" spacing={0.8} alignItems="center">
                <Tooltip title="Copiar folio">
                  <IconButton
                    onClick={() => copiarTexto(ticket?.folio, "Folio copiado.")}
                    size="small"
                    sx={{
                      color: "#334155",
                      border: "1px solid #d1d5db",
                      bgcolor: "#f8fafc",
                      width: { xs: 34, md: 38 },
                      height: { xs: 34, md: 38 },
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Actualizar historial">
                  <IconButton
                    onClick={recargarHistorial}
                    disabled={refrescando}
                    size="small"
                    sx={{
                      color: "#334155",
                      border: "1px solid #d1d5db",
                      bgcolor: "#f8fafc",
                      opacity: refrescando ? 0.6 : 1,
                      width: { xs: 34, md: 38 },
                      height: { xs: 34, md: 38 },
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 1, md: 1.2 },
              mt: 1.8,
            }}
          >
            <PublicTicketInfoItem label="Folio" value={ticket?.folio} />
            <PublicTicketInfoItem label="Sistema" value={sistemaNombre} />
            <PublicTicketInfoItem label="Sección" value={seccionNombre} />
            <PublicTicketInfoItem label="Estado" badge={estado} />
            <PublicTicketInfoItem label="Creado" value={fechaCreacion} />
            <PublicTicketInfoItem
              label="Última actualización"
              value={fechaActualizacion}
            />
          </Box>
        </Box>

        {(error || ok) && (
          <Box
            sx={{
              px: { xs: 1.5, md: 3 },
              pt: 1.3,
              flexShrink: 0,
            }}
          >
            {error && <Alert severity="error">{error}</Alert>}
            {ok && <Alert severity="success">{ok}</Alert>}
          </Box>
        )}

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 1, sm: 1.5, md: 3 },
            py: { xs: 1.5, md: 2 },
            bgcolor: "#e5ddd5",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.22), rgba(255,255,255,0.22))",
          }}
        >
          <Stack spacing={{ xs: 1.2, md: 1.5 }}>
            {messages.length === 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                <Paper
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.85)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Aún no hay mensajes públicos.
                  </Typography>
                </Paper>
              </Box>
            )}

            {messages.map((msg) => {
              const esCliente = msg.user?.role === "client";
              const esEvento = msg.type === "event";
              const adjuntos = Array.isArray(msg.attachments)
                ? msg.attachments
                : [];
              const autorTipo = esCliente ? "Cliente" : "Soporte";

              if (esEvento) {
                return (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        px: { xs: 1.4, md: 2 },
                        py: 1,
                        borderRadius: 3,
                        bgcolor: "#e2e8f0",
                        border: "1px solid #cbd5e1",
                        textAlign: "center",
                        maxWidth: { xs: "88%", md: 380 },
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={900}
                        color="text.secondary"
                        display="block"
                      >
                        Evento del sistema
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="#334155"
                        mt={0.3}
                        sx={{
                          fontSize: { xs: 12.5, md: 14 },
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.message}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={0.5}
                      >
                        {formatearFecha(msg.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                );
              }

              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    justifyContent: esCliente ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: {
                        xs: "92%",
                        sm: "82%",
                        md: "68%",
                      },
                      minWidth: { xs: 0, sm: 180 },
                      px: { xs: 1.3, md: 1.6 },
                      py: { xs: 1, md: 1.2 },
                      borderRadius: 3,
                      bgcolor: esCliente ? "#d9fdd3" : "#ffffff",
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                      borderTopRightRadius: esCliente ? 4 : 18,
                      borderTopLeftRadius: esCliente ? 18 : 4,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={900}
                      color={esCliente ? "#166534" : "#1d4ed8"}
                      display="block"
                      mb={0.5}
                    >
                      {autorTipo} · {msg.user?.name || "Usuario"}
                    </Typography>

                    {msg.message && (
                      <Typography
                        variant="body2"
                        whiteSpace="pre-line"
                        sx={{
                          wordBreak: "break-word",
                          color: "#111827",
                          lineHeight: 1.5,
                          fontSize: { xs: 13, md: 14 },
                        }}
                      >
                        {msg.message}
                      </Typography>
                    )}

                    {adjuntos.length > 0 && (
                      <Stack spacing={1} mt={1}>
                        {adjuntos.map((archivo) => {
                          if (esImagen(archivo)) {
                            return (
                              <Box
                                key={archivo.id}
                                onClick={() => abrirPreview(archivo)}
                                sx={{
                                  cursor: "pointer",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  border: "1px solid rgba(0,0,0,0.12)",
                                  bgcolor: "#ffffff",
                                  width: {
                                    xs: "100%",
                                    sm: 230,
                                    md: 250,
                                  },
                                  maxWidth: "100%",
                                }}
                              >
                                <Box
                                  component="img"
                                  src={archivo.url}
                                  alt={
                                    archivo.nombre_archivo || "Imagen adjunta"
                                  }
                                  sx={{
                                    display: "block",
                                    width: "100%",
                                    height: { xs: 135, sm: 145, md: 155 },
                                    objectFit: "cover",
                                  }}
                                />

                                <Box
                                  sx={{
                                    px: 1,
                                    py: 0.7,
                                    bgcolor: "rgba(255,255,255,0.9)",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    display="block"
                                  >
                                    {archivo.nombre_archivo || "Imagen adjunta"}
                                  </Typography>
                                </Box>
                              </Box>
                            );
                          }

                          return (
                            <Button
                              key={archivo.id}
                              href={archivo.url}
                              download={archivo.nombre_archivo || true}
                              variant="outlined"
                              size="small"
                              startIcon={<InsertDriveFileIcon />}
                              sx={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                borderRadius: 2,
                                bgcolor: "rgba(255,255,255,0.65)",
                                color: "#1f2937",
                                borderColor: "rgba(0,0,0,0.12)",
                                maxWidth: "100%",
                                "& .MuiButton-startIcon": {
                                  flexShrink: 0,
                                },
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: { xs: 180, sm: 260, md: 340 },
                                }}
                              >
                                {archivo.nombre_archivo || "Archivo adjunto"}
                              </Box>
                            </Button>
                          );
                        })}
                      </Stack>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      textAlign="right"
                      mt={0.6}
                      sx={{ fontSize: { xs: 10.5, md: 12 } }}
                    >
                      {formatearFecha(msg.created_at)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}

            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        <Divider />

        <Box
          sx={{
            p: { xs: 1, sm: 1.3, md: 2 },
            bgcolor: "#ffffff",
            flexShrink: 0,
          }}
        >
          {archivos.length > 0 && (
            <Stack
              spacing={1}
              mb={1.2}
              sx={{
                maxHeight: { xs: 120, md: 170 },
                overflowY: "auto",
                pr: 0.5,
              }}
            >
              {archivos.map((archivo, index) => (
                <Box
                  key={`${archivo.name}-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    p: 1,
                    borderRadius: 2,
                    bgcolor: "#f8fafc",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{ minWidth: 0 }}
                  >
                    <InsertDriveFileIcon color="action" />

                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {archivo.name}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {formatoPeso(archivo.size)}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => quitarArchivo(index)}
                    disabled={enviando}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}

          <Stack
            direction="row"
            spacing={{ xs: 0.8, md: 1.2 }}
            alignItems="flex-end"
          >
            <Tooltip title="Adjuntar archivo">
              <IconButton
                component="label"
                disabled={enviando}
                sx={{
                  width: { xs: 40, md: 42 },
                  height: { xs: 40, md: 42 },
                  border: "1px solid #d1d5db",
                  bgcolor: "#f8fafc",
                  flexShrink: 0,
                }}
              >
                <AttachFileIcon fontSize="small" />

                <input
                  type="file"
                  hidden
                  multiple
                  onChange={seleccionarArchivos}
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                />
              </IconButton>
            </Tooltip>

            <TextField
              placeholder="Escribir mensaje público"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={manejarEnter}
              multiline
              minRows={1}
              maxRows={4}
              fullWidth
              disabled={enviando}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 4,
                  bgcolor: "#f8fafc",
                  fontSize: { xs: 13, md: 14 },
                },
              }}
            />

            <Button
              variant="contained"
              onClick={enviarMensaje}
              disabled={enviando || (!message.trim() && archivos.length === 0)}
              endIcon={<SendIcon />}
              sx={{
                minWidth: { xs: 42, sm: 48, md: 150 },
                width: { xs: 42, sm: 48, md: "auto" },
                height: { xs: 40, md: 42 },
                px: { xs: 0, md: 2 },
                borderRadius: 4,
                fontWeight: 900,
                bgcolor: color,
                flexShrink: 0,
                "&:hover": {
                  bgcolor: color,
                  opacity: 0.92,
                },
                "& .MuiButton-endIcon": {
                  m: { xs: 0, md: "0 0 0 8px" },
                },
              }}
            >
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                {enviando ? "Enviando" : "Enviar"}
              </Box>
            </Button>
          </Stack>
        </Box>
      </Paper>

      <PublicTicketFooter
        system={system}
        color={color}
        titulo={tituloPortada}
      />

      <Dialog
        open={Boolean(archivoPreview)}
        onClose={cerrarPreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, md: 3 },
            borderRadius: { xs: 2, md: 3 },
            overflow: "hidden",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            bgcolor: "#0f172a",
            position: "relative",
          }}
        >
          <IconButton
            onClick={cerrarPreview}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              color: "#ffffff",
              bgcolor: "rgba(0,0,0,0.45)",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.65)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {archivoPreview && (
            <Box>
              <Box
                component="img"
                src={archivoPreview.url}
                alt={archivoPreview.nombre_archivo || "Imagen adjunta"}
                sx={{
                  display: "block",
                  width: "100%",
                  maxHeight: { xs: "72vh", md: "80vh" },
                  objectFit: "contain",
                  bgcolor: "#0f172a",
                }}
              />

              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: "#ffffff",
                }}
              >
                <Typography fontWeight={800} noWrap>
                  {archivoPreview.nombre_archivo || "Imagen adjunta"}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default TicketPublicoHistorial;
