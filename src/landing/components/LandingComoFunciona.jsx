import {
  Box,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import LockIcon from "@mui/icons-material/Lock";
import SearchIcon from "@mui/icons-material/Search";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const pasos = [
  {
    numero: "01",
    etiqueta: "Registro",
    titulo: "Crea una solicitud clara",
    descripcion:
      "Describe el problema, selecciona el sistema correspondiente y agrega la información necesaria para facilitar la revisión.",
    icono: AddCircleIcon,
    color: "#2563eb",
    fondo: "#eff6ff",
    borde: "#bfdbfe",
    panelTitulo: "Nueva solicitud",
    campos: [
      "Sistema o servicio",
      "Asunto de la solicitud",
      "Descripción del problema",
    ],
    estado: "Lista para enviar",
  },
  {
    numero: "02",
    etiqueta: "Asignación",
    titulo: "El ticket llega al equipo adecuado",
    descripcion:
      "La solicitud se registra y puede asignarse a un responsable para iniciar su revisión y seguimiento.",
    icono: SupportAgentIcon,
    color: "#ea580c",
    fondo: "#fff7ed",
    borde: "#fed7aa",
    panelTitulo: "Responsable asignado",
    campos: [
      "Equipo de soporte",
      "Prioridad de atención",
      "Fecha de asignación",
    ],
    estado: "En atención",
  },
  {
    numero: "03",
    etiqueta: "Seguimiento",
    titulo: "Consulta cada actualización",
    descripcion:
      "Revisa respuestas, responsables, archivos y cambios de estado desde el historial de tu solicitud.",
    icono: SearchIcon,
    color: "#7c3aed",
    fondo: "#f5f3ff",
    borde: "#ddd6fe",
    panelTitulo: "Seguimiento del ticket",
    campos: [
      "Respuesta del equipo",
      "Evidencias adjuntas",
      "Cambio de estado",
    ],
    estado: "Seguimiento constante",
  },
  {
    numero: "04",
    etiqueta: "Resolución",
    titulo: "Obtén la solución y conserva el historial",
    descripcion:
      "Cuando la solicitud se resuelve, la información permanece disponible para futuras consultas.",
    icono: CheckCircleIcon,
    color: "#16a34a",
    fondo: "#f0fdf4",
    borde: "#bbf7d0",
    panelTitulo: "Solicitud resuelta",
    campos: [
      "Solución registrada",
      "Fecha de resolución",
      "Historial disponible",
    ],
    estado: "Finalizado",
  },
];

const ventajas = [
  {
    titulo: "Acceso protegido",
    descripcion: "La información permanece asociada a cada usuario.",
    icono: LockIcon,
  },
  {
    titulo: "Historial completo",
    descripcion: "Cada respuesta y actualización queda registrada.",
    icono: HistoryIcon,
  },
  {
    titulo: "Atención organizada",
    descripcion: "Los tickets conservan responsables y estados claros.",
    icono: SupportAgentIcon,
  },
];

function LandingComoFunciona() {
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
            circle at 8% 12%,
            rgba(37, 99, 235, 0.10),
            transparent 24%
          ),
          radial-gradient(
            circle at 94% 35%,
            rgba(124, 58, 237, 0.08),
            transparent 26%
          ),
          linear-gradient(
            180deg,
            #f8fafc 0%,
            #ffffff 45%,
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
              lg: "minmax(0, 1fr) 360px",
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
              label="Cómo funciona"
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
                maxWidth: 850,
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
              Un proceso claro desde el primer contacto
            </Typography>

            <Typography
              sx={{
                maxWidth: 730,
                color: "#64748b",
                fontSize: {
                  xs: 16,
                  md: 18,
                },
                lineHeight: 1.75,
              }}
            >
              Cada solicitud avanza por etapas visibles, conservando
              responsables, respuestas, archivos y actualizaciones.
            </Typography>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              overflow: "hidden",
              borderRadius: 4,
              color: "#ffffff",
              p: 3.5,
              backgroundImage: `
                radial-gradient(
                  circle at 90% 10%,
                  rgba(37, 99, 235, 0.42),
                  transparent 40%
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
              Seguimiento constante
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 27,
                lineHeight: 1.18,
                fontWeight: 950,
              }}
            >
              Toda la información permanece disponible
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 3 }}>
              {pasos.map((paso) => (
                <Stack
                  key={paso.numero}
                  direction="row"
                  spacing={1.4}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      flex: "0 0 auto",
                      borderRadius: "50%",
                      bgcolor: "rgba(37,99,235,0.28)",
                      color: "#bfdbfe",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 950,
                    }}
                  >
                    {paso.numero}
                  </Box>

                  <Typography
                    sx={{
                      color: "#e2e8f0",
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    {paso.titulo}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Box>

        <Stack
          spacing={{
            xs: 7,
            md: 10,
          }}
        >
          {pasos.map((paso, index) => (
            <PasoProceso
              key={paso.numero}
              paso={paso}
              invertido={index % 2 !== 0}
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
            borderRadius: 4,
            border: "1px solid #dbeafe",
            bgcolor: "#eff6ff",
            p: {
              xs: 3,
              md: 4,
            },
          }}
        >
          <Typography
            sx={{
              color: "#07162f",
              fontSize: {
                xs: 26,
                md: 32,
              },
              fontWeight: 950,
              letterSpacing: "-0.025em",
            }}
          >
            La información no desaparece cuando termina la atención
          </Typography>

          <Typography
            sx={{
              mt: 1,
              maxWidth: 760,
              color: "#64748b",
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            El historial permite consultar soluciones anteriores y mantener un
            registro claro de cada solicitud.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
              mt: 3,
            }}
          >
            {ventajas.map((ventaja) => {
              const Icono = ventaja.icono;

              return (
                <Stack
                  key={ventaja.titulo}
                  direction="row"
                  spacing={1.4}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      flex: "0 0 auto",
                      borderRadius: 2.5,
                      bgcolor: "#ffffff",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icono sx={{ fontSize: 23 }} />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        color: "#0f172a",
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      {ventaja.titulo}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.3,
                        color: "#64748b",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {ventaja.descripcion}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function PasoProceso({ paso, invertido }) {
  const Icono = paso.icono;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: "repeat(2, minmax(0, 1fr))",
        },
        alignItems: "center",
        gap: {
          xs: 4,
          lg: 8,
        },
      }}
    >
      <Box
        sx={{
          order: {
            xs: 1,
            lg: invertido ? 2 : 1,
          },
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            spacing={1.6}
            alignItems="center"
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                flex: "0 0 auto",
                borderRadius: 3,
                bgcolor: paso.fondo,
                color: paso.color,
                border: `1px solid ${paso.borde}`,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icono sx={{ fontSize: 31 }} />
            </Box>

            <Box>
              <Typography
                sx={{
                  color: paso.color,
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Paso {paso.numero} · {paso.etiqueta}
              </Typography>

              <Typography
                component="h2"
                sx={{
                  mt: 0.4,
                  color: "#07162f",
                  fontSize: {
                    xs: 28,
                    md: 36,
                  },
                  lineHeight: 1.12,
                  fontWeight: 950,
                  letterSpacing: "-0.03em",
                }}
              >
                {paso.titulo}
              </Typography>
            </Box>
          </Stack>

          <Typography
            sx={{
              maxWidth: 620,
              color: "#64748b",
              fontSize: 16,
              lineHeight: 1.75,
            }}
          >
            {paso.descripcion}
          </Typography>

          <Stack spacing={1.2}>
            {paso.campos.map((campo) => (
              <Stack
                key={campo}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <CheckCircleIcon
                  sx={{
                    color: paso.color,
                    fontSize: 19,
                  }}
                />

                <Typography
                  sx={{
                    color: "#334155",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {campo}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>

      <VistaPaso
        paso={paso}
        order={{
          xs: 2,
          lg: invertido ? 1 : 2,
        }}
      />
    </Box>
  );
}

function VistaPaso({ paso, order }) {
  return (
    <Paper
      elevation={0}
      sx={{
        order,
        overflow: "hidden",
        borderRadius: 4,
        border: "1px solid #dbe3ee",
        bgcolor: "#ffffff",
        boxShadow: "0 25px 65px rgba(15,23,42,0.12)",
      }}
    >
      <Box
        sx={{
          minHeight: 44,
          px: 2,
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: 0.8,
        }}
      >
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
      </Box>

      <Box
        sx={{
          p: {
            xs: 2.5,
            md: 3.5,
          },
          bgcolor: "#f8fafc",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <Box
            sx={{
              p: 2.5,
              bgcolor: paso.fondo,
              borderBottom: `1px solid ${paso.borde}`,
            }}
          >
            <Typography
              sx={{
                color: paso.color,
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              {paso.etiqueta}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "#0f172a",
                fontSize: 22,
                fontWeight: 950,
              }}
            >
              {paso.panelTitulo}
            </Typography>
          </Box>

          <Stack
            divider={<Divider />}
          >
            {paso.campos.map((campo, index) => (
              <Box
                key={campo}
                sx={{
                  px: 2.5,
                  py: 1.8,
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr)",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.8,
                    bgcolor: paso.fondo,
                    color: paso.color,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: 950,
                  }}
                >
                  {index + 1}
                </Box>

                <Box>
                  <Typography
                    sx={{
                      color: "#0f172a",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {campo}
                  </Typography>

                  <Box
                    sx={{
                      width: `${78 - index * 10}%`,
                      height: 7,
                      mt: 0.8,
                      borderRadius: 10,
                      bgcolor: "#e2e8f0",
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Stack>

          <Box
            sx={{
              p: 2.5,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Chip
              label={paso.estado}
              sx={{
                bgcolor: paso.fondo,
                color: paso.color,
                border: `1px solid ${paso.borde}`,
                fontWeight: 900,
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Paper>
  );
}

export default LandingComoFunciona;