import { useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import axiosCliente from "../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockResetIcon from "@mui/icons-material/LockReset";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

function RestablecerContrasena() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [formulario, setFormulario] = useState({
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const enlaceValido = Boolean(token && email);

  const cambiarValor = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const restablecerContrasena = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!enlaceValido) {
      setError(
        "El enlace de recuperación está incompleto o no es válido.",
      );
      return;
    }

    if (formulario.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (
      formulario.password !==
      formulario.password_confirmation
    ) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await axiosCliente.post("/reset-password", {
        token,
        email,
        password: formulario.password,
        password_confirmation:
          formulario.password_confirmation,
      });

      setMensaje(
        respuesta.data?.message ||
          "La contraseña fue actualizada correctamente.",
      );

      setFormulario({
        password: "",
        password_confirmation: "",
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 2500);
    } catch (error) {
      const errores = error.response?.data?.errors;

      const mensajeValidacion =
        errores?.password?.[0] ||
        errores?.token?.[0] ||
        errores?.email?.[0] ||
        error.response?.data?.message ||
        "No fue posible restablecer la contraseña.";

      setError(mensajeValidacion);
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
          boxShadow:
            "0 18px 45px rgba(15, 23, 42, 0.10)",
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
          <Stack
            spacing={2}
            alignItems="center"
            textAlign="center"
          >
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
              <LockResetIcon sx={{ fontSize: 34 }} />
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
                Crear nueva contraseña
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.7,
                  fontWeight: 600,
                }}
              >
                The Business Ticket
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: { xs: 2.5, sm: 3 },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mb: 2.5,
              lineHeight: 1.7,
            }}
          >
            Escribe una nueva contraseña para la cuenta
            asociada a <strong>{email || "tu correo"}</strong>.
          </Typography>

          {!enlaceValido && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              El enlace de recuperación está incompleto o no
              es válido. Solicita uno nuevo.
            </Alert>
          )}

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

          {mensaje && (
            <Alert
              severity="success"
              sx={{
                mb: 2.5,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              {mensaje}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={restablecerContrasena}
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                type="password"
                name="password"
                label="Nueva contraseña"
                value={formulario.password}
                onChange={cambiarValor}
                required
                disabled={cargando || !enlaceValido}
                autoComplete="new-password"
                autoFocus
                size="small"
                helperText="Debe contener al menos 8 caracteres."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />

              <TextField
                fullWidth
                type="password"
                name="password_confirmation"
                label="Confirmar nueva contraseña"
                value={
                  formulario.password_confirmation
                }
                onChange={cambiarValor}
                required
                disabled={cargando || !enlaceValido}
                autoComplete="new-password"
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
                disabled={cargando || !enlaceValido}
                size="large"
                startIcon={
                  cargando ? (
                    <CircularProgress
                      size={18}
                      sx={{ color: "#ffffff" }}
                    />
                  ) : (
                    <SaveOutlinedIcon />
                  )
                }
                sx={{
                  minHeight: 46,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 900,
                  bgcolor: "#2563eb",
                  boxShadow:
                    "0 10px 20px rgba(37, 99, 235, 0.25)",
                  "&:hover": {
                    bgcolor: "#1d4ed8",
                    boxShadow:
                      "0 12px 24px rgba(37, 99, 235, 0.32)",
                  },
                }}
              >
                {cargando
                  ? "Actualizando..."
                  : "Guardar nueva contraseña"}
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
          <Box
            component={RouterLink}
            to="/login"
            sx={{
              color: "#1d4ed8",
              fontWeight: 900,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.7,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            <ArrowBackIcon fontSize="small" />
            Volver al inicio de sesión
          </Box>
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

export default RestablecerContrasena;