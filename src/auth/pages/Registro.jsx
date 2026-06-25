import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosCliente from "../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

function Registro() {
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

  const registrarUsuario = async (e) => {
    e.preventDefault();

    setError("");

    if (formulario.telefono.length !== 10) {
      setError("El teléfono debe tener exactamente 10 dígitos");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await axiosCliente.post("/register", formulario);

      localStorage.setItem("TOKEN", respuesta.data.token);
      localStorage.setItem("USUARIO", JSON.stringify(respuesta.data.user));

      navigate("/tickets/nuevo");
    } catch (error) {
      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(error.response?.data?.message || "No se pudo crear la cuenta");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f6fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper sx={{ width: "100%", maxWidth: 760, p: 4, borderRadius: 3 }}>
        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Crear cuenta
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Registra tus datos para crear tickets de soporte.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={registrarUsuario}>
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
                type="email"
                label="Correo electrónico"
                name="email"
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
                type="password"
                label="Contraseña"
                name="password"
                value={formulario.password}
                onChange={cambiarValor}
                required
              />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={cargando}
              size="large"
            >
              {cargando ? "Registrando..." : "Crear cuenta"}
            </Button>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" mt={3}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login">Iniciar sesión</Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Registro;