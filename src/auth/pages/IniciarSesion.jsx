import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosCliente from "../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

function IniciarSesion() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
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

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const respuesta = await axiosCliente.post("/login", formulario);

      const user = respuesta.data.user;
      const company = respuesta.data.company;

      // ✅ OPCIÓN A: Si Spatie no devuelve roles, usar company.role como fallback
      let roles = Array.isArray(user.roles) ? [...user.roles] : [];
      console.log("roles:", roles);

      if (roles.length === 0 && company?.role) {
        const mapaRoles = {
          admin: "Administrador",
          agent: "Agente",
          supervisor: "Supervisor",
          client: "Cliente",
        };
        const rolTraducido = mapaRoles[company.role];
        if (rolTraducido) roles = [rolTraducido];
      }

      // Guardamos los roles resueltos en el usuario
      user.roles = roles;

      localStorage.setItem("TOKEN", respuesta.data.token);
      localStorage.setItem("USUARIO", JSON.stringify(user));

      // Routing por rol
      if (
        roles.includes("Administrador") ||
        roles.includes("Agente") ||
        roles.includes("Supervisor")
      ) {
        console.log("entrando al paneladministrador");
        navigate("/paneladministrador");
        return;
      }

      if (roles.includes("Cliente")) {
        navigate("/tickets/nuevo");
        return;
      }

      // Sin rol reconocido
      setError("Tu usuario no tiene un rol asignado. Contacta al administrador.");

    } catch (error) {
      setError(
        error.response?.data?.message || "Correo o contraseña incorrectos"
      );
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
      <Paper sx={{ width: "100%", maxWidth: 420, p: 4, borderRadius: 3 }}>
        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Accede al panel de soporte.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={iniciarSesion}>
          <TextField
            fullWidth
            type="email"
            name="email"
            label="Correo electrónico"
            value={formulario.email}
            onChange={cambiarValor}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            name="password"
            label="Contraseña"
            value={formulario.password}
            onChange={cambiarValor}
            required
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={cargando}
            size="large"
          >
            {cargando ? "Entrando..." : "Entrar"}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" mt={3}>
          ¿No tienes cuenta?{" "}
          <Link to="/registro">Crear cuenta</Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default IniciarSesion;