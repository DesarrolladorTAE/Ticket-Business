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

import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LockIcon from "@mui/icons-material/Lock";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const resumenes = [
  {
    label: "Tickets abiertos",
    value: "86",
    cambio: "+12%",
    color: "#2563eb",
    fondo: "#eff6ff",
  },
  {
    label: "En proceso",
    value: "3",
    cambio: "Activos",
    color: "#ea580c",
    fondo: "#fff7ed",
  },
  {
    label: "Finalizados",
    value: "6",
    cambio: "+8%",
    color: "#16a34a",
    fondo: "#f0fdf4",
  },
];

const tickets = [
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

function LandingHero() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        width: "100%",
        minHeight: {
          xs: "auto",
          lg: "100svh",
        },
        display: "flex",
        alignItems: "center",
        color: "#ffffff",
        border: 0,
        outline: 0,
        pt: {
          xs: "108px",
          sm: "112px",
          md: "116px",
          lg: "96px",
        },
        pb: {
          xs: 9,
          md: 8,
          lg: 5,
        },
        backgroundImage: `
          radial-gradient(
            circle at 14% 23%,
            rgba(37, 99, 235, 0.28),
            transparent 34%
          ),
          radial-gradient(
            circle at 88% 32%,
            rgba(124, 58, 237, 0.20),
            transparent 32%
          ),
          linear-gradient(
            135deg,
            #06182f 0%,
            #08264b 55%,
            #071b36 100%
          )
        `,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.14,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.34) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -2,
          height: 4,
          bgcolor: "#06182f",
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          zIndex: 0,
          top: "17%",
          right: "6%",
          width: {
            xs: 260,
            md: 500,
          },
          height: {
            xs: 260,
            md: 500,
          },
          borderRadius: "50%",
          bgcolor: "rgba(37, 99, 235, 0.14)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "minmax(0, 0.86fr) minmax(560px, 1.14fr)",
            },
            alignItems: "center",
            gap: {
              xs: 8,
              lg: 5,
              xl: 8,
            },
          }}
        >
          <Stack
            spacing={3}
            sx={{
              minWidth: 0,
              maxWidth: 680,
              mx: {
                xs: "auto",
                lg: 0,
              },
              alignItems: {
                xs: "center",
                lg: "flex-start",
              },
              textAlign: {
                xs: "center",
                lg: "left",
              },
            }}
          >
            <Chip
              icon={<SupportAgentIcon />}
              label="Soporte centralizado y seguimiento constante"
              sx={{
                maxWidth: "100%",
                height: 36,
                bgcolor: "rgba(37, 99, 235, 0.16)",
                color: "#dbeafe",
                border: "1px solid rgba(96, 165, 250, 0.32)",
                fontWeight: 800,
                "& .MuiChip-icon": {
                  color: "#60a5fa",
                },
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />

            <Typography
              component="h1"
              sx={{
                maxWidth: 680,
                fontSize: {
                  xs: 40,
                  sm: 52,
                  md: 60,
                  lg: 58,
                  xl: 67,
                },
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.045em",
              }}
            >
              El soporte que necesitas,{" "}
              <Box
                component="span"
                sx={{
                  color: "#3b82f6",
                }}
              >
                en un solo lugar
              </Box>
            </Typography>

            <Typography
              sx={{
                maxWidth: 620,
                color: "#cbd5e1",
                fontSize: {
                  xs: 16,
                  md: 18,
                },
                lineHeight: 1.7,
              }}
            >
              Crea, organiza y da seguimiento a tus solicitudes de soporte de
              forma rápida, clara y segura. Consulta cada avance sin perder
              información.
            </Typography>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
              sx={{
                width: {
                  xs: "100%",
                  sm: "auto",
                },
              }}
            >
              <Button
                component={RouterLink}
                to="/registro"
                variant="contained"
                size="large"
                startIcon={<AddCircleIcon />}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  minHeight: 52,
                  px: 3,
                  borderRadius: 2.5,
                  bgcolor: "#2563eb",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: 900,
                  boxShadow: "0 16px 35px rgba(37,99,235,0.32)",
                  "& .MuiButton-startIcon, & .MuiButton-endIcon": {
                    display: "grid",
                    placeItems: "center",
                  },
                  "&:hover": {
                    bgcolor: "#1d4ed8",
                    boxShadow: "0 18px 40px rgba(37,99,235,0.40)",
                  },
                }}
              >
                Crear mi cuenta
              </Button>

              <Button
                component={RouterLink}
                to="/como-funciona"
                variant="outlined"
                size="large"
                startIcon={<PlayCircleIcon />}
                sx={{
                  minHeight: 52,
                  px: 3,
                  borderRadius: 2.5,
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.35)",
                  bgcolor: "rgba(255,255,255,0.02)",
                  textTransform: "none",
                  fontWeight: 900,
                  "& .MuiButton-startIcon": {
                    display: "grid",
                    placeItems: "center",
                  },
                  "&:hover": {
                    color: "#ffffff",
                    borderColor: "#ffffff",
                    bgcolor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                Ver cómo funciona
              </Button>
            </Stack>

            <Stack
              direction="row"
              useFlexGap
              flexWrap="wrap"
              sx={{
                width: "100%",
                gap: {
                  xs: 2,
                  sm: 3,
                },
                justifyContent: {
                  xs: "center",
                  lg: "flex-start",
                },
                alignItems: "center",
              }}
            >
              <FeatureItem
                icon={<BoltIcon />}
                label="Rápido y fácil"
                color="#facc15"
              />

              <FeatureItem
                icon={<LockIcon />}
                label="Acceso seguro"
                color="#22c55e"
              />

              <FeatureItem
                icon={<SupportAgentIcon />}
                label="Atención organizada"
                color="#60a5fa"
              />
            </Stack>
          </Stack>

          <DashboardPreview />
        </Box>
      </Container>
    </Box>
  );
}

function DashboardPreview() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        minHeight: {
          xs: 470,
          sm: 540,
          lg: 570,
        },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: {
          lg: "1400px",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: "78%",
          height: "72%",
          borderRadius: "50%",
          bgcolor: "rgba(37, 99, 235, 0.26)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      <FloatingMetric
        position={{
          top: {
            sm: 24,
            lg: 34,
          },
          left: {
            sm: -5,
            lg: -22,
          },
        }}
        icon={<TrendingUpIcon />}
        value="94%"
        label="Nivel de atención"
        color="#2563eb"
        hiddenXs
      />

      <FloatingMetric
        position={{
          right: {
            sm: -4,
            lg: -20,
          },
          bottom: {
            sm: 20,
            lg: 34,
          },
        }}
        icon={<CheckCircleIcon />}
        value="12"
        label="Resueltos hoy"
        color="#16a34a"
        hiddenXs
      />

      <Paper
        elevation={0}
        sx={{
          position: "relative",
          zIndex: 2,
          width: {
            xs: "100%",
            sm: "94%",
            lg: "94%",
          },
          maxWidth: 720,
          overflow: "hidden",
          borderRadius: {
            xs: 3,
            md: 4,
          },
          border: "1px solid rgba(255,255,255,0.42)",
          bgcolor: "#ffffff",
          boxShadow: `
            0 45px 100px rgba(0,0,0,0.36),
            0 0 0 1px rgba(255,255,255,0.08)
          `,
          transform: {
            xs: "none",
            lg: "rotateY(-3deg) rotateX(1deg)",
          },
          transformOrigin: "center center",
          transition: "transform 220ms ease",
          "&:hover": {
            transform: {
              xs: "none",
              lg: "rotateY(-1deg) rotateX(0deg) translateY(-4px)",
            },
          },
        }}
      >
        <Box
          sx={{
            minHeight: 48,
            px: 2,
            bgcolor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "grid",
            gridTemplateColumns: "auto minmax(100px, 1fr) auto",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={0.8}>
            {["#ef4444", "#f59e0b", "#22c55e"].map((color) => (
              <Box
                key={color}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: color,
                }}
              />
            ))}
          </Stack>

          <Box
            sx={{
              justifySelf: "center",
              width: {
                xs: "65%",
                sm: "48%",
              },
              maxWidth: 250,
              height: 22,
              borderRadius: 10,
              bgcolor: "#e2e8f0",
            }}
          />

          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: "#eff6ff",
              color: "#2563eb",
              display: "grid",
              placeItems: "center",
              fontSize: 11,
              fontWeight: 950,
            }}
          >
            TB
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "52px minmax(0, 1fr)",
              sm: "72px minmax(0, 1fr)",
            },
            minHeight: {
              xs: 430,
              sm: 480,
            },
          }}
        >
          <Stack
            alignItems="center"
            sx={{
              bgcolor: "#0f1d35",
              py: 2,
              px: 1,
            }}
          >
            <SidebarIcon active>
              <SupportAgentIcon />
            </SidebarIcon>

            <SidebarIcon>
              <DashboardIcon />
            </SidebarIcon>

            <SidebarIcon>
              <ConfirmationNumberIcon />
            </SidebarIcon>

            <SidebarIcon>
              <TrendingUpIcon />
            </SidebarIcon>

            <Box sx={{ flex: 1 }} />

            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.10)",
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                fontSize: 10,
                fontWeight: 900,
              }}
            >
              AD
            </Box>
          </Stack>

          <Box
            sx={{
              minWidth: 0,
              bgcolor: "#f5f8fc",
              p: {
                xs: 1.3,
                sm: 2.2,
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  sx={{
                    color: "#0f172a",
                    fontSize: {
                      xs: 18,
                      sm: 22,
                    },
                    lineHeight: 1.2,
                    fontWeight: 950,
                  }}
                >
                  Dashboard
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,
                    color: "#64748b",
                    fontSize: 10,
                  }}
                >
                  Resumen general de tickets
                </Typography>
              </Box>

              <Chip
                label="Actualizado"
                size="small"
                sx={{
                  display: {
                    xs: "none",
                    sm: "inline-flex",
                  },
                  height: 25,
                  bgcolor: "#f0fdf4",
                  color: "#16a34a",
                  fontSize: 9,
                  fontWeight: 900,
                }}
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.2,
                mt: 2,
              }}
            >
              {resumenes.map((resumen) => (
                <Paper
                  key={resumen.label}
                  elevation={0}
                  sx={{
                    minWidth: 0,
                    p: 1.4,
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.8,
                        bgcolor: resumen.fondo,
                        color: resumen.color,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <ConfirmationNumberIcon
                        sx={{
                          display: "block",
                          fontSize: 17,
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        color: resumen.color,
                        fontSize: 8,
                        fontWeight: 900,
                      }}
                    >
                      {resumen.cambio}
                    </Typography>
                  </Stack>

                  <Typography
                    noWrap
                    sx={{
                      mt: 1,
                      color: "#64748b",
                      fontSize: 9,
                      fontWeight: 700,
                    }}
                  >
                    {resumen.label}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#0f172a",
                      fontSize: 25,
                      lineHeight: 1.1,
                      fontWeight: 950,
                    }}
                  >
                    {resumen.value}
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Paper
              elevation={0}
              sx={{
                mt: 1.5,
                overflow: "hidden",
                borderRadius: 2.5,
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
                boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 1.2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    color: "#0f172a",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  Tickets recientes
                </Typography>

                <Typography
                  sx={{
                    color: "#2563eb",
                    fontSize: 9,
                    fontWeight: 900,
                  }}
                >
                  Ver todos
                </Typography>
              </Box>

              <Divider />

              {tickets.map((ticket, index) => (
                <Box key={ticket.folio}>
                  <Box
                    sx={{
                      px: 1.3,
                      py: 1.1,
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          width: 29,
                          height: 29,
                          flex: "0 0 auto",
                          borderRadius: 1.5,
                          bgcolor: ticket.fondo,
                          color: ticket.color,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <ConfirmationNumberIcon
                          sx={{
                            fontSize: 15,
                          }}
                        />
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{
                            color: "#0f172a",
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
                          {ticket.asunto}
                        </Typography>

                        <Typography
                          noWrap
                          sx={{
                            color: "#94a3b8",
                            fontSize: 8,
                          }}
                        >
                          {ticket.folio}
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      label={ticket.estado}
                      size="small"
                      sx={{
                        height: 22,
                        bgcolor: ticket.fondo,
                        color: ticket.color,
                        fontSize: 8,
                        fontWeight: 800,
                      }}
                    />
                  </Box>

                  {index < tickets.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>

            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "grid",
                },
                gridTemplateColumns: "1.2fr 0.8fr",
                gap: 1.2,
                mt: 1.5,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.4,
                  borderRadius: 2.5,
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  Rendimiento semanal
                </Typography>

                <Stack
                  direction="row"
                  spacing={0.7}
                  alignItems="flex-end"
                  sx={{
                    height: 40,
                    mt: 1,
                  }}
                >
                  {[18, 28, 22, 36, 31, 40, 34].map((altura, index) => (
                    <Box
                      key={`${altura}-${index}`}
                      sx={{
                        flex: 1,
                        height: altura,
                        borderRadius: "4px 4px 1px 1px",
                        bgcolor:
                          index === 5
                            ? "#2563eb"
                            : "#dbeafe",
                      }}
                    />
                  ))}
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.4,
                  borderRadius: 2.5,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  Nivel de atención
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,
                    color: "#0f172a",
                    fontSize: 25,
                    fontWeight: 950,
                  }}
                >
                  94%
                </Typography>

                <Box
                  sx={{
                    mt: 0.7,
                    height: 6,
                    overflow: "hidden",
                    borderRadius: 10,
                    bgcolor: "#e2e8f0",
                  }}
                >
                  <Box
                    sx={{
                      width: "94%",
                      height: "100%",
                      borderRadius: 10,
                      bgcolor: "#2563eb",
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function FloatingMetric({
  position,
  icon,
  value,
  label,
  color,
  hiddenXs = false,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "absolute",
        zIndex: 4,
        display: hiddenXs
          ? {
              xs: "none",
              sm: "block",
            }
          : "block",
        ...position,
        width: 170,
        p: 1.5,
        borderRadius: 3,
        bgcolor: "rgba(255,255,255,0.96)",
        border: "1px solid rgba(255,255,255,0.72)",
        boxShadow: "0 20px 45px rgba(15,23,42,0.24)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            flex: "0 0 auto",
            borderRadius: 2,
            bgcolor: `${color}16`,
            color,
            display: "grid",
            placeItems: "center",
            "& svg": {
              fontSize: 20,
            },
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            sx={{
              color: "#0f172a",
              fontSize: 18,
              lineHeight: 1.1,
              fontWeight: 950,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              mt: 0.2,
              color: "#64748b",
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function FeatureItem({ icon, label, color }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 30,
          height: 30,
          flex: "0 0 auto",
          borderRadius: "50%",
          bgcolor: `${color}1f`,
          color,
          display: "grid",
          placeItems: "center",
          lineHeight: 0,
          "& svg": {
            display: "block",
            width: 17,
            height: 17,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          color: "#cbd5e1",
          fontSize: 12,
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

function SidebarIcon({ children, active = false }) {
  return (
    <Box
      sx={{
        width: 38,
        height: 38,
        flex: "0 0 auto",
        mb: 1.2,
        borderRadius: 2,
        bgcolor: active
          ? "#2563eb"
          : "transparent",
        color: active
          ? "#ffffff"
          : "#94a3b8",
        display: "grid",
        placeItems: "center",
        lineHeight: 0,
        "& svg": {
          display: "block",
          width: 19,
          height: 19,
        },
      }}
    >
      {children}
    </Box>
  );
}

export default LandingHero;