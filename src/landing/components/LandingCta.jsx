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
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";

function LandingCta() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "#ffffff",
        py: {
          xs: 8,
          md: 11,
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
            border: "1px solid rgba(96, 165, 250, 0.22)",
            bgcolor: "#06182f",
            color: "#ffffff",
            px: {
              xs: 3,
              sm: 5,
              md: 8,
            },
            py: {
              xs: 6,
              md: 8,
            },
            backgroundImage: `
              radial-gradient(
                circle at 12% 20%,
                rgba(37, 99, 235, 0.35),
                transparent 30%
              ),
              radial-gradient(
                circle at 90% 80%,
                rgba(124, 58, 237, 0.22),
                transparent 32%
              ),
              linear-gradient(
                135deg,
                #06182f 0%,
                #08264b 58%,
                #071b36 100%
              )
            `,
            boxShadow: "0 30px 70px rgba(15, 23, 42, 0.18)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.12,
              pointerEvents: "none",
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.32) 1px, transparent 1px)",
              backgroundSize: "27px 27px",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              bgcolor: "rgba(37, 99, 235, 0.20)",
              filter: "blur(60px)",
              right: -120,
              top: -120,
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(0, 1fr) auto",
              },
              alignItems: "center",
              gap: {
                xs: 5,
                lg: 7,
              },
            }}
          >
            <Stack
              spacing={2.5}
              sx={{
                maxWidth: 760,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: "rgba(37, 99, 235, 0.22)",
                  color: "#93c5fd",
                  border: "1px solid rgba(147, 197, 253, 0.26)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SupportAgentRoundedIcon
                  sx={{
                    fontSize: 35,
                  }}
                />
              </Box>

              <Typography
                component="h2"
                sx={{
                  fontSize: {
                    xs: 34,
                    sm: 43,
                    md: 52,
                  },
                  lineHeight: 1.08,
                  fontWeight: 950,
                  letterSpacing: "-0.04em",
                }}
              >
                Centraliza tus solicitudes de soporte
              </Typography>

              <Typography
                sx={{
                  maxWidth: 670,
                  color: "#cbd5e1",
                  fontSize: {
                    xs: 16,
                    md: 18,
                  },
                  lineHeight: 1.7,
                }}
              >
                Crea tu cuenta y comienza a registrar, consultar y dar
                seguimiento a tus tickets desde una sola plataforma.
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={{
                  xs: 1.2,
                  sm: 3,
                }}
              >
                <BeneficioCta texto="Seguimiento centralizado" />
                <BeneficioCta texto="Acceso seguro" />
                <BeneficioCta texto="Historial disponible" />
              </Stack>
            </Stack>

            <Stack
              spacing={1.5}
              sx={{
                width: {
                  xs: "100%",
                  sm: 320,
                },
              }}
            >
              <Button
                component={RouterLink}
                to="/registro"
                variant="contained"
                size="large"
                startIcon={<PersonAddAltIcon />}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  minHeight: 54,
                  px: 3,
                  borderRadius: 2.5,
                  bgcolor: "#2563eb",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: 900,
                  boxShadow: "0 16px 35px rgba(37, 99, 235, 0.38)",
                  "&:hover": {
                    bgcolor: "#1d4ed8",
                    boxShadow: "0 18px 40px rgba(37, 99, 235, 0.45)",
                  },
                }}
              >
                Crear cuenta
              </Button>

              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="large"
                startIcon={<LoginIcon />}
                sx={{
                  minHeight: 54,
                  px: 3,
                  borderRadius: 2.5,
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.32)",
                  bgcolor: "rgba(255,255,255,0.03)",
                  textTransform: "none",
                  fontWeight: 900,
                  "&:hover": {
                    color: "#ffffff",
                    borderColor: "#ffffff",
                    bgcolor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                Iniciar sesión
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function BeneficioCta({ texto }) {
  return (
    <Stack direction="row" spacing={0.8} alignItems="center">
      <CheckCircleRoundedIcon
        sx={{
          color: "#4ade80",
          fontSize: 19,
        }}
      />

      <Typography
        sx={{
          color: "#e2e8f0",
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {texto}
      </Typography>
    </Stack>
  );
}

export default LandingCta;