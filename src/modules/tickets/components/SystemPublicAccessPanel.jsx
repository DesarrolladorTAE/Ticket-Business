import { useEffect, useMemo, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PublicIcon from "@mui/icons-material/Public";
import BlockIcon from "@mui/icons-material/Block";

function SystemPublicAccessPanel({ system }) {
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [publicEnabled, setPublicEnabled] = useState(false);
  const [publicToken, setPublicToken] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    subtitulo: "",
    descripcion: "",
    color_hex: "#23388B",
  });

  const frontendUrl = useMemo(() => {
    if (!publicToken?.prefix || !system?.id) return "";

    return `${window.location.origin}/public/s/${system.id}/${publicToken.prefix}`;
  }, [system?.id, publicToken?.prefix]);

  useEffect(() => {
    if (system?.id) {
      cargarAccesoPublico();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [system?.id]);

  const cargarAccesoPublico = async () => {
    setLoading(true);
    setError("");
    setOk("");

    try {
      const res = await axiosCliente.get(`/systems/${system.id}/public-access`);

      const sistema = res.data.system;
      const token = res.data.public_token;

      setPublicEnabled(Boolean(sistema?.public_enabled));
      setPublicToken(token);

      setForm({
        titulo: sistema?.dato_portada?.titulo || "",
        subtitulo: sistema?.dato_portada?.subtitulo || "",
        descripcion: sistema?.dato_portada?.descripcion || "",
        color_hex: sistema?.color_hex || "#23388B",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo cargar el acceso público del sistema.",
      );
    } finally {
      setLoading(false);
    }
  };

  const cambiarValor = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const activarPublico = async () => {
    setGuardando(true);
    setError("");
    setOk("");

    try {
      const res = await axiosCliente.post(
        `/systems/${system.id}/public-access/enable`,
        {
          dato_portada: {
            titulo: form.titulo,
            subtitulo: form.subtitulo,
            descripcion: form.descripcion,
          },
          color_hex: form.color_hex,
        },
      );

      setPublicEnabled(true);
      setPublicToken(res.data.public_token);

      setOk("Acceso público activado correctamente.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo activar el acceso público.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const desactivarPublico = async () => {
    setGuardando(true);
    setError("");
    setOk("");

    try {
      await axiosCliente.post(`/systems/${system.id}/public-access/disable`);

      setPublicEnabled(false);
      setPublicToken(null);

      setOk("Acceso público desactivado correctamente.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo desactivar el acceso público.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const regenerarToken = async () => {
    setGuardando(true);
    setError("");
    setOk("");

    try {
      const res = await axiosCliente.post(
        `/systems/${system.id}/public-access/regenerate`,
      );

      setPublicEnabled(true);
      setPublicToken(res.data.public_token);

      setOk("Token público regenerado correctamente.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo regenerar el token público.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const copiarUrl = async () => {
    if (!frontendUrl) return;

    try {
      await navigator.clipboard.writeText(frontendUrl);
      setOk("URL pública copiada.");
      setError("");
    } catch (error) {
      setError("No se pudo copiar la URL pública.");
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        bgcolor: "#ffffff",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1}
        >
          <Box>
            <Typography fontWeight={900}>
              Acceso público
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Formulario externo para crear tickets sin iniciar sesión.
            </Typography>
          </Box>

          <Chip
            icon={publicEnabled ? <PublicIcon /> : <BlockIcon />}
            label={publicEnabled ? "Activo" : "Inactivo"}
            color={publicEnabled ? "success" : "default"}
            variant={publicEnabled ? "filled" : "outlined"}
          />
        </Stack>

        <Divider />

        {error && <Alert severity="error">{error}</Alert>}
        {ok && <Alert severity="success">{ok}</Alert>}

        <Stack spacing={2}>
          <TextField
            label="Título de portada"
            name="titulo"
            value={form.titulo}
            onChange={cambiarValor}
            fullWidth
            disabled={loading || guardando}
            placeholder="Soporte TAECONTA"
          />

          <TextField
            label="Subtítulo"
            name="subtitulo"
            value={form.subtitulo}
            onChange={cambiarValor}
            fullWidth
            disabled={loading || guardando}
            placeholder="Levanta tu solicitud de soporte"
          />

          <TextField
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={cambiarValor}
            fullWidth
            multiline
            minRows={3}
            disabled={loading || guardando}
            placeholder="Describe el problema para que el equipo pueda darte seguimiento."
          />

          <TextField
            label="Color hexadecimal"
            name="color_hex"
            value={form.color_hex}
            onChange={cambiarValor}
            fullWidth
            disabled={loading || guardando}
            placeholder="#23388B"
            helperText="Ejemplo: #23388B, #ED6C02, #16A34A"
          />
        </Stack>

        {frontendUrl && (
          <Box>
            <Typography variant="body2" fontWeight={800} mb={0.5}>
              URL pública
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                value={frontendUrl}
                fullWidth
                size="small"
                InputProps={{
                  readOnly: true,
                }}
              />

              <Tooltip title="Copiar URL">
                <Button
                  variant="outlined"
                  onClick={copiarUrl}
                  startIcon={<ContentCopyIcon />}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Copiar
                </Button>
              </Tooltip>
            </Stack>
          </Box>
        )}

        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <Button
            variant="contained"
            onClick={activarPublico}
            disabled={guardando}
            startIcon={<PublicIcon />}
          >
            {publicEnabled ? "Guardar cambios" : "Activar público"}
          </Button>

          <Button
            variant="outlined"
            onClick={regenerarToken}
            disabled={guardando || !publicEnabled}
            startIcon={<AutorenewIcon />}
            color="warning"
          >
            Regenerar token
          </Button>

          <Button
            variant="outlined"
            onClick={desactivarPublico}
            disabled={guardando || !publicEnabled}
            color="error"
            startIcon={<BlockIcon />}
          >
            Desactivar
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default SystemPublicAccessPanel;