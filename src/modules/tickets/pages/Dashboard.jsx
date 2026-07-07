import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [data, setData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setError("");

      const [resDashboard, resTickets] = await Promise.all([
        axiosCliente.get("/tickets-dashboard"),
        axiosCliente.get("/tickets"),
      ]);

      setData(resDashboard.data.data || {});
      setTickets(resTickets.data.data || resTickets.data || []);
    } catch (error) {
      console.log("ERROR DASHBOARD:", error.response?.data || error);

      setError(
        error.response?.data?.message ||
          "No se pudo cargar la información del dashboard",
      );
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  const actualizarDashboard = () => {
    setActualizando(true);
    cargarDashboard();
  };

  const colorEstado = (estado) => {
    const valor = String(estado || "").toLowerCase();

    if (valor.includes("cerr")) return "success";
    if (valor.includes("resuelto")) return "success";
    if (valor.includes("proceso")) return "warning";
    if (valor.includes("abiert")) return "primary";
    if (valor.includes("pendiente")) return "primary";
    if (valor.includes("reciente")) return "info";

    return "default";
  };

  const nombreEstado = (ticket) =>
    ticket.status?.nombre || ticket.status?.name || ticket.status || "Abierto";

  const nombreSistema = (ticket) =>
    ticket.system?.nombre || ticket.sistema?.nombre || "Sin sistema";

  const folioTicket = (ticket) => {
    if (ticket.folio) return ticket.folio;

    if (ticket.folio_prefijo || ticket.folio_numero) {
      return `${ticket.folio_prefijo || "TCK"}-${
        ticket.folio_numero || ticket.id
      }`;
    }

    return `#${ticket.id}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = data?.stats || {};
  const chart = data?.chart || [];

  const total = stats.total ?? 0;
  const abiertos = stats.abiertos ?? 0;
  const proceso = stats.proceso ?? 0;
  const cerrados = stats.cerrados ?? 0;

  const ticketsRecientes = tickets.slice(0, 10);

  const maxDia = chart.length
    ? Math.max(...chart.map((item) => Number(item.total || 0)))
    : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        flexDirection={{ xs: "column", sm: "row" }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ fontSize: { xs: 22, md: 26 } }}
          >
            Dashboard
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Resumen general de tickets registrados en el sistema.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={actualizarDashboard}
          disabled={actualizando}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {actualizando ? "Actualizando..." : "Actualizar"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1.5, md: 3 },
          mb: 4,
        }}
      >
        <StatCard
          titulo="Total"
          valor={total}
          chip="Tickets"
          icon={<ConfirmationNumberIcon />}
          accent="#2563eb"
        />

        <StatCard
          titulo="Abiertos"
          valor={abiertos}
          chip="Pendientes"
          color="primary"
          icon={<PendingActionsIcon />}
          accent="#1d4ed8"
        />

        <StatCard
          titulo="En proceso"
          valor={proceso}
          chip="Activos"
          color="warning"
          icon={<AutorenewIcon />}
          accent="#f97316"
        />

        <StatCard
          titulo="Cerrados"
          valor={cerrados}
          chip="Finalizados"
          color="success"
          icon={<CheckCircleIcon />}
          accent="#16a34a"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(620px, 780px) 1fr",
          },
          gap: { xs: 2, md: 3 },
          alignItems: "start",
        }}
      >
        <Paper sx={chartSectionStyle}>
          <Box
            mb={2.5}
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            gap={2}
          >
            <Box>
              <Typography
                fontWeight={900}
                sx={{ fontSize: { xs: 18, md: 21 } }}
              >
                Tickets por día
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Evolución diaria de tickets creados.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Chip
                label={`${chart.length} días registrados`}
                variant="outlined"
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                }}
              />

              <Chip
                label={`Máximo diario: ${maxDia}`}
                color="primary"
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                }}
              />
            </Stack>
          </Box>

          {chart.length > 0 ? (
            <Box
              sx={{
                width: "100%",
                overflowX: { xs: "auto", md: "hidden" },
                mt: { xs: 2.5, md: 3 },
                pb: { xs: 1, md: 2 },
              }}
            >
              <Box
                sx={{
                  width: { xs: 560, md: "100%" },
                  minWidth: { xs: 560, md: 0 },
                  height: { xs: 320, sm: 360, md: 410 },
                  px: { xs: 1, md: 2 },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chart}
                    margin={{
                      top: 35,
                      right: 35,
                      left: -5,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#e5e7eb"
                    />

                    <XAxis
                      dataKey="fecha"
                      tick={{
                        fontSize: 11,
                        fill: "#64748b",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                        fill: "#64748b",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#2563eb"
                      strokeWidth={4}
                      dot={{
                        r: 6,
                        stroke: "#2563eb",
                        strokeWidth: 3,
                        fill: "#ffffff",
                      }}
                      activeDot={{
                        r: 8,
                        stroke: "#1d4ed8",
                        strokeWidth: 3,
                        fill: "#ffffff",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          ) : (
            <EmptyBox texto="No hay información suficiente para graficar." />
          )}
        </Paper>

        <Box sx={{ display: { xs: "none", md: "block" } }} />
      </Box>

      <Box mt={3}>
        <Paper sx={sectionStyle}>
          <Box
            mb={2.5}
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            gap={1.5}
          >
            <Box>
              <Typography
                fontWeight={900}
                sx={{ fontSize: { xs: 18, md: 20 } }}
              >
                Tickets recientes
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Últimos tickets registrados con folio y estado.
              </Typography>
            </Box>

            <Chip
              label={`${ticketsRecientes.length} recientes`}
              variant="outlined"
              sx={{
                fontWeight: 800,
                width: { xs: "fit-content", sm: "auto" },
              }}
            />
          </Box>

          {ticketsRecientes.length > 0 ? (
            <>
              <TableContainer
                sx={{
                  display: { xs: "none", md: "block" },
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  overflowX: "auto",
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      <TableCell sx={headCell}>Folio</TableCell>
                      <TableCell sx={headCell}>Título</TableCell>
                      <TableCell sx={headCell}>Sistema</TableCell>
                      <TableCell sx={headCell}>Estado</TableCell>
                      <TableCell sx={headCell} align="right">
                        Acción
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {ticketsRecientes.map((ticket) => (
                      <TableRow key={ticket.id} hover>
                        <TableCell>
                          <Typography fontWeight={900} noWrap color="primary">
                            {folioTicket(ticket)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{
                              maxWidth: 360,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ticket.titulo || "Sin título"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {nombreSistema(ticket)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={nombreEstado(ticket)}
                            color={colorEstado(nombreEstado(ticket))}
                            sx={{
                              fontWeight: 800,
                              borderRadius: 2,
                            }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 800,
                            }}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack
                spacing={1.5}
                sx={{
                  display: { xs: "flex", md: "none" },
                }}
              >
                {ticketsRecientes.map((ticket) => (
                  <Paper
                    key={ticket.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      borderColor: "#e5e7eb",
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Stack spacing={1.3}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={800}
                            display="block"
                          >
                            Folio
                          </Typography>

                          <Typography fontWeight={900} color="primary" noWrap>
                            {folioTicket(ticket)}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={nombreEstado(ticket)}
                          color={colorEstado(nombreEstado(ticket))}
                          sx={{
                            fontWeight: 800,
                            borderRadius: 2,
                            flexShrink: 0,
                            maxWidth: 130,
                          }}
                        />
                      </Stack>

                      <Box>
                        <Typography
                          fontWeight={900}
                          sx={{
                            fontSize: 15,
                            lineHeight: 1.35,
                            wordBreak: "break-word",
                          }}
                        >
                          {ticket.titulo || "Sin título"}
                        </Typography>
                      </Box>

                      <Divider />

                      <InfoItem label="Sistema" value={nombreSistema(ticket)} />

                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 800,
                        }}
                      >
                        Ver ticket
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </>
          ) : (
            <EmptyBox texto="No hay tickets registrados." height={150} />
          )}
        </Paper>
      </Box>
    </Box>
  );
}

function StatCard({ titulo, valor, chip, color = "default", icon, accent }) {
  return (
    <Paper sx={cardStyle}>
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            bgcolor: `${accent}18`,
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.3,
          }}
        >
          {icon}
        </Box>

        <Typography variant="body2" color="text.secondary" fontWeight={800}>
          {titulo}
        </Typography>

        <Typography
          fontWeight={900}
          mt={0.8}
          sx={{
            fontSize: { xs: 26, md: 34 },
            lineHeight: 1,
          }}
        >
          {valor}
        </Typography>
      </Box>

      <Chip label={chip} color={color} sx={chipStyle} />
    </Paper>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <Paper
      sx={{
        p: 1.2,
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        boxShadow: 3,
      }}
    >
      <Typography fontWeight={900} fontSize={13}>
        {label}
      </Typography>

      <Typography fontSize={13} color="text.secondary">
        Tickets creados:{" "}
        <Box component="span" fontWeight={900} color="#2563eb">
          {payload[0].value}
        </Box>
      </Typography>
    </Paper>
  );
}

function InfoItem({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={800}
        display="block"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={800}
        sx={{
          wordBreak: "break-word",
          lineHeight: 1.35,
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

function EmptyBox({ texto, height = 220 }) {
  return (
    <Box
      sx={{
        minHeight: height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
        border: "1px dashed #cbd5e1",
        borderRadius: 2,
        bgcolor: "#f8fafc",
        textAlign: "center",
        px: 2,
        py: 3,
      }}
    >
      <Typography variant="body2" fontWeight={700}>
        {texto}
      </Typography>
    </Box>
  );
}

const cardStyle = {
  height: "100%",
  minHeight: { xs: 145, md: 165 },
  p: { xs: 1.6, md: 2.5 },
  borderRadius: 3,
  boxShadow: 1,
  border: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 1.5,
  transition: "0.2s ease",
  overflow: "hidden",
  "&:hover": {
    boxShadow: { xs: 1, md: 4 },
    transform: { xs: "none", md: "translateY(-2px)" },
  },
};

const chipStyle = {
  fontWeight: 800,
  borderRadius: 2,
  flexShrink: 0,
};

const chartSectionStyle = {
  width: "100%",
  minWidth: 0,
  p: { xs: 2, sm: 3, md: 4 },
  borderRadius: 3,
  boxShadow: 1,
  border: "1px solid #dbeafe",
  bgcolor: "#ffffff",
  overflow: "hidden",
};

const sectionStyle = {
  p: { xs: 1.5, sm: 2, md: 3 },
  borderRadius: 3,
  boxShadow: 1,
  border: "1px solid #e5e7eb",
};

const headCell = {
  fontWeight: 900,
  color: "#334155",
  whiteSpace: "nowrap",
};

export default Dashboard;