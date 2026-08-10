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
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import DeleteIcon from "@mui/icons-material/Delete";

import axiosCliente from "../../../services/axiosCliente";

const formularioInicial = {
  name: "",
  apellido_paterno: "",
  apellido_materno: "",
  telefono: "",
  email: "",
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("es-MX").format(
    Number(value || 0),
  );
};

const nombreCompleto = (client) => {
  return `${client?.name || ""} ${
    client?.apellido_paterno || ""
  } ${client?.apellido_materno || ""}`
    .trim()
    .replace(/\s+/g, " ");
};

const normalizarTexto = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const inicialCliente = (client) => {
  const nombre = nombreCompleto(client);

  return nombre
    ? nombre.charAt(0).toUpperCase()
    : "C";
};

function MetricCard({
  title,
  value,
  description,
}) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow:
          "0 10px 25px rgba(15, 23, 42, 0.06)",
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

function EditarClienteDialog({
  open,
  client,
  onClose,
  onUpdated,
}) {
  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [error, setError] = useState("");
  const [cargando, setCargando] =
    useState(false);

  useEffect(() => {
    if (open && client) {
      setFormulario({
        name: client.name || "",
        apellido_paterno:
          client.apellido_paterno || "",
        apellido_materno:
          client.apellido_materno || "",
        telefono: client.telefono || "",
        email: client.email || "",
      });

      setError("");
    }
  }, [open, client]);

  const cerrar = () => {
    if (cargando) return;

    setFormulario(formularioInicial);
    setError("");
    onClose();
  };

  const cambiarValor = (event) => {
    setFormulario((prev) => ({
      ...prev,
      [event.target.name]:
        event.target.value,
    }));
  };

  const cambiarTelefono = (event) => {
    setFormulario((prev) => ({
      ...prev,
      telefono: event.target.value
        .replace(/\D/g, "")
        .slice(0, 10),
    }));
  };

  const actualizarCliente = async (
    event,
  ) => {
    event.preventDefault();

    if (!client?.id) return;

    setError("");

    if (
      formulario.telefono.length !== 10
    ) {
      setError(
        "El teléfono debe tener exactamente 10 dígitos.",
      );

      return;
    }

    setCargando(true);

    try {
      await axiosCliente.patch(
        `/clients/${client.id}`,
        formulario,
      );

      await onUpdated();

      cerrar();
    } catch (requestError) {
      console.log(
        "ERROR EDITAR CLIENTE:",
        requestError.response?.data ||
          requestError,
      );

      const errores =
        requestError.response?.data?.errors;

      if (errores) {
        setError(
          Object.values(errores)
            .flat()
            .join(" "),
        );
      } else {
        setError(
          requestError.response?.data
            ?.message ||
            "No se pudo actualizar el cliente.",
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
        Editar cliente
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
            }}
          >
            Actualiza los datos de contacto
            del cliente.
          </Typography>

          {client?.origin ===
            "integration" && (
            <Alert severity="info">
              Este cliente fue registrado
              mediante una integración
              externa.
            </Alert>
          )}

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Box
            component="form"
            id="editar-cliente-form"
            onSubmit={actualizarCliente}
          >
            <Paper
              variant="outlined"
              sx={{
                p: {
                  xs: 1.5,
                  md: 2,
                },
                borderRadius: 3,
                borderColor: "#e5e7eb",
              }}
            >
              <Stack spacing={2}>
                <Typography
                  fontWeight={900}
                >
                  Información personal
                </Typography>

                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    item
                    xs={12}
                    md={4}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Nombre(s)"
                      name="name"
                      value={
                        formulario.name
                      }
                      onChange={
                        cambiarValor
                      }
                      required
                      disabled={cargando}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={4}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Apellido paterno"
                      name="apellido_paterno"
                      value={
                        formulario.apellido_paterno
                      }
                      onChange={
                        cambiarValor
                      }
                      required
                      disabled={cargando}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={4}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Apellido materno"
                      name="apellido_materno"
                      value={
                        formulario.apellido_materno
                      }
                      onChange={
                        cambiarValor
                      }
                      required
                      disabled={cargando}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={6}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Teléfono"
                      name="telefono"
                      value={
                        formulario.telefono
                      }
                      onChange={
                        cambiarTelefono
                      }
                      required
                      disabled={cargando}
                      inputProps={{
                        maxLength: 10,
                        inputMode:
                          "numeric",
                      }}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={6}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      label="Correo electrónico"
                      name="email"
                      value={
                        formulario.email
                      }
                      onChange={
                        cambiarValor
                      }
                      required
                      disabled={cargando}
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
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          form="editar-cliente-form"
          variant="contained"
          disabled={cargando}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "none",
          }}
        >
          {cargando
            ? "Guardando..."
            : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ConfirmarEstadoDialog({
  open,
  client,
  onClose,
  onConfirm,
  cargando,
}) {
  const activo =
    Number(client?.company_status) === 1;

  return (
    <Dialog
      open={open}
      onClose={
        cargando
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle
        sx={{
          fontWeight: 900,
        }}
      >
        {activo
          ? "Inactivar cliente"
          : "Activar cliente"}
      </DialogTitle>

      <DialogContent dividers>
        <Typography
          variant="body2"
          sx={{
            color: "#475569",
          }}
        >
          {activo
            ? "El cliente quedará inactivo dentro de la empresa, pero se conservará su información e historial."
            : "El cliente volverá a quedar activo dentro de la empresa."}
        </Typography>

        <Typography
          sx={{
            mt: 2,
            fontWeight: 900,
          }}
        >
          {nombreCompleto(client)}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={cargando}
          sx={{
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color={
            activo
              ? "warning"
              : "success"
          }
          onClick={onConfirm}
          disabled={cargando}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "none",
          }}
        >
          {cargando
            ? "Procesando..."
            : activo
              ? "Inactivar"
              : "Activar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ConfirmarEliminarDialog({
  open,
  client,
  onClose,
  onConfirm,
  cargando,
  error,
}) {
  const nombre = nombreCompleto(client);

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
          color: "#b91c1c",
        }}
      >
        Eliminar cliente
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography
            variant="body2"
            sx={{
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            ¿Seguro que deseas eliminar a este cliente?
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "#f8fafc",
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              {nombre || "Cliente sin nombre"}
            </Typography>

            {client?.email && (
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.3,
                  wordBreak: "break-word",
                }}
              >
                {client.email}
              </Typography>
            )}
          </Paper>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Alert severity="warning">
            Si el cliente ya tiene historial de tickets,
            el sistema conservará la información necesaria
            para no perder ese historial.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={cargando}
          sx={{
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={cargando}
          startIcon={<DeleteIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "none",
          }}
        >
          {cargando ? "Eliminando..." : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ClientesPagination({
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
      onRowsPerPageChange={
        onRowsPerPageChange
      }
      rowsPerPageOptions={[
        5,
        10,
        25,
        50,
      ]}
      labelRowsPerPage="Filas por página"
      labelDisplayedRows={({
        from,
        to,
        count,
      }) =>
        `${from}-${to} de ${count}`
      }
    />
  );
}

function ClienteCard({
  client,
  onEdit,
  onToggleStatus,
  onDelete,
  changingStatusId,
  deletingClientId,
}) {
  const activo =
    Number(client.company_status) === 1;

  const cambiando =
    Number(changingStatusId) ===
    Number(client.id);

  const eliminando =
    Number(deletingClientId) ===
    Number(client.id);

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1.5}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: activo
                ? "#dbeafe"
                : "#f1f5f9",
              color: activo
                ? "#1d4ed8"
                : "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            {inicialCliente(client)}
          </Box>

          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              {nombreCompleto(client) ||
                "Sin nombre"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                wordBreak:
                  "break-word",
              }}
            >
              {client.email}
            </Typography>
          </Box>

          <Chip
            label={
              activo
                ? "Activo"
                : "Inactivo"
            }
            color={
              activo
                ? "success"
                : "default"
            }
            size="small"
          />
        </Stack>

        <Divider />

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
        >
          <Chip
            label={
              client.origin ===
              "integration"
                ? "Integración"
                : "Registrado"
            }
            variant="outlined"
            size="small"
            color={
              client.origin ===
              "integration"
                ? "secondary"
                : "primary"
            }
          />

          {client.telefono && (
            <Chip
              label={`Tel. ${client.telefono}`}
              variant="outlined"
              size="small"
            />
          )}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: 1,
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Total
            </Typography>

            <Typography
              fontWeight={900}
            >
              {formatNumber(
                client.total_tickets,
              )}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Abiertos
            </Typography>

            <Typography
              fontWeight={900}
            >
              {formatNumber(
                client.open_tickets,
              )}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Resueltos
            </Typography>

            <Typography
              fontWeight={900}
            >
              {formatNumber(
                client.resolved_tickets,
              )}
            </Typography>
          </Paper>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
        >
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() =>
              onEdit(client)
            }
            sx={{
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Editar
          </Button>

          <Button
            fullWidth
            variant="contained"
            size="small"
            color={
              activo
                ? "warning"
                : "success"
            }
            startIcon={
              activo ? (
                <ToggleOffIcon />
              ) : (
                <ToggleOnIcon />
              )
            }
            onClick={() =>
              onToggleStatus(client)
            }
            disabled={cambiando || eliminando}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              boxShadow: "none",
            }}
          >
            {cambiando
              ? "Procesando..."
              : activo
                ? "Inactivar"
                : "Activar"}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() =>
              onDelete(client)
            }
            disabled={eliminando || cambiando}
            sx={{
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            {eliminando
              ? "Eliminando..."
              : "Eliminar"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function Clientes() {
  const theme = useTheme();

  const isMobile =
    useMediaQuery(
      theme.breakpoints.down("md"),
    );

  const [summary, setSummary] =
    useState({});

  const [clients, setClients] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    originFilter,
    setOriginFilter,
  ] = useState("all");

  const [page, setPage] =
    useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [
    selectedClient,
    setSelectedClient,
  ] = useState(null);

  const [
    openEditDialog,
    setOpenEditDialog,
  ] = useState(false);

  const [
    statusClient,
    setStatusClient,
  ] = useState(null);

  const [
    changingStatus,
    setChangingStatus,
  ] = useState(false);

  const [
    deleteClient,
    setDeleteClient,
  ] = useState(null);

  const [
    deletingClient,
    setDeletingClient,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadClients = async ({
    refresh = false,
  } = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response =
        await axiosCliente.get(
          "/clients/summary",
        );

      setSummary(
        response.data.summary || {},
      );

      setClients(
        response.data.data || [],
      );
    } catch (requestError) {
      console.log(
        "ERROR CLIENTES:",
        requestError.response?.data ||
          requestError,
      );

      setError(
        requestError.response?.data
          ?.message ||
          "No se pudieron cargar los clientes.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [
    search,
    statusFilter,
    originFilter,
  ]);

  const clientesFiltrados =
    useMemo(() => {
      const searchText =
        normalizarTexto(search);

      return clients.filter(
        (client) => {
          const nombre =
            normalizarTexto(
              nombreCompleto(client),
            );

          const email =
            normalizarTexto(
              client.email,
            );

          const telefono =
            normalizarTexto(
              client.telefono,
            );

          const coincideBusqueda =
            !searchText ||
            nombre.includes(
              searchText,
            ) ||
            email.includes(
              searchText,
            ) ||
            telefono.includes(
              searchText,
            );

          const activo =
            Number(
              client.company_status,
            ) === 1;

          const coincideEstado =
            statusFilter ===
              "all" ||
            (statusFilter ===
              "active" &&
              activo) ||
            (statusFilter ===
              "inactive" &&
              !activo);

          const coincideOrigen =
            originFilter ===
              "all" ||
            client.origin ===
              originFilter;

          return (
            coincideBusqueda &&
            coincideEstado &&
            coincideOrigen
          );
        },
      );
    }, [
      clients,
      search,
      statusFilter,
      originFilter,
    ]);

  const clientesPaginados =
    useMemo(() => {
      const start =
        page * rowsPerPage;

      return clientesFiltrados.slice(
        start,
        start + rowsPerPage,
      );
    }, [
      clientesFiltrados,
      page,
      rowsPerPage,
    ]);

  const abrirEditar = (client) => {
    setSelectedClient(client);
    setOpenEditDialog(true);
    setError("");
    setSuccess("");
  };

  const cerrarEditar = () => {
    setOpenEditDialog(false);
    setSelectedClient(null);
  };

  const confirmarEstado =
    async () => {
      if (!statusClient?.id)
        return;

      const activo =
        Number(
          statusClient.company_status,
        ) === 1;

      const nuevoStatus =
        activo ? 0 : 1;

      setChangingStatus(true);
      setError("");
      setSuccess("");

      try {
        await axiosCliente.patch(
          `/clients/${statusClient.id}/status`,
          {
            status:
              nuevoStatus,
          },
        );

        setSuccess(
          activo
            ? "Cliente inactivado correctamente."
            : "Cliente activado correctamente.",
        );

        setStatusClient(null);

        await loadClients({
          refresh: true,
        });
      } catch (requestError) {
        setError(
          requestError.response?.data
            ?.message ||
            "No se pudo cambiar el estado del cliente.",
        );
      } finally {
        setChangingStatus(false);
      }
    };

const confirmarEliminacion = async () => {
  if (!deleteClient?.id) {
    return;
  }

  setDeletingClient(true);
  setError("");
  setSuccess("");

  try {
    const response =
      await axiosCliente.delete(
        `/clients/${deleteClient.id}`,
      );

    setSuccess(
      response.data?.message ||
        "Cliente eliminado correctamente.",
    );

    setDeleteClient(null);

    await loadClients({
      refresh: true,
    });
  } catch (requestError) {
    console.log(
      "ERROR ELIMINAR CLIENTE:",
      requestError.response?.data ||
        requestError,
    );

    setError(
      requestError.response?.data?.message ||
        "No se pudo eliminar el cliente.",
    );
  } finally {
    setDeletingClient(false);
  }
};

  const abrirEliminar = (client) => {
    setDeleteClient(client);
    setDeleteError("");
    setError("");
    setSuccess("");
  };

  const cerrarEliminar = () => {
    if (deletingClient) return;

    setDeleteClient(null);
    setDeleteError("");
  };

  const confirmarEliminar =
    async () => {
      if (
        !deleteClient?.id ||
        deletingClient
      ) {
        return;
      }

      setDeletingClient(true);
      setDeleteError("");
      setError("");
      setSuccess("");

      try {
        const response =
          await axiosCliente.delete(
            `/clients/${deleteClient.id}`,
          );

        setSuccess(
          response.data?.message ||
            "Cliente eliminado correctamente.",
        );

        setDeleteClient(null);

        await loadClients({
          refresh: true,
        });
      } catch (requestError) {
        console.log(
          "ERROR ELIMINAR CLIENTE:",
          requestError.response?.data ||
            requestError,
        );

        const mensaje =
          requestError.response?.data
            ?.message ||
          "No se pudo eliminar el cliente.";

        setDeleteError(mensaje);
      } finally {
        setDeletingClient(false);
      }
    };

  const handleUpdated =
    async () => {
      setSuccess(
        "Cliente actualizado correctamente.",
      );

      await loadClients({
        refresh: true,
      });
    };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
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
        overflowX: "hidden",
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            Clientes
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mt: 0.5,
            }}
          >
            Consulta y administra los
            clientes registrados en la
            empresa.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success">
            {success}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          <MetricCard
            title="Total de clientes"
            value={
              summary.total_clients
            }
            description="Clientes registrados en la empresa"
          />

          <MetricCard
            title="Clientes activos"
            value={
              summary.active_clients
            }
            description="Clientes actualmente activos"
          />

          <MetricCard
            title="Clientes inactivos"
            value={
              summary.inactive_clients
            }
            description="Clientes con acceso inactivo"
          />

          <MetricCard
            title="Con tickets"
            value={
              summary.clients_with_tickets
            }
            description="Clientes que ya tienen historial"
          />

          <MetricCard
            title="Integraciones"
            value={
              summary.integration_clients
            }
            description="Clientes provenientes de sistemas externos"
          />

          <MetricCard
            title="Tickets"
            value={
              summary.total_tickets
            }
            description="Tickets de todos los clientes"
          />

          <MetricCard
            title="Tickets abiertos"
            value={
              summary.total_open_tickets
            }
            description="Seguimientos pendientes"
          />

          <MetricCard
            title="Tickets resueltos"
            value={
              summary.total_resolved_tickets
            }
            description="Seguimientos concluidos"
          />
        </Box>

        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            border:
              "1px solid #e5e7eb",
            boxShadow: "none",
          }}
        >
          <Stack spacing={2}>
            <Typography
              fontWeight={900}
            >
              Filtros
            </Typography>

            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={1.5}
            >
              <TextField
                fullWidth
                size="small"
                label="Buscar cliente"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                helperText="Nombre, correo o teléfono"
              />

              <TextField
                select
                fullWidth
                size="small"
                label="Estado"
                value={
                  statusFilter
                }
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value,
                  )
                }
              >
                <MenuItem value="all">
                  Todos
                </MenuItem>

                <MenuItem value="active">
                  Activos
                </MenuItem>

                <MenuItem value="inactive">
                  Inactivos
                </MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                size="small"
                label="Origen"
                value={
                  originFilter
                }
                onChange={(event) =>
                  setOriginFilter(
                    event.target
                      .value,
                  )
                }
              >
                <MenuItem value="all">
                  Todos
                </MenuItem>

                <MenuItem value="registered">
                  Registrados
                </MenuItem>

                <MenuItem value="integration">
                  Integración
                </MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </Paper>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
          spacing={1.5}
        >
          <Box>
            <Typography
              fontWeight={900}
            >
              Lista de clientes
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Consulta información y
              actividad de cada cliente.
            </Typography>
          </Box>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
          >
            <Button
              variant="outlined"
              startIcon={
                refreshing ? (
                  <CircularProgress
                    size={16}
                  />
                ) : (
                  <RefreshIcon />
                )
              }
              disabled={refreshing}
              onClick={() =>
                loadClients({
                  refresh: true,
                })
              }
              sx={{
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              {refreshing
                ? "Actualizando..."
                : "Actualizar"}
            </Button>

            <Chip
              label={`${clientesFiltrados.length} resultado(s)`}
              variant="outlined"
              color="primary"
            />
          </Stack>
        </Stack>

        {clientesFiltrados.length ===
        0 ? (
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              border:
                "1px dashed #cbd5e1",
              bgcolor: "#f8fafc",
              textAlign: "center",
            }}
          >
            <Typography
              fontWeight={900}
            >
              No se encontraron
              clientes.
            </Typography>
          </Paper>
        ) : isMobile ? (
          <Stack spacing={2}>
            {clientesPaginados.map(
              (client) => (
                <ClienteCard
                  key={client.id}
                  client={client}
                  onEdit={
                    abrirEditar
                  }
                  onToggleStatus={(
                    item,
                  ) =>
                    setStatusClient(
                      item,
                    )
                  }
                  changingStatusId={
                    changingStatus
                      ? statusClient?.id
                      : null
                  }
                  onDelete={
                    abrirEliminar
                  }
                  deletingClientId={
                    deletingClient
                      ? deleteClient?.id
                      : null
                  }
                />
              ),
            )}

            <Paper>
              <ClientesPagination
                count={
                  clientesFiltrados.length
                }
                page={page}
                rowsPerPage={
                  rowsPerPage
                }
                onPageChange={(
                  event,
                  newPage,
                ) =>
                  setPage(newPage)
                }
                onRowsPerPageChange={(
                  event,
                ) => {
                  setRowsPerPage(
                    Number(
                      event.target
                        .value,
                    ),
                  );

                  setPage(0);
                }}
              />
            </Paper>
          </Stack>
        ) : (
          <Paper
            sx={{
              borderRadius: 3,
              border:
                "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <TableContainer
              sx={{
                maxHeight: 500,
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 900,
                      }}
                    >
                      Cliente
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 900,
                      }}
                    >
                      Contacto
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 900,
                      }}
                    >
                      Origen
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 900,
                      }}
                    >
                      Estado
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 900,
                      }}
                    >
                      Tickets
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 900,
                      }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {clientesPaginados.map(
                    (client) => {
                      const activo =
                        Number(
                          client.company_status,
                        ) === 1;

                      return (
                        <TableRow
                          key={
                            client.id
                          }
                          hover
                        >
                          <TableCell>
                            <Typography
                              fontWeight={
                                900
                              }
                            >
                              {nombreCompleto(
                                client,
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {
                                client.email
                              }
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {client.telefono
                                ? `Tel. ${client.telefono}`
                                : "Sin teléfono"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              variant="outlined"
                              label={
                                client.origin ===
                                "integration"
                                  ? "Integración"
                                  : "Registrado"
                              }
                              color={
                                client.origin ===
                                "integration"
                                  ? "secondary"
                                  : "primary"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                activo
                                  ? "Activo"
                                  : "Inactivo"
                              }
                              color={
                                activo
                                  ? "success"
                                  : "default"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Stack spacing={0.25}>
                              <Typography variant="caption">
                                Total:{" "}
                                <strong>
                                  {formatNumber(
                                    client.total_tickets,
                                  )}
                                </strong>
                              </Typography>

                              <Typography variant="caption">
                                Abiertos:{" "}
                                <strong>
                                  {formatNumber(
                                    client.open_tickets,
                                  )}
                                </strong>
                              </Typography>

                              <Typography variant="caption">
                                Resueltos:{" "}
                                <strong>
                                  {formatNumber(
                                    client.resolved_tickets,
                                  )}
                                </strong>
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Stack
                              spacing={
                                0.75
                              }
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={
                                  <EditIcon />
                                }
                                onClick={() =>
                                  abrirEditar(
                                    client,
                                  )
                                }
                                sx={{
                                  textTransform:
                                    "none",
                                  fontWeight:
                                    800,
                                }}
                              >
                                Editar
                              </Button>

                              <Button
                                size="small"
                                variant="contained"
                                color={
                                  activo
                                    ? "warning"
                                    : "success"
                                }
                                startIcon={
                                  activo ? (
                                    <ToggleOffIcon />
                                  ) : (
                                    <ToggleOnIcon />
                                  )
                                }
                                onClick={() =>
                                  setStatusClient(
                                    client,
                                  )
                                }
                                disabled={
                                  changingStatus &&
                                  Number(
                                    statusClient?.id,
                                  ) ===
                                    Number(
                                      client.id,
                                    )
                                }
                                sx={{
                                  textTransform:
                                    "none",
                                  fontWeight:
                                    800,
                                  boxShadow:
                                    "none",
                                }}
                              >
                                {changingStatus &&
                                Number(
                                  statusClient?.id,
                                ) ===
                                  Number(
                                    client.id,
                                  )
                                  ? "Procesando..."
                                  : activo
                                    ? "Inactivar"
                                    : "Activar"}
                              </Button>

                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={
                                  <DeleteIcon />
                                }
                                onClick={() =>
                                  abrirEliminar(
                                    client,
                                  )
                                }
                                disabled={
                                  deletingClient &&
                                  Number(
                                    deleteClient?.id,
                                  ) ===
                                    Number(
                                      client.id,
                                    )
                                }
                                sx={{
                                  textTransform:
                                    "none",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {deletingClient &&
                                Number(
                                  deleteClient?.id,
                                ) ===
                                  Number(
                                    client.id,
                                  )
                                  ? "Eliminando..."
                                  : "Eliminar"}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <ClientesPagination
              count={
                clientesFiltrados.length
              }
              page={page}
              rowsPerPage={
                rowsPerPage
              }
              onPageChange={(
                event,
                newPage,
              ) =>
                setPage(newPage)
              }
              onRowsPerPageChange={(
                event,
              ) => {
                setRowsPerPage(
                  Number(
                    event.target.value,
                  ),
                );

                setPage(0);
              }}
            />
          </Paper>
        )}
      </Stack>

      <EditarClienteDialog
        open={openEditDialog}
        client={selectedClient}
        onClose={cerrarEditar}
        onUpdated={
          handleUpdated
        }
      />

      <ConfirmarEstadoDialog
        open={Boolean(
          statusClient,
        )}
        client={statusClient}
        cargando={
          changingStatus
        }
        onClose={() => {
          if (!changingStatus) {
            setStatusClient(null);
          }
        }}
        onConfirm={
          confirmarEstado
        }
      />

      <ConfirmarEliminarDialog
        open={Boolean(
          deleteClient,
        )}
        client={deleteClient}
        cargando={
          deletingClient
        }
        error={deleteError}
        onClose={
          cerrarEliminar
        }
        onConfirm={
          confirmarEliminar
        }
      />
    </Box>
  );
}