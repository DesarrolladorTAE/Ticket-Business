import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";

import axiosCliente from "../../../services/axiosCliente";

const formatNumber = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("es-MX").format(number);
};

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getCurrentMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    dateFrom: formatDateInput(firstDay),
    dateTo: formatDateInput(lastDay),
  };
};

const getPreviousMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);

  return {
    dateFrom: formatDateInput(firstDay),
    dateTo: formatDateInput(lastDay),
  };
};

const formatPeriodLabel = (period) => {
  if (!period?.date_from || !period?.date_to) {
    return "Periodo no disponible";
  }

  return `${period.date_from} al ${period.date_to}`;
};

const normalizeRoleKey = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

function MetricCard({ title, value, description }) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
      }}
    >
      <CardContent>
        <Typography
          variant="body2"
          sx={{
            color: "#64748b",
            fontWeight: 700,
            mb: 1,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: "#0f172a",
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          {formatNumber(value)}
        </Typography>

        {description && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "#64748b",
              mt: 1,
            }}
          >
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function DataList({ title, items, emptyText }) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "none",
        height: "100%",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          color: "#0f172a",
          mb: 1.5,
        }}
      >
        {title}
      </Typography>

      <Stack spacing={1}>
        {items?.length ? (
          items.map((item, index) => (
            <Box key={`${item.label}-${index}`}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#334155",
                    fontWeight: 600,
                    wordBreak: "break-word",
                  }}
                >
                  {item.label || "Sin dato"}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#0f172a",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatNumber(item.total)}
                </Typography>
              </Stack>

              {index < items.length - 1 && <Divider sx={{ mt: 1 }} />}
            </Box>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
            }}
          >
            {emptyText || "No hay información disponible."}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function PersonMetricsList({ title, items, emptyText }) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "none",
        height: "100%",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          color: "#0f172a",
          mb: 1.5,
        }}
      >
        {title}
      </Typography>

      <Stack spacing={1.5}>
        {items?.length ? (
          items.map((item, index) => (
            <Box key={`${item.user_id}-${index}`}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      color: "#0f172a",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.name || "Sin nombre"}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "#64748b",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.email || "Sin correo"}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1.2}
                  sx={{
                    flexWrap: "wrap",
                    rowGap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#334155",
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Total: {formatNumber(item.total_tickets)}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "#334155",
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Abiertos: {formatNumber(item.open_tickets)}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "#334155",
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Resueltos: {formatNumber(item.resolved_tickets)}
                  </Typography>
                </Stack>
              </Stack>

              {index < items.length - 1 && <Divider sx={{ mt: 1.5 }} />}
            </Box>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
            }}
          >
            {emptyText || "No hay información disponible."}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function LatestExternalTickets({ tickets }) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "none",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          color: "#0f172a",
          mb: 1.5,
        }}
      >
        Últimos tickets externos
      </Typography>

      <Stack spacing={1.5}>
        {tickets?.length ? (
          tickets.map((ticket, index) => (
            <Box key={`${ticket.folio}-${index}`}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  wordBreak: "break-word",
                }}
              >
                {ticket.folio}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#334155",
                  wordBreak: "break-word",
                }}
              >
                {ticket.titulo}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  display: "block",
                  mt: 0.5,
                }}
              >
                {ticket.system || "Sin sistema"} ·{" "}
                {ticket.status || "Sin estado"}
              </Typography>

              {index < tickets.length - 1 && <Divider sx={{ mt: 1.5 }} />}
            </Box>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
            }}
          >
            No hay tickets externos recientes.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function LatestApiErrors({ errors }) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "none",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          color: "#0f172a",
          mb: 1.5,
        }}
      >
        Últimos errores de API
      </Typography>

      <Stack spacing={1.5}>
        {errors?.length ? (
          errors.map((error, index) => (
            <Box key={`${error.endpoint}-${index}`}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  wordBreak: "break-word",
                }}
              >
                {error.method} · {error.status_code || "Sin código"}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#334155",
                  wordBreak: "break-word",
                }}
              >
                {error.endpoint}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  display: "block",
                  mt: 0.5,
                  wordBreak: "break-word",
                }}
              >
                {error.error_message ||
                  error.error_code ||
                  "Error sin descripción"}
              </Typography>

              {index < errors.length - 1 && <Divider sx={{ mt: 1.5 }} />}
            </Box>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
            }}
          >
            No hay errores recientes de API.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function LatestUnassignedTickets({ tickets, onViewTicket }) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "none",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          color: "#0f172a",
          mb: 1.5,
        }}
      >
        Tickets pendientes de asignación
      </Typography>

      <Stack spacing={1.5}>
        {tickets?.length ? (
          tickets.map((ticket, index) => (
            <Box key={`${ticket.folio}-${index}`}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1.5}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      color: "#0f172a",
                      wordBreak: "break-word",
                    }}
                  >
                    {ticket.folio}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#334155",
                      wordBreak: "break-word",
                    }}
                  >
                    {ticket.titulo}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    {ticket.system || "Sin sistema"} ·{" "}
                    {ticket.status || "Sin estado"}
                  </Typography>
                </Box>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onViewTicket(ticket.id)}
                  disabled={!ticket.id || !onViewTicket}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    alignSelf: { xs: "stretch", sm: "center" },
                  }}
                >
                  Ver ticket
                </Button>
              </Stack>

              {index < tickets.length - 1 && <Divider sx={{ mt: 1.5 }} />}
            </Box>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
            }}
          >
            No hay tickets pendientes de asignación.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function AdminControlPanel({ admin, onViewTicket, canSeeTechnicalMetrics }) {
  const alerts = admin?.alerts || {};

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #dbeafe",
        bgcolor: "#f8fbff",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            Control operativo
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
            }}
          >
            Vista para revisar asignaciones, agentes, clientes y seguimiento del
            periodo.
          </Typography>
        </Box>

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
          <MetricCard
            title="Sin responsable"
            value={alerts.tickets_without_responsible}
            description="Tickets sin agente asignado"
          />

          <MetricCard
            title="Abiertos sin responsable"
            value={alerts.open_tickets_without_responsible}
            description="Pendientes de asignación"
          />

          <MetricCard
            title="Sin grupo"
            value={alerts.tickets_without_group}
            description="Tickets sin grupo de soporte"
          />

          <MetricCard
            title="Sistemas con tickets"
            value={alerts.systems_with_tickets}
            description="Sistemas con actividad en el periodo"
          />

          {canSeeTechnicalMetrics && (
            <MetricCard
              title="Tokens activos"
              value={alerts.active_external_tokens}
              description="Tokens externos activos"
            />
          )}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <PersonMetricsList
            title="Tickets por agente"
            items={admin?.agents}
            emptyText="No hay tickets asignados a agentes en este periodo."
          />

          <PersonMetricsList
            title="Tickets por cliente"
            items={admin?.customers}
            emptyText="No hay clientes con tickets en este periodo."
          />
        </Box>

        <LatestUnassignedTickets
          tickets={admin?.latest_unassigned_tickets}
          onViewTicket={onViewTicket}
        />
      </Stack>
    </Paper>
  );
}

export default function GeneralMetricsDashboard() {
  const navigate = useNavigate();

  const initialRange = getCurrentMonthRange();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState(null);

  const [dateFrom, setDateFrom] = useState(initialRange.dateFrom);
  const [dateTo, setDateTo] = useState(initialRange.dateTo);

  const validateDateRange = (range) => {
    if (!range.dateFrom || !range.dateTo) {
      return "Selecciona fecha inicial y fecha final.";
    }

    if (range.dateFrom > range.dateTo) {
      return "La fecha inicial no puede ser mayor que la fecha final.";
    }

    return "";
  };

  const loadMetrics = async ({
    refresh = false,
    range = {
      dateFrom,
      dateTo,
    },
  } = {}) => {
    const validationMessage = validateDateRange(range);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await axiosCliente.get("/general-metrics/summary", {
        params: {
          date_from: range.dateFrom,
          date_to: range.dateTo,
        },
      });

      setMetrics(response.data);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "No se pudieron cargar las métricas generales.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const aplicarFiltros = () => {
    loadMetrics({
      refresh: true,
      range: {
        dateFrom,
        dateTo,
      },
    });
  };

  const aplicarMesActual = () => {
    const range = getCurrentMonthRange();

    setDateFrom(range.dateFrom);
    setDateTo(range.dateTo);

    loadMetrics({
      refresh: true,
      range,
    });
  };

  const aplicarMesAnterior = () => {
    const range = getPreviousMonthRange();

    setDateFrom(range.dateFrom);
    setDateTo(range.dateTo);

    loadMetrics({
      refresh: true,
      range,
    });
  };

  useEffect(() => {
    loadMetrics({
      range: initialRange,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = metrics?.summary || {};
  const context = metrics?.context || {};
  const period = metrics?.period || {};
  const admin = metrics?.admin || {};

  const roleKey = normalizeRoleKey(context?.role_key);

  const isAdmin = roleKey === "admin" || roleKey === "administrador";
  const isSupervisor = roleKey === "supervisor";
  const isAgent = roleKey === "agent" || roleKey === "agente";
  const isClient = roleKey === "client" || roleKey === "cliente";

  const canSeeOperationalControl = isAdmin || isSupervisor;
  const canSeeOriginMetrics = isAdmin || isSupervisor;
  const canSeeApiMetrics = isAdmin && Boolean(context?.can_see_api_metrics);

  const verTicket = (ticketId) => {
    if (!ticketId) return;

    navigate(`/tickets/${ticketId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                mb: 0.5,
              }}
            >
              Métricas generales
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
              }}
            >
              Resumen operativo según el rol del usuario conectado.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={
              refreshing ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
            onClick={() =>
              loadMetrics({
                refresh: true,
                range: {
                  dateFrom,
                  dateTo,
                },
              })
            }
            disabled={loading || refreshing}
            sx={{
              alignSelf: { xs: "stretch", sm: "center" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              px: 2.5,
              py: 1,
              boxShadow: "none",
              bgcolor: "#2563eb",
              "&:hover": {
                bgcolor: "#1d4ed8",
                boxShadow: "none",
              },
            }}
          >
            {refreshing ? "Actualizando..." : "Actualizar métricas"}
          </Button>
        </Stack>

        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            boxShadow: "none",
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                Filtros de periodo
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                }}
              >
                Periodo consultado: {formatPeriodLabel(period)}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                label="Desde"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
                fullWidth
              />

              <TextField
                label="Hasta"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
                fullWidth
              />

              <Button
                variant="contained"
                onClick={aplicarFiltros}
                disabled={loading || refreshing}
                sx={{
                  minWidth: { xs: "100%", md: 150 },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  boxShadow: "none",
                  bgcolor: "#0f172a",
                  "&:hover": {
                    bgcolor: "#111827",
                    boxShadow: "none",
                  },
                }}
              >
                Aplicar filtros
              </Button>

              <Button
                variant="outlined"
                onClick={aplicarMesActual}
                disabled={loading || refreshing}
                sx={{
                  minWidth: { xs: "100%", md: 120 },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                Este mes
              </Button>

              <Button
                variant="outlined"
                onClick={aplicarMesAnterior}
                disabled={loading || refreshing}
                sx={{
                  minWidth: { xs: "100%", md: 130 },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                Mes anterior
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {metrics && (
          <>
            <Alert severity="info">
              {isAdmin &&
                "Vista de administrador: puedes consultar las métricas generales de la empresa y el control operativo de agentes y clientes."}

              {isSupervisor &&
                "Vista de supervisor: puedes consultar métricas operativas, tickets, agentes, clientes y seguimiento general."}

              {isAgent &&
                "Vista de agente: puedes consultar las métricas de tus tickets asignados."}

              {isClient &&
                "Vista de cliente: puedes consultar únicamente las métricas de tus propios tickets."}
            </Alert>

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
              <MetricCard
                title="Total de tickets"
                value={summary.total_tickets}
                description="Tickets visibles para este usuario"
              />

              <MetricCard
                title="Tickets abiertos"
                value={summary.open_tickets}
                description="Pendientes o en proceso"
              />

              <MetricCard
                title="Tickets resueltos"
                value={summary.resolved_tickets}
                description="Resueltos o cerrados"
              />

              {canSeeOriginMetrics && (
                <MetricCard
                  title="Tickets externos"
                  value={summary.external_tickets}
                  description="Creados desde API externa"
                />
              )}

              {canSeeOriginMetrics && (
                <MetricCard
                  title="Tickets internos"
                  value={summary.internal_tickets}
                  description="Creados desde el panel"
                />
              )}

              {canSeeOriginMetrics && (
                <MetricCard
                  title="Tickets públicos"
                  value={summary.public_tickets}
                  description="Creados desde portal público"
                />
              )}

              {canSeeOriginMetrics && (
                <MetricCard
                  title="Clientes externos"
                  value={summary.external_customers}
                  description="Clientes registrados por integración"
                />
              )}

              {canSeeApiMetrics && (
                <MetricCard
                  title="Errores API"
                  value={summary.api_errors}
                  description="Errores registrados en integraciones"
                />
              )}

              {canSeeApiMetrics && (
                <MetricCard
                  title="Solicitudes API"
                  value={summary.api_requests}
                  description="Consumo registrado de API externa"
                />
              )}
            </Box>

            {canSeeOperationalControl && (
              <AdminControlPanel
                admin={admin}
                onViewTicket={verTicket}
                canSeeTechnicalMetrics={isAdmin}
              />
            )}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <DataList
                title="Tickets por sistema"
                items={metrics.tickets_by_system}
              />

              <DataList
                title="Tickets por estado"
                items={metrics.tickets_by_status}
              />

              <DataList
                title="Tickets por categoría"
                items={metrics.tickets_by_category}
              />
            </Box>

            {(canSeeOriginMetrics || canSeeApiMetrics) && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    lg:
                      canSeeOriginMetrics && canSeeApiMetrics
                        ? "repeat(2, minmax(0, 1fr))"
                        : "1fr",
                  },
                  gap: 2,
                }}
              >
                {canSeeOriginMetrics && (
                  <LatestExternalTickets
                    tickets={metrics.latest_external_tickets}
                  />
                )}

                {canSeeApiMetrics && (
                  <LatestApiErrors errors={metrics.latest_api_errors} />
                )}
              </Box>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}