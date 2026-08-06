import { Link as RouterLink } from "react-router-dom";

import {
  Box,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const LOGO_URL =
  "https://api.thebusinessticket.com/images/email/the-business-ticket.png";

const enlacesProducto = [
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

const enlacesAcceso = [
  {
    label: "Iniciar sesión",
    to: "/login",
  },
  {
    label: "Crear cuenta",
    to: "/registro",
  },
  {
    label: "Recuperar contraseña",
    to: "/olvide-contrasena",
  },
];

function LandingFooter() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#06182f",
        color: "#ffffff",
        pt: {
          xs: 7,
          md: 9,
        },
        pb: 3,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "minmax(300px, 1.4fr) repeat(3, minmax(170px, 0.6fr))",
            },
            gap: {
              xs: 5,
              md: 6,
            },
          }}
        >
          <Stack
            spacing={2.5}
            sx={{
              maxWidth: 390,
            }}
          >
            <Box
              component={RouterLink}
              to="/"
              aria-label="Ir al inicio"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                width: "fit-content",
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
                    xs: 180,
                    md: 210,
                  },
                  height: 62,
                  objectFit: "contain",
                  objectPosition: "left center",
                }}
              />
            </Box>

            <Typography
              sx={{
                color: "#94a3b8",
                fontSize: 15,
                lineHeight: 1.75,
              }}
            >
              Plataforma para registrar, organizar y dar seguimiento a
              solicitudes de soporte desde un solo lugar.
            </Typography>

            <Stack direction="row" spacing={1}>
              <SocialButton
                label="Facebook"
                icon={<FacebookIcon />}
              />

              <SocialButton
                label="LinkedIn"
                icon={<LinkedInIcon />}
              />

              <SocialButton
                label="Sitio web"
                icon={<LanguageIcon />}
              />
            </Stack>
          </Stack>

          <FooterColumn
            titulo="Producto"
            enlaces={enlacesProducto}
          />

          <FooterColumn
            titulo="Acceso"
            enlaces={enlacesAcceso}
          />

          <Stack spacing={2}>
            <Typography
              sx={{
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              Soporte
            </Typography>

            <Stack spacing={1.5}>
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    flex: "0 0 auto",
                    borderRadius: 2,
                    bgcolor: "rgba(37, 99, 235, 0.18)",
                    color: "#60a5fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EmailOutlinedIcon
                    sx={{
                      fontSize: 19,
                    }}
                  />
                </Box>

                <Typography
                  component="a"
                  href="mailto:soporte@thebusinessticket.com"
                  sx={{
                    color: "#94a3b8",
                    fontSize: 14,
                    textDecoration: "none",
                    wordBreak: "break-word",
                    transition: "color 150ms ease",
                    "&:hover": {
                      color: "#ffffff",
                    },
                  }}
                >
                  soporte@thebusinessticket.com
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    flex: "0 0 auto",
                    borderRadius: 2,
                    bgcolor: "rgba(37, 99, 235, 0.18)",
                    color: "#60a5fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SupportAgentIcon
                    sx={{
                      fontSize: 19,
                    }}
                  />
                </Box>

                <Typography
                  sx={{
                    color: "#94a3b8",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  Atención y seguimiento de tickets
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        <Divider
          sx={{
            my: {
              xs: 5,
              md: 6,
            },
            borderColor: "rgba(255, 255, 255, 0.10)",
          }}
        />

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
          alignItems={{
            xs: "flex-start",
            md: "center",
          }}
          justifyContent="space-between"
        >
          <Typography
            sx={{
              color: "#64748b",
              fontSize: 13,
            }}
          >
            © {new Date().getFullYear()} The Business Ticket. Todos los
            derechos reservados.
          </Typography>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={{
              xs: 1,
              sm: 2.5,
            }}
          >
            <FooterLegalLink label="Aviso de privacidad" />
            <FooterLegalLink label="Términos y condiciones" />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function FooterColumn({ titulo, enlaces }) {
  return (
    <Stack spacing={2}>
      <Typography
        sx={{
          color: "#ffffff",
          fontSize: 15,
          fontWeight: 900,
        }}
      >
        {titulo}
      </Typography>

      <Stack spacing={1.4}>
        {enlaces.map((enlace) => (
          <Typography
            key={enlace.to}
            component={RouterLink}
            to={enlace.to}
            sx={{
              width: "fit-content",
              color: "#94a3b8",
              fontSize: 14,
              textDecoration: "none",
              transition: "color 150ms ease",
              "&:hover": {
                color: "#ffffff",
              },
            }}
          >
            {enlace.label}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}

function SocialButton({ label, icon }) {
  return (
    <IconButton
      type="button"
      aria-label={label}
      sx={{
        width: 40,
        height: 40,
        color: "#94a3b8",
        bgcolor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        borderRadius: 2,
        "&:hover": {
          color: "#ffffff",
          bgcolor: "rgba(37, 99, 235, 0.24)",
          borderColor: "rgba(96, 165, 250, 0.38)",
        },
      }}
    >
      {icon}
    </IconButton>
  );
}

function FooterLegalLink({ label }) {
  return (
    <Typography
      component="button"
      type="button"
      sx={{
        p: 0,
        border: 0,
        bgcolor: "transparent",
        color: "#64748b",
        fontFamily: "inherit",
        fontSize: 13,
        cursor: "pointer",
        textAlign: "left",
        transition: "color 150ms ease",
        "&:hover": {
          color: "#ffffff",
        },
      }}
    >
      {label}
    </Typography>
  );
}

export default LandingFooter;