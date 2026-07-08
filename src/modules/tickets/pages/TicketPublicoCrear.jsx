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

      navigate(`/public/tickets/${ticket.public_tracking_code}`);
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
        pt: 0,
        pb: 0,
        px: { xs: 0, sm: 2, md: 3 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: { xs: 2, md: 3 },
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
            px: { xs: 1.6, sm: 2.5, md: 4 },
            py: { xs: 1.8, md: 2.5 },
            bgcolor: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Typography
            variant="caption"
            fontWeight={900}
            sx={{
              color,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Formulario público
          </Typography>

          <Typography
            fontWeight={900}
            sx={{
              mt: 0.5,
              color: "#0f172a",
              fontSize: { xs: 20, sm: 24, md: 28 },
              lineHeight: 1.15,
            }}
          >
            Crear ticket de soporte
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.8,
              maxWidth: 720,
              fontSize: { xs: 12.5, md: 14 },
              lineHeight: 1.45,
            }}
          >
            Completa tus datos y describe el problema. El equipo de soporte dará
            seguimiento a tu solicitud desde The Business Ticket.
          </Typography>
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
                    Permitidos: imágenes, PDF, Word, Excel, TXT o ZIP. Máximo 10
                    MB por archivo.
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

      <PublicTicketFooter
        system={system}
        color={color}
        titulo={tituloPortada}
      />
    </Box>
  );
}

export default TicketPublicoCrear;
