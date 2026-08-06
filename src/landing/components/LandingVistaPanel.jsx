import { Link as RouterLink } from "react-router-dom";

import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const tarjetasResumen = [
  {
    titulo: "Tickets abiertos",
    cantidad: "86",
    color: "#2563eb",
    fondo: "#eff6ff",
    simbolo: "A",
  },
  {
    titulo: "En proceso",
    cantidad: "3",
    color: "#ea580c",
    fondo: "#fff7ed",
    simbolo: "P",
  },
  {
    titulo: "Finalizados",
    cantidad: "6",
    color: "#16a34a",
    fondo: "#f0fdf4",
    simbolo: "F",
  },
];

const ticketsRecientes = [
  {
    folio: "TBT-2026-1052",
    asunto: "Problema con acceso al sistema",
    estado: "Pendiente",
    color: "#2563eb",
    fondo: "#eff6ff",
  },
  {
    folio: "TBT-2026-1048",
    asunto: "Error al generar reporte",
    estado: "En proceso",
    color: "#ea580c",
    fondo: "#fff7ed",
  },
  {
    folio: "TBT-2026-1041",
    asunto: "Solicitud de nueva funcionalidad",
    estado: "Resuelto",
    color: "#16a34a",
    fondo: "#f0fdf4",
  },
];

const caracteristicas = [
  "Consulta estados y prioridades.",
  "Revisa respuestas y responsables.",
  "Accede al historial de cada ticket.",
  "Administra evidencias y archivos.",
];

function LandingVistaPanel() {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "#ffffff",
        py: {
          xs: 8,
          md: 11,
        },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(320px, 0.8fr) minmax(560px, 1.2fr)",
            },
            alignItems: "center",
            gap: {
              xs: 6,
              lg: 8,
            },
          }}
        >
          <Stack spacing={3}>
            <Typography
              sx={{
                color: "#2563eb",
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Panel de control
            </Typography>

            <Typography
              component="h2"
              sx={{
                color: "#0f172a",
                fontSize: {
                  xs: 34,
                  sm: 42,
                  md: 50,
                },
                lineHeight: 1.08,
                fontWeight: 950,
                letterSpacing: "-0.04em",
              }}
            >
              Toda la información sin perder el control
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: {
                  xs: 16,
                  md: 17,
                },
                lineHeight: 1.75,
              }}
            >
              Consulta tus tickets, responsables, prioridades y avances desde
              una sola vista.
            </Typography>

            <Stack spacing={1.5}>
              {caracteristicas.map((caracteristica) => (
                <Stack
                  key={caracteristica}
                  direction="row"
                  spacing={1.3}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      flex: "0 0 auto",
                      borderRadius: "50%",
                      bgcolor: "#2563eb",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </Box>

                  <Typography
                    sx={{
                      color: "#334155",
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    {caracteristica}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              sx={{
                alignSelf: {
                  xs: "stretch",
                  sm: "flex-start",
                },
                minHeight: 50,
                px: 3,
                bgcolor: "#2563eb",
                color: "#ffffff",
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2.5,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#1d4ed8",
                  boxShadow: "none",
                },
              }}
            >
              Iniciar sesión
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              overflow: "hidden",
              borderRadius: {
                xs: 3,
                md: 4,
              },
              border: "1px solid #dbe3ee",
              bgcolor: "#ffffff",
              boxShadow: "0 30px 70px rgba(15, 23, 42, 0.14)",
            }}
          >
            <Box
              sx={{
                minHeight: 46,
                px: 2,
                bgcolor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={0.8}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#ef4444",
                  }}
                />

                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#f59e0b",
                  }}
                />

                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#22c55e",
                  }}
                />
              </Stack>

              <Box
                sx={{
                  width: {
                    xs: "48%",
                    sm: "38%",
                  },
                  height: 22,
                  borderRadius: 10,
                  bgcolor: "#e2e8f0",
                }}
              />

              <Box sx={{ width: 38 }} />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "54px minmax(0, 1fr)",
                  sm: "72px minmax(0, 1fr)",
                },
                minHeight: {
                  xs: 470,
                  sm: 520,
                },
              }}
            >
              <Stack
                spacing={1.4}
                alignItems="center"
                sx={{
                  bgcolor: "#0f1d35",
                  py: 2,
                  px: 1,
                }}
              >
                <MenuPanelItem activo texto="T" />
                <MenuPanelItem texto="D" />
                <MenuPanelItem texto="S" />
                <MenuPanelItem texto="R" />
              </Stack>

              <Box
                sx={{
                  minWidth: 0,
                  bgcolor: "#f4f7fb",
                  p: {
                    xs: 1.5,
                    sm: 2.5,
                  },
                }}
              >
                <Typography
                  sx={{
                    color: "#0f172a",
                    fontSize: {
                      xs: 19,
                      sm: 23,
                    },
                    fontWeight: 950,
                  }}
                >
                  Dashboard
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: 11,
                  }}
                >
                  Resumen general de tickets
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 1.5,
                    mt: 2,
                  }}
                >
                  {tarjetasResumen.map((tarjeta) => (
                    <Paper
                      key={tarjeta.titulo}
                      elevation={0}
                      sx={{
                        p: 1.6,
                        borderRadius: 2.5,
                        border: "1px solid #e2e8f0",
                        bgcolor: "#ffffff",
                      }}
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 2,
                          bgcolor: tarjeta.fondo,
                          color: tarjeta.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 950,
                        }}
                      >
                        {tarjeta.simbolo}
                      </Box>

                      <Typography
                        sx={{
                          mt: 1,
                          color: "#64748b",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {tarjeta.titulo}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#0f172a",
                          fontSize: 27,
                          lineHeight: 1.2,
                          fontWeight: 950,
                        }}
                      >
                        {tarjeta.cantidad}
                      </Typography>
                    </Paper>
                  ))}
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    mt: 2,
                    overflow: "hidden",
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Box
                    sx={{
                      px: {
                        xs: 1.5,
                        sm: 2,
                      },
                      py: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#0f172a",
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      Tickets recientes
                    </Typography>
                  </Box>

                  <Divider />

                  {ticketsRecientes.map((ticket, index) => (
                    <Box key={ticket.folio}>
                      <Box
                        sx={{
                          px: {
                            xs: 1.5,
                            sm: 2,
                          },
                          py: 1.4,
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "minmax(0, 1fr)",
                            sm: "minmax(0, 1fr) auto",
                          },
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            noWrap
                            sx={{
                              color: "#0f172a",
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          >
                            {ticket.asunto}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.3,
                              color: "#94a3b8",
                              fontSize: 10,
                            }}
                          >
                            {ticket.folio}
                          </Typography>
                        </Box>

                        <Chip
                          label={ticket.estado}
                          size="small"
                          sx={{
                            justifySelf: {
                              xs: "start",
                              sm: "end",
                            },
                            height: 24,
                            bgcolor: ticket.fondo,
                            color: ticket.color,
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        />
                      </Box>

                      {index < ticketsRecientes.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Paper>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

function MenuPanelItem({ texto, activo = false }) {
  return (
    <Box
      sx={{
        width: {
          xs: 34,
          sm: 38,
        },
        height: {
          xs: 34,
          sm: 38,
        },
        borderRadius: 2,
        bgcolor: activo ? "#2563eb" : "transparent",
        color: activo ? "#ffffff" : "#94a3b8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 950,
      }}
    >
      {texto}
    </Box>
  );
}

export default LandingVistaPanel;