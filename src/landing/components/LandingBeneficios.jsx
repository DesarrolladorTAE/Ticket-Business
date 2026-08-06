import {
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupsIcon from "@mui/icons-material/Groups";
import HistoryIcon from "@mui/icons-material/History";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const categorias = [
  {
    categoria: "Control",
    titulo: "Mantén organizada cada solicitud",
    descripcion:
      "Consulta estados, responsables, fechas y antecedentes sin buscar información en distintos medios.",
    icono: HistoryIcon,
    color: "#2563eb",
    fondo: "#eff6ff",
    borde: "#bfdbfe",
    beneficios: [
      {
        titulo: "Historial completo",
        descripcion:
          "Cada respuesta y actualización permanece dentro del ticket.",
        icono: HistoryIcon,
      },
      {
        titulo: "Seguimiento constante",
        descripcion:
          "Consulta el avance de las solicitudes desde cualquier dispositivo.",
        icono: AccessTimeIcon,
      },
    ],
  },
  {
    categoria: "Comunicación",
    titulo: "Reduce confusiones durante la atención",
    descripcion:
      "La conversación, las evidencias y los cambios de estado permanecen centralizados.",
    icono: SupportAgentIcon,
    color: "#7c3aed",
    fondo: "#f5f3ff",
    borde: "#ddd6fe",
    beneficios: [
      {
        titulo: "Notificaciones oportunas",
        descripcion:
          "Conoce cuándo una solicitud tiene una respuesta o cambio.",
        icono: NotificationsActiveIcon,
      },
      {
        titulo: "Archivos y evidencias",
        descripcion:
          "Adjunta documentos y capturas para facilitar la revisión.",
        icono: AttachFileIcon,
      },
    ],
  },
  {
    categoria: "Seguridad",
    titulo: "Protege la información de usuarios y empresas",
    descripcion:
      "Cada usuario accede a la información correspondiente dentro de la plataforma.",
    icono: LockIcon,
    color: "#16a34a",
    fondo: "#f0fdf4",
    borde: "#bbf7d0",
    beneficios: [
      {
        titulo: "Acceso protegido",
        descripcion:
          "La información permanece vinculada a cuentas identificadas.",
        icono: LockIcon,
      },
      {
        titulo: "Atención organizada",
        descripcion:
          "Cada solicitud conserva un responsable y un estado definido.",
        icono: GroupsIcon,
      },
    ],
  },
];

const comparacion = [
  {
    antes: "Solicitudes enviadas por diferentes medios",
    despues: "Tickets centralizados en una sola plataforma",
  },
  {
    antes: "Respuestas difíciles de localizar",
    despues: "Historial completo dentro de cada solicitud",
  },
  {
    antes: "Sin claridad sobre el responsable",
    despues: "Asignación y estado visibles para el usuario",
  },
  {
    antes: "Archivos separados de la conversación",
    despues: "Evidencias conservadas dentro del ticket",
  },
];

function LandingBeneficios() {
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
        backgroundImage: `
          radial-gradient(
            circle at 94% 10%,
            rgba(37, 99, 235, 0.11),
            transparent 27%
          ),
          radial-gradient(
            circle at 5% 40%,
            rgba(124, 58, 237, 0.08),
            transparent 26%
          ),
          linear-gradient(
            180deg,
            #f8fafc 0%,
            #ffffff 42%,
            #f8fafc 100%
          )
        `,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1fr) 380px",
            },
            alignItems: "center",
            gap: {
              xs: 5,
              lg: 8,
            },
            mb: {
              xs: 8,
              md: 11,
            },
          }}
        >
          <Stack spacing={2.2}>
            <Chip
              label="Beneficios"
              sx={{
                alignSelf: "flex-start",
                height: 34,
                bgcolor: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #bfdbfe",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.11em",
                textTransform: "uppercase",
              }}
            />

            <Typography
              component="h1"
              sx={{
                maxWidth: 900,
                color: "#07162f",
                fontSize: {
                  xs: 40,
                  sm: 50,
                  md: 61,
                },
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.045em",
              }}
            >
              Más control, claridad y seguimiento
            </Typography>

            <Typography
              sx={{
                maxWidth: 760,
                color: "#64748b",
                fontSize: {
                  xs: 16,
                  md: 18,
                },
                lineHeight: 1.75,
              }}
            >
              The Business Ticket concentra la atención de soporte dentro de
              un proceso visible, organizado y seguro.
            </Typography>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              color: "#ffffff",
              p: 3.5,
              backgroundImage: `
                radial-gradient(
                  circle at 85% 12%,
                  rgba(124, 58, 237, 0.38),
                  transparent 42%
                ),
                linear-gradient(
                  145deg,
                  #06182f 0%,
                  #0b2b55 100%
                )
              `,
              boxShadow: "0 24px 55px rgba(15,23,42,0.18)",
            }}
          >
            <Typography
              sx={{
                color: "#93c5fd",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.11em",
                textTransform: "uppercase",
              }}
            >
              Una sola plataforma
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 27,
                lineHeight: 1.18,
                fontWeight: 950,
              }}
            >
              Solicitudes, respuestas, archivos e historial
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 3 }}>
              {[
                "Información centralizada",
                "Seguimiento constante",
                "Acceso protegido",
              ].map((texto) => (
                <Stack
                  key={texto}
                  direction="row"
                  spacing={1.2}
                  alignItems="center"
                >
                  <CheckCircleIcon
                    sx={{
                      color: "#4ade80",
                      fontSize: 20,
                    }}
                  />

                  <Typography
                    sx={{
                      color: "#e2e8f0",
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    {texto}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Box>

        <Stack spacing={4}>
          {categorias.map((categoria, index) => (
            <CategoriaBeneficios
              key={categoria.categoria}
              categoria={categoria}
              invertida={index % 2 !== 0}
            />
          ))}
        </Stack>

        <Paper
          elevation={0}
          sx={{
            mt: {
              xs: 8,
              md: 11,
            },
            overflow: "hidden",
            borderRadius: 4,
            border: "1px solid #dbe3ee",
            bgcolor: "#ffffff",
            boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
          }}
        >
          <Box
            sx={{
              p: {
                xs: 3,
                md: 4,
              },
              textAlign: "center",
              bgcolor: "#071b36",
              color: "#ffffff",
            }}
          >
            <Typography
              sx={{
                color: "#93c5fd",
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.11em",
              }}
            >
              Antes y después
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: {
                  xs: 27,
                  md: 36,
                },
                fontWeight: 950,
                letterSpacing: "-0.03em",
              }}
            >
              Una forma más clara de gestionar soporte
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            <Box
              sx={{
                p: {
                  xs: 3,
                  md: 4,
                },
                bgcolor: "#fff7ed",
                borderRight: {
                  xs: 0,
                  md: "1px solid #e2e8f0",
                },
                borderBottom: {
                  xs: "1px solid #e2e8f0",
                  md: 0,
                },
              }}
            >
              <Typography
                sx={{
                  color: "#c2410c",
                  fontSize: 13,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Sin centralización
              </Typography>

              <Stack spacing={2} sx={{ mt: 3 }}>
                {comparacion.map((elemento) => (
                  <Stack
                    key={elemento.antes}
                    direction="row"
                    spacing={1.3}
                    alignItems="flex-start"
                  >
                    <Box
                      sx={{
                        width: 25,
                        height: 25,
                        flex: "0 0 auto",
                        borderRadius: "50%",
                        bgcolor: "#ffedd5",
                        color: "#ea580c",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 15,
                        fontWeight: 900,
                      }}
                    >
                      ×
                    </Box>

                    <Typography
                      sx={{
                        color: "#7c2d12",
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      {elemento.antes}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                p: {
                  xs: 3,
                  md: 4,
                },
                bgcolor: "#f0fdf4",
              }}
            >
              <Typography
                sx={{
                  color: "#15803d",
                  fontSize: 13,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Con The Business Ticket
              </Typography>

              <Stack spacing={2} sx={{ mt: 3 }}>
                {comparacion.map((elemento) => (
                  <Stack
                    key={elemento.despues}
                    direction="row"
                    spacing={1.3}
                    alignItems="flex-start"
                  >
                    <CheckCircleIcon
                      sx={{
                        flex: "0 0 auto",
                        color: "#16a34a",
                        fontSize: 25,
                      }}
                    />

                    <Typography
                      sx={{
                        color: "#14532d",
                        fontSize: 14,
                        lineHeight: 1.6,
                        fontWeight: 700,
                      }}
                    >
                      {elemento.despues}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function CategoriaBeneficios({ categoria, invertida }) {
  const IconoCategoria = categoria.icono;

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        borderRadius: 4,
        border: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
        boxShadow: "0 18px 48px rgba(15,23,42,0.07)",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(300px, 0.72fr) minmax(0, 1.28fr)",
          },
        }}
      >
        <Box
          sx={{
            order: {
              xs: 1,
              lg: invertida ? 2 : 1,
            },
            p: {
              xs: 3,
              md: 4,
            },
            bgcolor: categoria.fondo,
            borderRight: {
              xs: 0,
              lg: invertida ? 0 : `1px solid ${categoria.borde}`,
            },
            borderLeft: {
              xs: 0,
              lg: invertida ? `1px solid ${categoria.borde}` : 0,
            },
          }}
        >
          <Box
            sx={{
              width: 66,
              height: 66,
              borderRadius: 3,
              bgcolor: "#ffffff",
              color: categoria.color,
              border: `1px solid ${categoria.borde}`,
              display: "grid",
              placeItems: "center",
            }}
          >
            <IconoCategoria sx={{ fontSize: 34 }} />
          </Box>

          <Typography
            sx={{
              mt: 3,
              color: categoria.color,
              fontSize: 12,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {categoria.categoria}
          </Typography>

          <Typography
            component="h2"
            sx={{
              mt: 0.8,
              color: "#07162f",
              fontSize: {
                xs: 26,
                md: 32,
              },
              lineHeight: 1.15,
              fontWeight: 950,
              letterSpacing: "-0.03em",
            }}
          >
            {categoria.titulo}
          </Typography>

          <Typography
            sx={{
              mt: 1.5,
              color: "#64748b",
              fontSize: 14.5,
              lineHeight: 1.7,
            }}
          >
            {categoria.descripcion}
          </Typography>
        </Box>

        <Box
          sx={{
            order: {
              xs: 2,
              lg: invertida ? 1 : 2,
            },
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
          }}
        >
          {categoria.beneficios.map((beneficio, index) => {
            const Icono = beneficio.icono;

            return (
              <Box
                key={beneficio.titulo}
                sx={{
                  p: {
                    xs: 3,
                    md: 4,
                  },
                  borderRight: {
                    xs: 0,
                    sm:
                      index === 0
                        ? "1px solid #e2e8f0"
                        : 0,
                  },
                  borderBottom: {
                    xs:
                      index === 0
                        ? "1px solid #e2e8f0"
                        : 0,
                    sm: 0,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: 2.5,
                    bgcolor: categoria.fondo,
                    color: categoria.color,
                    border: `1px solid ${categoria.borde}`,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icono sx={{ fontSize: 27 }} />
                </Box>

                <Typography
                  sx={{
                    mt: 2.5,
                    color: "#0f172a",
                    fontSize: 20,
                    fontWeight: 950,
                  }}
                >
                  {beneficio.titulo}
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#64748b",
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  {beneficio.descripcion}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}

export default LandingBeneficios;