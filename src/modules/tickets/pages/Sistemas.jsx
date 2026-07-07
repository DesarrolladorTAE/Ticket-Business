import { useEffect, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";
import SystemPublicAccessPanel from "../components/SystemPublicAccessPanel";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";

const API_ORIGIN = "https://api.thebusinessticket.com";

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

    e.target.value = "";
  };

  const quitarLogo = () => {
    setFormulario({
      ...formulario,
      logo: null,
    });

    setPreviewLogo(null);
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

    if (logo.startsWith("http://") || logo.startsWith("https://")) {
      return logo;
    }

    if (logo.startsWith("storage/")) {
      return `${API_ORIGIN}/${logo}`;
    }

    if (logo.startsWith("systems/")) {
      return `${API_ORIGIN}/storage/${logo}`;
    }

    return `${API_ORIGIN}/${logo}`;
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
      <Box
        mb={3}
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={1.5}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ fontSize: { xs: 22, md: 26 } }}
          >
            Sistemas
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Administra los sistemas disponibles para clasificar tickets y
            configurar su portal público.
          </Typography>
        </Box>

        <Chip
          label={`${sistemas.length} activos`}
          color="primary"
          variant="outlined"
          sx={{
            fontWeight: 800,
            width: { xs: "fit-content", sm: "auto" },
          }}
        />
      </Box>

      <Paper
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          borderRadius: 3,
          boxShadow: 1,
          mb: 4,
          border: "1px solid #e5e7eb",
        }}
      >
        <Box mb={2}>
          <Typography fontWeight={900} sx={{ fontSize: { xs: 18, md: 20 } }}>
            Crear sistema
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Agrega un nuevo sistema para que los tickets puedan clasificarse por
            producto o servicio.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={crearSistema}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nombre del sistema"
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarValor}
                required
                size="small"
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
                size="small"
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
                size="small"
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
                  minHeight: 44,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
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

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 0.7,
                  display: "block",
                  fontSize: { xs: 11.5, md: 12 },
                }}
              >
                Formatos permitidos: JPG, PNG o WEBP. Máximo 2 MB.
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  minHeight: 72,
                  border: "1px dashed #cbd5e1",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  bgcolor: "#f8fafc",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ minWidth: 0 }}
                >
                  {previewLogo ? (
                    <Box
                      component="img"
                      src={previewLogo}
                      alt="Vista previa"
                      sx={{
                        width: 50,
                        height: 50,
                        objectFit: "contain",
                        borderRadius: 2,
                        border: "1px solid #e5e7eb",
                        bgcolor: "#ffffff",
                        p: 0.5,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        bgcolor: "#e5e7eb",
                        border: "1px solid #d1d5db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ImageIcon color="action" />
                    </Box>
                  )}

                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={800} variant="body2">
                      Vista previa del logo
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      display="block"
                    >
                      {formulario.logo?.name || "Sin archivo seleccionado"}
                    </Typography>
                  </Box>
                </Stack>

                {previewLogo && (
                  <IconButton
                    size="small"
                    onClick={quitarLogo}
                    disabled={cargando}
                    sx={{ flexShrink: 0 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Grid>
          </Grid>

          <Box
            mt={3}
            display="flex"
            justifyContent={{ xs: "stretch", sm: "flex-start" }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={cargando}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
                px: 3,
                py: 1,
                maxWidth: { xs: "100%", sm: 180 },
              }}
            >
              {cargando ? "Creando..." : "Crear sistema"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box mb={2}>
        <Typography fontWeight={900} sx={{ fontSize: { xs: 18, md: 20 } }}>
          Sistemas registrados
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Configura el acceso público, portada, color y enlace de cada sistema.
        </Typography>
      </Box>

      {sistemas.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px dashed #cbd5e1",
            textAlign: "center",
            bgcolor: "#f8fafc",
          }}
        >
          <Typography fontWeight={800}>No hay sistemas activos.</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Crea un sistema para comenzar.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
          {sistemas.map((sistema) => {
            const logoUrl = obtenerLogoUrl(sistema.logo_url || sistema.logo);

            return (
              <Grid item xs={12} lg={6} key={sistema.id}>
                <Paper
                  sx={{
                    height: "100%",
                    minHeight: { xs: "auto", md: 190 },
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    borderRadius: 3,
                    boxShadow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    border: "1px solid #e5e7eb",
                    transition: "0.2s ease",
                    overflow: "hidden",
                    "&:hover": {
                      boxShadow: { xs: 1, md: 4 },
                      transform: { xs: "none", md: "translateY(-2px)" },
                    },
                  }}
                >
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1.5}
                      mb={1.5}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ minWidth: 0, flex: 1 }}
                      >
                        {logoUrl ? (
                          <Box
                            component="img"
                            src={logoUrl}
                            alt={sistema.nombre}
                            sx={{
                              width: { xs: 46, md: 52 },
                              height: { xs: 46, md: 52 },
                              objectFit: "contain",
                              borderRadius: 2,
                              border: "1px solid #e5e7eb",
                              bgcolor: "#ffffff",
                              p: 0.5,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: { xs: 46, md: 52 },
                              height: { xs: 46, md: 52 },
                              borderRadius: 2,
                              bgcolor: "#e5e7eb",
                              border: "1px solid #d1d5db",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <ImageIcon color="action" />
                          </Box>
                        )}

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            fontWeight={900}
                            sx={{
                              fontSize: { xs: 15, md: 16 },
                              lineHeight: 1.2,
                              wordBreak: "break-word",
                            }}
                          >
                            {sistema.nombre}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.4 }}
                          >
                            ID: {sistema.id}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        size="small"
                        label={
                          Number(sistema.estado) === 1 ? "Activo" : "Inactivo"
                        }
                        color={
                          Number(sistema.estado) === 1 ? "success" : "default"
                        }
                        sx={{
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: { xs: 2, md: 3 },
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {sistema.descripcion || "Sin descripción"}
                    </Typography>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      mt={2}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                      <Chip
                        label={sistema.prefijo || "TCK"}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          borderRadius: 2,
                          bgcolor: sistema.color_secundario || "#eff6ff",
                          color: sistema.color || "#1d4ed8",
                        }}
                      />

                      <Typography variant="caption" color="text.secondary">
                        Prefijo de ticket
                      </Typography>
                    </Stack>
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      minWidth: 0,
                      overflow: "hidden",
                      "& *": {
                        maxWidth: "100%",
                        boxSizing: "border-box",
                      },
                    }}
                  >
                    <SystemPublicAccessPanel system={sistema} />
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export default Sistemas;