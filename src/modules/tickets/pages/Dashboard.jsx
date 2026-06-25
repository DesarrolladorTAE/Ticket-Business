import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
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
          "No se pudo cargar la información del dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const colorEstado = (estado) => {
    const valor = String(estado || "").toLowerCase();

    if (valor.includes("cerr")) return "success";
    if (valor.includes("resuelto")) return "success";
    if (valor.includes("proceso")) return "warning";
    if (valor.includes("abiert")) return "primary";
    if (valor.includes("pendiente")) return "primary";

    return "default";
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

  return (
    <Box>
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        flexDirection={{ xs: "column", sm: "row" }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Dashboard
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Resumen general de tickets registrados en el sistema.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => navigate("/tickets/nuevo")}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
          }}
        >
          Nuevo ticket
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} mb={4} alignItems="stretch">
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={cardStyle}>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Total
              </Typography>

              <Typography variant="h4" fontWeight={800} mt={1}>
                {total}
              </Typography>
            </Box>

            <Chip label="Tickets" color="default" sx={chipStyle} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={cardStyle}>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Abiertos
              </Typography>

              <Typography variant="h4" fontWeight={800} mt={1}>
                {abiertos}
              </Typography>
            </Box>

            <Chip label="Pendientes" color="primary" sx={chipStyle} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={cardStyle}>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                En proceso
              </Typography>

              <Typography variant="h4" fontWeight={800} mt={1}>
                {proceso}
              </Typography>
            </Box>

            <Chip label="Activos" color="warning" sx={chipStyle} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={cardStyle}>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Cerrados
              </Typography>

              <Typography variant="h4" fontWeight={800} mt={1}>
                {cerrados}
              </Typography>
            </Box>

            <Chip label="Finalizados" color="success" sx={chipStyle} />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={sectionStyle}>
            <Box mb={2.5}>
              <Typography fontWeight={800}>Tickets por día</Typography>

              <Typography variant="body2" color="text.secondary">
                Evolución diaria de tickets creados.
              </Typography>
            </Box>

            {chart.length > 0 ? (
              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart}>
                    <XAxis dataKey="fecha" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <EmptyBox texto="No hay información suficiente para graficar." />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={sectionStyle}>
            <Box mb={2.5}>
              <Typography fontWeight={800}>Tickets recientes</Typography>

              <Typography variant="body2" color="text.secondary">
                Últimos tickets registrados con folio y estado.
              </Typography>
            </Box>

            {tickets.length > 0 ? (
              <TableContainer
                sx={{
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
                    {tickets.slice(0, 10).map((ticket) => (
                      <TableRow key={ticket.id} hover>
                        <TableCell>
                          <Typography fontWeight={800} noWrap>
                            {ticket.folio || `#${ticket.id}`}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 320,
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
                            {ticket.system?.nombre ||
                              ticket.sistema?.nombre ||
                              "Sin sistema"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              ticket.status?.nombre ||
                              ticket.status ||
                              "Abierto"
                            }
                            color={colorEstado(
                              ticket.status?.nombre || ticket.status
                            )}
                            sx={{ fontWeight: 700 }}
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
                              fontWeight: 700,
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
            ) : (
              <EmptyBox texto="No hay tickets registrados." height={150} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function EmptyBox({ texto, height = 220 }) {
  return (
    <Box
      sx={{
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
        border: "1px dashed #cbd5e1",
        borderRadius: 2,
        bgcolor: "#f8fafc",
        textAlign: "center",
        px: 2,
      }}
    >
      {texto}
    </Box>
  );
}

const cardStyle = {
  height: "100%",
  minHeight: 125,
  p: 2.5,
  borderRadius: 3,
  boxShadow: 1,
  border: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 2,
  transition: "0.2s ease",
  "&:hover": {
    boxShadow: 4,
    transform: "translateY(-2px)",
  },
};

const chipStyle = {
  fontWeight: 700,
  borderRadius: 2,
};

const sectionStyle = {
  p: { xs: 2, md: 3 },
  borderRadius: 3,
  boxShadow: 1,
  border: "1px solid #e5e7eb",
};

const headCell = {
  fontWeight: 800,
  color: "#334155",
};

export default Dashboard;