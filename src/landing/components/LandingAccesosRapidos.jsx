import { Link as RouterLink } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

const accesos = [
  {
    titulo: "Conoce cómo funciona",
    descripcion:
      "Revisa el proceso completo desde la creación de una solicitud hasta su seguimiento y resolución.",
    ruta: "/como-funciona",
    boton: "Conocer el proceso",
    icono: RouteRoundedIcon,
    iconoSecundario: CheckCircleOutlineRoundedIcon,
    color: "#2563eb",
    fondo: "#eff6ff",
    degradado:
      "linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(255,255,255,1) 68%)",
  },
  {
    titulo: "Descubre sus beneficios",
    descripcion:
      "Centraliza tickets, respuestas, archivos, responsables e historial dentro de una sola plataforma.",
    ruta: "/beneficios",
    boton: "Ver beneficios",
    icono: AutoAwesomeRoundedIcon,
    iconoSecundario: TrendingUpRoundedIcon,
    color: "#7c3aed",
    fondo: "#f5f3ff",
    degradado:
      "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(255,255,255,1) 68%)",
  },
];

function LandingAccesosRapidos() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "#f8fafc",
        py: {
          xs: 8,
          md: 11,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 460,
          height: 460,
          borderRadius: "50%",
          bgcolor: "rgba(37, 99, 235, 0.05)",
          filter: "blur(30px)",
          top: -220,
          right: -180,
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack
          spacing={1.5}
          alignItems="center"
          textAlign="center"
          sx={{
            maxWidth: 760,
            mx: "auto",
            mb: {
              xs: 5,
              md: 7,
            },
          }}
        >
          <Typography
            sx={{
              color: "#2563eb",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Explora la plataforma
          </Typography>

          <Typography
            component="h2"
            sx={{
              color: "#0f172a",
              fontSize: {
                xs: 32,
                sm: 40,
                md: 48,
              },
              lineHeight: 1.1,
              fontWeight: 950,
              letterSpacing: "-0.035em",
            }}
          >
            Conoce todo lo que puedes hacer
          </Typography>

          <Typography
            sx={{
              maxWidth: 660,
              color: "#64748b",
              fontSize: {
                xs: 16,
                md: 18,
              },
              lineHeight: 1.7,
            }}
          >
            Consulta el funcionamiento completo del sistema y los beneficios de
            gestionar tus solicitudes desde un solo lugar.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: {
              xs: 2.5,
              md: 3.5,
            },
          }}
        >
          {accesos.map((acceso) => {
            const Icono = acceso.icono;
            const IconoSecundario = acceso.iconoSecundario;

            return (
              <Paper
                key={acceso.ruta}
                elevation={0}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: {
                    xs: 330,
                    md: 390,
                  },
                  p: {
                    xs: 3,
                    sm: 4,
                    md: 4.5,
                  },
                  borderRadius: 4,
                  border: "1px solid #dbe3ee",
                  background: acceso.degradado,
                  transition:
                    "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    borderColor: `${acceso.color}55`,
                    boxShadow: "0 24px 55px rgba(15, 23, 42, 0.10)",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: 210,
                    height: 210,
                    borderRadius: "50%",
                    bgcolor: acceso.fondo,
                    right: -65,
                    bottom: -70,
                    opacity: 0.8,
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    right: {
                      xs: 22,
                      sm: 34,
                    },
                    bottom: {
                      xs: 22,
                      sm: 32,
                    },
                    width: {
                      xs: 90,
                      sm: 110,
                    },
                    height: {
                      xs: 90,
                      sm: 110,
                    },
                    borderRadius: 4,
                    bgcolor: "#ffffff",
                    color: acceso.color,
                    border: `1px solid ${acceso.color}28`,
                    boxShadow: "0 18px 35px rgba(15, 23, 42, 0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: "rotate(-5deg)",
                  }}
                >
                  <IconoSecundario
                    sx={{
                      fontSize: {
                        xs: 44,
                        sm: 54,
                      },
                    }}
                  />
                </Box>

                <Stack
                  spacing={2.5}
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    maxWidth: {
                      xs: "100%",
                      sm: "72%",
                    },
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      bgcolor: acceso.fondo,
                      color: acceso.color,
                      border: `1px solid ${acceso.color}24`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icono
                      sx={{
                        fontSize: 34,
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      component="h3"
                      sx={{
                        color: "#0f172a",
                        fontSize: {
                          xs: 25,
                          md: 29,
                        },
                        lineHeight: 1.15,
                        fontWeight: 950,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {acceso.titulo}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1.5,
                        color: "#64748b",
                        fontSize: 15,
                        lineHeight: 1.7,
                      }}
                    >
                      {acceso.descripcion}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mt: "auto",
                      pt: 1,
                    }}
                  >
                    <Button
                      component={RouterLink}
                      to={acceso.ruta}
                      variant="contained"
                      endIcon={<ArrowForwardRoundedIcon />}
                      sx={{
                        minHeight: 48,
                        px: 2.8,
                        bgcolor: acceso.color,
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: 900,
                        borderRadius: 2.5,
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: acceso.color,
                          boxShadow: `0 12px 28px ${acceso.color}35`,
                        },
                      }}
                    >
                      {acceso.boton}
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

export default LandingAccesosRapidos;