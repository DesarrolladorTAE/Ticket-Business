import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import axiosCliente from "../../../services/axiosCliente";

const formularioInicial = {
  name: "",
  apellido_paterno: "",
  apellido_materno: "",
  telefono: "",
  email: "",
  password: "",
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("es-MX").format(number);
};

const nombreCompleto = (agent) => {
  return `${agent?.name || ""} ${agent?.apellido_paterno || ""} ${
    agent?.apellido_materno || ""
  }`
    .trim()
    .replace(/\s+/g, " ");
};

const inicialAgente = (agent) => {
  const nombre = nombreCompleto(agent);

  return nombre ? nombre.charAt(0).toUpperCase() : "A";
};

const normalizarTexto = (value) => {
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
            fontWeight: 900,
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

function AgentCard({ agent }) {
  const nombre = nombreCompleto(agent);
  const grupos = agent?.groups || [];
  const activo = Number(agent?.company_status) === 1;

  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.05)",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: "#dbeafe",
                color: "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              {inicialAgente(agent)}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                  wordBreak: "break-word",
                  lineHeight: 1.25,
                }}
              >
                {nombre || "Sin nombre"}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  wordBreak: "break-word",
                }}
              >
                {agent?.email || "Sin correo"}
              </Typography>

              {agent?.telefono && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    display: "block",
                    mt: 0.3,
                  }}
                >
                  Tel. {agent.telefono}
                </Typography>
              )}
            </Box>
          </Stack>

          <Chip
            label={activo ? "Activo" : "Inactivo"}
            color={activo ? "success" : "default"}
            size="small"
            sx={{
              fontWeight: 800,
              alignSelf: { xs: "flex-start", sm: "center" },
            }}
          />
        </Stack>

        <Divider />

        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 900,
              color: "#0f172a",
              mb: 1,
            }}
          >
            Grupos de soporte
          </Typography>

          {grupos.length > 0 ? (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                flexWrap: "wrap",
                rowGap: 1,
              }}
            >
              {grupos.map((grupo) => (
                <Chip
                  key={grupo.id}
                  label={grupo.nombre}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    maxWidth: "100%",
                  }}
                />
              ))}
            </Stack>
          ) : (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              Este agente no tiene grupos asignados.
            </Alert>
          )}
        </Box>

        <Divider />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontWeight: 700,
              }}
            >
              Total
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.1,
              }}
            >
              {formatNumber(agent?.total_tickets)}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontWeight: 700,
              }}
            >
              Abiertos
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.1,
              }}
            >
              {formatNumber(agent?.open_tickets)}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontWeight: 700,
              }}
            >
              Resueltos
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.1,
              }}
            >
              {formatNumber(agent?.resolved_tickets)}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}

function CrearAgenteDialog({ open, onClose, onCreated }) {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cerrar = () => {
    if (cargando) return;

    setFormulario(formularioInicial);
    setError("");
    onClose();
  };

  const cambiarValor = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const cambiarTelefono = (e) => {
    setFormulario({
      ...formulario,
      telefono: e.target.value.replace(/\D/g, "").slice(0, 10),
    });
  };

  const crearAgente = async (e) => {
    e.preventDefault();

    setError("");

    if (formulario.telefono.length !== 10) {
      setError("El teléfono debe tener exactamente 10 dígitos.");
      return;
    }

    setCargando(true);

    try {
      await axiosCliente.post("/agents", formulario);

      setFormulario(formularioInicial);
      setError("");

      await onCreated();

      onClose();
    } catch (error) {
      console.log("ERROR CREAR AGENTE:", error.response?.data || error);

      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(error.response?.data?.message || "No se pudo crear el agente");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={cerrar}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 900,
          color: "#0f172a",
          pb: 1,
        }}
      >
        Nuevo agente
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
            }}
          >
            Registra un nuevo usuario agente para atención y seguimiento de
            tickets.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" id="crear-agente-form" onSubmit={crearAgente}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: 3,
                borderColor: "#e5e7eb",
                bgcolor: "#ffffff",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                    Información personal
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Estos datos identifican al agente dentro del sistema.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Nombre(s)"
                      name="name"
                      value={formulario.name}
                      onChange={cambiarValor}
                      required
                      disabled={cargando}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Apellido paterno"
                      name="apellido_paterno"
                      value={formulario.apellido_paterno}
                      onChange={cambiarValor}
                      required
                      disabled={cargando}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Apellido materno"
                      name="apellido_materno"
                      value={formulario.apellido_materno}
                      onChange={cambiarValor}
                      required
                      disabled={cargando}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>

            <Divider sx={{ my: 2.5 }} />

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: 3,
                borderColor: "#e5e7eb",
                bgcolor: "#ffffff",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                    Contacto y acceso
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    El correo y la contraseña se usarán para iniciar sesión.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Teléfono"
                      name="telefono"
                      value={formulario.telefono}
                      onChange={cambiarTelefono}
                      required
                      disabled={cargando}
                      inputProps={{
                        maxLength: 10,
                        inputMode: "numeric",
                      }}
                      helperText="Debe contener exactamente 10 dígitos"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Correo electrónico"
                      name="email"
                      type="email"
                      value={formulario.email}
                      onChange={cambiarValor}
                      required
                      disabled={cargando}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Contraseña"
                      name="password"
                      type="password"
                      value={formulario.password}
                      onChange={cambiarValor}
                      required
                      disabled={cargando}
                      helperText="Define la contraseña inicial del agente"
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={cerrar}
          disabled={cargando}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          form="crear-agente-form"
          variant="contained"
          disabled={cargando}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "none",
            bgcolor: "#2563eb",
            "&:hover": {
              bgcolor: "#1d4ed8",
              boxShadow: "none",
            },
          }}
        >
          {cargando ? "Creando..." : "Crear agente"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Agentes() {
  const [summary, setSummary] = useState({});
  const [agents, setAgents] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAgents = async ({ refresh = false } = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await axiosCliente.get("/agents/summary");

      setSummary(response.data.summary || {});
      setAgents(response.data.data || []);
    } catch (requestError) {
      console.log(
        "ERROR AGENTES SUMMARY:",
        requestError.response?.data || requestError,
      );

      setError(
        requestError?.response?.data?.message ||
          "No se pudo cargar el resumen de agentes.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAgentCreated = async () => {
    await loadAgents({
      refresh: true,
    });
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const gruposDisponibles = useMemo(() => {
    const grupos = [];

    agents.forEach((agent) => {
      (agent.groups || []).forEach((group) => {
        const exists = grupos.some((item) => item.id === group.id);

        if (!exists) {
          grupos.push(group);
        }
      });
    });

    return grupos.sort((a, b) =>
      String(a.nombre).localeCompare(String(b.nombre)),
    );
  }, [agents]);

  const agentesFiltrados = useMemo(() => {
    const searchText = normalizarTexto(search);

    return agents.filter((agent) => {
      const nombre = normalizarTexto(nombreCompleto(agent));
      const email = normalizarTexto(agent.email);
      const telefono = normalizarTexto(agent.telefono);

      const coincideBusqueda =
        !searchText ||
        nombre.includes(searchText) ||
        email.includes(searchText) ||
        telefono.includes(searchText);

      const activo = Number(agent.company_status) === 1;

      const coincideEstado =
        statusFilter === "all" ||
        (statusFilter === "active" && activo) ||
        (statusFilter === "inactive" && !activo);

      const coincideGrupo =
        groupFilter === "all" ||
        (agent.groups || []).some(
          (group) => String(group.id) === String(groupFilter),
        );

      return coincideBusqueda && coincideEstado && coincideGrupo;
    });
  }, [agents, search, statusFilter, groupFilter]);

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
              Agentes
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
              }}
            >
              Consulta agentes, grupos asignados y tickets atendidos.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={
                refreshing ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={() => loadAgents({ refresh: true })}
              disabled={refreshing}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              {refreshing ? "Actualizando..." : "Actualizar"}
            </Button>

            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
                boxShadow: "none",
                bgcolor: "#2563eb",
                "&:hover": {
                  bgcolor: "#1d4ed8",
                  boxShadow: "none",
                },
              }}
            >
              Nuevo agente
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

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
            title="Total de agentes"
            value={summary.total_agents}
            description="Agentes activos e inactivos"
          />

          <MetricCard
            title="Agentes activos"
            value={summary.active_agents}
            description="Disponibles para operación"
          />

          <MetricCard
            title="Sin grupo"
            value={summary.agents_without_group}
            description="Agentes sin grupo asignado"
          />

          <MetricCard
            title="Tickets abiertos"
            value={summary.total_open_tickets}
            description="Tickets pendientes asignados"
          />

          <MetricCard
            title="Tickets asignados"
            value={summary.total_assigned_tickets}
            description="Total de tickets por agentes"
          />

          <MetricCard
            title="Tickets resueltos"
            value={summary.total_resolved_tickets}
            description="Tickets resueltos por agentes"
          />
        </Box>

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
                Filtros
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                }}
              >
                Filtra por nombre, correo, teléfono, estado o grupo de soporte.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                fullWidth
                size="small"
                label="Buscar agente"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <TextField
                select
                fullWidth
                size="small"
                label="Estado"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Activos</MenuItem>
                <MenuItem value="inactive">Inactivos</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                size="small"
                label="Grupo"
                value={groupFilter}
                onChange={(event) => setGroupFilter(event.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>

                {gruposDisponibles.map((group) => (
                  <MenuItem key={group.id} value={String(group.id)}>
                    {group.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
        </Paper>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            Lista de agentes
          </Typography>

          <Chip
            label={`${agentesFiltrados.length} resultado(s)`}
            variant="outlined"
            color="primary"
            sx={{
              fontWeight: 800,
              alignSelf: { xs: "flex-start", sm: "center" },
            }}
          />
        </Stack>

        {agentesFiltrados.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              border: "1px dashed #cbd5e1",
              bgcolor: "#f8fafc",
              textAlign: "center",
            }}
          >
            <Typography fontWeight={900}>
              No se encontraron agentes.
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Ajusta los filtros o registra un nuevo agente.
            </Typography>
          </Paper>
        ) : (
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
            {agentesFiltrados.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </Box>
        )}
      </Stack>

      <CrearAgenteDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreated={handleAgentCreated}
      />
    </Box>
  );
}