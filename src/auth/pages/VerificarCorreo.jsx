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
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

function VerificarCorreo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email")?.trim() || "";

  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const cambiarCodigo = (e) => {
    setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6));
    setError("");
    setMensaje("");
  };

  const verificarCodigo = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!email) {
      setError("No se encontró el correo que debe verificarse.");
      return;
    }

    if (codigo.length !== 6) {
      setError("Escribe el código completo de 6 dígitos.");
      return;
    }

    setVerificando(true);

    try {
      const respuesta = await axiosCliente.post("/verify-email-code", {
        email,
        code: codigo,
      });

      if (respuesta.data.token) {
        localStorage.setItem("TOKEN", respuesta.data.token);
      }

      if (respuesta.data.user) {
        localStorage.setItem(
          "USUARIO",
          JSON.stringify(respuesta.data.user)
        );
      }

      navigate("/tickets/nuevo", {
        replace: true,
      });
    } catch (error) {
      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(
          error.response?.data?.message ||
            "No fue posible verificar el código."
        );
      }
    } finally {
      setVerificando(false);
    }
  };

  const reenviarCodigo = async () => {
    setError("");
    setMensaje("");

    if (!email) {
      setError("No se encontró el correo que debe verificarse.");
      return;
    }

    setReenviando(true);

    try {
      const respuesta = await axiosCliente.post("/resend-email-code", {
        email,
      });

      setCodigo("");
      setMensaje(
        respuesta.data.message ||
          "Enviamos un nuevo código de verificación."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No fue posible reenviar el código."
      );
    } finally {
      setReenviando(false);
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
                width: 62,
                height: 62,
                borderRadius: 4,
                bgcolor: "#eff6ff",
                color: "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #bfdbfe",
              }}
            >
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 34 }} />
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
                Verifica tu correo
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.8,
                  fontWeight: 600,
                  lineHeight: 1.7,
                }}
              >
                Enviamos un código de 6 dígitos a:
              </Typography>

              <Typography
                sx={{
                  color: "#0f172a",
                  mt: 0.5,
                  fontSize: 14,
                  fontWeight: 900,
                  wordBreak: "break-word",
                }}
              >
                {email || "Correo no disponible"}
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

          <Box component="form" onSubmit={verificarCodigo}>
            <Stack spacing={2.2}>
              <TextField
                fullWidth
                label="Código de verificación"
                value={codigo}
                onChange={cambiarCodigo}
                disabled={verificando}
                autoFocus
                inputProps={{
                  maxLength: 6,
                  inputMode: "numeric",
                  autoComplete: "one-time-code",
                  style: {
                    textAlign: "center",
                    fontSize: 28,
                    fontWeight: 900,
                    letterSpacing: 8,
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: "#ffffff",
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={
                  verificando ||
                  reenviando ||
                  codigo.length !== 6 ||
                  !email
                }
                size="large"
                startIcon={
                  verificando ? (
                    <CircularProgress
                      size={18}
                      sx={{ color: "#ffffff" }}
                    />
                  ) : (
                    <VerifiedOutlinedIcon />
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
                  },
                }}
              >
                {verificando
                  ? "Verificando..."
                  : "Verificar correo"}
              </Button>

              <Button
                fullWidth
                type="button"
                variant="text"
                disabled={reenviando || verificando || !email}
                onClick={reenviarCodigo}
                startIcon={
                  reenviando ? (
                    <CircularProgress size={17} />
                  ) : (
                    <ReplayOutlinedIcon />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 900,
                  color: "#1d4ed8",
                }}
              >
                {reenviando
                  ? "Reenviando..."
                  : "Reenviar código"}
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
            ¿Ya verificaste tu cuenta?{" "}
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

export default VerificarCorreo;