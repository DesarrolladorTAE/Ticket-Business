import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BusinessIcon from "@mui/icons-material/Business";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

const logoUrl =
  "https://api.thebusinessticket.com/images/email/the-business-ticket.png";

const normalizarRol = (rol) =>
  String(rol || "")
    .trim()
    .toLowerCase();

const obtenerNombreRol = (rol) => {
  const roles = {
    admin: "Administrador",
    administrador: "Administrador",
    supervisor: "Supervisor",
    agent: "Agente",
    agente: "Agente",
    client: "Cliente",
    cliente: "Cliente",
  };

  return roles[normalizarRol(rol)] || rol || "Sin rol";
};

const obtenerIniciales = (nombre) => {
  const partes = String(nombre || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!partes.length) {
    return "TB";
  }

  return partes
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
};

const obtenerEstiloRol = (rol) => {
  const role = normalizarRol(rol);

  if (role === "admin" || role === "administrador") {
    return {
      bgcolor: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    };
  }

  if (role === "supervisor") {
    return {
      bgcolor: "#faf5ff",
      color: "#7e22ce",
      border: "1px solid #e9d5ff",
    };
  }

  if (role === "agent" || role === "agente") {
    return {
      bgcolor: "#fff7ed",
      color: "#c2410c",
      border: "1px solid #fed7aa",
    };
  }

  return {
    bgcolor: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
  };
};

const obtenerEstiloVencimiento = (daysRemaining) => {
  const dias = Number(daysRemaining);

  if (dias <= 0) {
    return {
      bgcolor: "#fef2f2",
      color: "#b91c1c",
      borderColor: "#fecaca",
      dotColor: "#dc2626",
    };
  }

  if (dias === 1) {
    return {
      bgcolor: "#fff7ed",
      color: "#c2410c",
      borderColor: "#fed7aa",
      dotColor: "#ea580c",
    };
  }

  return {
    bgcolor: "#fffbeb",
    color: "#a16207",
    borderColor: "#fde68a",
    dotColor: "#ca8a04",
  };
};

export default function SeleccionEmpresaView({
  cuentas = [],
  seleccionando = null,
  error = "",
  onSeleccionar,
  onVolver,
  textoVolver = "Volver",
  currentCompanyUserId = null,
}) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#f4f7fb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          py: {
            xs: 1.5,
            sm: 1.8,
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1040,
            mx: "auto",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={logoUrl}
            alt="The Business Ticket"
            sx={{
              height: {
                xs: 44,
                sm: 50,
              },
              maxWidth: {
                xs: 210,
                sm: 250,
              },
              width: "auto",
              objectFit: "contain",
            }}
          />
        </Box>
      </Box>

      {/* CONTENIDO */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: 1040,
          mx: "auto",
          px: {
            xs: 1.7,
            sm: 3,
            md: 4,
          },
          py: {
            xs: 3,
            sm: 4,
            md: 5,
          },
        }}
      >
        {onVolver && (
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={onVolver}
            disabled={seleccionando !== null}
            sx={{
              mb: {
                xs: 2,
                sm: 2.5,
              },
              px: 0.5,
              textTransform: "none",
              color: "#475569",
              fontWeight: 800,
              fontSize: 14,
              "&:hover": {
                bgcolor: "transparent",
                color: "#1d4ed8",
              },
            }}
          >
            {textoVolver}
          </Button>
        )}

        {/* CABECERA DE LA VISTA */}
        <Box
          sx={{
            mb: {
              xs: 3,
              md: 3.5,
            },
          }}
        >
          <Typography
            component="h1"
            fontWeight={900}
            sx={{
              color: "#0f172a",
              fontSize: {
                xs: 27,
                sm: 32,
                md: 36,
              },
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Selecciona tu empresa
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#64748b",
              fontSize: {
                xs: 14,
                sm: 15,
                md: 16,
              },
              lineHeight: 1.6,
              maxWidth: 760,
            }}
          >
            Elige el espacio de trabajo donde deseas continuar. También puedes
            revisar si tienes tickets próximos a vencer antes de ingresar.
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2.5,
              fontWeight: 700,
            }}
          >
            {error}
          </Alert>
        )}

        {/* EMPRESAS */}
        <Stack spacing={2.2}>
          {cuentas.map((cuenta) => {
            const companyName =
              cuenta.company_name ||
              cuenta.company_business_name ||
              `Empresa ${cuenta.company_id}`;

            const seleccionActual = seleccionando === cuenta.company_user_id;

            const esEmpresaActual =
              currentCompanyUserId !== null &&
              Number(currentCompanyUserId) === Number(cuenta.company_user_id);

            const upcoming = cuenta.upcoming_tickets || {};

            const tickets = Array.isArray(upcoming.items) ? upcoming.items : [];

            const totalTickets = Number(upcoming.count || 0);

            const adicionales = Math.max(totalTickets - tickets.length, 0);

            const roleStyle = obtenerEstiloRol(cuenta.role);

            return (
              <Paper
                key={cuenta.company_user_id}
                elevation={0}
                sx={{
                  overflow: "hidden",
                  border: esEmpresaActual
                    ? "1px solid #93c5fd"
                    : "1px solid #e2e8f0",
                  borderRadius: {
                    xs: 3,
                    sm: 3.5,
                  },
                  bgcolor: "#ffffff",
                  boxShadow: esEmpresaActual
                    ? "0 8px 28px rgba(37, 99, 235, 0.08)"
                    : "0 4px 18px rgba(15, 23, 42, 0.04)",
                  transition:
                    "border-color .2s ease, box-shadow .2s ease, transform .2s ease",
                  "&:hover": {
                    borderColor: "#93c5fd",
                    boxShadow: "0 12px 34px rgba(15, 23, 42, 0.08)",
                    transform: {
                      xs: "none",
                      md: "translateY(-1px)",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    p: {
                      xs: 2,
                      sm: 2.5,
                      md: 3,
                    },
                  }}
                >
                  {/* EMPRESA + ROL */}
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{
                      xs: "stretch",
                      sm: "flex-start",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={{
                        xs: 1.5,
                        sm: 2,
                      }}
                      sx={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: {
                            xs: 48,
                            sm: 54,
                          },
                          height: {
                            xs: 48,
                            sm: 54,
                          },
                          flexShrink: 0,
                          borderRadius: 2.5,
                          bgcolor: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#1d4ed8",
                          fontWeight: 900,
                          fontSize: {
                            xs: 16,
                            sm: 18,
                          },
                        }}
                      >
                        {companyName ? (
                          obtenerIniciales(companyName)
                        ) : (
                          <BusinessIcon />
                        )}
                      </Box>

                      <Box
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={{
                            xs: 0.8,
                            sm: 1,
                          }}
                          alignItems={{
                            xs: "flex-start",
                            sm: "center",
                          }}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Typography
                            fontWeight={900}
                            sx={{
                              color: "#0f172a",
                              fontSize: {
                                xs: 17,
                                sm: 18,
                              },
                              lineHeight: 1.3,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {companyName}
                          </Typography>

                          {esEmpresaActual && (
                            <Chip
                              size="small"
                              label="Empresa actual"
                              sx={{
                                height: 24,
                                bgcolor: "#dbeafe",
                                color: "#1d4ed8",
                                border: "1px solid #bfdbfe",
                                fontWeight: 800,
                                fontSize: 11,
                              }}
                            />
                          )}
                        </Stack>

                        {cuenta.company_business_name &&
                          cuenta.company_business_name !==
                            cuenta.company_name && (
                            <Typography
                              sx={{
                                mt: 0.35,
                                color: "#64748b",
                                fontSize: {
                                  xs: 13,
                                  sm: 14,
                                },
                                lineHeight: 1.45,
                                overflowWrap: "anywhere",
                              }}
                            >
                              {cuenta.company_business_name}
                            </Typography>
                          )}

                        <Chip
                          size="small"
                          label={obtenerNombreRol(cuenta.role)}
                          sx={{
                            mt: 1.1,
                            height: 27,
                            ...roleStyle,
                            fontWeight: 900,
                            borderRadius: 1.8,
                          }}
                        />
                      </Box>
                    </Stack>
                  </Stack>

                  {/* SEPARADOR */}
                  <Box
                    sx={{
                      my: {
                        xs: 2,
                        sm: 2.2,
                      },
                      borderTop: "1px solid #edf2f7",
                    }}
                  />

                  {/* TICKETS PRÓXIMOS A VENCER */}
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        mb: totalTickets > 0 ? 1.3 : 0,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.8}
                        alignItems="center"
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <AccessTimeIcon
                          sx={{
                            fontSize: 19,
                            color: "#64748b",
                            flexShrink: 0,
                          }}
                        />

                        <Typography
                          fontWeight={900}
                          sx={{
                            color: "#334155",
                            fontSize: {
                              xs: 13.5,
                              sm: 14,
                            },
                          }}
                        >
                          Próximos a vencer
                        </Typography>
                      </Stack>

                      {totalTickets > 0 && (
                        <Chip
                          size="small"
                          label={totalTickets}
                          sx={{
                            minWidth: 29,
                            height: 25,
                            bgcolor: "#f1f5f9",
                            color: "#334155",
                            fontWeight: 900,
                          }}
                        />
                      )}
                    </Stack>

                    {totalTickets === 0 ? (
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{
                          mt: 1.2,
                          p: {
                            xs: 1.4,
                            sm: 1.6,
                          },
                          borderRadius: 2.2,
                          bgcolor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            flexShrink: 0,
                            borderRadius: "50%",
                            bgcolor: "#dcfce7",
                            color: "#16a34a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 900,
                            lineHeight: 1,
                          }}
                        >
                          ✓
                        </Box>

                        <Typography
                          sx={{
                            color: "#64748b",
                            fontWeight: 700,
                            fontSize: {
                              xs: 13,
                              sm: 13.5,
                            },
                          }}
                        >
                          Sin tickets próximos a vencer
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack spacing={1}>
                        {tickets.map((ticket) => {
                          const dueStyle = obtenerEstiloVencimiento(
                            ticket.days_remaining,
                          );

                          return (
                            <Box
                              key={ticket.id}
                              sx={{
                                p: {
                                  xs: 1.4,
                                  sm: 1.6,
                                },
                                borderRadius: 2.2,
                                bgcolor: dueStyle.bgcolor,
                                border: `1px solid ${dueStyle.borderColor}`,
                              }}
                            >
                              <Stack
                                direction={{
                                  xs: "column",
                                  sm: "row",
                                }}
                                spacing={{
                                  xs: 0.8,
                                  sm: 2,
                                }}
                                justifyContent="space-between"
                                alignItems={{
                                  xs: "flex-start",
                                  sm: "center",
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{
                                    minWidth: 0,
                                    flex: 1,
                                  }}
                                >
                                  <WarningAmberRoundedIcon
                                    sx={{
                                      color: dueStyle.dotColor,
                                      fontSize: 20,
                                      flexShrink: 0,
                                      mt: "2px",
                                    }}
                                  />

                                  <Box
                                    sx={{
                                      minWidth: 0,
                                    }}
                                  >
                                    <Typography
                                      fontWeight={900}
                                      sx={{
                                        color: "#0f172a",
                                        fontSize: {
                                          xs: 12.5,
                                          sm: 13.5,
                                        },
                                        overflowWrap: "anywhere",
                                      }}
                                    >
                                      {ticket.folio}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        mt: 0.25,
                                        color: "#475569",
                                        fontSize: {
                                          xs: 12.5,
                                          sm: 13,
                                        },
                                        lineHeight: 1.4,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {ticket.titulo || "Ticket sin título"}
                                    </Typography>
                                  </Box>
                                </Stack>

                                <Chip
                                  size="small"
                                  label={ticket.due_label || "Próximo a vencer"}
                                  sx={{
                                    flexShrink: 0,
                                    height: 26,
                                    bgcolor: "#ffffff",
                                    color: dueStyle.color,
                                    border: `1px solid ${dueStyle.borderColor}`,
                                    fontWeight: 900,
                                    fontSize: 11.5,
                                  }}
                                />
                              </Stack>
                            </Box>
                          );
                        })}

                        {adicionales > 0 && (
                          <Typography
                            sx={{
                              pt: 0.3,
                              color: "#64748b",
                              fontSize: 12.5,
                              fontWeight: 800,
                            }}
                          >
                            + {adicionales}{" "}
                            {adicionales === 1
                              ? "ticket más próximo a vencer"
                              : "tickets más próximos a vencer"}
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </Box>

                  {/* BOTÓN */}
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    justifyContent="flex-end"
                    sx={{
                      mt: {
                        xs: 2,
                        sm: 2.3,
                      },
                    }}
                  >
                    <Button
                      variant="contained"
                      disabled={seleccionando !== null}
                      onClick={() => onSeleccionar(cuenta)}
                      endIcon={seleccionActual ? null : <ArrowForwardIcon />}
                      startIcon={
                        seleccionActual ? (
                          <CircularProgress
                            size={17}
                            sx={{
                              color: "#ffffff",
                            }}
                          />
                        ) : null
                      }
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "auto",
                        },
                        minWidth: {
                          sm: 155,
                        },
                        minHeight: 44,
                        px: 2.5,
                        borderRadius: 2.3,
                        textTransform: "none",
                        fontWeight: 900,
                        bgcolor: "#2563eb",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "#1d4ed8",
                          boxShadow: "none",
                        },
                      }}
                    >
                      {seleccionActual
                        ? "Entrando..."
                        : esEmpresaActual
                          ? "Continuar"
                          : "Ingresar"}
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          borderTop: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          py: {
            xs: 1.5,
            sm: 1.8,
          },
          px: 2,
          textAlign: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#94a3b8",
            fontWeight: 600,
            fontSize: {
              xs: 10.5,
              sm: 11.5,
            },
          }}
        >
          The Business Ticket · Tecnologías Administrativas ELAD
        </Typography>
      </Box>
    </Box>
  );
}
