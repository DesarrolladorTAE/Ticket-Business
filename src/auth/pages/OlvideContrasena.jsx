import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
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
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockResetIcon from "@mui/icons-material/LockReset";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

function OlvideContrasena() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const solicitarRecuperacion = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");
    setCargando(true);

    try {
      const respuesta = await axiosCliente.post("/forgot-password", {
        email: email.trim(),
      });

      setMensaje(
        respuesta.data?.message ||
          "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
      );
    } catch (error) {
      const mensajeValidacion =
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.message ||
        "No fue posible procesar la solicitud. Inténtalo nuevamente.";

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
                Recuperar contraseña
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
            Escribe el correo asociado a tu cuenta. Te enviaremos un enlace
            temporal para crear una nueva contraseña.
          </Typography>

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

          <Box component="form" onSubmit={solicitarRecuperacion}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                type="email"
                name="email"
                label="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                    <SendOutlinedIcon />
                  )
                }
                sx={{
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
                {cargando ? "Enviando..." : "Enviar enlace de recuperación"}
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

export default OlvideContrasena;