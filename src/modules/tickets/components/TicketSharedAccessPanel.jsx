import { useEffect, useMemo, useState } from "react";

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

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";

import Swal from "sweetalert2";

import axiosCliente from "../../../services/axiosCliente";

export default function TicketSharedAccessPanel({ ticketId }) {
  const [email, setEmail] = useState("");
  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [generandoLink, setGenerandoLink] = useState(false);
  const [revocandoId, setRevocandoId] = useState(null);

  const [directUrl, setDirectUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail("");
    setDirectUrl("");
    cargarAccesos();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const accesoLink = useMemo(
    () =>
      accesos.find(
        (acceso) =>
          String(acceso?.access_type || "email").toLowerCase() === "link",
      ) || null,
    [accesos],
  );

  const cargarAccesos = async () => {
    if (!ticketId) return;

    setLoading(true);
    setError("");

    try {
      const response = await axiosCliente.get(
        `/tickets/${ticketId}/public-access`,
      );

      setAccesos(response.data?.data || []);
    } catch (error) {
      console.log(
        "ERROR CARGAR ACCESOS PÚBLICOS:",
        error.response?.data || error,
      );

      setError(
        error.response?.data?.message ||
          "No fue posible cargar los accesos compartidos.",
      );
    } finally {
      setLoading(false);
    }
  };

  const enviarAcceso = async () => {
    const correo = email.trim().toLowerCase();

    if (!correo) {
      Swal.fire({
        icon: "warning",
        title: "Correo requerido",
        text: "Escribe el correo de la persona a quien compartirás el ticket.",
      });

      return;
    }

    setEnviandoCorreo(true);
    setError("");

    try {
      const response = await axiosCliente.post(
        `/tickets/${ticketId}/public-access`,
        {
          access_type: "email",
          email: correo,
        },
      );

      setEmail("");

      await cargarAccesos();

      Swal.fire({
        icon: "success",
        title: "Acceso enviado",
        text:
          response.data?.message ||
          "La invitación por correo fue enviada correctamente.",
      });
    } catch (error) {
      console.log(
        "ERROR ENVIAR ACCESO PÚBLICO:",
        error.response?.data || error,
      );

      Swal.fire({
        icon: "error",
        title: "No se pudo compartir",
        text:
          error.response?.data?.message ||
          "No fue posible enviar la invitación por correo.",
      });
    } finally {
      setEnviandoCorreo(false);
    }
  };

  const reenviarAcceso = async (acceso) => {
    if (!acceso?.email) return;

    setEnviandoCorreo(true);
    setError("");

    try {
      const response = await axiosCliente.post(
        `/tickets/${ticketId}/public-access`,
        {
          access_type: "email",
          email: acceso.email,
        },
      );

      await cargarAccesos();

      Swal.fire({
        icon: "success",
        title: acceso.status ? "Invitación reenviada" : "Acceso reactivado",
        text:
          response.data?.message ||
          (acceso.status
            ? "La invitación fue reenviada correctamente."
            : "El acceso fue reactivado correctamente."),
      });
    } catch (error) {
      console.log(
        "ERROR REENVIAR ACCESO:",
        error.response?.data || error,
      );

      Swal.fire({
        icon: "error",
        title: "No se pudo completar la acción",
        text:
          error.response?.data?.message ||
          "No fue posible actualizar la invitación.",
      });
    } finally {
      setEnviandoCorreo(false);
    }
  };

  const generarEnlaceDirecto = async () => {
    if (accesoLink) {
      const confirmar = await Swal.fire({
        icon: accesoLink.status ? "warning" : "question",
        title: accesoLink.status
          ? "Regenerar enlace directo"
          : "Generar nuevo enlace",
        text: accesoLink.status
          ? "Se creará un enlace nuevo. El enlace anterior y sus sesiones activas dejarán de funcionar."
          : "Se generará un nuevo enlace directo para este ticket.",
        showCancelButton: true,
        confirmButtonText: accesoLink.status
          ? "Sí, regenerar"
          : "Sí, generar",
        cancelButtonText: "Cancelar",
      });

      if (!confirmar.isConfirmed) return;
    }

    setGenerandoLink(true);
    setError("");

    try {
      const response = await axiosCliente.post(
        `/tickets/${ticketId}/public-access`,
        {
          access_type: "link",
        },
      );

      const data = response.data?.data || {};
      const url = String(data.public_url || "").trim();

      if (!url) {
        throw new Error(
          "El servidor generó el acceso, pero no devolvió el enlace directo.",
        );
      }

      setDirectUrl(url);

      await cargarAccesos();

      Swal.fire({
        icon: "success",
        title: accesoLink ? "Enlace regenerado" : "Enlace generado",
        text:
          response.data?.message ||
          "El enlace directo fue generado correctamente.",
      });
    } catch (error) {
      console.log(
        "ERROR GENERAR ENLACE DIRECTO:",
        error.response?.data || error,
      );

      Swal.fire({
        icon: "error",
        title: "No se pudo generar el enlace",
        text:
          error.response?.data?.message ||
          error?.message ||
          "No fue posible generar el enlace directo.",
      });
    } finally {
      setGenerandoLink(false);
    }
  };

  const revocarAcceso = async (acceso) => {
    const esLink =
      String(acceso?.access_type || "email").toLowerCase() === "link";

    const nombreAcceso = esLink
      ? "el enlace directo"
      : acceso?.email || "este acceso";

    const confirmar = await Swal.fire({
      icon: "warning",
      title: esLink ? "Revocar enlace directo" : "Revocar acceso",
      text: esLink
        ? "¿Deseas revocar el enlace directo? El enlace dejará de funcionar y se cerrarán sus sesiones activas."
        : `¿Deseas quitar el acceso a ${nombreAcceso}?`,
      showCancelButton: true,
      confirmButtonText: "Sí, revocar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (!confirmar.isConfirmed) return;

    setRevocandoId(acceso.id);

    try {
      await axiosCliente.patch(
        `/tickets/${ticketId}/public-access/${acceso.id}/revoke`,
      );

      if (esLink) {
        setDirectUrl("");
      }

      await cargarAccesos();

      Swal.fire({
        icon: "success",
        title: esLink ? "Enlace revocado" : "Acceso revocado",
        text:
          esLink
            ? "El enlace directo fue revocado correctamente."
            : "El acceso público fue revocado correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(
        "ERROR REVOCAR ACCESO:",
        error.response?.data || error,
      );

      Swal.fire({
        icon: "error",
        title: "No se pudo revocar",
        text:
          error.response?.data?.message ||
          "No fue posible revocar el acceso.",
      });
    } finally {
      setRevocandoId(null);
    }
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

  const copiarLink = async () => {
    if (!directUrl) {
      Swal.fire({
        icon: "info",
        title: "Genera un enlace primero",
        text: "Por seguridad, el enlace completo solo se muestra al generarlo o regenerarlo.",
      });

      return;
    }

    try {
      await copiarTextoPortapapeles(directUrl);

      Swal.fire({
        icon: "success",
        title: "Enlace copiado",
        text: "Ya puedes compartirlo por WhatsApp u otro medio.",
        timer: 1700,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("ERROR COPIAR LINK:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo copiar",
        text: "No fue posible copiar el enlace.",
      });
    }
  };

  const esAccesoLink = (acceso) =>
    String(acceso?.access_type || "email").toLowerCase() === "link";

  const nombreAcceso = (acceso) => {
    if (esAccesoLink(acceso)) {
      return acceso?.display_name || "Persona externa";
    }

    return acceso?.email || acceso?.display_name || "Correo externo";
  };

  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 2,
        borderRadius: 3,
        border: "1px solid #cbd5e1",
        bgcolor: "#ffffff",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2.25}>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            Compartir seguimiento
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mt: 0.25,
              lineHeight: 1.6,
            }}
          >
            Comparte este ticket con una persona externa mediante correo o
            mediante un enlace directo que puedes enviar por WhatsApp u otro
            medio.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {/* ACCESO POR CORREO */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2.5,
            borderColor: "#dbeafe",
            bgcolor: "#f8fbff",
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <EmailOutlinedIcon
                  sx={{
                    color: "#2563eb",
                    fontSize: 21,
                  }}
                />

                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  Compartir por correo
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.5,
                  lineHeight: 1.6,
                }}
              >
                La persona recibirá una invitación y accederá con su correo y
                una contraseña propia para este ticket.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                fullWidth
                size="small"
                type="email"
                label="Correo de la persona"
                placeholder="correo@ejemplo.com"
                value={email}
                disabled={enviandoCorreo}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    enviarAcceso();
                  }
                }}
              />

              <Button
                variant="contained"
                startIcon={<EmailOutlinedIcon />}
                onClick={enviarAcceso}
                disabled={enviandoCorreo || !email.trim()}
                sx={{
                  minWidth: { xs: "100%", md: 190 },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  boxShadow: "none",
                }}
              >
                {enviandoCorreo ? "Enviando..." : "Enviar por correo"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Divider sx={{ flex: 1 }} />

          <Typography
            variant="caption"
            sx={{
              color: "#94a3b8",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            o
          </Typography>

          <Divider sx={{ flex: 1 }} />
        </Box>

        {/* ACCESO POR LINK */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2.5,
            borderColor: "#fed7aa",
            bgcolor: "#fffaf5",
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <LinkOutlinedIcon
                  sx={{
                    color: "#ea580c",
                    fontSize: 22,
                  }}
                />

                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  Compartir mediante enlace directo
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.5,
                  lineHeight: 1.6,
                }}
              >
                No requiere correo, registro ni contraseña. Genera el enlace,
                cópialo y envíalo por WhatsApp, mensaje o cualquier otro medio.
                El enlace únicamente permite entrar a este ticket.
              </Typography>
            </Box>

            {directUrl && (
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <TextField
                  fullWidth
                  size="small"
                  label="Enlace directo generado"
                  value={directUrl}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: 13,
                    },
                  }}
                />

                <Button
                  variant="contained"
                  startIcon={<ContentCopyOutlinedIcon />}
                  onClick={copiarLink}
                  sx={{
                    minWidth: { xs: "100%", md: 150 },
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                    boxShadow: "none",
                  }}
                >
                  Copiar link
                </Button>
              </Stack>
            )}

            {!directUrl && accesoLink?.status && (
              <Alert severity="info">
                Este ticket ya tiene un enlace directo activo. Por seguridad,
                el token completo no se guarda en texto plano y no puede
                recuperarse después. Si necesitas volver a copiarlo, regenera
                el enlace; el anterior dejará de funcionar.
              </Alert>
            )}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              useFlexGap
              flexWrap="wrap"
            >
              <Button
                variant={accesoLink?.status ? "outlined" : "contained"}
                startIcon={
                  accesoLink ? (
                    <RefreshOutlinedIcon />
                  ) : (
                    <LinkOutlinedIcon />
                  )
                }
                onClick={generarEnlaceDirecto}
                disabled={generandoLink}
                sx={{
                  minWidth: { xs: "100%", sm: 190 },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  boxShadow: "none",
                }}
              >
                {generandoLink
                  ? "Generando..."
                  : accesoLink?.status
                    ? "Regenerar enlace"
                    : "Generar enlace"}
              </Button>

              {directUrl && (
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyOutlinedIcon />}
                  onClick={copiarLink}
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  Copiar link
                </Button>
              )}

              {accesoLink?.status && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<BlockOutlinedIcon />}
                  onClick={() => revocarAcceso(accesoLink)}
                  disabled={revocandoId === accesoLink.id}
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  {revocandoId === accesoLink.id
                    ? "Revocando..."
                    : "Revocar enlace"}
                </Button>
              )}
            </Stack>

            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                lineHeight: 1.5,
              }}
            >
              Cualquier persona que tenga el enlace podrá entrar a este ticket
              mientras el enlace permanezca activo. Puedes revocarlo o
              regenerarlo cuando sea necesario.
            </Typography>
          </Stack>
        </Paper>

        <Divider />

        {/* LISTADO DE ACCESOS */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
        >
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 900,
                color: "#334155",
              }}
            >
              Accesos compartidos
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
              }}
            >
              Historial de accesos por correo y enlace directo.
            </Typography>
          </Box>

          <Button
            size="small"
            variant="text"
            startIcon={<RefreshOutlinedIcon />}
            onClick={cargarAccesos}
            disabled={loading}
            sx={{
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Actualizar
          </Button>
        </Box>

        {loading ? (
          <Box
            sx={{
              py: 3,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : accesos.length === 0 ? (
          <Alert severity="info">
            Este ticket todavía no se ha compartido con ninguna persona.
          </Alert>
        ) : (
          <Stack spacing={1}>
            {accesos.map((acceso) => {
              const esLink = esAccesoLink(acceso);

              return (
                <Paper
                  key={acceso.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    borderColor: "#e2e8f0",
                    bgcolor: "#f8fafc",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", md: "center" }}
                    spacing={1.5}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 900,
                          color: "#0f172a",
                          wordBreak: "break-word",
                        }}
                      >
                        {esLink
                          ? "Enlace directo · Persona externa"
                          : nombreAcceso(acceso)}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.75}
                        useFlexGap
                        flexWrap="wrap"
                        mt={0.75}
                      >
                        <Chip
                          size="small"
                          label={esLink ? "Enlace directo" : "Correo"}
                          variant="outlined"
                          color={esLink ? "warning" : "primary"}
                          sx={{ fontWeight: 800 }}
                        />

                        <Chip
                          size="small"
                          label={acceso.status ? "Activo" : "Revocado"}
                          color={acceso.status ? "success" : "default"}
                          sx={{ fontWeight: 800 }}
                        />

                        {esLink ? (
                          <Chip
                            size="small"
                            variant="outlined"
                            label="Sin correo ni contraseña"
                            sx={{ fontWeight: 800 }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={
                              acceso.has_password
                                ? "Contraseña configurada"
                                : "Registro pendiente"
                            }
                            color={
                              acceso.has_password
                                ? "primary"
                                : "warning"
                            }
                            sx={{ fontWeight: 800 }}
                          />
                        )}
                      </Stack>
                    </Box>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                    >
                      {!esLink && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EmailOutlinedIcon />}
                          onClick={() => reenviarAcceso(acceso)}
                          disabled={enviandoCorreo}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          {acceso.status ? "Reenviar" : "Reactivar"}
                        </Button>
                      )}

                      {esLink && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<RefreshOutlinedIcon />}
                          onClick={generarEnlaceDirecto}
                          disabled={generandoLink}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          {acceso.status
                            ? "Regenerar"
                            : "Generar nuevo"}
                        </Button>
                      )}

                      {acceso.status && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<BlockOutlinedIcon />}
                          onClick={() => revocarAcceso(acceso)}
                          disabled={revocandoId === acceso.id}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          {revocandoId === acceso.id
                            ? "Revocando..."
                            : "Revocar"}
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}