import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
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
    direccion: "",
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
      setError("El teléfono debe tener exactamente 10 dígitos");
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
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Crear agente
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Registra un nuevo usuario agente para atención y seguimiento de tickets.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1, maxWidth: 900 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={crearAgente}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nombre(s)"
                name="name"
                value={formulario.name}
                onChange={cambiarValor}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Apellido paterno"
                name="apellido_paterno"
                value={formulario.apellido_paterno}
                onChange={cambiarValor}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Apellido materno"
                name="apellido_materno"
                value={formulario.apellido_materno}
                onChange={cambiarValor}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formulario.telefono}
                onChange={cambiarTelefono}
                required
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
                label="Correo electrónico"
                name="email"
                type="email"
                value={formulario.email}
                onChange={cambiarValor}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                value={formulario.direccion}
                onChange={cambiarValor}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type="password"
                value={formulario.password}
                onChange={cambiarValor}
                required
              />
            </Grid>
          </Grid>

          <Box mt={3} display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={cargando}
            >
              {cargando ? "Creando..." : "Crear agente"}
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/paneladministrador")}
              disabled={cargando}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default CrearAgente;