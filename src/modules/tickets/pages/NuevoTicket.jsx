import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosCliente from "../../../services/axiosCliente";
import SystemCard from "../components/SystemCard";
import CategoryCard from "../components/CategoryCard";
import PriorityCard from "../components/PriorityCard";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";

function NuevoTicket() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    system_id: "",
    category_id: "",
    priority_id: "",
  });

  const [archivos, setArchivos] = useState([]);
  const [dragActivo, setDragActivo] = useState(false);

  const [sistemas, setSistemas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  const normalizar = (res) => res?.data?.data || res?.data || [];

  useEffect(() => {
    obtenerCatalogos();
  }, []);

  const obtenerCatalogos = async () => {
    setLoadingCatalogos(true);
    setError("");

    try {
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
      setError("No se pudieron cargar los catálogos");
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const cambiarValor = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const seleccionarSistema = (sistemaId) => {
    setFormulario((prev) => ({
      ...prev,
      system_id: sistemaId,
      category_id: "",
    }));
  };

  const seleccionarCategoria = (categoriaId) => {
    setFormulario((prev) => ({
      ...prev,
      category_id: categoriaId,
    }));
  };

  const seleccionarPrioridad = (prioridadId) => {
    setFormulario((prev) => ({
      ...prev,
      priority_id: prioridadId,
    }));
  };

  const agregarArchivos = (listaArchivos) => {
    const nuevos = Array.from(listaArchivos || []);

    if (!nuevos.length) return;

    setArchivos((prev) => [...prev, ...nuevos]);
  };

  const cambiarArchivos = (e) => {
    agregarArchivos(e.target.files);
    e.target.value = "";
  };

  const eliminarArchivo = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActivo(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragActivo(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActivo(false);
    agregarArchivos(e.dataTransfer.files);
  };

  const esImagen = (archivo) => archivo.type?.startsWith("image/");
  const esVideo = (archivo) => archivo.type?.startsWith("video/");

  const categoriasFiltradas = categorias.filter(
    (categoria) => String(categoria.system_id) === String(formulario.system_id),
  );

  const categoriaSeleccionada = categorias.find(
    (categoria) => String(categoria.id) === String(formulario.category_id),
  );

  const formularioCompleto =
    formulario.system_id &&
    formulario.category_id &&
    formulario.priority_id &&
    formulario.titulo.trim() &&
    formulario.descripcion.trim();

  const crearTicket = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      const formData = new FormData();

      formData.append("titulo", formulario.titulo);
      formData.append("descripcion", formulario.descripcion);
      formData.append("system_id", formulario.system_id);
      formData.append("category_id", formulario.category_id);
      formData.append("priority_id", formulario.priority_id);

      archivos.forEach((archivo) => {
        formData.append("archivos[]", archivo);
      });

      await axiosCliente.post("/tickets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/paneladministrador");
    } catch (error) {
      console.log("ERROR CREAR TICKET:", error.response?.data || error);

      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(error.response?.data?.message || "Error al crear ticket");
      }
    } finally {
      setCargando(false);
    }
  };

  if (loadingCatalogos) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Nuevo ticket
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Registra un incidente para seguimiento por el equipo de soporte.
        </Typography>
      </Box>

      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          boxShadow: 1,
          border: "1px solid #e5e7eb",
          maxWidth: 980,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={crearTicket}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Box>
                <Typography fontWeight={800}>Clasificación</Typography>
                <Typography variant="body2" color="text.secondary">
                  Selecciona el sistema, tipo de problema y prioridad.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography fontWeight={800} mb={1}>
                Sistema
              </Typography>

              <Grid container spacing={2}>
                {sistemas.map((sistema) => (
                  <Grid item xs={12} sm={6} md={4} key={sistema.id}>
                    <SystemCard
                      sistema={sistema}
                      selected={
                        String(formulario.system_id) === String(sistema.id)
                      }
                      onClick={() => seleccionarSistema(sistema.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography fontWeight={800} mb={1}>
                Tipo de problema
              </Typography>

              {!formulario.system_id ? (
                <Alert severity="info">
                  Selecciona primero un sistema para ver los tipos de problema
                  disponibles.
                </Alert>
              ) : categoriasFiltradas.length > 0 ? (
                <Grid container spacing={2}>
                  {categoriasFiltradas.map((categoria) => (
                    <Grid item xs={12} sm={6} md={3} key={categoria.id}>
                      <CategoryCard
                        categoria={categoria}
                        selected={
                          String(formulario.category_id) ===
                          String(categoria.id)
                        }
                        onClick={() => seleccionarCategoria(categoria.id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="warning">
                  No hay tipos de problema disponibles para este sistema.
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography fontWeight={800} mb={1}>
                Prioridad
              </Typography>

              <Grid container spacing={2}>
                {prioridades.map((prioridad) => (
                  <Grid item xs={12} sm={6} md={3} key={prioridad.id}>
                    <PriorityCard
                      prioridad={prioridad}
                      selected={
                        String(formulario.priority_id) === String(prioridad.id)
                      }
                      onClick={() => seleccionarPrioridad(prioridad.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  borderTop: "1px solid #e5e7eb",
                  pt: 2,
                  mt: 1,
                }}
              >
                <Typography fontWeight={800}>Información del ticket</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="¿Qué problema estás presentando?"
                name="titulo"
                value={formulario.titulo}
                onChange={cambiarValor}
                placeholder={
                  categoriaSeleccionada?.titulo_ejemplo ||
                  "Describe brevemente el problema"
                }
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Cuéntanos un poco más"
                name="descripcion"
                value={formulario.descripcion}
                onChange={cambiarValor}
                placeholder={
                  categoriaSeleccionada?.descripcion_ejemplo ||
                  "Describe con el mayor detalle posible el problema."
                }
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  borderTop: "1px solid #e5e7eb",
                  pt: 2,
                  mt: 1,
                }}
              >
                <Typography fontWeight={800}>Evidencias</Typography>

                <Typography variant="body2" color="text.secondary">
                  Adjunta fotos, capturas, documentos o videos relacionados con
                  el problema.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                sx={{
                  border: dragActivo
                    ? "2px dashed #2563eb"
                    : "2px dashed #cbd5e1",
                  borderRadius: 3,
                  p: 3,
                  bgcolor: dragActivo ? "#eff6ff" : "#f8fafc",
                  textAlign: "center",
                  transition: "0.2s ease",
                }}
              >
                <InsertDriveFileIcon color="primary" />

                <Typography fontWeight={800} mt={1}>
                  Arrastra archivos aquí
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  También puedes seleccionar múltiples archivos desde tu equipo.
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Seleccionar archivos
                  <input
                    hidden
                    multiple
                    type="file"
                    accept="image/*,video/*,.jfif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    onChange={cambiarArchivos}
                  />
                </Button>
              </Box>
            </Grid>

            {archivos.length > 0 && (
              <Grid item xs={12}>
                <Stack spacing={1.5}>
                  {archivos.map((archivo, index) => (
                    <Paper
                      key={`${archivo.name}-${index}`}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      {esImagen(archivo) ? (
                        <Box
                          component="img"
                          src={URL.createObjectURL(archivo)}
                          alt={archivo.name}
                          sx={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid #e5e7eb",
                            flexShrink: 0,
                          }}
                        />
                      ) : esVideo(archivo) ? (
                        <Box
                          component="video"
                          src={URL.createObjectURL(archivo)}
                          sx={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid #e5e7eb",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: "#e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <InsertDriveFileIcon />
                        </Box>
                      )}

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography fontWeight={700} noWrap>
                          {archivo.name}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {(archivo.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>

                      <Chip
                        label={
                          esImagen(archivo)
                            ? "Imagen"
                            : esVideo(archivo)
                              ? "Video"
                              : "Archivo"
                        }
                        size="small"
                      />

                      <Button
                        color="error"
                        size="small"
                        onClick={() => eliminarArchivo(index)}
                        sx={{
                          minWidth: 40,
                          borderRadius: 2,
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              </Grid>
            )}
          </Grid>

          <Box
            mt={4}
            display="flex"
            gap={2}
            justifyContent="flex-end"
            flexDirection={{ xs: "column", sm: "row" }}
            sx={{
              position: "sticky",
              bottom: 0,
              py: 2,
              px: 1,
              bgcolor: "#fff",
              borderTop: "1px solid #e5e7eb",
              zIndex: 20,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/paneladministrador")}
              disabled={cargando}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
              }}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={cargando || !formularioCompleto}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
              }}
            >
              {cargando ? "Creando..." : "Crear ticket"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default NuevoTicket;
