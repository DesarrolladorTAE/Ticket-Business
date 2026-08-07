import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";

const getStorageKey = (trackingCode) =>
  `TBT_SHARED_TICKET_SESSION_${trackingCode}`;

const statusNombre = (statusId) => {
  switch (Number(statusId)) {
    case 1:
      return "Abierto";

    case 2:
      return "En proceso";

    case 3:
      return "Resuelto";

    case 4:
      return "Cerrado";

    default:
      return "Sin estado";
  }
};

const statusColor = (statusId) => {
  switch (Number(statusId)) {
    case 2:
      return "warning";

    case 3:
      return "success";

    case 4:
      return "default";

    default:
      return "primary";
  }
};

export default function TicketCompartido() {
  const { trackingCode } = useParams();

  const chatEndRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [sessionToken, setSessionToken] = useState(() => {
    if (!trackingCode) return "";

    return sessionStorage.getItem(getStorageKey(trackingCode)) || "";
  });

  const [ticket, setTicket] = useState(null);
  const [access, setAccess] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [archivo, setArchivo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [error, setError] = useState("");

  const ticketCerrado = Number(ticket?.status_id || 0) === 4;

  useEffect(() => {
    if (!sessionToken || !trackingCode) {
      return;
    }

    cargarSesion(sessionToken);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingCode, sessionToken]);

  useEffect(() => {
    if (!messages.length) return;

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  }, [messages]);

  const headersPublicos = (token = sessionToken) => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  });

  const cargarSesion = async (token) => {
    setLoadingTicket(true);
    setError("");

    try {
      await Promise.all([
        cargarTicket(token, false),
        cargarMensajes(token, false),
      ]);
    } catch (error) {
      console.log(
        "ERROR CARGAR SESIÓN COMPARTIDA:",
        error.response?.data || error,
      );

      limpiarSesion();

      setError(
        error.response?.data?.message ||
          "La sesión pública no es válida o fue revocada.",
      );
    } finally {
      setLoadingTicket(false);
    }
  };

  const iniciarAcceso = async () => {
    const correo = email.trim().toLowerCase();

    if (!correo || !password) {
      setError("Escribe tu correo y contraseña.");

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosCliente.post(
        `/public/shared-tickets/${trackingCode}/access`,
        {
          email: correo,
          password,
        },
      );

      const data = response.data?.data || {};
      const token = data.session_token || "";

      if (!token) {
        throw new Error("El servidor no devolvió una sesión pública.");
      }

      sessionStorage.setItem(getStorageKey(trackingCode), token);

      setPassword("");
      setSessionToken(token);
    } catch (error) {
      console.log(
        "ERROR ACCESO TICKET COMPARTIDO:",
        error.response?.data || error,
      );

      setError(
        error.response?.data?.message || "No fue posible acceder al ticket.",
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarTicket = async (
    token = sessionToken,
    controlarLoading = true,
  ) => {
    if (!token || !trackingCode) return;

    if (controlarLoading) {
      setLoadingTicket(true);
    }

    try {
      const response = await axiosCliente.get(
        `/public/shared-tickets/${trackingCode}`,
        {
          headers: headersPublicos(token),
        },
      );

      const data = response.data?.data || {};

      setTicket(data.ticket || null);
      setAccess(data.access || null);

      return data;
    } finally {
      if (controlarLoading) {
        setLoadingTicket(false);
      }
    }
  };

  const cargarMensajes = async (
    token = sessionToken,
    controlarLoading = true,
  ) => {
    if (!token || !trackingCode) return;

    if (controlarLoading) {
      setLoadingMessages(true);
    }

    try {
      const response = await axiosCliente.get(
        `/public/shared-tickets/${trackingCode}/messages`,
        {
          headers: headersPublicos(token),
        },
      );

      setMessages(Array.isArray(response.data?.data) ? response.data.data : []);
    } finally {
      if (controlarLoading) {
        setLoadingMessages(false);
      }
    }
  };

  const enviarMensaje = async () => {
    const mensaje = text.trim();

    if ((!mensaje && !archivo) || sendingMessage) {
      return;
    }

    if (ticketCerrado) {
      setError("Este ticket está cerrado y ya no acepta mensajes ni archivos.");

      return;
    }

    setSendingMessage(true);
    setError("");

    try {
      const formData = new FormData();

      if (mensaje) {
        formData.append("message", mensaje);
      }

      if (archivo) {
        formData.append("archivo", archivo);
      }

      const response = await axiosCliente.post(
        `/public/shared-tickets/${trackingCode}/messages`,
        formData,
        {
          headers: headersPublicos(),
        },
      );

      setText("");
      setArchivo(null);

      const nuevoMensaje = response.data?.data || null;

      if (nuevoMensaje) {
        setMessages((prev) => [...prev, nuevoMensaje]);
      } else {
        await cargarMensajes();
      }

      if (response.data?.ticket_reopened || response.data?.ticket_status_id) {
        await cargarTicket();
      }
    } catch (error) {
      console.log(
        "ERROR ENVIAR MENSAJE COMPARTIDO:",
        error.response?.data || error,
      );

      const validationErrors = error.response?.data?.errors;

      if (validationErrors && typeof validationErrors === "object") {
        const primerError = Object.values(validationErrors)
          .flat()
          .find(Boolean);

        setError(primerError || "No fue posible enviar la respuesta.");
      } else {
        setError(
          error.response?.data?.message ||
            "No fue posible enviar la respuesta.",
        );
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      if (sessionToken) {
        await axiosCliente.post(
          `/public/shared-tickets/${trackingCode}/logout`,
          {},
          {
            headers: headersPublicos(),
          },
        );
      }
    } catch (error) {
      console.log(
        "ERROR CERRAR SESIÓN PÚBLICA:",
        error.response?.data || error,
      );
    } finally {
      limpiarSesion();
    }
  };

  const limpiarSesion = () => {
    if (trackingCode) {
      sessionStorage.removeItem(getStorageKey(trackingCode));
    }

    setSessionToken("");
    setTicket(null);
    setAccess(null);
    setMessages([]);
    setEmail("");
    setPassword("");
    setText("");
    setArchivo(null);
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return "";

    const parsed = new Date(String(fecha).replace(" ", "T"));

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMensaje = (msg) => {
    const sistema = msg?.type === "system" || msg?.author_type === "system";

    const propio =
      msg?.author_type === "external" &&
      String(msg?.author_email || "").toLowerCase() ===
        String(access?.email || "").toLowerCase();

    if (sistema) {
      return (
        <Box
          key={msg.id}
          sx={{
            display: "flex",
            justifyContent: "center",
            my: 1,
          }}
        >
          <Box
            sx={{
              maxWidth: "80%",
              px: 1.5,
              py: 0.8,
              borderRadius: 2,
              bgcolor: "#e2e8f0",
              border: "1px solid #cbd5e1",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: "#475569",
                textAlign: "center",
              }}
            >
              {msg.message}
            </Typography>
          </Box>
        </Box>
      );
    }

    const nombre =
      msg.author_name || msg.user?.name || (propio ? access?.email : "Soporte");

    return (
      <Box
        key={msg.id}
        sx={{
          display: "flex",
          justifyContent: propio ? "flex-end" : "flex-start",
          mb: 1,
        }}
      >
        <Box
          sx={{
            width: "fit-content",
            maxWidth: {
              xs: "92%",
              sm: "78%",
            },
            minWidth: 120,
            px: 1.5,
            py: 1,
            borderRadius: propio ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
            bgcolor: propio ? "#dcfce7" : "#ffffff",
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography
            sx={{
              fontSize: 11.5,
              fontWeight: 900,
              color: propio ? "#15803d" : "#1d4ed8",
              mb: 0.4,
              wordBreak: "break-word",
            }}
          >
            {propio ? "Tú" : nombre}
          </Typography>

          {msg.message && (
            <Typography
              sx={{
                fontSize: 14,
                color: "#0f172a",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.5,
              }}
            >
              {msg.message}
            </Typography>
          )}

          {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
            <Stack
              spacing={0.75}
              sx={{
                mt: msg.message ? 1 : 0,
              }}
            >
              {msg.attachments.map((file) => (
                <Button
                  key={file.id}
                  component="a"
                  href={file.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                  startIcon={<AttachFileOutlinedIcon />}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    fontWeight: 800,
                    maxWidth: "100%",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.nombre_archivo || "Archivo adjunto"}
                  </Box>
                </Button>
              ))}
            </Stack>
          )}

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 10,
              color: "#64748b",
              textAlign: "right",
              fontWeight: 700,
            }}
          >
            {formatoFecha(msg.created_at)}
          </Typography>
        </Box>
      </Box>
    );
  };

  if (sessionToken && loadingTicket && !ticket) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8fafc",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!sessionToken || !ticket) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          bgcolor: "#f1f5f9",
          px: 2,
          py: { xs: 4, md: 8 },
          display: "flex",
          justifyContent: "center",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: 460,
            p: { xs: 2.5, sm: 4 },
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Stack spacing={2.5}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                bgcolor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockOutlinedIcon />
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                Seguimiento de ticket
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.75,
                  lineHeight: 1.6,
                }}
              >
                Ingresa el correo al que fue enviada la invitación y tu
                contraseña.
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.75,
                  lineHeight: 1.6,
                }}
              >
                Si es tu primer acceso, la contraseña que escribas quedará
                registrada únicamente para este ticket.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              size="small"
              type="email"
              label="Correo"
              value={email}
              disabled={loading}
              onChange={(event) => setEmail(event.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              type="password"
              label="Contraseña"
              value={password}
              disabled={loading}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  iniciarAcceso();
                }
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={iniciarAcceso}
              disabled={loading || !email.trim() || !password}
              sx={{
                minHeight: 44,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 900,
                boxShadow: "none",
              }}
            >
              {loading ? "Accediendo..." : "Acceder al ticket"}
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#f1f5f9",
        px: { xs: 1.5, sm: 3 },
        py: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1000,
          mx: "auto",
        }}
      >
        <Stack spacing={2}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              boxShadow: "none",
            }}
          >
            <Stack spacing={2.5}>
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                  xs: "stretch",
                  sm: "center",
                }}
                spacing={1.5}
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      color: "#0f172a",
                    }}
                  >
                    Seguimiento de ticket
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      mt: 0.5,
                    }}
                  >
                    Acceso autorizado para {access?.email || "correo externo"}.
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<LogoutOutlinedIcon />}
                  onClick={cerrarSesion}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  Cerrar sesión
                </Button>
              </Stack>

              <Divider />

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      fontWeight: 800,
                    }}
                  >
                    Folio
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mt={0.5}
                  >
                    <ConfirmationNumberOutlinedIcon
                      sx={{
                        color: "#2563eb",
                      }}
                    />

                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: "#2563eb",
                      }}
                    >
                      {ticket.folio}
                    </Typography>
                  </Stack>
                </Box>

                <Chip
                  label={statusNombre(ticket.status_id)}
                  color={statusColor(ticket.status_id)}
                  sx={{
                    alignSelf: {
                      xs: "flex-start",
                      sm: "center",
                    },
                    fontWeight: 900,
                  }}
                />
              </Stack>

              <Divider />

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontWeight: 800,
                  }}
                >
                  Asunto
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  {ticket.titulo || "Sin título"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontWeight: 800,
                  }}
                >
                  Descripción
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: "#334155",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.7,
                  }}
                >
                  {ticket.descripcion || "Sin descripción"}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper
            sx={{
              overflow: "hidden",
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              boxShadow: "none",
            }}
          >
            <Box
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: 1.5,
                bgcolor: "#ffffff",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                Conversación
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                }}
              >
                Seguimiento público de este ticket.
              </Typography>
            </Box>

            <Box
              sx={{
                height: {
                  xs: "50dvh",
                  sm: 470,
                },
                minHeight: 360,
                overflowY: "auto",
                p: {
                  xs: 1.25,
                  sm: 2,
                },
                bgcolor: "#f8fafc",
              }}
            >
              {loadingMessages ? (
                <Box
                  sx={{
                    minHeight: 250,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={28} />
                </Box>
              ) : messages.length === 0 ? (
                <Alert severity="info">
                  Aún no hay mensajes públicos en este ticket.
                </Alert>
              ) : (
                <>
                  {messages.map(renderMensaje)}
                  <div ref={chatEndRef} />
                </>
              )}
            </Box>

            <Box
              sx={{
                p: {
                  xs: 1.25,
                  sm: 1.75,
                },
                bgcolor: "#ffffff",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              {ticketCerrado ? (
                <Alert severity="info">
                  <strong>Este ticket está cerrado.</strong> Ya no acepta
                  mensajes ni archivos.
                </Alert>
              ) : (
                <Stack spacing={1}>
                  {error && <Alert severity="error">{error}</Alert>}

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={1}
                    alignItems="stretch"
                  >
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={6}
                      size="small"
                      placeholder="Escribe una respuesta..."
                      value={text}
                      disabled={sendingMessage}
                      onChange={(event) => setText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          enviarMensaje();
                        }
                      }}
                    />

                    <Button
                      variant="contained"
                      startIcon={<SendOutlinedIcon />}
                      onClick={enviarMensaje}
                      disabled={sendingMessage || !text.trim()}
                      sx={{
                        minWidth: {
                          xs: "100%",
                          sm: 130,
                        },
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 900,
                        boxShadow: "none",
                      }}
                    >
                      {sendingMessage ? "Enviando..." : "Enviar"}
                    </Button>
                  </Stack>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                    }}
                  >
                    Enter para enviar. Shift + Enter para agregar una nueva
                    línea.
                  </Typography>
                </Stack>
              )}
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
