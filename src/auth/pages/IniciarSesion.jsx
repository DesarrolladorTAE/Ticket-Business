import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import axiosCliente from "../../services/axiosCliente";
import { useAuth } from "../context/AuthContext";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

function IniciarSesion() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [formulario, setFormulario] = useState({
    email: "",
    password: "",
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const [cuentasDisponibles, setCuentasDisponibles] = useState([]);
  const [cuentaSeleccionando, setCuentaSeleccionando] = useState(null);

  const cambiarValor = (event) => {
    const { name, value } = event.target;

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }));
  };

  const normalizarRol = (rol) => {
    return String(rol || "")
      .trim()
      .toLowerCase();
  };

  const obtenerNombreRol = (rol) => {
    const roles = {
      admin: "Administrador",
      administrador: "Administrador",
      supervisor: "Supervisor",
      agent: "Agente",
      agente: "Agente",
      client: "Cliente",
      cliente: "Cliente",
    };

    const rolNormalizado = normalizarRol(rol);

    return roles[rolNormalizado] || rol || "Sin rol";
  };

  const dirigirSegunRol = (user, company) => {
    const rol = normalizarRol(
      user?.company_role ||
        user?.role ||
        company?.role,
    );

    if (
      [
        "admin",
        "administrador",
        "agent",
        "agente",
        "supervisor",
      ].includes(rol)
    ) {
      navigate("/paneladministrador");
      return;
    }

    if (["client", "cliente"].includes(rol)) {
      navigate("/tickets/nuevo");
      return;
    }

    setError(
      "Tu cuenta no tiene un rol válido para ingresar al sistema.",
    );
  };

  const completarInicioSesion = async (data) => {
    if (!data?.token) {
      setError(
        "No fue posible completar el inicio de sesión.",
      );

      return;
    }

    localStorage.setItem("TOKEN", data.token);

    try {
      await refreshUser();
    } catch (error) {
      localStorage.removeItem("TOKEN");
      throw error;
    }

    dirigirSegunRol(data.user, data.company);
  };

  const procesarRespuestaLogin = async (data) => {
    if (data?.requires_company_selection) {
      const cuentas = Array.isArray(data.accounts)
        ? data.accounts
        : [];

      if (cuentas.length === 0) {
        setError(
          "No se encontraron cuentas disponibles para este usuario.",
        );

        return;
      }

      setCuentasDisponibles(cuentas);
      setError("");

      return;
    }

    await completarInicioSesion(data);
  };

  const iniciarSesion = async (event) => {
    event.preventDefault();

    setError("");
    setCargando(true);

    try {
      const respuesta = await axiosCliente.post(
        "/login",
        formulario,
      );

      await procesarRespuestaLogin(respuesta.data);
    } catch (error) {
      const data = error.response?.data;

      if (
        data?.requires_email_verification &&
        data?.verification_email
      ) {
        navigate(
          `/verificar-correo?email=${encodeURIComponent(
            data.verification_email,
          )}`,
          {
            replace: true,
          },
        );

        return;
      }

      setError(
        data?.message ||
          "Correo o contraseña incorrectos",
      );
    } finally {
      setCargando(false);
    }
  };

  const seleccionarCuenta = async (cuenta) => {
    if (!cuenta?.company_user_id) {
      setError("La cuenta seleccionada no es válida.");

      return;
    }

    setError("");
    setCuentaSeleccionando(cuenta.company_user_id);

    try {
      const respuesta = await axiosCliente.post(
        "/login",
        {
          ...formulario,
          company_user_id: cuenta.company_user_id,
        },
      );

      await completarInicioSesion(respuesta.data);
    } catch (error) {
      const data = error.response?.data;

      if (
        data?.requires_email_verification &&
        data?.verification_email
      ) {
        navigate(
          `/verificar-correo?email=${encodeURIComponent(
            data.verification_email,
          )}`,
          {
            replace: true,
          },
        );

        return;
      }

      setError(
        data?.message ||
          "No se pudo ingresar con la cuenta seleccionada.",
      );
    } finally {
      setCuentaSeleccionando(null);
    }
  };

  const volverAlLogin = () => {
    setCuentasDisponibles([]);
    setCuentaSeleccionando(null);
    setError("");
  };

  const mostrandoSeleccionEmpresa =
    cuentasDisponibles.length > 0;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: {
          xs: 2,
          sm: 3,
        },
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: mostrandoSeleccionEmpresa ? 540 : 460,
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
            px: {
              xs: 2.5,
              sm: 4,
            },
            pt: {
              xs: 3,
              sm: 4,
            },
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
              <SupportAgentIcon
                sx={{
                  fontSize: 32,
                }}
              />
            </Box>

            <Box>
              <Typography
                fontWeight={900}
                sx={{
                  fontSize: {
                    xs: 24,
                    sm: 27,
                  },
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
            px: {
              xs: 2.5,
              sm: 4,
            },
            py: {
              xs: 2.5,
              sm: 3,
            },
          }}
        >
          {!mostrandoSeleccionEmpresa ? (
            <>
              <Box mb={2.5}>
                <Typography
                  fontWeight={900}
                  sx={{
                    fontSize: {
                      xs: 21,
                      sm: 24,
                    },
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
                  Ingresa tu correo y contraseña para acceder
                  al sistema.
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

              <Box
                component="form"
                onSubmit={iniciarSesion}
              >
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
                    type={
                      mostrarPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    label="Contraseña"
                    value={formulario.password}
                    onChange={cambiarValor}
                    required
                    disabled={cargando}
                    autoComplete="current-password"
                    size="small"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              type="button"
                              edge="end"
                              disabled={cargando}
                              onClick={() =>
                                setMostrarPassword(
                                  (valorActual) =>
                                    !valorActual,
                                )
                              }
                              onMouseDown={(event) => {
                                event.preventDefault();
                              }}
                              aria-label={
                                mostrarPassword
                                  ? "Ocultar contraseña"
                                  : "Mostrar contraseña"
                              }
                              sx={{
                                color: "#64748b",
                                "&:hover": {
                                  bgcolor: "#f1f5f9",
                                  color: "#1d4ed8",
                                },
                              }}
                            >
                              {mostrarPassword ? (
                                <VisibilityOffOutlinedIcon fontSize="small" />
                              ) : (
                                <VisibilityOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={inputStyle}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: -0.5,
                    }}
                  >
                    <Box
                      component={RouterLink}
                      to="/olvide-contrasena"
                      sx={{
                        color: "#1d4ed8",
                        fontSize: 13,
                        fontWeight: 800,
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={cargando}
                    size="large"
                    startIcon={
                      cargando ? (
                        <CircularProgress
                          size={18}
                          sx={{
                            color: "#ffffff",
                          }}
                        />
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
                      ? "Entrando..."
                      : "Entrar"}
                  </Button>
                </Stack>
              </Box>
            </>
          ) : (
            <>
              <Box mb={2.5}>
                <Typography
                  fontWeight={900}
                  sx={{
                    fontSize: {
                      xs: 21,
                      sm: 24,
                    },
                    color: "#0f172a",
                  }}
                >
                  Selecciona dónde deseas ingresar
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    mt: 0.6,
                  }}
                >
                  Tu cuenta está relacionada con más de una
                  empresa. Selecciona la empresa y el rol con
                  el que deseas continuar.
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

              <Stack spacing={1.5}>
                {cuentasDisponibles.map((cuenta) => {
                  const seleccionando =
                    cuentaSeleccionando ===
                    cuenta.company_user_id;

                  return (
                    <Paper
                      key={cuenta.company_user_id}
                      elevation={0}
                      sx={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 3,
                        p: 2,
                        bgcolor: "#ffffff",
                      }}
                    >
                      <Stack
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
                        spacing={2}
                        alignItems={{
                          xs: "stretch",
                          sm: "center",
                        }}
                        justifyContent="space-between"
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            fontWeight={900}
                            sx={{
                              color: "#0f172a",
                              fontSize: 15,
                              wordBreak: "break-word",
                            }}
                          >
                            {cuenta.company_name ||
                              cuenta.company_business_name ||
                              `Empresa ${cuenta.company_id}`}
                          </Typography>

                          {cuenta.company_business_name &&
                            cuenta.company_business_name !==
                              cuenta.company_name && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  color: "#64748b",
                                  mt: 0.3,
                                }}
                              >
                                {
                                  cuenta.company_business_name
                                }
                              </Typography>
                            )}

                          <Chip
                            label={obtenerNombreRol(
                              cuenta.role,
                            )}
                            size="small"
                            sx={{
                              mt: 1,
                              bgcolor:
                                normalizarRol(
                                  cuenta.role,
                                ) === "client"
                                  ? "#ecfdf5"
                                  : "#eff6ff",
                              color:
                                normalizarRol(
                                  cuenta.role,
                                ) === "client"
                                  ? "#047857"
                                  : "#1d4ed8",
                              border:
                                normalizarRol(
                                  cuenta.role,
                                ) === "client"
                                  ? "1px solid #bbf7d0"
                                  : "1px solid #bfdbfe",
                              fontWeight: 900,
                              borderRadius: 2,
                            }}
                          />
                        </Box>

                        <Button
                          variant="contained"
                          disabled={
                            cuentaSeleccionando !== null
                          }
                          onClick={() =>
                            seleccionarCuenta(cuenta)
                          }
                          startIcon={
                            seleccionando ? (
                              <CircularProgress
                                size={17}
                                sx={{
                                  color: "#ffffff",
                                }}
                              />
                            ) : (
                              <LoginIcon />
                            )
                          }
                          sx={{
                            minWidth: {
                              xs: "100%",
                              sm: 120,
                            },
                            minHeight: 40,
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 900,
                            bgcolor: "#2563eb",
                            "&:hover": {
                              bgcolor: "#1d4ed8",
                            },
                          }}
                        >
                          {seleccionando
                            ? "Entrando..."
                            : "Entrar"}
                        </Button>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>

              <Button
                fullWidth
                variant="text"
                disabled={cuentaSeleccionando !== null}
                onClick={volverAlLogin}
                sx={{
                  mt: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  color: "#64748b",
                }}
              >
                Usar otra cuenta
              </Button>
            </>
          )}
        </Box>

        {!mostrandoSeleccionEmpresa && (
          <Box
            sx={{
              px: {
                xs: 2.5,
                sm: 4,
              },
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
        )}
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