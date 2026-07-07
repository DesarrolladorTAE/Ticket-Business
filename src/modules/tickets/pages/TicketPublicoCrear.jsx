import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";

function TicketPublicoCrear() {
  const { systemId, prefix } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [system, setSystem] = useState(null);
  const [archivos, setArchivos] = useState([]);

  const [form, setForm] = useState({
    name: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
    titulo: "",
    descripcion: "",
  });

  useEffect(() => {
    cargarSistemaPublico();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemId, prefix]);

  const cargarSistemaPublico = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axiosCliente.get(`/public/s/${systemId}/${prefix}`);

      setSystem(res.data.system);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo cargar el formulario público.",
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

  const seleccionarArchivos = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setArchivos((prev) => [...prev, ...files]);

    e.target.value = "";
  };

  const quitarArchivo = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const validarFormulario = () => {
    if (!form.name.trim()) {
      return "El nombre es obligatorio.";
    }

    if (!form.email.trim()) {
      return "El correo es obligatorio.";
    }

    if (!form.titulo.trim()) {
      return "El asunto del ticket es obligatorio.";
    }

    if (!form.descripcion.trim()) {
      return "La descripción del problema es obligatoria.";
    }

    return "";
  };

  const crearTicket = async (e) => {
    e.preventDefault();

    setError("");

    const mensajeError = validarFormulario();

    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    setEnviando(true);

    try {
      const formData = new FormData();

      formData.append("cliente[name]", form.name.trim());
      formData.append(
        "cliente[apellido_paterno]",
        form.apellido_paterno.trim(),
      );
      formData.append(
        "cliente[apellido_materno]",
        form.apellido_materno.trim(),
      );
      formData.append("cliente[email]", form.email.trim());
      formData.append("cliente[telefono]", form.telefono.trim());

      formData.append("ticket[titulo]", form.titulo.trim());
      formData.append("ticket[descripcion]", form.descripcion.trim());

      archivos.forEach((archivo) => {
        formData.append("attachments[]", archivo);
      });

      const res = await axiosCliente.post(
        `/public/s/${systemId}/${prefix}/tickets`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const ticket = res.data.ticket;

      navigate(
        `/public/tickets/${ticket.public_tracking_code}?access_token=${ticket.access_token}`,
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo crear el ticket público.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const formatoPeso = (bytes) => {
    if (!bytes) return "0 KB";

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
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

  if (error && !system) {
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

  const portada = system?.dato_portada || {};
  const color = system?.color_hex || "#23388B";

  const tituloPortada = portada.titulo || system?.nombre || "Soporte";
  const subtituloPortada =
    portada.subtitulo || "Levanta tu solicitud de soporte";
  const descripcionPortada =
    portada.descripcion || "Describe el problema para darte seguimiento.";

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: "100%",
        bgcolor: "#eef2f7",
        py: { xs: 0, sm: 2, md: 5 },
        px: { xs: 0, sm: 2, md: 3 },
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        boxSizing: "border-box",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 920,
          borderRadius: { xs: 0, sm: 4 },
          overflow: "hidden",
          boxShadow: { xs: "none", sm: 4 },
          border: { xs: "none", sm: "1px solid #e5e7eb" },
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            bgcolor: color,
            color: "#fff",
            p: { xs: 1.6, sm: 2.5, md: 4 },
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 1.2, sm: 1.8, md: 2.5 }}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            {system?.logo_url ? (
              <Box
                component="img"
                src={system.logo_url}
                alt={system?.nombre || "Logo del sistema"}
                sx={{
                  width: { xs: 46, sm: 60, md: 76 },
                  height: { xs: 46, sm: 60, md: 76 },
                  objectFit: "contain",
                  borderRadius: 2,
                  bgcolor: "#ffffff",
                  p: { xs: 0.6, md: 1 },
                  border: "1px solid rgba(255,255,255,0.35)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: { xs: 46, sm: 60, md: 76 },
                  height: { xs: 46, sm: 60, md: 76 },
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ImageIcon />
              </Box>
            )}

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                fontWeight={900}
                sx={{
                  fontSize: { xs: 18, sm: 24, md: 34 },
                  lineHeight: 1.1,
                  wordBreak: "break-word",
                }}
              >
                {tituloPortada}
              </Typography>

              <Typography
                mt={{ xs: 0.4, md: 1 }}
                fontWeight={800}
                sx={{
                  fontSize: { xs: 12, sm: 14, md: 16 },
                  lineHeight: 1.25,
                  opacity: 0.95,
                  display: "-webkit-box",
                  WebkitLineClamp: { xs: 2, md: 3 },
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {subtituloPortada}
              </Typography>

              <Typography
                mt={1}
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: 12.5, md: 15 },
                  lineHeight: 1.45,
                  display: { xs: "none", sm: "block" },
                }}
              >
                {descripcionPortada}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          component="form"
          onSubmit={crearTicket}
          sx={{
            p: { xs: 1.6, sm: 2.5, md: 4 },
          }}
        >
          <Stack spacing={{ xs: 2, md: 2.5 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Box>
              <Typography
                variant="h6"
                fontWeight={900}
                sx={{ fontSize: { xs: 18, md: 20 } }}
              >
                Datos del cliente
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.4, fontSize: { xs: 12.5, md: 14 } }}
              >
                Coloca tus datos de contacto para que el equipo pueda dar
                seguimiento.
              </Typography>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: 3,
                bgcolor: "#ffffff",
                borderColor: "#e5e7eb",
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label="Nombre"
                  name="name"
                  value={form.name}
                  onChange={cambiarValor}
                  fullWidth
                  required
                  size="small"
                />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField
                    label="Apellido paterno"
                    name="apellido_paterno"
                    value={form.apellido_paterno}
                    onChange={cambiarValor}
                    fullWidth
                    size="small"
                  />

                  <TextField
                    label="Apellido materno"
                    name="apellido_materno"
                    value={form.apellido_materno}
                    onChange={cambiarValor}
                    fullWidth
                    size="small"
                  />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField
                    label="Correo"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={cambiarValor}
                    fullWidth
                    required
                    size="small"
                  />

                  <TextField
                    label="Teléfono"
                    name="telefono"
                    value={form.telefono}
                    onChange={cambiarValor}
                    fullWidth
                    size="small"
                  />
                </Stack>
              </Stack>
            </Paper>

            <Divider />

            <Box>
              <Typography
                variant="h6"
                fontWeight={900}
                sx={{ fontSize: { xs: 18, md: 20 } }}
              >
                Datos del ticket
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.4, fontSize: { xs: 12.5, md: 14 } }}
              >
                Describe el problema con claridad. Puedes adjuntar capturas o
                documentos.
              </Typography>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: 3,
                bgcolor: "#ffffff",
                borderColor: "#e5e7eb",
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label="Asunto"
                  name="titulo"
                  value={form.titulo}
                  onChange={cambiarValor}
                  fullWidth
                  required
                  size="small"
                />

                <TextField
                  label="Descripción del problema"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={cambiarValor}
                  fullWidth
                  required
                  multiline
                  minRows={4}
                  size="small"
                />

                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    disabled={enviando}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 800,
                      justifyContent: "center",
                      py: 1,
                    }}
                  >
                    Adjuntar archivos
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={seleccionarArchivos}
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    />
                  </Button>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={0.8}
                    sx={{
                      fontSize: { xs: 11.5, md: 12 },
                      lineHeight: 1.4,
                    }}
                  >
                    Permitidos: imágenes, PDF, Word, Excel, TXT o ZIP. Máximo
                    10 MB por archivo.
                  </Typography>
                </Box>

                {archivos.length > 0 && (
                  <Stack
                    spacing={1}
                    sx={{
                      maxHeight: { xs: 220, md: 260 },
                      overflowY: "auto",
                      pr: 0.3,
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
                          p: 1.2,
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
                            <Typography
                              variant="body2"
                              fontWeight={800}
                              noWrap
                              sx={{
                                maxWidth: {
                                  xs: 210,
                                  sm: 420,
                                  md: 620,
                                },
                              }}
                            >
                              {archivo.name}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatoPeso(archivo.size)}
                            </Typography>
                          </Box>
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => quitarArchivo(index)}
                          disabled={enviando}
                          sx={{ flexShrink: 0 }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>

            <Button
              type="submit"
              variant="contained"
              disabled={enviando}
              fullWidth
              sx={{
                py: { xs: 1.2, md: 1.4 },
                fontWeight: 900,
                borderRadius: 2.5,
                textTransform: "none",
                bgcolor: color,
                fontSize: { xs: 14, md: 15 },
                "&:hover": {
                  bgcolor: color,
                  opacity: 0.9,
                },
              }}
            >
              {enviando ? "Enviando..." : "Crear ticket"}
            </Button>

            <Chip
              label="Todos los mensajes enviados desde este portal serán públicos."
              variant="outlined"
              sx={{
                height: "auto",
                justifyContent: "center",
                fontWeight: 800,
                borderRadius: 2,
                py: 0.7,
                "& .MuiChip-label": {
                  whiteSpace: "normal",
                  textAlign: "center",
                  px: 1.5,
                  fontSize: { xs: 11.5, md: 13 },
                  lineHeight: 1.35,
                },
              }}
            />
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default TicketPublicoCrear;