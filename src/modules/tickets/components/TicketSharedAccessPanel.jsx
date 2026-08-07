import { useEffect, useState } from "react";

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

import Swal from "sweetalert2";

import axiosCliente from "../../../services/axiosCliente";

export default function TicketSharedAccessPanel({ ticketId }) {
  const [email, setEmail] = useState("");
  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [revocandoId, setRevocandoId] = useState(null);
  const [publicUrl, setPublicUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarAccesos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

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

    setEnviando(true);
    setError("");

    try {
      const response = await axiosCliente.post(
        `/tickets/${ticketId}/public-access`,
        {
          email: correo,
        },
      );

      const data = response.data?.data || {};

      setPublicUrl(data.public_url || "");
      setEmail("");

      await cargarAccesos();

      Swal.fire({
        icon: "success",
        title: "Acceso enviado",
        text:
          response.data?.message ||
          "El acceso público fue enviado correctamente.",
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
          "No fue posible enviar el acceso público.",
      });
    } finally {
      setEnviando(false);
    }
  };

  const reenviarAcceso = async (acceso) => {
    if (!acceso?.email) return;

    setEnviando(true);
    setError("");

    try {
      const response = await axiosCliente.post(
        `/tickets/${ticketId}/public-access`,
        {
          email: acceso.email,
        },
      );

      const data = response.data?.data || {};

      setPublicUrl(data.public_url || "");

      await cargarAccesos();

      Swal.fire({
        icon: "success",
        title: "Invitación reenviada",
        text:
          response.data?.message ||
          "La invitación fue reenviada correctamente.",
      });
    } catch (error) {
      console.log(
        "ERROR REENVIAR ACCESO:",
        error.response?.data || error,
      );

      Swal.fire({
        icon: "error",
        title: "No se pudo reenviar",
        text:
          error.response?.data?.message ||
          "No fue posible reenviar la invitación.",
      });
    } finally {
      setEnviando(false);
    }
  };

  const revocarAcceso = async (acceso) => {
    const confirmar = await Swal.fire({
      icon: "warning",
      title: "Revocar acceso",
      text: `¿Deseas quitar el acceso a ${acceso.email}?`,
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

      await cargarAccesos();

      Swal.fire({
        icon: "success",
        title: "Acceso revocado",
        text: "El acceso público fue revocado correctamente.",
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

  const copiarLink = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);

      Swal.fire({
        icon: "success",
        title: "Enlace copiado",
        text: "El enlace compartido fue copiado correctamente.",
        timer: 1600,
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
      <Stack spacing={2}>
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
            }}
          >
            Autoriza a una persona externa para consultar y dar seguimiento a
            este ticket mediante correo y contraseña.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

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
            disabled={enviando}
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
            disabled={enviando || !email.trim()}
            sx={{
              minWidth: { xs: "100%", md: 190 },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              boxShadow: "none",
            }}
          >
            {enviando ? "Enviando..." : "Enviar acceso"}
          </Button>
        </Stack>

        {publicUrl && (
          <Alert
            severity="success"
            action={
              <Button
                size="small"
                startIcon={<ContentCopyOutlinedIcon />}
                onClick={copiarLink}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                Copiar
              </Button>
            }
          >
            El acceso fue preparado correctamente. También puedes copiar el
            enlace para compartirlo manualmente con la persona autorizada.
          </Alert>
        )}

        <Divider />

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 900,
              color: "#334155",
            }}
          >
            Accesos compartidos
          </Typography>

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
            {accesos.map((acceso) => (
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
                      {acceso.email}
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
                        label={acceso.status ? "Activo" : "Revocado"}
                        color={acceso.status ? "success" : "default"}
                        sx={{ fontWeight: 800 }}
                      />

                      <Chip
                        size="small"
                        variant="outlined"
                        label={
                          acceso.has_password
                            ? "Contraseña configurada"
                            : "Registro pendiente"
                        }
                        color={acceso.has_password ? "primary" : "warning"}
                        sx={{ fontWeight: 800 }}
                      />
                    </Stack>
                  </Box>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EmailOutlinedIcon />}
                      onClick={() => reenviarAcceso(acceso)}
                      disabled={enviando}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 800,
                      }}
                    >
                      {acceso.status ? "Reenviar" : "Reactivar"}
                    </Button>

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
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}