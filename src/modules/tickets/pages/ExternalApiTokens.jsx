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
  useTheme,
} from "@mui/material";

import axiosCliente from "../../../services/axiosCliente";

const sistemasIniciales = [
  { id: "", nombre: "Todos" },
  { id: 8, nombre: "TAECONTA" },
  { id: 9, nombre: "Mi Tienda en Línea MX" },
  { id: 10, nombre: "Clic Menu" },
  { id: 11, nombre: "Telorecargo" },
  { id: 12, nombre: "Tecnologías Administrativas ELAD" },
];

const sistemasParaCrear = sistemasIniciales.filter((sistema) => sistema.id !== "");

const formatFecha = (value) => {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

function MobileTokenCard({ token, onToggle }) {
  const activo = Boolean(token.active);

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Box>
              <Typography fontWeight={900}>{token.name}</Typography>

              <Typography variant="caption" color="text.secondary">
                Token #{token.id}
              </Typography>
            </Box>

            <Chip
              label={activo ? "Activo" : "Inactivo"}
              color={activo ? "success" : "default"}
              size="small"
              sx={{ fontWeight: 900 }}
            />
          </Stack>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              Sistema
            </Typography>

            <Typography variant="body2">
              {token.system_name || "Sin sistema"}
              {token.system_id ? ` · ID ${token.system_id}` : ""}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              Prefijo
            </Typography>

            <Typography
              variant="body2"
              sx={{
                wordBreak: "break-all",
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
              }}
            >
              {token.token_prefix || "—"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              Expira
            </Typography>

            <Typography variant="body2">{formatFecha(token.expires_at)}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              Último uso
            </Typography>

            <Typography variant="body2">{formatFecha(token.last_used_at)}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              Creado
            </Typography>

            <Typography variant="body2">{formatFecha(token.created_at)}</Typography>
          </Box>

          <Button
            fullWidth
            variant={activo ? "outlined" : "contained"}
            color={activo ? "error" : "success"}
            onClick={() => onToggle(token)}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              mt: 1,
            }}
          >
            {activo ? "Desactivar token" : "Activar token"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ExternalApiTokens() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [tokens, setTokens] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });

  const [filters, setFilters] = useState({
    q: "",
    system_id: "",
    active: "",
  });

  const [form, setForm] = useState({
    system_id: 10,
    name: "",
    expires_at: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const params = useMemo(() => {
    const cleanParams = {
      page: pagination.current_page,
      per_page: pagination.per_page,
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        cleanParams[key] = value;
      }
    });

    return cleanParams;
  }, [filters, pagination.current_page, pagination.per_page]);

  const cargarTokens = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await axiosCliente.get("/external-api/tokens", {
        params,
      });

      setTokens(data?.data || []);

      setPagination((prev) => ({
        ...prev,
        current_page: data?.pagination?.current_page || 1,
        per_page: data?.pagination?.per_page || prev.per_page,
        total: data?.pagination?.total || 0,
        last_page: data?.pagination?.last_page || 1,
      }));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudieron cargar los tokens externos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const actualizarFiltro = (campo, valor) => {
    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));

    setFilters((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limpiarFiltros = () => {
    setFilters({
      q: "",
      system_id: "",
      active: "",
    });

    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));
  };

  const abrirModalCrear = () => {
    setGeneratedToken(null);
    setForm({
      system_id: 10,
      name: "",
      expires_at: "",
    });
    setModalOpen(true);
  };

  const cerrarModalCrear = () => {
    setModalOpen(false);
    setGeneratedToken(null);
    setForm({
      system_id: 10,
      name: "",
      expires_at: "",
    });
  };

  const crearToken = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        system_id: form.system_id,
        name: form.name,
      };

      if (form.expires_at) {
        payload.expires_at = form.expires_at;
      }

      const { data } = await axiosCliente.post("/external-api/tokens", payload);

      setGeneratedToken(data?.plain_token || null);
      setSuccess(data?.message || "Token externo generado correctamente.");

      cargarTokens();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo generar el token externo."
      );
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstadoToken = async (token) => {
    const activo = Boolean(token.active);
    const endpoint = activo
      ? `/external-api/tokens/${token.id}/deactivate`
      : `/external-api/tokens/${token.id}/activate`;

    setError("");
    setSuccess("");

    try {
      const { data } = await axiosCliente.patch(endpoint);

      setSuccess(data?.message || "Estado del token actualizado.");
      cargarTokens();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo actualizar el estado del token."
      );
    }
  };

  const copiarToken = async () => {
    if (!generatedToken) return;

    try {
      await navigator.clipboard.writeText(generatedToken);
      setSuccess("Token copiado al portapapeles.");
    } catch (error) {
      setError("No se pudo copiar el token. Cópialo manualmente.");
    }
  };

  const cambiarPagina = (_, nuevaPagina) => {
    setPagination((prev) => ({
      ...prev,
      current_page: nuevaPagina + 1,
    }));
  };

  const cambiarFilas = (event) => {
    setPagination((prev) => ({
      ...prev,
      current_page: 1,
      per_page: parseInt(event.target.value, 10),
    }));
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            fontWeight={900}
            sx={{
              fontSize: { xs: 26, md: 34 },
              lineHeight: 1.15,
            }}
          >
            Tokens de API externa
          </Typography>

          <Typography color="text.secondary">
            Administra los tokens usados por sistemas externos para crear,
            consultar, comentar y adjuntar tickets.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            onClick={cargarTokens}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              minHeight: 44,
            }}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            onClick={abrirModalCrear}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              minHeight: 44,
            }}
          >
            Nuevo token
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper
        sx={{
          p: { xs: 1.5, md: 2 },
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Stack spacing={2}>
          <Typography fontWeight={900}>Filtros</Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "2fr 1.4fr 1fr",
              },
              gap: 2,
              alignItems: "end",
            }}
          >
            <TextField
              fullWidth
              label="Buscar"
              size="small"
              value={filters.q}
              onChange={(e) => actualizarFiltro("q", e.target.value)}
              placeholder="Sistema, nombre o prefijo..."
            />

            <TextField
              fullWidth
              select
              label="Sistema"
              size="small"
              value={filters.system_id}
              onChange={(e) => actualizarFiltro("system_id", e.target.value)}
            >
              {sistemasIniciales.map((sistema) => (
                <MenuItem key={sistema.id || "all"} value={sistema.id}>
                  {sistema.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Estado"
              size="small"
              value={filters.active}
              onChange={(e) => actualizarFiltro("active", e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="1">Activos</MenuItem>
              <MenuItem value="0">Inactivos</MenuItem>
            </TextField>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="flex-end"
            spacing={1}
          >
            <Button
              variant="outlined"
              onClick={limpiarFiltros}
              fullWidth={isMobile}
              sx={{
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Limpiar filtros
            </Button>

            <Button
              variant="contained"
              onClick={cargarTokens}
              disabled={loading}
              fullWidth={isMobile}
              sx={{
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Buscar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        sx={{
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Box sx={{ p: { xs: 1.5, md: 2 } }}>
          <Typography fontWeight={900}>Tokens registrados</Typography>

          <Typography variant="body2" color="text.secondary">
            Mostrando {pagination.total} tokens encontrados.
          </Typography>
        </Box>

        <Divider />

        {isMobile ? (
          <Box sx={{ p: 1.5 }}>
            {loading ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <CircularProgress size={28} />

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Cargando tokens...
                </Typography>
              </Box>
            ) : tokens.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No se encontraron tokens.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {tokens.map((token) => (
                  <MobileTokenCard
                    key={token.id}
                    token={token}
                    onToggle={cambiarEstadoToken}
                  />
                ))}
              </Stack>
            )}
          </Box>
        ) : (
          <TableContainer
            sx={{
              maxHeight: 620,
              overflowX: "auto",
            }}
          >
            <Table
              stickyHeader
              size="small"
              sx={{
                minWidth: 1050,
                "& th": {
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                  bgcolor: "#f8fafc",
                },
                "& td": {
                  verticalAlign: "top",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Sistema</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Prefijo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Expira</TableCell>
                  <TableCell>Último uso</TableCell>
                  <TableCell>Creado</TableCell>
                  <TableCell align="right">Acción</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={28} />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Cargando tokens...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : tokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        No se encontraron tokens.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tokens.map((token) => {
                    const activo = Boolean(token.active);

                    return (
                      <TableRow key={token.id} hover>
                        <TableCell>{token.id}</TableCell>

                        <TableCell>
                          <Typography fontWeight={800} variant="body2">
                            {token.system_name || "Sin sistema"}
                          </Typography>

                          {token.system_id && (
                            <Typography variant="caption" color="text.secondary">
                              ID {token.system_id}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={800}>
                            {token.name || "—"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Tooltip title={token.token_prefix || ""}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 180,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontFamily:
                                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                              }}
                            >
                              {token.token_prefix || "—"}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={activo ? "Activo" : "Inactivo"}
                            color={activo ? "success" : "default"}
                            size="small"
                            sx={{ fontWeight: 900 }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {formatFecha(token.expires_at)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {formatFecha(token.last_used_at)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {formatFecha(token.created_at)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            variant={activo ? "outlined" : "contained"}
                            color={activo ? "error" : "success"}
                            onClick={() => cambiarEstadoToken(token)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 900,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {activo ? "Desactivar" : "Activar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          component="div"
          count={pagination.total}
          page={Math.max(0, pagination.current_page - 1)}
          onPageChange={cambiarPagina}
          rowsPerPage={pagination.per_page}
          onRowsPerPageChange={cambiarFilas}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Filas por página"
        />
      </Paper>

      <Dialog
        open={modalOpen}
        onClose={generatedToken ? undefined : cerrarModalCrear}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={900}>Generar token externo</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              El token completo solo se mostrará una vez. Cópialo antes de cerrar
              esta ventana.
            </Alert>

            <TextField
              fullWidth
              select
              label="Sistema"
              value={form.system_id}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  system_id: Number(e.target.value),
                }))
              }
              disabled={Boolean(generatedToken)}
            >
              {sistemasParaCrear.map((sistema) => (
                <MenuItem key={sistema.id} value={sistema.id}>
                  {sistema.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Nombre del token"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Ej. Clic Menu producción"
              disabled={Boolean(generatedToken)}
            />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
                sx={{ display: "block", mb: 0.5 }}
              >
                Expira
              </Typography>

              <TextField
                fullWidth
                type="date"
                value={form.expires_at}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    expires_at: e.target.value,
                  }))
                }
                disabled={Boolean(generatedToken)}
              />
            </Box>

            {generatedToken && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "#f8fafc",
                }}
              >
                <Typography fontWeight={900} sx={{ mb: 1 }}>
                  Token generado
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    wordBreak: "break-all",
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                  }}
                >
                  {generatedToken}
                </Typography>

                <Button
                  variant="contained"
                  onClick={copiarToken}
                  sx={{
                    mt: 1.5,
                    textTransform: "none",
                    fontWeight: 900,
                  }}
                >
                  Copiar token
                </Button>
              </Paper>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={cerrarModalCrear}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            Cerrar
          </Button>

          {!generatedToken && (
            <Button
              variant="contained"
              onClick={crearToken}
              disabled={saving || !form.system_id || !form.name}
              sx={{ textTransform: "none", fontWeight: 900 }}
            >
              {saving ? "Generando..." : "Generar token"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}