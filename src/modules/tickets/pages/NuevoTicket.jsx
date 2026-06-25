import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

function NuevoTicket() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    system_id: "",
    category_id: "",
    priority_id: "",
  });

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

      setSistemas(normalizar(resS));
      setCategorias(normalizar(resC));
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
      ...(name === "system_id" ? { category_id: "" } : {}),
    }));
  };

  const categoriasFiltradas = categorias.filter(
    (categoria) => String(categoria.system_id) === String(formulario.system_id)
  );

  const crearTicket = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      await axiosCliente.post("/tickets", formulario);
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
              <Typography fontWeight={800} mb={1}>
                Información del ticket
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                name="titulo"
                value={formulario.titulo}
                onChange={cambiarValor}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Descripción"
                name="descripcion"
                value={formulario.descripcion}
                onChange={cambiarValor}
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
                <Typography fontWeight={800}>
                  Clasificación
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Selecciona el sistema, tipo de problema y prioridad.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Sistema"
                name="system_id"
                value={formulario.system_id}
                onChange={cambiarValor}
                required
              >
                {sistemas.map((sistema) => (
                  <MenuItem key={sistema.id} value={sistema.id}>
                    {sistema.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Tipo de problema"
                name="category_id"
                value={formulario.category_id}
                onChange={cambiarValor}
                disabled={!formulario.system_id}
                required
              >
                {categoriasFiltradas.length > 0 ? (
                  categoriasFiltradas.map((categoria) => (
                    <MenuItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {formulario.system_id
                      ? "No hay tipos disponibles"
                      : "Selecciona un sistema primero"}
                  </MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Prioridad"
                name="priority_id"
                value={formulario.priority_id}
                onChange={cambiarValor}
                required
              >
                {prioridades.map((prioridad) => (
                  <MenuItem key={prioridad.id} value={prioridad.id}>
                    {prioridad.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Box
            mt={4}
            pt={3}
            display="flex"
            gap={2}
            justifyContent="flex-end"
            flexDirection={{ xs: "column", sm: "row" }}
            sx={{
              borderTop: "1px solid #e5e7eb",
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
              disabled={cargando}
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