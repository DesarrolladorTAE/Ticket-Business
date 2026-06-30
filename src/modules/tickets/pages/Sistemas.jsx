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
    logo: null,
  });

  const [previewLogo, setPreviewLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const API_URL =
    import.meta.env.VITE_API_URL || "https://api.thebusinessticket.com";

  useEffect(() => {
    obtenerSistemas();
  }, []);

  const obtenerSistemas = async () => {
    try {
      setError("");

      const respuesta = await axiosCliente.get("/systems");
      setSistemas(
        (respuesta.data.data || respuesta.data || [])
          .filter((sistema) => Number(sistema.estado) === 1)
          .sort((a, b) => Number(a.orden || 999) - Number(b.orden || 999)),
      );
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

  const cambiarLogo = (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    setFormulario({
      ...formulario,
      logo: archivo,
    });

    setPreviewLogo(URL.createObjectURL(archivo));
  };

  const crearSistema = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      const formData = new FormData();

      formData.append("nombre", formulario.nombre);
      formData.append("descripcion", formulario.descripcion);
      formData.append("prefijo", formulario.prefijo.toUpperCase());
      formData.append("responsable_id", "");
      formData.append("estado", "1");

      if (formulario.logo) {
        formData.append("logo", formulario.logo);
      }

      await axiosCliente.post("/systems", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFormulario({
        nombre: "",
        descripcion: "",
        prefijo: "",
        logo: null,
      });

      setPreviewLogo(null);

      obtenerSistemas();
    } catch (error) {
      console.log("ERROR CREAR SISTEMA:", error.response?.data || error);

      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(
          error.response?.data?.message || "No se pudo crear el sistema",
        );
      }
    } finally {
      setCargando(false);
    }
  };

  const obtenerLogoUrl = (logo) => {
    if (!logo) return null;

    if (logo.startsWith("http")) {
      return logo;
    }

    return `/${logo}`;
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
          border: "1px solid #e5e7eb",
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

            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{
                  height: 56,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Seleccionar logo
                <input
                  type="file"
                  hidden
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={cambiarLogo}
                />
              </Button>

              <Typography variant="caption" color="text.secondary">
                Formatos permitidos: JPG, PNG o WEBP. Máximo 2 MB.
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: 72,
                  border: "1px dashed #cbd5e1",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 2,
                  bgcolor: "#f8fafc",
                }}
              >
                {previewLogo ? (
                  <Box
                    component="img"
                    src={previewLogo}
                    alt="Vista previa"
                    sx={{
                      width: 48,
                      height: 48,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: "#e5e7eb",
                    }}
                  />
                )}

                <Box>
                  <Typography fontWeight={700} variant="body2">
                    Vista previa del logo
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {formulario.logo?.name || "Sin archivo seleccionado"}
                  </Typography>
                </Box>
              </Box>
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
        {sistemas.map((sistema) => {
          const logoUrl = obtenerLogoUrl(sistema.logo);

          return (
            <Grid item xs={12} sm={6} lg={4} key={sistema.id}>
              <Paper
                sx={{
                  height: "100%",
                  minHeight: 190,
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
                    <Box display="flex" gap={1.5} sx={{ minWidth: 0 }}>
                      {logoUrl ? (
                        <Box
                          component="img"
                          src={logoUrl}
                          alt={sistema.nombre}
                          sx={{
                            width: 46,
                            height: 46,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid #e5e7eb",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 2,
                            bgcolor: "#e5e7eb",
                            flexShrink: 0,
                          }}
                        />
                      )}

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
                    </Box>

                    <Chip
                      size="small"
                      label={
                        Number(sistema.estado) === 1 ? "Activo" : "Inactivo"
                      }
                      color={
                        Number(sistema.estado) === 1 ? "success" : "default"
                      }
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

                <Box
                  mt={2}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Chip
                    label={sistema.prefijo || "TCK"}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      borderRadius: 2,
                      bgcolor: sistema.color_secundario || "#eff6ff",
                      color: sistema.color || "#1d4ed8",
                    }}
                  />

                  <Typography variant="caption" color="text.secondary">
                    Prefijo de ticket
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default Sistemas;
