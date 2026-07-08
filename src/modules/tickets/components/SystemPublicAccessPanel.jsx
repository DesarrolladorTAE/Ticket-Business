import { useEffect, useMemo, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";
import { useDropzone } from "react-dropzone";
import { HexColorPicker } from "react-colorful";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PublicIcon from "@mui/icons-material/Public";
import BlockIcon from "@mui/icons-material/Block";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";

function SystemPublicAccessPanel({ system }) {
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [publicEnabled, setPublicEnabled] = useState(false);
  const [publicToken, setPublicToken] = useState(null);

  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

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

    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [system?.id]);

  const cargarAccesoPublico = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axiosCliente.get(`/systems/${system.id}/public-access`);

      const sistema = res.data.system;
      const token = res.data.public_token;

      setPublicEnabled(Boolean(sistema?.public_enabled));
      setPublicToken(token);

      setLogoUrl(sistema?.logo_url || "");
      setLogoFile(null);
      setLogoPreview("");

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

  const cambiarColor = (color) => {
    setForm({
      ...form,
      color_hex: color,
    });
  };

  const cambiarColorManual = (e) => {
    let color = e.target.value || "";

    if (!color.startsWith("#")) {
      color = `#${color}`;
    }

    setForm({
      ...form,
      color_hex: color,
    });
  };

  const onDrop = (acceptedFiles) => {
    const archivo = acceptedFiles?.[0];

    if (!archivo) return;

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(archivo);
    setLogoPreview(URL.createObjectURL(archivo));
    setOk("");
    setError("");
  };

  const quitarLogoSeleccionado = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(null);
    setLogoPreview("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: loading || guardando,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 2 * 1024 * 1024,
    onDropRejected: () => {
      setError("El logo debe ser JPG, PNG o WEBP y pesar máximo 2 MB.");
      setOk("");
    },
  });

  const guardarPublico = async () => {
    setGuardando(true);
    setError("");
    setOk("");

    try {
      const formData = new FormData();

      formData.append("dato_portada[titulo]", form.titulo || "");
      formData.append("dato_portada[subtitulo]", form.subtitulo || "");
      formData.append("dato_portada[descripcion]", form.descripcion || "");
      formData.append("color_hex", form.color_hex || "#23388B");

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const res = await axiosCliente.post(
        `/systems/${system.id}/public-access/enable`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setPublicEnabled(true);
      setPublicToken(res.data.public_token);

      await cargarAccesoPublico();

      setOk("Portada pública guardada correctamente.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo guardar la portada pública.",
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

  const logoMostrar = logoPreview || logoUrl;

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
            <Typography fontWeight={900}>Acceso público</Typography>

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

        <Box>
          <Typography fontWeight={900} mb={1}>
            Logo del portal
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box
              {...getRootProps()}
              sx={{
                flex: 1,
                minHeight: 132,
                border: "2px dashed",
                borderColor: isDragActive ? form.color_hex : "#cbd5e1",
                borderRadius: 3,
                bgcolor: isDragActive ? "#f8fafc" : "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: loading || guardando ? "not-allowed" : "pointer",
                px: 2,
                textAlign: "center",
                transition: "0.2s ease",
              }}
            >
              <input {...getInputProps()} />

              <Stack alignItems="center" spacing={1}>
                <CloudUploadIcon sx={{ color: "#64748b" }} />

                <Typography fontWeight={800}>
                  {isDragActive
                    ? "Suelta el logo aquí"
                    : "Arrastra el logo o haz clic para seleccionar"}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  JPG, PNG o WEBP. Máximo 2 MB.
                </Typography>
              </Stack>
            </Box>

            <Box
              sx={{
                width: { xs: "100%", md: 160 },
                minHeight: 132,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                bgcolor: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {logoMostrar ? (
                <>
                  <Box
                    component="img"
                    src={logoMostrar}
                    alt="Logo del sistema"
                    sx={{
                      width: "100%",
                      height: "100%",
                      maxHeight: 132,
                      objectFit: "contain",
                      p: 1.5,
                    }}
                  />

                  {logoPreview && (
                    <Tooltip title="Quitar logo seleccionado">
                      <IconButton
                        size="small"
                        onClick={quitarLogoSeleccionado}
                        sx={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": {
                            bgcolor: "#ffffff",
                          },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              ) : (
                <Stack alignItems="center" spacing={1}>
                  <ImageIcon color="disabled" />
                  <Typography variant="caption" color="text.secondary">
                    Sin logo
                  </Typography>
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>

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

          <Box>
            <Typography fontWeight={900} mb={1}>
              Color principal del portal
            </Typography>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems="stretch"
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  width: { xs: "100%", md: 260 },
                  bgcolor: "#ffffff",
                }}
              >
                <HexColorPicker
                  color={form.color_hex || "#23388B"}
                  onChange={cambiarColor}
                  style={{
                    width: "100%",
                  }}
                />

                <TextField
                  label="Código hexadecimal"
                  value={form.color_hex || "#23388B"}
                  onChange={cambiarColorManual}
                  fullWidth
                  size="small"
                  disabled={loading || guardando}
                  sx={{ mt: 2 }}
                  helperText="Ejemplo: #23388B"
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "#ffffff",
                }}
              >
                <Box
                  sx={{
                    bgcolor: form.color_hex || "#23388B",
                    color: "#ffffff",
                    p: 2.5,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    {logoMostrar ? (
                      <Box
                        component="img"
                        src={logoMostrar}
                        alt="Vista previa del logo"
                        sx={{
                          width: 56,
                          height: 56,
                          objectFit: "contain",
                          borderRadius: 2,
                          bgcolor: "#ffffff",
                          p: 1,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          bgcolor: "rgba(255,255,255,0.25)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ImageIcon />
                      </Box>
                    )}

                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={900} noWrap>
                        {form.titulo || `Soporte ${system?.nombre || ""}`}
                      </Typography>

                      <Typography variant="body2" sx={{ opacity: 0.9 }} noWrap>
                        {form.subtitulo || "Levanta tu solicitud de soporte"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="body2" mt={2} sx={{ opacity: 0.9 }}>
                    {form.descripcion ||
                      "Describe el problema para que el equipo pueda darte seguimiento."}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: "#f8fafc" }}>
                  <Typography variant="caption" color="text.secondary">
                    Vista previa de cómo se verá la portada pública con este
                    color.
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          </Box>
        </Stack>

        {frontendUrl && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "#f8fafc",
            }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={1.5}
              >
                <Box>
                  <Typography variant="body2" fontWeight={900}>
                    URL pública
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Copia el enlace para compartir el formulario público.
                  </Typography>
                </Box>

                <Tooltip title="Copiar URL pública">
                  <Button
                    variant="outlined"
                    onClick={copiarUrl}
                    startIcon={<ContentCopyIcon />}
                    sx={{
                      whiteSpace: "nowrap",
                      alignSelf: { xs: "stretch", sm: "center" },
                    }}
                  >
                    Copiar URL pública
                  </Button>
                </Tooltip>
              </Stack>

              <Box
                sx={{
                  px: 1.5,
                  py: 1.2,
                  borderRadius: 2,
                  border: "1px solid #dbe3ef",
                  bgcolor: "#ffffff",
                  fontSize: 14,
                  color: "#334155",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  wordBreak: "break-all",
                  userSelect: "text",
                }}
              >
                {frontendUrl}
              </Box>
            </Stack>
          </Paper>
        )}

        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <Button
            variant="contained"
            onClick={guardarPublico}
            disabled={guardando}
            startIcon={<PublicIcon />}
          >
            {publicEnabled ? "Guardar portada" : "Activar público"}
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
