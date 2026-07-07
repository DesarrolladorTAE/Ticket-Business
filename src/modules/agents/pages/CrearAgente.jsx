import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

function CrearAgente() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    name: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarValor = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const cambiarTelefono = (e) => {
    setFormulario({
      ...formulario,
      telefono: e.target.value.replace(/\D/g, "").slice(0, 10),
    });
  };

  const crearAgente = async (e) => {
    e.preventDefault();

    setError("");

    if (formulario.telefono.length !== 10) {
      setError("El teléfono debe tener exactamente 10 dígitos.");
      return;
    }

    setCargando(true);

    try {
      await axiosCliente.post("/agents", formulario);

      navigate("/paneladministrador");
    } catch (error) {
      console.log("ERROR CREAR AGENTE:", error.response?.data || error);

      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(error.response?.data?.message || "No se pudo crear el agente");
      }
    } finally {
      setCargando(false);
    }
  };

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
            Crear agente
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Registra un nuevo usuario agente para atención y seguimiento de
            tickets.
          </Typography>
        </Box>

        <Chip
          label="Nuevo agente"
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
          border: "1px solid #e5e7eb",
          maxWidth: 950,
        }}
      >
        <Box mb={2}>
          <Typography fontWeight={900} sx={{ fontSize: { xs: 18, md: 20 } }}>
            Datos del agente
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Captura los datos básicos de acceso y contacto del agente.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={crearAgente}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1.5, md: 2 },
              borderRadius: 3,
              borderColor: "#e5e7eb",
              bgcolor: "#ffffff",
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                  Información personal
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Estos datos identifican al agente dentro del sistema.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nombre(s)"
                    name="name"
                    value={formulario.name}
                    onChange={cambiarValor}
                    required
                    disabled={cargando}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Apellido paterno"
                    name="apellido_paterno"
                    value={formulario.apellido_paterno}
                    onChange={cambiarValor}
                    required
                    disabled={cargando}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Apellido materno"
                    name="apellido_materno"
                    value={formulario.apellido_materno}
                    onChange={cambiarValor}
                    required
                    disabled={cargando}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          <Divider sx={{ my: 2.5 }} />

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1.5, md: 2 },
              borderRadius: 3,
              borderColor: "#e5e7eb",
              bgcolor: "#ffffff",
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                  Contacto y acceso
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  El correo y la contraseña se usarán para iniciar sesión.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Teléfono"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={cambiarTelefono}
                    required
                    disabled={cargando}
                    inputProps={{
                      maxLength: 10,
                      inputMode: "numeric",
                    }}
                    helperText="Debe contener exactamente 10 dígitos"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    value={formulario.email}
                    onChange={cambiarValor}
                    required
                    disabled={cargando}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Contraseña"
                    name="password"
                    type="password"
                    value={formulario.password}
                    onChange={cambiarValor}
                    required
                    disabled={cargando}
                    helperText="Define la contraseña inicial del agente"
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            mt={3}
            justifyContent="flex-end"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/paneladministrador")}
              disabled={cargando}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
                px: 3,
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
                px: 3,
                maxWidth: { xs: "100%", sm: 160 },
              }}
            >
              {cargando ? "Creando..." : "Crear agente"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default CrearAgente;