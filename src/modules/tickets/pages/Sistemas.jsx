import { useEffect, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

function Sistemas() {
  const [sistemas, setSistemas] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    prefijo: "",
  });

  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerSistemas();
  }, []);

  const obtenerSistemas = async () => {
    try {
      setError("");

      const respuesta = await axiosCliente.get("/systems");
      setSistemas(respuesta.data.data || respuesta.data || []);
    } catch (error) {
      console.log("ERROR SISTEMAS:", error.response?.data || error);
      setError("No se pudieron cargar los sistemas");
    } finally {
      setLoading(false);
    }
  };

  const cambiarValor = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const crearSistema = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      await axiosCliente.post("/systems", {
        nombre: formulario.nombre,
        descripcion: formulario.descripcion,
        prefijo: formulario.prefijo.toUpperCase(),
        company_id: 1,
        responsable_id: null,
        estado: 1,
      });

      setFormulario({
        nombre: "",
        descripcion: "",
        prefijo: "",
      });

      obtenerSistemas();
    } catch (error) {
      console.log("ERROR CREAR SISTEMA:", error.response?.data || error);

      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(error.response?.data?.message || "No se pudo crear el sistema");
      }
    } finally {
      setCargando(false);
    }
  };

  if (loading) {
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
          Sistemas
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Administra los sistemas disponibles para clasificar tickets.
        </Typography>
      </Box>

      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          boxShadow: 1,
          mb: 4,
        }}
      >
        <Typography fontWeight={800} mb={2}>
          Crear sistema
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={crearSistema}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nombre del sistema"
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarValor}
                required
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={formulario.descripcion}
                onChange={cambiarValor}
                required
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Prefijo"
                name="prefijo"
                value={formulario.prefijo}
                onChange={cambiarValor}
                required
                inputProps={{
                  maxLength: 5,
                  style: { textTransform: "uppercase" },
                }}
                helperText="Ejemplo: WEB, ADM, INV"
              />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={cargando}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1,
              }}
            >
              {cargando ? "Creando..." : "Crear sistema"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3} alignItems="stretch">
        {sistemas.map((sistema) => (
          <Grid item xs={12} sm={6} lg={4} key={sistema.id}>
            <Paper
              sx={{
                height: "100%",
                minHeight: 170,
                p: 2.5,
                borderRadius: 3,
                boxShadow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: "1px solid #e5e7eb",
                transition: "0.2s ease",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  gap={2}
                  mb={1.5}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={800} noWrap>
                      {sistema.nombre}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      ID: {sistema.id}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label={Number(sistema.estado) === 1 ? "Activo" : "Inactivo"}
                    color={Number(sistema.estado) === 1 ? "success" : "default"}
                  />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.6,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {sistema.descripcion || "Sin descripción"}
                </Typography>
              </Box>

              <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                <Chip
                  label={sistema.prefijo || "TCK"}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    borderRadius: 2,
                    bgcolor: "#eff6ff",
                    color: "#1d4ed8",
                  }}
                />

                <Typography variant="caption" color="text.secondary">
                  Prefijo de ticket
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Sistemas;