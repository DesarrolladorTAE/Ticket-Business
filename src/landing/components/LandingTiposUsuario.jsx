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
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

const perfiles = [
  {
    tipo: "Para usuarios",
    titulo: "Solicita ayuda y consulta cada avance",
    descripcion:
      "Registra tus solicitudes, adjunta evidencias y mantente informado durante todo el proceso de atención.",
    icono: PersonRoundedIcon,
    color: "#2563eb",
    fondo: "#eff6ff",
    degradado:
      "linear-gradient(145deg, rgba(37, 99, 235, 0.12) 0%, rgba(255, 255, 255, 1) 62%)",
    ruta: "/registro",
    boton: "Crear mi cuenta",
    funcionalidades: [
      {
        texto: "Crear tickets de soporte",
        icono: TaskAltRoundedIcon,
      },
      {
        texto: "Consultar estados y respuestas",
        icono: VisibilityRoundedIcon,
      },
      {
        texto: "Adjuntar archivos y evidencias",
        icono: AttachFileRoundedIcon,
      },
      {
        texto: "Recibir notificaciones",
        icono: NotificationsActiveRoundedIcon,
      },
    ],
  },
  {
    tipo: "Para equipos de soporte",
    titulo: "Organiza y atiende solicitudes con mayor control",
    descripcion:
      "Centraliza el trabajo del equipo, asigna responsables y conserva un historial completo de atención.",
    icono: SupportAgentRoundedIcon,
    color: "#7c3aed",
    fondo: "#f5f3ff",
    degradado:
      "linear-gradient(145deg, rgba(124, 58, 237, 0.12) 0%, rgba(255, 255, 255, 1) 62%)",
    ruta: "/login",
    boton: "Iniciar sesión",
    funcionalidades: [
      {
        texto: "Asignar responsables",
        icono: ManageAccountsRoundedIcon,
      },
      {
        texto: "Definir prioridades",
        icono: PriorityHighRoundedIcon,
      },
      {
        texto: "Organizar grupos de soporte",
        icono: GroupsRoundedIcon,
      },
      {
        texto: "Consultar el historial completo",
        icono: HistoryRoundedIcon,
      },
    ],
  },
];

function LandingTiposUsuario() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "#f8fafc",
        py: {
          xs: 9,
          md: 12,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 460,
          height: 460,
          borderRadius: "50%",
          bgcolor: "rgba(37, 99, 235, 0.06)",
          filter: "blur(30px)",
          top: -220,
          left: -180,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          bgcolor: "rgba(124, 58, 237, 0.05)",
          filter: "blur(30px)",
          right: -180,
          bottom: -220,
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
            maxWidth: 780,
            mx: "auto",
            mb: {
              xs: 6,
              md: 8,
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
            Una plataforma para todos
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
            Diseñada para usuarios y equipos de soporte
          </Typography>

          <Typography
            sx={{
              maxWidth: 680,
              color: "#64748b",
              fontSize: {
                xs: 16,
                md: 18,
              },
              lineHeight: 1.7,
            }}
          >
            Cada perfil cuenta con las herramientas necesarias para registrar,
            atender y dar seguimiento a las solicitudes.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "repeat(2, minmax(0, 1fr))",
            },
            gap: {
              xs: 3,
              lg: 4,
            },
          }}
        >
          {perfiles.map((perfil) => {
            const IconoPrincipal = perfil.icono;

            return (
              <Paper
                key={perfil.tipo}
                elevation={0}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                  p: {
                    xs: 3,
                    sm: 4,
                    md: 4.5,
                  },
                  borderRadius: 4,
                  border: "1px solid #dbe3ee",
                  background: perfil.degradado,
                  transition:
                    "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    borderColor: `${perfil.color}55`,
                    boxShadow: "0 24px 55px rgba(15, 23, 42, 0.10)",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: 240,
                    height: 240,
                    borderRadius: "50%",
                    bgcolor: perfil.fondo,
                    right: -90,
                    top: -90,
                    opacity: 0.8,
                  }}
                />

                <Stack
                  spacing={3}
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    height: "100%",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 68,
                        height: 68,
                        flex: "0 0 auto",
                        borderRadius: 3,
                        bgcolor: perfil.fondo,
                        color: perfil.color,
                        border: `1px solid ${perfil.color}25`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconoPrincipal
                        sx={{
                          fontSize: 36,
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          color: perfil.color,
                          fontSize: 13,
                          fontWeight: 900,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {perfil.tipo}
                      </Typography>

                      <Typography
                        component="h3"
                        sx={{
                          mt: 0.5,
                          color: "#0f172a",
                          fontSize: {
                            xs: 23,
                            sm: 27,
                          },
                          lineHeight: 1.2,
                          fontWeight: 950,
                          letterSpacing: "-0.025em",
                        }}
                      >
                        {perfil.titulo}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: 15,
                      lineHeight: 1.75,
                    }}
                  >
                    {perfil.descripcion}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                      },
                      gap: 1.5,
                    }}
                  >
                    {perfil.funcionalidades.map((funcionalidad) => {
                      const Icono = funcionalidad.icono;

                      return (
                        <Stack
                          key={funcionalidad.texto}
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                          sx={{
                            minHeight: 52,
                            p: 1.3,
                            borderRadius: 2.5,
                            bgcolor: "rgba(255,255,255,0.78)",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              flex: "0 0 auto",
                              borderRadius: 2,
                              bgcolor: perfil.fondo,
                              color: perfil.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icono
                              sx={{
                                fontSize: 19,
                              }}
                            />
                          </Box>

                          <Typography
                            sx={{
                              color: "#334155",
                              fontSize: 13,
                              lineHeight: 1.4,
                              fontWeight: 800,
                            }}
                          >
                            {funcionalidad.texto}
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Box>

                  <Box
                    sx={{
                      mt: "auto",
                      pt: 1,
                    }}
                  >
                    <Button
                      component={RouterLink}
                      to={perfil.ruta}
                      variant="contained"
                      endIcon={<ArrowForwardRoundedIcon />}
                      sx={{
                        minHeight: 50,
                        px: 3,
                        bgcolor: perfil.color,
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: 900,
                        borderRadius: 2.5,
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: perfil.color,
                          boxShadow: `0 14px 30px ${perfil.color}35`,
                        },
                      }}
                    >
                      {perfil.boton}
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Box>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{
            mt: {
              xs: 5,
              md: 6,
            },
          }}
        >
          <CheckCircleRoundedIcon
            sx={{
              color: "#16a34a",
              fontSize: 20,
            }}
          />

          <Typography
            sx={{
              color: "#64748b",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Toda la información permanece centralizada y disponible para su
            seguimiento.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default LandingTiposUsuario;