import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axiosCliente from "../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LoginIcon from "@mui/icons-material/Login";

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

      let roles = Array.isArray(user.roles) ? [...user.roles] : [];

      if (roles.length === 0 && company?.role) {
        const mapaRoles = {
          admin: "Administrador",
          agent: "Agente",
          supervisor: "Supervisor",
          client: "Cliente",
        };

        const rolTraducido = mapaRoles[company.role];

        if (rolTraducido) {
          roles = [rolTraducido];
        }
      }

      user.roles = roles;

      localStorage.setItem("TOKEN", respuesta.data.token);
      localStorage.setItem("USUARIO", JSON.stringify(user));

      if (
        roles.includes("Administrador") ||
        roles.includes("Agente") ||
        roles.includes("Supervisor")
      ) {
        navigate("/paneladministrador");
        return;
      }

      if (roles.includes("Cliente")) {
        navigate("/tickets/nuevo");
        return;
      }

      setError("Tu usuario no tiene un rol asignado. Contacta al administrador.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Correo o contraseña incorrectos",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.10)",
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            px: { xs: 2.5, sm: 4 },
            pt: { xs: 3, sm: 4 },
            pb: 2,
          }}
        >
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 4,
                bgcolor: "#eff6ff",
                color: "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #bfdbfe",
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 32 }} />
            </Box>

            <Box>
              <Typography
                fontWeight={900}
                sx={{
                  fontSize: { xs: 24, sm: 27 },
                  color: "#0f172a",
                  lineHeight: 1.15,
                }}
              >
                The Business Ticket
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.7,
                  fontWeight: 600,
                }}
              >
                Panel de soporte y seguimiento de tickets
              </Typography>
            </Box>

            <Chip
              label="Acceso seguro"
              size="small"
              sx={{
                bgcolor: "#ecfdf5",
                color: "#047857",
                fontWeight: 900,
                borderRadius: 2,
                border: "1px solid #bbf7d0",
              }}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: { xs: 2.5, sm: 3 },
          }}
        >
          <Box mb={2.5}>
            <Typography
              fontWeight={900}
              sx={{
                fontSize: { xs: 21, sm: 24 },
                color: "#0f172a",
              }}
            >
              Iniciar sesión
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                mt: 0.5,
              }}
            >
              Ingresa tu correo y contraseña para acceder al sistema.
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={iniciarSesion}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                type="email"
                name="email"
                label="Correo electrónico"
                value={formulario.email}
                onChange={cambiarValor}
                required
                disabled={cargando}
                autoComplete="email"
                autoFocus
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />

              <TextField
                fullWidth
                type="password"
                name="password"
                label="Contraseña"
                value={formulario.password}
                onChange={cambiarValor}
                required
                disabled={cargando}
                autoComplete="current-password"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={cargando}
                size="large"
                startIcon={
                  cargando ? (
                    <CircularProgress size={18} sx={{ color: "#ffffff" }} />
                  ) : (
                    <LoginIcon />
                  )
                }
                sx={{
                  mt: 0.5,
                  minHeight: 46,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 900,
                  bgcolor: "#2563eb",
                  boxShadow: "0 10px 20px rgba(37, 99, 235, 0.25)",
                  "&:hover": {
                    bgcolor: "#1d4ed8",
                    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.32)",
                  },
                }}
              >
                {cargando ? "Entrando..." : "Entrar"}
              </Button>
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: 2,
            bgcolor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            ¿No tienes cuenta?{" "}
            <Box
              component={RouterLink}
              to="/registro"
              sx={{
                color: "#1d4ed8",
                fontWeight: 900,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Crear cuenta
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    bgcolor: "#ffffff",
    fontSize: 14,
  },
  "& .MuiInputLabel-root": {
    fontSize: 14,
  },
};

export default IniciarSesion;