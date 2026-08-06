import { useEffect, useState } from "react";
import {
  Link as RouterLink,
  useLocation,
} from "react-router-dom";

import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
} from "@mui/material";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const LOGO_URL =
  "https://api.thebusinessticket.com/images/email/the-business-ticket.png";

const enlaces = [
  {
    label: "Inicio",
    to: "/",
  },
  {
    label: "Cómo funciona",
    to: "/como-funciona",
  },
  {
    label: "Beneficios",
    to: "/beneficios",
  },
];

function LandingHeader() {
  const location = useLocation();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [desplazado, setDesplazado] = useState(false);

  const esInicio = location.pathname === "/";

  const colorPrincipal = esInicio
    ? "#ffffff"
    : "#0f172a";

  const colorSecundario = esInicio
    ? "#cbd5e1"
    : "#475569";

  const fondoHeader = desplazado
    ? esInicio
      ? "rgba(6, 24, 47, 0.88)"
      : "rgba(255, 255, 255, 0.92)"
    : "transparent";

  const bordeHeader = desplazado
    ? esInicio
      ? "1px solid rgba(255, 255, 255, 0.10)"
      : "1px solid rgba(15, 23, 42, 0.10)"
    : "1px solid transparent";

  useEffect(() => {
    const controlarScroll = () => {
      setDesplazado(window.scrollY > 16);
    };

    controlarScroll();

    window.addEventListener(
      "scroll",
      controlarScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        controlarScroll,
      );
    };
  }, []);

  useEffect(() => {
    setMenuAbierto(false);
    setDesplazado(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <>
      <AppBar
        component="header"
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: fondoHeader,
          color: colorPrincipal,
          borderBottom: bordeHeader,

          boxShadow: desplazado
            ? "0 10px 30px rgba(15, 23, 42, 0.10)"
            : "none",

          backdropFilter: desplazado
            ? "blur(18px)"
            : "none",

          WebkitBackdropFilter: desplazado
            ? "blur(18px)"
            : "none",

          transition: [
            "background-color 180ms ease",
            "border-color 180ms ease",
            "box-shadow 180ms ease",
            "backdrop-filter 180ms ease",
          ].join(", "),
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 70,
                md: 80,
              },

              display: "grid",

              gridTemplateColumns: {
                xs: "minmax(0, 1fr) auto",
                md: "minmax(190px, 1fr) auto minmax(280px, 1fr)",
              },

              alignItems: "center",

              gap: {
                xs: 1.5,
                md: 3,
              },
            }}
          >
            <Box
              component={RouterLink}
              to="/"
              aria-label="Ir al inicio"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifySelf: "start",
                minWidth: 0,
                textDecoration: "none",
              }}
            >
              <Box
                component="img"
                src={LOGO_URL}
                alt="The Business Ticket"
                sx={{
                  display: "block",

                  width: {
                    xs: 145,
                    sm: 170,
                    md: 190,
                  },

                  maxWidth: "100%",

                  height: {
                    xs: 54,
                    md: 60,
                  },

                  objectFit: "contain",
                  objectPosition: "left center",
                }}
              />
            </Box>

            <Stack
              component="nav"
              direction="row"
              spacing={0.5}
              aria-label="Navegación principal"
              sx={{
                display: {
                  xs: "none",
                  md: "flex",
                },

                justifySelf: "center",
                alignItems: "center",
              }}
            >
              {enlaces.map((enlace) => {
                const activo =
                  location.pathname === enlace.to;

                return (
                  <Button
                    key={enlace.to}
                    component={RouterLink}
                    to={enlace.to}
                    aria-current={
                      activo ? "page" : undefined
                    }
                    sx={{
                      position: "relative",

                      minHeight: 42,
                      px: 2,

                      color: activo
                        ? colorPrincipal
                        : colorSecundario,

                      textTransform: "none",
                      fontWeight: activo ? 900 : 700,
                      borderRadius: 2,

                      "&::after": {
                        content: '""',

                        position: "absolute",

                        left: 16,
                        right: 16,
                        bottom: 1,

                        height: 2,
                        borderRadius: 10,

                        bgcolor: activo
                          ? "#3b82f6"
                          : "transparent",

                        transition:
                          "background-color 180ms ease",
                      },

                      "&:hover": {
                        color: colorPrincipal,

                        bgcolor: esInicio
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(37, 99, 235, 0.07)",
                      },
                    }}
                  >
                    {enlace.label}
                  </Button>
                );
              })}
            </Stack>

            <Stack
              direction="row"
              spacing={1.2}
              sx={{
                display: {
                  xs: "none",
                  md: "flex",
                },

                justifySelf: "end",
                alignItems: "center",
              }}
            >
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                sx={{
                  minHeight: 42,
                  px: 2.3,

                  color: colorPrincipal,

                  borderColor: esInicio
                    ? "rgba(255, 255, 255, 0.38)"
                    : "rgba(15, 23, 42, 0.28)",

                  textTransform: "none",
                  fontWeight: 900,
                  borderRadius: 2,

                  "&:hover": {
                    color: colorPrincipal,
                    borderColor: colorPrincipal,

                    bgcolor: esInicio
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(15, 23, 42, 0.05)",
                  },
                }}
              >
                Iniciar sesión
              </Button>

              <Button
                component={RouterLink}
                to="/registro"
                variant="contained"
                sx={{
                  minHeight: 42,
                  px: 2.6,

                  bgcolor: "#2563eb",
                  color: "#ffffff",

                  textTransform: "none",
                  fontWeight: 900,
                  borderRadius: 2,

                  boxShadow: "none",

                  "&:hover": {
                    bgcolor: "#1d4ed8",
                    boxShadow: "none",
                  },
                }}
              >
                Crear cuenta
              </Button>
            </Stack>

            <IconButton
              type="button"
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto(true)}
              sx={{
                display: {
                  xs: "inline-flex",
                  md: "none",
                },

                justifySelf: "end",

                color: colorPrincipal,

                border: esInicio
                  ? "1px solid rgba(255, 255, 255, 0.22)"
                  : "1px solid rgba(15, 23, 42, 0.16)",

                borderRadius: 2,

                "&:hover": {
                  bgcolor: esInicio
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(15, 23, 42, 0.05)",
                },
              }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={menuAbierto}
        onClose={cerrarMenu}
        slotProps={{
          paper: {
            sx: {
              width: {
                xs: "88%",
                sm: 360,
              },

              maxWidth: 380,

              bgcolor: "#ffffff",
              color: "#0f172a",

              boxShadow:
                "-16px 0 45px rgba(15, 23, 42, 0.18)",
            },
          },
        }}
      >
        <Box
          sx={{
            minHeight: "100dvh",

            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              minHeight: 72,
              px: 2.5,

              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",

              gap: 2,
            }}
          >
            <Box
              component={RouterLink}
              to="/"
              onClick={cerrarMenu}
              aria-label="Ir al inicio"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <Box
                component="img"
                src={LOGO_URL}
                alt="The Business Ticket"
                sx={{
                  width: 165,
                  maxWidth: "100%",
                  height: 56,
                  objectFit: "contain",
                  objectPosition: "left center",
                }}
              />
            </Box>

            <IconButton
              type="button"
              aria-label="Cerrar menú"
              onClick={cerrarMenu}
              sx={{
                flex: "0 0 auto",
                color: "#0f172a",

                "&:hover": {
                  bgcolor: "#f1f5f9",
                },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Divider />

          <Stack
            component="nav"
            spacing={1}
            aria-label="Navegación móvil"
            sx={{
              p: 2.5,
            }}
          >
            {enlaces.map((enlace) => {
              const activo =
                location.pathname === enlace.to;

              return (
                <Button
                  key={enlace.to}
                  component={RouterLink}
                  to={enlace.to}
                  onClick={cerrarMenu}
                  aria-current={
                    activo ? "page" : undefined
                  }
                  fullWidth
                  sx={{
                    minHeight: 48,
                    justifyContent: "flex-start",
                    px: 2,

                    color: activo
                      ? "#1d4ed8"
                      : "#334155",

                    bgcolor: activo
                      ? "#eff6ff"
                      : "transparent",

                    textTransform: "none",
                    fontWeight: activo ? 900 : 700,
                    borderRadius: 2,

                    "&:hover": {
                      bgcolor: "#eff6ff",
                      color: "#1d4ed8",
                    },
                  }}
                >
                  {enlace.label}
                </Button>
              );
            })}
          </Stack>

          <Box
            sx={{
              mt: "auto",
              p: 2.5,
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <Stack spacing={1.5}>
              <Button
                component={RouterLink}
                to="/login"
                onClick={cerrarMenu}
                fullWidth
                variant="outlined"
                sx={{
                  minHeight: 48,

                  color: "#0f172a",
                  borderColor: "#cbd5e1",

                  textTransform: "none",
                  fontWeight: 900,
                  borderRadius: 2,

                  "&:hover": {
                    borderColor: "#0f172a",
                    bgcolor: "#f8fafc",
                  },
                }}
              >
                Iniciar sesión
              </Button>

              <Button
                component={RouterLink}
                to="/registro"
                onClick={cerrarMenu}
                fullWidth
                variant="contained"
                sx={{
                  minHeight: 48,

                  bgcolor: "#2563eb",
                  color: "#ffffff",

                  textTransform: "none",
                  fontWeight: 900,
                  borderRadius: 2,

                  boxShadow: "none",

                  "&:hover": {
                    bgcolor: "#1d4ed8",
                    boxShadow: "none",
                  },
                }}
              >
                Crear cuenta
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default LandingHeader;