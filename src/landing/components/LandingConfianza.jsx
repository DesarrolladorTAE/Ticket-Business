import {
  Box,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ViewTimelineRoundedIcon from "@mui/icons-material/ViewTimelineRounded";

const elementos = [
  {
    titulo: "Seguimiento constante",
    descripcion: "Consulta cada avance y actualización de tus solicitudes.",
    icono: AccessTimeRoundedIcon,
    color: "#2563eb",
    fondo: "#eff6ff",
  },
  {
    titulo: "Información centralizada",
    descripcion: "Mantén respuestas, archivos e historial en un solo lugar.",
    icono: ViewTimelineRoundedIcon,
    color: "#7c3aed",
    fondo: "#f5f3ff",
  },
  {
    titulo: "Acceso seguro",
    descripcion: "Protección para la información de usuarios y empresas.",
    icono: SecurityRoundedIcon,
    color: "#16a34a",
    fondo: "#f0fdf4",
  },
  {
    titulo: "Atención organizada",
    descripcion: "Cada solicitud llega al equipo correspondiente.",
    icono: SupportAgentRoundedIcon,
    color: "#ea580c",
    fondo: "#fff7ed",
  },
];

function LandingConfianza() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        bgcolor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        py: {
          xs: 5,
          md: 6,
        },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: {
              xs: 2,
              md: 0,
            },
          }}
        >
          {elementos.map((elemento, index) => {
            const Icono = elemento.icono;

            return (
              <Box
                key={elemento.titulo}
                sx={{
                  position: "relative",
                  px: {
                    xs: 0,
                    md: 3,
                  },
                  py: {
                    xs: 1,
                    md: 0,
                  },

                  "&::after": {
                    content: '""',
                    display: {
                      xs: "none",
                      lg: index < elementos.length - 1 ? "block" : "none",
                    },
                    position: "absolute",
                    top: "10%",
                    right: 0,
                    width: "1px",
                    height: "80%",
                    bgcolor: "#e2e8f0",
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.8}
                  alignItems="flex-start"
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      flex: "0 0 auto",
                      borderRadius: 2.5,
                      bgcolor: elemento.fondo,
                      color: elemento.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${elemento.color}20`,
                    }}
                  >
                    <Icono
                      sx={{
                        fontSize: 25,
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      component="h3"
                      sx={{
                        color: "#0f172a",
                        fontSize: 16,
                        lineHeight: 1.3,
                        fontWeight: 900,
                      }}
                    >
                      {elemento.titulo}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.6,
                        color: "#64748b",
                        fontSize: 13,
                        lineHeight: 1.55,
                      }}
                    >
                      {elemento.descripcion}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

export default LandingConfianza;