import { useEffect, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockResetIcon from "@mui/icons-material/LockReset";
import SaveIcon from "@mui/icons-material/Save";

import axiosCliente from "../../../services/axiosCliente";

const perfilInicial = {
  id: null,
  name: "",
  apellido_paterno: "",
  apellido_materno: "",
  email: "",
  telefono: "",
  role: "",
};

const contrasenaInicial = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

const obtenerMensajeError = (error) => {
  const errores = error?.response?.data?.errors;

  if (errores && typeof errores === "object") {
    const primerError = Object.values(errores).flat()[0];

    if (primerError) {
      return primerError;
    }
  }

  return (
    error?.response?.data?.message ||
    "Ocurrió un error. Inténtalo nuevamente."
  );
};

export default function MiPerfil() {
  const [perfil, setPerfil] = useState(perfilInicial);

  const [contacto, setContacto] = useState({
    email: "",
    telefono: "",
  });

  const [contrasena, setContrasena] = useState(contrasenaInicial);

  const [cargando, setCargando] = useState(true);
  const [guardandoContacto, setGuardandoContacto] = useState(false);
  const [guardandoContrasena, setGuardandoContrasena] = useState(false);

  const [mensajeContacto, setMensajeContacto] = useState(null);
  const [mensajeContrasena, setMensajeContrasena] = useState(null);

  const cargarPerfil = async () => {
    setCargando(true);
    setMensajeContacto(null);

    try {
      const { data } = await axiosCliente.get("/profile");

      const usuario = data?.user || perfilInicial;

      setPerfil(usuario);

      setContacto({
        email: usuario.email || "",
        telefono: usuario.telefono || "",
      });
    } catch (error) {
      setMensajeContacto({
        type: "error",
        text: obtenerMensajeError(error),
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const actualizarContacto = (event) => {
    const { name, value } = event.target;

    if (name === "telefono") {
      const telefonoLimpio = value.replace(/\D/g, "").slice(0, 10);

      setContacto((prev) => ({
        ...prev,
        telefono: telefonoLimpio,
      }));

      return;
    }

    setContacto((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const actualizarContrasena = (event) => {
    const { name, value } = event.target;

    setContrasena((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarContacto = async (event) => {
    event.preventDefault();

    setMensajeContacto(null);

    if (!contacto.email.trim()) {
      setMensajeContacto({
        type: "error",
        text: "El correo electrónico es obligatorio.",
      });

      return;
    }

    if (contacto.telefono.length !== 10) {
      setMensajeContacto({
        type: "error",
        text: "El teléfono debe contener exactamente 10 dígitos.",
      });

      return;
    }

    setGuardandoContacto(true);

    try {
      const { data } = await axiosCliente.put("/profile", {
        email: contacto.email.trim(),
        telefono: contacto.telefono,
      });

      const usuarioActualizado = data?.user;

      if (usuarioActualizado) {
        setPerfil(usuarioActualizado);

        setContacto({
          email: usuarioActualizado.email || "",
          telefono: usuarioActualizado.telefono || "",
        });

        try {
          const usuarioGuardado = JSON.parse(
            localStorage.getItem("USUARIO") || "{}",
          );

          localStorage.setItem(
            "USUARIO",
            JSON.stringify({
              ...usuarioGuardado,
              email: usuarioActualizado.email,
              telefono: usuarioActualizado.telefono,
            }),
          );
        } catch (error) {
          console.error(
            "No se pudo actualizar el usuario guardado localmente.",
            error,
          );
        }
      }

      setMensajeContacto({
        type: "success",
        text: data?.message || "Perfil actualizado correctamente.",
      });
    } catch (error) {
      setMensajeContacto({
        type: "error",
        text: obtenerMensajeError(error),
      });
    } finally {
      setGuardandoContacto(false);
    }
  };

  const guardarContrasena = async (event) => {
    event.preventDefault();

    setMensajeContrasena(null);

    if (
      !contrasena.current_password ||
      !contrasena.password ||
      !contrasena.password_confirmation
    ) {
      setMensajeContrasena({
        type: "error",
        text: "Completa todos los campos de contraseña.",
      });

      return;
    }

    if (contrasena.password.length < 8) {
      setMensajeContrasena({
        type: "error",
        text: "La nueva contraseña debe tener al menos 8 caracteres.",
      });

      return;
    }

    if (contrasena.password !== contrasena.password_confirmation) {
      setMensajeContrasena({
        type: "error",
        text: "La confirmación de la contraseña no coincide.",
      });

      return;
    }

    setGuardandoContrasena(true);

    try {
      const { data } = await axiosCliente.put("/profile/password", {
        current_password: contrasena.current_password,
        password: contrasena.password,
        password_confirmation: contrasena.password_confirmation,
      });

      setContrasena(contrasenaInicial);

      setMensajeContrasena({
        type: "success",
        text: data?.message || "Contraseña actualizada correctamente.",
      });
    } catch (error) {
      setMensajeContrasena({
        type: "error",
        text: obtenerMensajeError(error),
      });
    } finally {
      setGuardandoContrasena(false);
    }
  };

  const nombreCompleto = [
    perfil.name,
    perfil.apellido_paterno,
    perfil.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");

  if (cargando) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">
            Cargando perfil...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1100,
        mx: "auto",
        py: { xs: 1, md: 2 },
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.7rem", md: "2.1rem" },
            }}
          >
            Mi perfil
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Consulta tus datos y actualiza tu información de acceso.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "primary.main",
              }}
            >
              <AccountCircleIcon sx={{ fontSize: 42 }} />
            </Avatar>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {nombreCompleto || "Usuario"}
              </Typography>

              <Typography color="text.secondary">
                Rol: {perfil.role || "Sin rol"}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "1fr 1fr",
            },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Paper
            component="form"
            onSubmit={guardarContacto}
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Datos de contacto
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Puedes actualizar únicamente tu correo y teléfono.
                </Typography>
              </Box>

              <Divider />

              {mensajeContacto && (
                <Alert severity={mensajeContacto.type}>
                  {mensajeContacto.text}
                </Alert>
              )}

              <TextField
                label="Nombre"
                value={nombreCompleto}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
              />

              <TextField
                label="Rol"
                value={perfil.role || ""}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
              />

              <TextField
                label="Correo electrónico"
                name="email"
                type="email"
                value={contacto.email}
                onChange={actualizarContacto}
                autoComplete="email"
                fullWidth
                required
              />

              <TextField
                label="Número de teléfono"
                name="telefono"
                value={contacto.telefono}
                onChange={actualizarContacto}
                fullWidth
                required
                helperText={`${contacto.telefono.length}/10 dígitos`}
                slotProps={{
                  htmlInput: {
                    maxLength: 10,
                    inputMode: "numeric",
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={guardandoContacto}
                startIcon={
                  guardandoContacto ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
              >
                {guardandoContacto
                  ? "Guardando..."
                  : "Guardar datos de contacto"}
              </Button>
            </Stack>
          </Paper>

          <Paper
            component="form"
            onSubmit={guardarContrasena}
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Cambiar contraseña
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Debes confirmar tu contraseña actual antes de establecer una
                  nueva.
                </Typography>
              </Box>

              <Divider />

              {mensajeContrasena && (
                <Alert severity={mensajeContrasena.type}>
                  {mensajeContrasena.text}
                </Alert>
              )}

              <TextField
                label="Contraseña actual"
                name="current_password"
                type="password"
                value={contrasena.current_password}
                onChange={actualizarContrasena}
                autoComplete="current-password"
                fullWidth
                required
              />

              <TextField
                label="Nueva contraseña"
                name="password"
                type="password"
                value={contrasena.password}
                onChange={actualizarContrasena}
                autoComplete="new-password"
                fullWidth
                required
                helperText="Debe contener al menos 8 caracteres."
              />

              <TextField
                label="Confirmar nueva contraseña"
                name="password_confirmation"
                type="password"
                value={contrasena.password_confirmation}
                onChange={actualizarContrasena}
                autoComplete="new-password"
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={guardandoContrasena}
                startIcon={
                  guardandoContrasena ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <LockResetIcon />
                  )
                }
              >
                {guardandoContrasena
                  ? "Actualizando..."
                  : "Actualizar contraseña"}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}