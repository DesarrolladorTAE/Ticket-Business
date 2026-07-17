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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import RefreshIcon from "@mui/icons-material/Refresh";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";

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

const getGroupsCount = (agent) => {
  return Number(agent?.groups_count ?? agent?.groups?.length ?? 0);
};

const getGroupsText = (agent) => {
  const grupos = agent?.groups || [];

  if (!grupos.length) {
    return "Sin grupos asignados";
  }

  return grupos.map((grupo) => grupo.nombre).join(", ");
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

function AgentCard({ agent, onEdit, onToggleStatus, changingStatusId }) {
  const nombre = nombreCompleto(agent);
  const grupos = agent?.groups || [];
  const gruposCount = getGroupsCount(agent);
  const activo = Number(agent?.company_status) === 1;
  const changingThisAgent = Number(changingStatusId) === Number(agent.id);

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
                bgcolor: activo ? "#dbeafe" : "#f1f5f9",
                color: activo ? "#1d4ed8" : "#64748b",
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
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              Grupos de soporte
            </Typography>

            <Chip
              label={`${gruposCount} grupo(s)`}
              size="small"
              variant="outlined"
              color={gruposCount > 0 ? "primary" : "default"}
              sx={{
                fontWeight: 800,
              }}
            />
          </Stack>

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

        <Divider />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="flex-end"
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(agent)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Editar
          </Button>

          <Button
            variant="contained"
            size="small"
            color={activo ? "warning" : "success"}
            startIcon={activo ? <ToggleOffIcon /> : <ToggleOnIcon />}
            onClick={() => onToggleStatus(agent)}
            disabled={changingThisAgent}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              boxShadow: "none",
            }}
          >
            {changingThisAgent
              ? "Procesando..."
              : activo
                ? "Inactivar"
                : "Activar"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function AgentsTable({ agents, onEdit, onToggleStatus, changingStatusId }) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.05)",
        overflowX: "hidden",
        maxHeight: 440,
      }}
    >
      <Table
        stickyHeader
        sx={{
          width: "100%",
          tableLayout: "fixed",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                width: "26%",
                fontWeight: 900,
                bgcolor: "#f8fafc",
              }}
            >
              Agente
            </TableCell>

            <TableCell
              sx={{
                width: "23%",
                fontWeight: 900,
                bgcolor: "#f8fafc",
              }}
            >
              Contacto
            </TableCell>

            <TableCell
              sx={{
                width: "16%",
                fontWeight: 900,
                bgcolor: "#f8fafc",
              }}
            >
              Grupos
            </TableCell>

            <TableCell
              sx={{
                width: "18%",
                fontWeight: 900,
                bgcolor: "#f8fafc",
              }}
            >
              Tickets
            </TableCell>

            <TableCell
              sx={{
                width: "17%",
                fontWeight: 900,
                bgcolor: "#f8fafc",
              }}
            >
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {agents.map((agent) => {
            const nombre = nombreCompleto(agent);
            const gruposCount = getGroupsCount(agent);
            const activo = Number(agent?.company_status) === 1;
            const changingThisAgent =
              Number(changingStatusId) === Number(agent.id);

            return (
              <TableRow
                key={agent.id}
                hover
                sx={{
                  "&:last-child td": {
                    borderBottom: 0,
                  },
                }}
              >
                <TableCell
                  sx={{
                    verticalAlign: "top",
                    wordBreak: "break-word",
                  }}
                >
                  <Stack direction="row" spacing={1.2} sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: activo ? "#dbeafe" : "#f1f5f9",
                        color: activo ? "#1d4ed8" : "#64748b",
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
                        variant="body2"
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
                        variant="caption"
                        sx={{
                          color: "#64748b",
                          wordBreak: "break-word",
                        }}
                      >
                        Rol: {agent?.company_role || "agent"}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell
                  sx={{
                    verticalAlign: "top",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#0f172a",
                      wordBreak: "break-word",
                      lineHeight: 1.25,
                    }}
                  >
                    {agent?.email || "Sin correo"}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                    }}
                  >
                    {agent?.telefono
                      ? `Tel. ${agent.telefono}`
                      : "Sin teléfono"}
                  </Typography>
                </TableCell>

                <TableCell sx={{ verticalAlign: "top" }}>
                  <Tooltip title={getGroupsText(agent)} arrow>
                    <Chip
                      label={`${gruposCount} grupo(s)`}
                      size="small"
                      variant="outlined"
                      color={gruposCount > 0 ? "primary" : "default"}
                      sx={{
                        fontWeight: 800,
                        cursor: "default",
                        maxWidth: "100%",
                      }}
                    />
                  </Tooltip>

                  {gruposCount === 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "#b45309",
                        fontWeight: 700,
                        mt: 0.8,
                      }}
                    >
                      Sin grupos
                    </Typography>
                  )}
                </TableCell>

                <TableCell sx={{ verticalAlign: "top" }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Total:{" "}
                      <Box component="span" sx={{ fontWeight: 900 }}>
                        {formatNumber(agent?.total_tickets)}
                      </Box>
                    </Typography>

                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Abiertos:{" "}
                      <Box component="span" sx={{ fontWeight: 900 }}>
                        {formatNumber(agent?.open_tickets)}
                      </Box>
                    </Typography>

                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Resueltos:{" "}
                      <Box component="span" sx={{ fontWeight: 900 }}>
                        {formatNumber(agent?.resolved_tickets)}
                      </Box>
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell sx={{ verticalAlign: "top" }}>
                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => onEdit(agent)}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 800,
                        justifyContent: "flex-start",
                      }}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="contained"
                      size="small"
                      color={activo ? "warning" : "success"}
                      startIcon={activo ? <ToggleOffIcon /> : <ToggleOnIcon />}
                      onClick={() => onToggleStatus(agent)}
                      disabled={changingThisAgent}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 800,
                        boxShadow: "none",
                        justifyContent: "flex-start",
                      }}
                    >
                      {changingThisAgent
                        ? "..."
                        : activo
                          ? "Inactivar"
                          : "Activar"}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function AgentesPagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={[5, 10, 25]}
      labelRowsPerPage="Filas por página"
      labelDisplayedRows={({ from, to, count }) =>
        `${from}-${to} de ${count}`
      }
      sx={{
        borderTop: "1px solid #e5e7eb",
        bgcolor: "#ffffff",
        borderRadius: "0 0 12px 12px",
        ".MuiTablePagination-toolbar": {
          flexWrap: { xs: "wrap", sm: "nowrap" },
          justifyContent: { xs: "center", sm: "flex-end" },
          rowGap: 1,
        },
      }}
    />
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

      <DialogActions sx={{ p: 2 }}>
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

function EditarAgenteDialog({ open, agent, onClose, onUpdated }) {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (open && agent) {
      setFormulario({
        name: agent.name || "",
        apellido_paterno: agent.apellido_paterno || "",
        apellido_materno: agent.apellido_materno || "",
        telefono: agent.telefono || "",
        email: agent.email || "",
        password: "",
      });

      setError("");
    }
  }, [open, agent]);

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

  const actualizarAgente = async (e) => {
    e.preventDefault();

    if (!agent?.id) return;

    setError("");

    if (formulario.telefono.length !== 10) {
      setError("El teléfono debe tener exactamente 10 dígitos.");
      return;
    }

    setCargando(true);

    try {
      const payload = {
        name: formulario.name,
        apellido_paterno: formulario.apellido_paterno,
        apellido_materno: formulario.apellido_materno,
        telefono: formulario.telefono,
        email: formulario.email,
      };

      if (formulario.password.trim()) {
        payload.password = formulario.password.trim();
      }

      await axiosCliente.patch(`/agents/${agent.id}`, payload);

      await onUpdated();

      cerrar();
    } catch (error) {
      console.log("ERROR EDITAR AGENTE:", error.response?.data || error);

      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(
          error.response?.data?.message || "No se pudo actualizar el agente",
        );
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
        Editar agente
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
            }}
          >
            Actualiza los datos principales del agente. La contraseña solo se
            cambiará si capturas una nueva.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Box
            component="form"
            id="editar-agente-form"
            onSubmit={actualizarAgente}
          >
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
                    Correo, teléfono y contraseña de acceso.
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
                      label="Nueva contraseña"
                      name="password"
                      type="password"
                      value={formulario.password}
                      onChange={cambiarValor}
                      disabled={cargando}
                      helperText="Opcional. Déjala vacía si no deseas cambiarla."
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
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
          form="editar-agente-form"
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
          {cargando ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ConfirmarEstadoDialog({ open, agent, onClose, onConfirm, cargando }) {
  const activo = Number(agent?.company_status) === 1;
  const nombre = nombreCompleto(agent);

  return (
    <Dialog
      open={open}
      onClose={cargando ? undefined : onClose}
      fullWidth
      maxWidth="xs"
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
        }}
      >
        {activo ? "Inactivar agente" : "Activar agente"}
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ color: "#475569" }}>
          {activo
            ? "El agente dejará de estar disponible para nuevas operaciones, pero se conservará su historial."
            : "El agente volverá a estar disponible dentro de la empresa."}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#0f172a",
            fontWeight: 900,
            mt: 2,
            wordBreak: "break-word",
          }}
        >
          {nombre || "Agente sin nombre"}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
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
          variant="contained"
          color={activo ? "warning" : "success"}
          onClick={onConfirm}
          disabled={cargando}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "none",
          }}
        >
          {cargando ? "Procesando..." : activo ? "Inactivar" : "Activar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Agentes() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [summary, setSummary] = useState({});
  const [agents, setAgents] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [statusAgent, setStatusAgent] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("Agente creado correctamente.");

    await loadAgents({
      refresh: true,
    });
  };

  const handleAgentUpdated = async () => {
    setSuccess("Agente actualizado correctamente.");

    await loadAgents({
      refresh: true,
    });
  };

  const abrirEditarAgente = (agent) => {
    setSelectedAgent(agent);
    setOpenEditDialog(true);
    setError("");
    setSuccess("");
  };

  const cerrarEditarAgente = () => {
    setOpenEditDialog(false);
    setSelectedAgent(null);
  };

  const abrirConfirmarEstado = (agent) => {
    setStatusAgent(agent);
    setError("");
    setSuccess("");
  };

  const cerrarConfirmarEstado = () => {
    if (changingStatus) return;

    setStatusAgent(null);
  };

  const confirmarCambioEstado = async () => {
    if (!statusAgent?.id) return;

    const activo = Number(statusAgent.company_status) === 1;
    const nuevoStatus = activo ? 0 : 1;

    setChangingStatus(true);
    setError("");
    setSuccess("");

    try {
      await axiosCliente.patch(`/agents/${statusAgent.id}/status`, {
        status: nuevoStatus,
      });

      setSuccess(
        activo
          ? "Agente inactivado correctamente."
          : "Agente activado correctamente.",
      );

      setStatusAgent(null);

      await loadAgents({
        refresh: true,
      });
    } catch (requestError) {
      console.log(
        "ERROR CAMBIAR ESTADO AGENTE:",
        requestError.response?.data || requestError,
      );

      setError(
        requestError?.response?.data?.message ||
          "No se pudo cambiar el estado del agente.",
      );
    } finally {
      setChangingStatus(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, groupFilter]);

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

  const agentesPaginados = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;

    return agentesFiltrados.slice(start, end);
  }, [agentesFiltrados, page, rowsPerPage]);

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
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
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
            title="Agentes inactivos"
            value={summary.inactive_agents}
            description="Con historial conservado"
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
          spacing={1.5}
        >
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              Lista de agentes
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
              }}
            >
              Administra agentes, estado operativo y datos de contacto.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Button
              variant="outlined"
              startIcon={
                refreshing ? <CircularProgress size={16} /> : <RefreshIcon />
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
              onClick={() => {
                setOpenCreateDialog(true);
                setError("");
                setSuccess("");
              }}
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
            <Typography fontWeight={900}>No se encontraron agentes.</Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Ajusta los filtros o registra un nuevo agente.
            </Typography>
          </Paper>
        ) : isMobile ? (
          <Stack spacing={2}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 2,
              }}
            >
              {agentesPaginados.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onEdit={abrirEditarAgente}
                  onToggleStatus={abrirConfirmarEstado}
                  changingStatusId={changingStatus ? statusAgent?.id : null}
                />
              ))}
            </Box>

            <Paper
              sx={{
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <AgentesPagination
                count={agentesFiltrados.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Stack>
        ) : (
          <Paper
            sx={{
              borderRadius: 3,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
              boxShadow: "0 10px 25px rgba(15, 23, 42, 0.05)",
            }}
          >
            <AgentsTable
              agents={agentesPaginados}
              onEdit={abrirEditarAgente}
              onToggleStatus={abrirConfirmarEstado}
              changingStatusId={changingStatus ? statusAgent?.id : null}
            />

            <AgentesPagination
              count={agentesFiltrados.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
      </Stack>

      <CrearAgenteDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreated={handleAgentCreated}
      />

      <EditarAgenteDialog
        open={openEditDialog}
        agent={selectedAgent}
        onClose={cerrarEditarAgente}
        onUpdated={handleAgentUpdated}
      />

      <ConfirmarEstadoDialog
        open={Boolean(statusAgent)}
        agent={statusAgent}
        onClose={cerrarConfirmarEstado}
        onConfirm={confirmarCambioEstado}
        cargando={changingStatus}
      />
    </Box>
  );
}