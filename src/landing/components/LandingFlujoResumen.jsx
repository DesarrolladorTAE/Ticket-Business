import { Link as RouterLink } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const pasos = [
  {
    numero: "01",
    titulo: "Registra",
    descripcion: "Crea tu solicitud con la información necesaria.",
    icono: AddCircleIcon,
    color: "#60a5fa",
    fondo: "rgba(37, 99, 235, 0.22)",
  },
  {
    numero: "02",
    titulo: "Asigna",
    descripcion: "El equipo correspondiente recibe el ticket.",
    icono: SupportAgentIcon,
    color: "#fb923c",
    fondo: "rgba(234, 88, 12, 0.20)",
  },
  {
    numero: "03",
    titulo: "Consulta",
    descripcion: "Revisa respuestas, responsables y avances.",
    icono: SearchIcon,
    color: "#c084fc",
    fondo: "rgba(124, 58, 237, 0.20)",
  },
  {
    numero: "04",
    titulo: "Resuelve",
    descripcion: "Obtén la solución y conserva el historial.",
    icono: CheckCircleIcon,
    color: "#4ade80",
    fondo: "rgba(22, 163, 74, 0.20)",
  },
];

function LandingFlujoResumen() {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "#ffffff",
        py: {
          xs: 6,
          md: 8,
        },
      }}
    >
      <Container maxWidth="xl">
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: {
              xs: 4,
              md: 5,
            },
            border: "1px solid rgba(96, 165, 250, 0.20)",
            color: "#ffffff",
            px: {
              xs: 3,
              md: 5,
            },
            py: {
              xs: 4,
              md: 5,
            },
            backgroundImage: `
              radial-gradient(
                circle at 10% 20%,
                rgba(37, 99, 235, 0.30),
                transparent 32%
              ),
              radial-gradient(
                circle at 90% 80%,
                rgba(124, 58, 237, 0.18),
                transparent 30%
              ),
              linear-gradient(
                135deg,
                #06182f 0%,
                #08264b 58%,
                #071b36 100%
              )
            `,
            boxShadow: "0 28px 70px rgba(15, 23, 42, 0.17)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.12,
              pointerEvents: "none",
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.38) 1px, transparent 1px)",
              backgroundSize: "27px 27px",
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <Stack
              direction={{
                xs: "column",
                lg: "row",
              }}
              spacing={3}
              alignItems={{
                xs: "flex-start",
                lg: "center",
              }}
              justifyContent="space-between"
              sx={{
                mb: 4,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: "#93c5fd",
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Flujo de atención
                </Typography>

                <Typography
                  component="h2"
                  sx={{
                    mt: 0.8,
                    color: "#ffffff",
                    fontSize: {
                      xs: 28,
                      md: 38,
                    },
                    lineHeight: 1.1,
                    fontWeight: 950,
                    letterSpacing: "-0.035em",
                  }}
                >
                  De la solicitud a la solución
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    maxWidth: 650,
                    color: "#cbd5e1",
                    fontSize: 15,
                    lineHeight: 1.7,
                  }}
                >
                  Cada ticket conserva su información, responsable, avances y
                  resolución dentro de un proceso claro.
                </Typography>
              </Box>

              <Button
                component={RouterLink}
                to="/como-funciona"
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  minHeight: 48,
                  px: 3,
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.34)",
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 900,
                  "&:hover": {
                    color: "#ffffff",
                    borderColor: "#ffffff",
                    bgcolor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                Ver proceso completo
              </Button>
            </Stack>

            <Box
              sx={{
                position: "relative",
              }}
            >
              <Box
                sx={{
                  display: {
                    xs: "none",
                    lg: "block",
                  },
                  position: "absolute",
                  top: 34,
                  left: "10%",
                  right: "10%",
                  height: 2,
                  bgcolor: "rgba(147, 197, 253, 0.22)",
                }}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                {pasos.map((paso) => {
                  const Icono = paso.icono;

                  return (
                    <Paper
                      key={paso.numero}
                      elevation={0}
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        minHeight: 205,
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        transition:
                          "transform 180ms ease, background-color 180ms ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          bgcolor: "rgba(255,255,255,0.11)",
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Box
                            sx={{
                              width: 54,
                              height: 54,
                              borderRadius: 2.5,
                              bgcolor: paso.fondo,
                              color: paso.color,
                              display: "grid",
                              placeItems: "center",
                              "& svg": {
                                fontSize: 27,
                              },
                            }}
                          >
                            <Icono />
                          </Box>

                          <Typography
                            sx={{
                              color: "rgba(255,255,255,0.18)",
                              fontSize: 34,
                              lineHeight: 1,
                              fontWeight: 950,
                            }}
                          >
                            {paso.numero}
                          </Typography>
                        </Stack>

                        <Box>
                          <Typography
                            sx={{
                              color: "#ffffff",
                              fontSize: 19,
                              fontWeight: 900,
                            }}
                          >
                            {paso.titulo}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.8,
                              color: "#cbd5e1",
                              fontSize: 13,
                              lineHeight: 1.65,
                            }}
                          >
                            {paso.descripcion}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LandingFlujoResumen;