import { useEffect, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

function NuevoTicketModal({ open, onClose, onCreated }) {
  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    system_id: "",
    category_id: "",
    priority_id: "",
  });

  const [archivo, setArchivo] = useState(null);
  const [sistemas, setSistemas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const normalizar = (res) => res?.data?.data || res?.data || [];

  useEffect(() => {
    if (open) cargarCatalogos();
  }, [open]);

  const cargarCatalogos = async () => {
    try {
      setError("");

      const [resS, resC, resP] = await Promise.all([
        axiosCliente.get("/systems"),
        axiosCliente.get("/ticket-categories"),
        axiosCliente.get("/ticket-priorities"),
      ]);

      setSistemas(
        normalizar(resS)
          .filter((sistema) => Number(sistema.estado) === 1)
          .sort((a, b) => Number(a.orden || 999) - Number(b.orden || 999)),
      );

      setCategorias(
        normalizar(resC).filter((categoria) => Number(categoria.estado) === 1),
      );

      setPrioridades(normalizar(resP));
    } catch (error) {
      console.log("ERROR CATÁLOGOS:", error.response?.data || error);
      setError("No se pudieron cargar los catálogos.");
    }
  };

  const categoriasFiltradas = categorias.filter(
    (categoria) => String(categoria.system_id) === String(formulario.system_id),
  );

  const cambiarValor = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "system_id" ? { category_id: "" } : {}),
    }));
  };

  const cerrar = () => {
    setFormulario({
      titulo: "",
      descripcion: "",
      system_id: "",
      category_id: "",
      priority_id: "",
    });

    setArchivo(null);
    setError("");
    onClose();
  };

  const seleccionarArchivo = (e) => {
    const file = e.target.files?.[0] || null;

    setArchivo(file);

    e.target.value = "";
  };

  const quitarArchivo = () => {
    setArchivo(null);
  };

  const formatoPeso = (bytes) => {
    if (!bytes) return "0 KB";

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const crearTicket = async (e) => {
    e.preventDefault();

    setCargando(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("titulo", formulario.titulo);
      formData.append("descripcion", formulario.descripcion);
      formData.append("system_id", formulario.system_id);
      formData.append("category_id", formulario.category_id);
      formData.append("priority_id", formulario.priority_id);

      if (archivo) {
        formData.append("archivos[]", archivo);
      }

      await axiosCliente.post("/tickets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      cerrar();

      if (onCreated) {
        onCreated();
      }
    } catch (error) {
      console.log("ERROR CREAR TICKET:", error.response?.data || error);

      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(error.response?.data?.message || "No se pudo crear el ticket.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={cargando ? undefined : cerrar}
      maxWidth="sm"
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: { xs: "calc(100% - 24px)", sm: 620 },
          m: { xs: 1.5, sm: 3 },
          borderRadius: { xs: 3, sm: 4 },
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.6, sm: 2.2 },
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={900}
              sx={{
                fontSize: { xs: 19, sm: 22 },
                lineHeight: 1.2,
              }}
            >
              Crear ticket
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                fontSize: { xs: 12.5, sm: 14 },
                lineHeight: 1.35,
              }}
            >
              Completa la información para registrar un nuevo ticket de soporte.
            </Typography>
          </Box>

          <IconButton
            onClick={cerrar}
            disabled={cargando}
            size="small"
            sx={{
              flexShrink: 0,
              border: "1px solid #e5e7eb",
              width: 34,
              height: 34,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Box component="form" onSubmit={crearTicket}>
        <DialogContent
          dividers={false}
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 },
            maxHeight: { xs: "calc(100dvh - 190px)", sm: "70vh" },
            overflowY: "auto",
          }}
        >
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                borderColor: "#e5e7eb",
                bgcolor: "#ffffff",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                    Clasificación
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Selecciona el sistema, sección y prioridad del ticket.
                  </Typography>
                </Box>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Sistema"
                  name="system_id"
                  value={formulario.system_id}
                  onChange={cambiarValor}
                  required
                  disabled={cargando}
                >
                  {sistemas.map((sistema) => (
                    <MenuItem key={sistema.id} value={sistema.id}>
                      {sistema.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Sección"
                  name="category_id"
                  value={formulario.category_id}
                  onChange={cambiarValor}
                  disabled={!formulario.system_id || cargando}
                  required
                  helperText={
                    !formulario.system_id
                      ? "Primero selecciona un sistema"
                      : categoriasFiltradas.length === 0
                        ? "Este sistema no tiene secciones disponibles"
                        : ""
                  }
                >
                  {categoriasFiltradas.map((categoria) => (
                    <MenuItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Prioridad"
                  name="priority_id"
                  value={formulario.priority_id}
                  onChange={cambiarValor}
                  required
                  disabled={cargando}
                >
                  {prioridades.map((prioridad) => (
                    <MenuItem key={prioridad.id} value={prioridad.id}>
                      {prioridad.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                borderColor: "#e5e7eb",
                bgcolor: "#ffffff",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                    Detalle del problema
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Describe el asunto y agrega información suficiente para
                    atenderlo.
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  label="Asunto"
                  name="titulo"
                  value={formulario.titulo}
                  onChange={cambiarValor}
                  required
                  disabled={cargando}
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={7}
                  size="small"
                  label="Descripción"
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={cambiarValor}
                  required
                  disabled={cargando}
                />
              </Stack>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                borderColor: "#e5e7eb",
                bgcolor: "#ffffff",
              }}
            >
              <Stack spacing={1.4}>
                <Box>
                  <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                    Archivo adjunto
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Puedes adjuntar una captura, documento o archivo relacionado.
                  </Typography>
                </Box>

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  disabled={cargando}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                    justifyContent: "center",
                    minHeight: 40,
                  }}
                >
                  Adjuntar archivo
                  <input
                    hidden
                    type="file"
                    accept="image/*,video/*,.jfif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    onChange={seleccionarArchivo}
                  />
                </Button>

                {archivo && (
                  <Box
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
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ minWidth: 0 }}
                    >
                      <InsertDriveFileIcon color="action" />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          noWrap
                          sx={{
                            maxWidth: { xs: 220, sm: 420 },
                          }}
                        >
                          {archivo.name}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {formatoPeso(archivo.size)}
                        </Typography>
                      </Box>
                    </Stack>

                    <IconButton
                      size="small"
                      onClick={quitarArchivo}
                      disabled={cargando}
                      sx={{ flexShrink: 0 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            display: "flex",
            flexDirection: { xs: "column-reverse", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={cerrar}
            disabled={cargando}
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              maxWidth: { xs: "100%", sm: 140 },
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={cargando}
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              maxWidth: { xs: "100%", sm: 150 },
            }}
          >
            {cargando ? "Creando..." : "Crear ticket"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default NuevoTicketModal;