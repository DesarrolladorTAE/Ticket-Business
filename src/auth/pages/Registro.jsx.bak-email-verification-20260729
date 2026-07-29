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

import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

function Registro() {
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
          maxWidth: 500,
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
                Crear cuenta
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.7,
                  fontWeight: 600,
                }}
              >
                Registra tus datos para crear tickets de soporte.
              </Typography>
            </Box>

            <Chip
              label="Cuenta de cliente"
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

          <Box component="form" onSubmit={registrarUsuario}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Nombre(s)"
                name="name"
                value={formulario.name}
                onChange={cambiarValor}
                required
                disabled={cargando}
                autoComplete="given-name"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />

              <TextField
                fullWidth
                size="small"
                label="Apellido paterno"
                name="apellido_paterno"
                value={formulario.apellido_paterno}
                onChange={cambiarValor}
                required
                disabled={cargando}
                autoComplete="family-name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />

              <TextField
                fullWidth
                size="small"
                label="Apellido materno"
                name="apellido_materno"
                value={formulario.apellido_materno}
                onChange={cambiarValor}
                required
                disabled={cargando}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />

              <TextField
                fullWidth
                size="small"
                label="Teléfono"
                name="telefono"
                value={formulario.telefono}
                onChange={cambiarTelefono}
                required
                disabled={cargando}
                helperText="Debe contener exactamente 10 dígitos"
                inputProps={{
                  maxLength: 10,
                  inputMode: "numeric",
                }}
                autoComplete="tel"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />

              <TextField
                fullWidth
                size="small"
                type="email"
                label="Correo electrónico"
                name="email"
                value={formulario.email}
                onChange={cambiarValor}
                required
                disabled={cargando}
                autoComplete="email"
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
                size="small"
                type="password"
                label="Contraseña"
                name="password"
                value={formulario.password}
                onChange={cambiarValor}
                required
                disabled={cargando}
                autoComplete="new-password"
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
                    <PersonAddAltIcon />
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
                {cargando ? "Registrando..." : "Crear cuenta"}
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
            ¿Ya tienes cuenta?{" "}
            <Box
              component={RouterLink}
              to="/login"
              sx={{
                color: "#1d4ed8",
                fontWeight: 900,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Iniciar sesión
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
  "& .MuiFormHelperText-root": {
    fontWeight: 600,
    ml: 0,
  },
};

export default Registro;