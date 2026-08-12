import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
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
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

const API_BASE_URL = "https://api.thebusinessticket.com/api";

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

  const [processingDirectLink, setProcessingDirectLink] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(
      new URLSearchParams(window.location.search).get("access_token"),
    );
  });

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
  const [archivoPreview, setArchivoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [error, setError] = useState("");

  const ticketCerrado = Number(ticket?.status_id || 0) === 4;

  useEffect(() => {
    if (!trackingCode || typeof window === "undefined") {
      setProcessingDirectLink(false);
      return;
    }

    const currentUrl = new URL(window.location.href);
    const directToken = String(
      currentUrl.searchParams.get("access_token") || "",
    ).trim();

    if (!directToken) {
      setProcessingDirectLink(false);
      return;
    }

    let active = true;

    /*
     * Quitamos el token secreto de la barra del navegador
     * inmediatamente. Conservamos el valor en memoria para
     * intercambiarlo por una sesión pública.
     */
    currentUrl.searchParams.delete("access_token");

    window.history.replaceState(
      window.history.state,
      document.title,
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
    );

    const iniciarAccesoDirecto = async () => {
      setProcessingDirectLink(true);
      setLoading(true);
      setError("");

      try {
        const response = await axiosCliente.post(
          `/public/shared-tickets/${trackingCode}/access`,
          {
            access_token: directToken,
          },
        );

        const data = response.data?.data || {};
        const token = data.session_token || "";

        if (!token) {
          throw new Error(
            "El servidor no devolvió una sesión pública.",
          );
        }

        if (!active) {
          return;
        }

        sessionStorage.setItem(
          getStorageKey(trackingCode),
          token,
        );

        setSessionToken(token);
      } catch (error) {
        if (!active) {
          return;
        }

        console.log(
          "ERROR ACCESO DIRECTO TICKET COMPARTIDO:",
          error.response?.data || error,
        );

        setError(
          error.response?.data?.message ||
            error?.message ||
            "El enlace compartido no es válido o fue revocado.",
        );
      } finally {
        if (active) {
          setLoading(false);
          setProcessingDirectLink(false);
        }
      }
    };

    iniciarAccesoDirecto();

    return () => {
      active = false;
    };
  }, [trackingCode]);

  useEffect(() => {
    if (
      processingDirectLink ||
      !sessionToken ||
      !trackingCode
    ) {
      return;
    }

    cargarSesion(sessionToken);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trackingCode,
    sessionToken,
    processingDirectLink,
  ]);

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
        formData.append("archivo", archivo, archivo.name);
      }

      const response = await fetch(
        `${API_BASE_URL}/public/shared-tickets/${trackingCode}/messages`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: formData,
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        const validationErrors = responseData?.errors;

        if (validationErrors && typeof validationErrors === "object") {
          const primerError = Object.values(validationErrors)
            .flat()
            .find(Boolean);

          throw new Error(
            primerError ||
              responseData?.message ||
              "No fue posible enviar la respuesta.",
          );
        }

        throw new Error(
          responseData?.message || "No fue posible enviar la respuesta.",
        );
      }

      setText("");
      setArchivo(null);

      const nuevoMensaje = responseData?.data || null;

      if (nuevoMensaje) {
        setMessages((prev) => [...prev, nuevoMensaje]);
      } else {
        await cargarMensajes();
      }

      if (responseData?.ticket_reopened || responseData?.ticket_status_id) {
        await cargarTicket();
      }
    } catch (error) {
      console.log("ERROR ENVIAR MENSAJE COMPARTIDO:", error);

      setError(error?.message || "No fue posible enviar la respuesta.");
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
      (access?.access_type === "link"
        ? !msg?.author_email
        : String(msg?.author_email || "").toLowerCase() ===
          String(access?.email || "").toLowerCase());

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
      msg.author_name ||
      msg.user?.name ||
      (propio
        ? access?.display_name ||
          access?.email ||
          "Persona externa"
        : "Soporte");

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
                  type="button"
                  onClick={() => abrirArchivo(file)}
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

  const esImagen = (file) => {
    const mime = String(file?.mime_type || "").toLowerCase();

    const nombre = String(file?.nombre_archivo || "").toLowerCase();

    return (
      mime.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(nombre)
    );
  };

  const esPdf = (file) => {
    const mime = String(file?.mime_type || "").toLowerCase();

    const nombre = String(file?.nombre_archivo || "").toLowerCase();

    return mime === "application/pdf" || nombre.endsWith(".pdf");
  };

  const abrirArchivo = (file) => {
    if (!file?.url) {
      setError("No fue posible localizar el archivo.");
      return;
    }

    setArchivoPreview(file);
  };

  const cerrarArchivo = () => {
    setArchivoPreview(null);
  };

  if (processingDirectLink) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8fafc",
          px: 2,
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress />

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              fontWeight: 700,
            }}
          >
            Validando enlace compartido...
          </Typography>
        </Stack>
      </Box>
    );
  }

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
                    Acceso autorizado para{" "}
                    {access?.display_name ||
                      access?.email ||
                      "Persona externa"}.
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
                px: {
                  xs: 1.5,
                  sm: 2,
                },
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

                  {/* ARCHIVO ADJUNTO */}
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={1}
                    alignItems={{
                      xs: "stretch",
                      sm: "center",
                    }}
                  >
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<AttachFileOutlinedIcon />}
                      disabled={sendingMessage}
                      sx={{
                        alignSelf: {
                          xs: "stretch",
                          sm: "flex-start",
                        },
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 800,
                      }}
                    >
                      Adjuntar archivo
                      <input
                        hidden
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;

                          setArchivo(file);

                          /*
                           * Permite seleccionar
                           * nuevamente el mismo archivo.
                           */
                          event.target.value = "";
                        }}
                      />
                    </Button>

                    {archivo && (
                      <Paper
                        variant="outlined"
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          px: 1.25,
                          py: 0.75,
                          borderRadius: 2,
                          bgcolor: "#f8fafc",
                          borderColor: "#cbd5e1",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            sx={{
                              minWidth: 0,
                            }}
                          >
                            <AttachFileOutlinedIcon
                              sx={{
                                fontSize: 18,
                                color: "#64748b",
                                flexShrink: 0,
                              }}
                            />

                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 800,
                                color: "#334155",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {archivo.name}
                            </Typography>
                          </Stack>

                          <Button
                            size="small"
                            color="error"
                            onClick={() => setArchivo(null)}
                            disabled={sendingMessage}
                            sx={{
                              flexShrink: 0,
                              minWidth: 0,
                              px: 1,
                              textTransform: "none",
                              fontWeight: 800,
                            }}
                          >
                            Quitar
                          </Button>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>

                  {/* MENSAJE */}
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
                      disabled={sendingMessage || (!text.trim() && !archivo)}
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

  {/* MODAL PARA VISUALIZAR ARCHIVOS */}
  <Dialog
    open={Boolean(archivoPreview)}
    onClose={cerrarArchivo}
    fullWidth
    maxWidth="md"
    PaperProps={{
      sx: {
        borderRadius: 3,
        overflow: "hidden",
      },
    }}
  >
    <DialogTitle
      sx={{
        py: 1.5,
        px: 2,
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              color: "#0f172a",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {archivoPreview?.nombre_archivo ||
              "Archivo adjunto"}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: "#64748b",
            }}
          >
            Archivo del ticket
          </Typography>
        </Box>

        <IconButton
          onClick={cerrarArchivo}
          size="small"
        >
          <CloseOutlinedIcon />
        </IconButton>
      </Stack>
    </DialogTitle>

    <DialogContent
      sx={{
        p: 0,
        bgcolor: "#f8fafc",
      }}
    >
      {/* IMÁGENES */}
      {archivoPreview &&
        esImagen(archivoPreview) && (
          <Box
            sx={{
              minHeight: {
                xs: 300,
                sm: 500,
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Box
              component="img"
              src={archivoPreview.url}
              alt={
                archivoPreview.nombre_archivo ||
                "Archivo adjunto"
              }
              sx={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          </Box>
        )}

      {/* PDF */}
      {archivoPreview &&
        esPdf(archivoPreview) && (
          <Box
            component="iframe"
            src={archivoPreview.url}
            title={
              archivoPreview.nombre_archivo ||
              "Documento PDF"
            }
            sx={{
              display: "block",
              width: "100%",
              height: {
                xs: "65vh",
                sm: "75vh",
              },
              border: 0,
              bgcolor: "#ffffff",
            }}
          />
        )}

      {/* WORD, EXCEL, TXT, ETC. */}
      {archivoPreview &&
        !esImagen(archivoPreview) &&
        !esPdf(archivoPreview) && (
          <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{
              minHeight: 280,
              p: 3,
            }}
          >
            <AttachFileOutlinedIcon
              sx={{
                fontSize: 48,
                color: "#64748b",
              }}
            />

            <Typography
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                textAlign: "center",
              }}
            >
              {archivoPreview.nombre_archivo ||
                "Archivo adjunto"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                textAlign: "center",
              }}
            >
              Este tipo de archivo no puede visualizarse
              directamente.
            </Typography>

            <Button
              component="a"
              href={archivoPreview.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<AttachFileOutlinedIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 900,
                boxShadow: "none",
              }}
            >
              Abrir archivo
            </Button>
          </Stack>
        )}
    </DialogContent>
  </Dialog>
</Box>
  );
}