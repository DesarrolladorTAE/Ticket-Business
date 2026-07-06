import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

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
    direccion: "",
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
      formData.append("cliente[direccion]", form.direccion.trim());

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "#f8fafc",
        py: { xs: 2, md: 5 },
        px: { xs: 2, md: 3 },
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
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: 4,
          border: "1px solid #e5e7eb",
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            bgcolor: color,
            color: "#fff",
            p: { xs: 3, md: 4 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            {system?.logo_url && (
              <Box
                component="img"
                src={system.logo_url}
                alt={system?.nombre || "Logo del sistema"}
                sx={{
                  width: 72,
                  height: 72,
                  objectFit: "contain",
                  borderRadius: 2,
                  bgcolor: "#ffffff",
                  p: 1,
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              />
            )}

            <Box>
              <Typography variant="h4" fontWeight={900}>
                {portada.titulo || system?.nombre || "Soporte"}
              </Typography>

              <Typography mt={1} fontWeight={600}>
                {portada.subtitulo || "Levanta tu solicitud de soporte"}
              </Typography>

              <Typography mt={1} sx={{ opacity: 0.9 }}>
                {portada.descripcion ||
                  "Describe el problema para darte seguimiento."}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box component="form" onSubmit={crearTicket} p={{ xs: 2.5, md: 4 }}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ p: { xs: 2, md: 3 } }}></Box>
            <Typography variant="h6" fontWeight={800}>
              Datos del cliente
            </Typography>

            <TextField
              label="Nombre"
              name="name"
              value={form.name}
              onChange={cambiarValor}
              fullWidth
              required
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Apellido paterno"
                name="apellido_paterno"
                value={form.apellido_paterno}
                onChange={cambiarValor}
                fullWidth
              />

              <TextField
                label="Apellido materno"
                name="apellido_materno"
                value={form.apellido_materno}
                onChange={cambiarValor}
                fullWidth
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
              />

              <TextField
                label="Teléfono"
                name="telefono"
                value={form.telefono}
                onChange={cambiarValor}
                fullWidth
              />
            </Stack>

            <TextField
              label="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={cambiarValor}
              fullWidth
            />

            <Typography variant="h6" fontWeight={800} mt={1}>
              Datos del ticket
            </Typography>

            <TextField
              label="Asunto"
              name="titulo"
              value={form.titulo}
              onChange={cambiarValor}
              fullWidth
              required
            />

            <TextField
              label="Descripción del problema"
              name="descripcion"
              value={form.descripcion}
              onChange={cambiarValor}
              fullWidth
              required
              multiline
              minRows={5}
            />

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                disabled={enviando}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
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
                mt={0.7}
              >
                Permitidos: imágenes, PDF, Word, Excel, TXT o ZIP. Máximo 10 MB
                por archivo.
              </Typography>
            </Box>

            {archivos.length > 0 && (
              <Stack spacing={1}>
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

            <Button
              type="submit"
              variant="contained"
              disabled={enviando}
              sx={{
                py: 1.3,
                fontWeight: 800,
                bgcolor: color,
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
                justifyContent: "center",
                fontWeight: 700,
                borderRadius: 2,
              }}
            />
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default TicketPublicoCrear;
