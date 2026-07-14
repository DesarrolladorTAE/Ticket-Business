import { useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import KeyIcon from "@mui/icons-material/Key";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ApiIcon from "@mui/icons-material/Api";

import ExternalApiTokens from "./ExternalApiTokens";
import ExternalApiLogs from "./ExternalApiLogs";
import ExternalApiEndpoints from "./ExternalApiEndpoints";

const PDF_URL = "/docs/guia-api-demo.pdf";

const TABS = {
  TOKENS: 0,
  LOGS: 1,
  ENDPOINTS: 2,
  DOCUMENTATION: 3,
};

function TabPanel({ value, index, children }) {
  if (value !== index) return null;

  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export default function ExternalApiDashboard() {
  const [tab, setTab] = useState(TABS.TOKENS);

  const cambiarTab = (_, nuevoValor) => {
    setTab(nuevoValor);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <Stack spacing={2.5}>
        <Paper
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                fontWeight={900}
                sx={{
                  fontSize: { xs: 26, md: 34 },
                  lineHeight: 1.15,
                }}
              >
                Dashboard API externa
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Administra tokens, revisa logs de consumo, consulta endpoints
                de prueba y descarga la documentación para desarrolladores.
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
              sx={{
                flexShrink: 0,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setTab(TABS.DOCUMENTATION)}
                size="small"
                sx={{
                  minHeight: 32,
                  px: 1.6,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                }}
              >
                Ver PDF
              </Button>

              <Button
                variant="contained"
                component="a"
                href={PDF_URL}
                download
                size="small"
                sx={{
                  minHeight: 32,
                  px: 1.6,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                }}
              >
                Descargar PDF
              </Button>
            </Stack>
          </Stack>
        </Paper>

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
          <Card
            onClick={() => setTab(TABS.TOKENS)}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              border:
                tab === TABS.TOKENS
                  ? "1px solid #2563eb"
                  : "1px solid #e5e7eb",
              boxShadow:
                tab === TABS.TOKENS
                  ? "0 10px 24px rgba(37, 99, 235, 0.12)"
                  : "0 8px 22px rgba(15, 23, 42, 0.05)",
              transition: "all 0.18s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
              },
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <KeyIcon color="primary" />

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900}>Tokens externos</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Administra accesos por sistema.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            onClick={() => setTab(TABS.LOGS)}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              border:
                tab === TABS.LOGS
                  ? "1px solid #2563eb"
                  : "1px solid #e5e7eb",
              boxShadow:
                tab === TABS.LOGS
                  ? "0 10px 24px rgba(37, 99, 235, 0.12)"
                  : "0 8px 22px rgba(15, 23, 42, 0.05)",
              transition: "all 0.18s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
              },
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ReceiptLongIcon color="primary" />

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900}>Logs externos</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Consulta consumos y errores.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            onClick={() => setTab(TABS.ENDPOINTS)}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              border:
                tab === TABS.ENDPOINTS
                  ? "1px solid #2563eb"
                  : "1px solid #e5e7eb",
              boxShadow:
                tab === TABS.ENDPOINTS
                  ? "0 10px 24px rgba(37, 99, 235, 0.12)"
                  : "0 8px 22px rgba(15, 23, 42, 0.05)",
              transition: "all 0.18s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
              },
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ApiIcon color="primary" />

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900}>Endpoints</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Consulta ejemplos de prueba.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            onClick={() => setTab(TABS.DOCUMENTATION)}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              border:
                tab === TABS.DOCUMENTATION
                  ? "1px solid #2563eb"
                  : "1px solid #e5e7eb",
              boxShadow:
                tab === TABS.DOCUMENTATION
                  ? "0 10px 24px rgba(37, 99, 235, 0.12)"
                  : "0 8px 22px rgba(15, 23, 42, 0.05)",
              transition: "all 0.18s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
              },
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <DescriptionIcon color="primary" />

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900}>Documentación</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Guía técnica descargable.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Paper
          sx={{
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
          }}
        >
          <Tabs
            value={tab}
            onChange={cambiarTab}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              borderBottom: "1px solid #e5e7eb",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 900,
                minHeight: 56,
              },
            }}
          >
            <Tab label="Tokens externos" />
            <Tab label="Logs externos" />
            <Tab label="Endpoints / Pruebas" />
            <Tab label="Documentación PDF" />
          </Tabs>

          <Box sx={{ p: { xs: 1, md: 2 } }}>
            <TabPanel value={tab} index={TABS.TOKENS}>
              <ExternalApiTokens />
            </TabPanel>

            <TabPanel value={tab} index={TABS.LOGS}>
              <ExternalApiLogs />
            </TabPanel>

            <TabPanel value={tab} index={TABS.ENDPOINTS}>
              <ExternalApiEndpoints />
            </TabPanel>

            <TabPanel value={tab} index={TABS.DOCUMENTATION}>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", md: "center" }}
                  spacing={1.5}
                >
                  <Box>
                    <Typography fontWeight={900} sx={{ fontSize: 22 }}>
                      Guía de integración para desarrolladores
                    </Typography>

                    <Typography color="text.secondary">
                      Documento técnico con endpoints, autenticación, estructura
                      de datos, ejemplos de consumo y checklist de validación.
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent={{ xs: "flex-start", md: "flex-end" }}
                    sx={{
                      flexShrink: 0,
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      variant="outlined"
                      component="a"
                      href={PDF_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{
                        minHeight: 32,
                        px: 1.6,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Abrir PDF
                    </Button>

                    <Button
                      variant="contained"
                      component="a"
                      href={PDF_URL}
                      download
                      size="small"
                      sx={{
                        minHeight: 32,
                        px: 1.6,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Descargar PDF
                    </Button>
                  </Stack>
                </Stack>

                <Box
                  component="iframe"
                  src={PDF_URL}
                  title="Documentación API externa"
                  sx={{
                    width: "100%",
                    minHeight: { xs: 420, md: 680 },
                    border: "1px solid #e5e7eb",
                    borderRadius: 2,
                    bgcolor: "#f8fafc",
                  }}
                />
              </Stack>
            </TabPanel>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}