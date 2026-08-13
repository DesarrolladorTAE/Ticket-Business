import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LockResetIcon from "@mui/icons-material/LockReset";
import SaveIcon from "@mui/icons-material/Save";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";


import axiosCliente from "../../../services/axiosCliente";
import { useAuth } from "../../../auth/context/AuthContext";
import UserAvatar from "../../../components/UserAvatar";

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
    error?.response?.data?.message || "Ocurrió un error. Inténtalo nuevamente."
  );
};

export default function MiPerfil() {
  const { refreshUser } = useAuth();

  const [perfil, setPerfil] = useState(perfilInicial);

  const [contacto, setContacto] = useState({
    name: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
  });

  const [contrasena, setContrasena] = useState(contrasenaInicial);

  const [mostrarContrasenaActual, setMostrarContrasenaActual] = useState(false);

  const [mostrarNuevaContrasena, setMostrarNuevaContrasena] = useState(false);

  const [mostrarConfirmacionContrasena, setMostrarConfirmacionContrasena] =
    useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardandoContacto, setGuardandoContacto] = useState(false);
  const [guardandoContrasena, setGuardandoContrasena] = useState(false);
  const [guardandoAvatar, setGuardandoAvatar] = useState(false);
  const [mensajeAvatar, setMensajeAvatar] = useState(null);

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
        name: usuario.name || "",
        apellido_paterno: usuario.apellido_paterno || "",
        apellido_materno: usuario.apellido_materno || "",
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

  const evitarPerderFocoContrasena = (event) => {
    event.preventDefault();
  };

  const guardarContacto = async (event) => {
    event.preventDefault();

    setMensajeContacto(null);

    if (!contacto.name.trim()) {
      setMensajeContacto({
        type: "error",
        text: "El nombre es obligatorio.",
      });

      return;
    }

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
        name: contacto.name.trim(),
        apellido_paterno: contacto.apellido_paterno.trim() || null,
        apellido_materno: contacto.apellido_materno.trim() || null,
        email: contacto.email.trim(),
        telefono: contacto.telefono,
      });

      const usuarioActualizado = data?.user;

      if (usuarioActualizado) {
        setPerfil(usuarioActualizado);

        setContacto({
          name: usuarioActualizado.name || "",
          apellido_paterno: usuarioActualizado.apellido_paterno || "",
          apellido_materno: usuarioActualizado.apellido_materno || "",
          email: usuarioActualizado.email || "",
          telefono: usuarioActualizado.telefono || "",
        });
      }

      try {
        await refreshUser();
      } catch (refreshError) {
        console.error(
          "El perfil se actualizó, pero no fue posible refrescar la sesión.",
          refreshError,
        );
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

  const cambiarAvatar = async (event) => {
    const archivo = event.target.files?.[0];

    // Permite volver a seleccionar posteriormente el mismo archivo.
    event.target.value = "";

    if (!archivo) return;

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

    if (!tiposPermitidos.includes(archivo.type)) {
      setMensajeAvatar({
        type: "error",
        text: "La imagen debe ser JPG, PNG o WEBP.",
      });

      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setMensajeAvatar({
        type: "error",
        text: "La imagen no debe superar los 5 MB.",
      });

      return;
    }

    setGuardandoAvatar(true);
    setMensajeAvatar(null);

    try {
      const formData = new FormData();

      formData.append("avatar", archivo);

      const { data } = await axiosCliente.post("/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPerfil((prev) => ({
        ...prev,
        avatar_url: data?.avatar_url || null,
      }));

      await refreshUser();

      setMensajeAvatar({
        type: "success",
        text: data?.message || "Foto de perfil actualizada correctamente.",
      });
    } catch (error) {
      setMensajeAvatar({
        type: "error",
        text: obtenerMensajeError(error),
      });
    } finally {
      setGuardandoAvatar(false);
    }
  };

  const quitarAvatar = async () => {
    setGuardandoAvatar(true);
    setMensajeAvatar(null);

    try {
      const { data } = await axiosCliente.delete("/profile/avatar");

      setPerfil((prev) => ({
        ...prev,
        avatar_url: null,
      }));

      await refreshUser();

      setMensajeAvatar({
        type: "success",
        text: data?.message || "Foto de perfil eliminada correctamente.",
      });
    } catch (error) {
      setMensajeAvatar({
        type: "error",
        text: obtenerMensajeError(error),
      });
    } finally {
      setGuardandoAvatar(false);
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

      setMostrarContrasenaActual(false);
      setMostrarNuevaContrasena(false);
      setMostrarConfirmacionContrasena(false);

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

  const obtenerRolVisible = (role) => {
    const rol = String(role || "")
      .trim()
      .toLowerCase();

    if (rol === "admin" || rol === "administrador") {
      return "Administrador";
    }

    if (rol === "supervisor") {
      return "Supervisor";
    }

    if (rol === "agent" || rol === "agente") {
      return "Agente";
    }

    if (rol === "client" || rol === "cliente") {
      return "Cliente";
    }

    return role || "Sin rol";
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

          <Typography color="text.secondary">Cargando perfil...</Typography>
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
        py: {
          xs: 1,
          md: 2,
        },
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: {
                xs: "1.7rem",
                md: "2.1rem",
              },
            }}
          >
            Mi perfil
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Consulta tus datos y actualiza tu información de acceso.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
          >
            <UserAvatar
              user={perfil}
              size={64}
              fontSize={20}
              sx={{
                boxShadow: "0 0 0 4px #eff6ff",
              }}
            />

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                {nombreCompleto || "Usuario"}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 0.75 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={700}
                >
                  Rol
                </Typography>

                <Chip
                  label={obtenerRolVisible(perfil.role)}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ mt: 1.5 }}
              >
                <Button
                  component="label"
                  size="small"
                  variant="outlined"
                  startIcon={<PhotoCameraOutlinedIcon />}
                  disabled={guardandoAvatar}
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: 2,
                  }}
                >
                  {perfil?.avatar_url ? "Cambiar foto" : "Agregar foto"}

                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={cambiarAvatar}
                  />
                </Button>

                {perfil?.avatar_url && (
                  <Button
                    type="button"
                    size="small"
                    color="error"
                    variant="outlined"
                    
                    onClick={quitarAvatar}
                    disabled={guardandoAvatar}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      borderRadius: 2,
                    }}
                  >
                    Quitar foto
                  </Button>
                )}
              </Stack>
              {mensajeAvatar && (
                <Alert severity={mensajeAvatar.type} sx={{ mt: 1.5 }}>
                  {mensajeAvatar.text}
                </Alert>
              )}
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
              p: {
                xs: 2,
                md: 3,
              },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Datos de contacto
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Puedes actualizar tu nombre, apellidos, correo y teléfono. El
                  rol es únicamente informativo.
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
                name="name"
                value={contacto.name}
                onChange={actualizarContacto}
                fullWidth
                required
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
              />

              <TextField
                label="Apellido paterno"
                name="apellido_paterno"
                value={contacto.apellido_paterno}
                onChange={actualizarContacto}
                fullWidth
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
              />

              <TextField
                label="Apellido materno"
                name="apellido_materno"
                value={contacto.apellido_materno}
                onChange={actualizarContacto}
                fullWidth
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
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
                {guardandoContacto ? "Guardando..." : "Guardar cambios"}
              </Button>
            </Stack>
          </Paper>

          <Paper
            component="form"
            onSubmit={guardarContrasena}
            elevation={0}
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Cambiar contraseña
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
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
                type={mostrarContrasenaActual ? "text" : "password"}
                value={contrasena.current_password}
                onChange={actualizarContrasena}
                autoComplete="current-password"
                fullWidth
                required
                disabled={guardandoContrasena}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          edge="end"
                          disabled={guardandoContrasena}
                          onClick={() =>
                            setMostrarContrasenaActual(
                              (valorActual) => !valorActual,
                            )
                          }
                          onMouseDown={evitarPerderFocoContrasena}
                          aria-label={
                            mostrarContrasenaActual
                              ? "Ocultar contraseña actual"
                              : "Mostrar contraseña actual"
                          }
                          aria-pressed={mostrarContrasenaActual}
                        >
                          {mostrarContrasenaActual ? (
                            <VisibilityOffOutlinedIcon />
                          ) : (
                            <VisibilityOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="Nueva contraseña"
                name="password"
                type={mostrarNuevaContrasena ? "text" : "password"}
                value={contrasena.password}
                onChange={actualizarContrasena}
                autoComplete="new-password"
                fullWidth
                required
                disabled={guardandoContrasena}
                helperText="Debe contener al menos 8 caracteres."
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          edge="end"
                          disabled={guardandoContrasena}
                          onClick={() =>
                            setMostrarNuevaContrasena(
                              (valorActual) => !valorActual,
                            )
                          }
                          onMouseDown={evitarPerderFocoContrasena}
                          aria-label={
                            mostrarNuevaContrasena
                              ? "Ocultar nueva contraseña"
                              : "Mostrar nueva contraseña"
                          }
                          aria-pressed={mostrarNuevaContrasena}
                        >
                          {mostrarNuevaContrasena ? (
                            <VisibilityOffOutlinedIcon />
                          ) : (
                            <VisibilityOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="Confirmar nueva contraseña"
                name="password_confirmation"
                type={mostrarConfirmacionContrasena ? "text" : "password"}
                value={contrasena.password_confirmation}
                onChange={actualizarContrasena}
                autoComplete="new-password"
                fullWidth
                required
                disabled={guardandoContrasena}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          edge="end"
                          disabled={guardandoContrasena}
                          onClick={() =>
                            setMostrarConfirmacionContrasena(
                              (valorActual) => !valorActual,
                            )
                          }
                          onMouseDown={evitarPerderFocoContrasena}
                          aria-label={
                            mostrarConfirmacionContrasena
                              ? "Ocultar confirmación de contraseña"
                              : "Mostrar confirmación de contraseña"
                          }
                          aria-pressed={mostrarConfirmacionContrasena}
                        >
                          {mostrarConfirmacionContrasena ? (
                            <VisibilityOffOutlinedIcon />
                          ) : (
                            <VisibilityOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
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
