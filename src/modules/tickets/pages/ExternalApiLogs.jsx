import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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

const getStatusInfo = (statusCode) => {
  const code = Number(statusCode);

  if (code >= 200 && code <= 299) {
    return {
      label: `${code} OK`,
      color: "success",
    };
  }

  if (code === 429) {
    return {
      label: `${code} Rate limit`,
      color: "warning",
    };
  }

  if (code >= 400 && code <= 499) {
    return {
      label: `${code} Error cliente`,
      color: "error",
    };
  }

  if (code >= 500) {
    return {
      label: `${code} Error servidor`,
      color: "error",
    };
  }

  return {
    label: statusCode || "Sin status",
    color: "default",
  };
};

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

function StatCard({ title, value, helper }) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          "&:last-child": {
            pb: { xs: 1.5, sm: 2 },
          },
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={900}
          sx={{
            textTransform: "uppercase",
            letterSpacing: 0.4,
            fontSize: { xs: 10, sm: 12 },
          }}
        >
          {title}
        </Typography>

        <Typography
          fontWeight={900}
          lineHeight={1.15}
          sx={{
            mt: 0.5,
            fontSize: { xs: 22, sm: 26 },
          }}
        >
          {value}
        </Typography>

        {helper && (
          <Typography variant="caption" color="text.secondary">
            {helper}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function MobileLogCard({ log }) {
  const status = getStatusInfo(log.status_code);

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Box>
              <Typography fontWeight={900}>
                {log.system_name || "Sin sistema"}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Log #{log.id}
                {log.system_id ? ` · Sistema ID ${log.system_id}` : ""}
              </Typography>
            </Box>

            <Chip
              label={status.label}
              color={status.color}
              size="small"
              sx={{ fontWeight: 900 }}
            />
          </Stack>

          <Divider />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={800}
            >
              Endpoint
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                wordBreak: "break-all",
              }}
            >
              {log.endpoint || "—"}
            </Typography>
          </Box>

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
              >
                Método
              </Typography>

              <Box>
                <Chip
                  label={log.method || "—"}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 900 }}
                />
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
              >
                Fecha
              </Typography>

              <Typography variant="body2">
                {formatFecha(log.created_at)}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
              >
                Referencia
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  wordBreak: "break-word",
                }}
              >
                {log.external_reference || "—"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
              >
                Token
              </Typography>

              <Typography variant="body2">{log.token_name || "—"}</Typography>

              {log.token_prefix && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    wordBreak: "break-all",
                  }}
                >
                  {log.token_prefix}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
              >
                IP
              </Typography>

              <Typography variant="body2">{log.request_ip || "—"}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
              >
                Error
              </Typography>

              {log.error_code ? (
                <Box>
                  <Typography variant="body2" fontWeight={900} color="error">
                    {log.error_code}
                  </Typography>

                  {log.error_message && (
                    <Typography variant="body2" color="text.secondary">
                      {log.error_message}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  —
                </Typography>
              )}
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ExternalApiLogs() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [logs, setLogs] = useState([]);

  const [summary, setSummary] = useState({
    total: 0,
    success: 0,
    errors_4xx: 0,
    errors_5xx: 0,
    rate_limited: 0,
  });

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });

  const [filters, setFilters] = useState({
    q: "",
    system_id: "",
    status_code: "",
    method: "",
    date_from: "",
    date_to: "",
  });

  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState("");

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

  const cargarLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await axiosCliente.get("/external-api/logs", {
        params,
      });

      setLogs(data?.data || []);

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
          "No se pudieron cargar los logs externos.",
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarResumen = async () => {
    setSummaryLoading(true);

    try {
      const summaryParams = {};

      if (filters.system_id) {
        summaryParams.system_id = filters.system_id;
      }

      if (filters.date_from) {
        summaryParams.date_from = filters.date_from;
      }

      if (filters.date_to) {
        summaryParams.date_to = filters.date_to;
      }

      const { data } = await axiosCliente.get("/external-api/logs/summary", {
        params: summaryParams,
      });

      setSummary(
        data?.summary || {
          total: 0,
          success: 0,
          errors_4xx: 0,
          errors_5xx: 0,
          rate_limited: 0,
        },
      );
    } catch (err) {
      // El resumen no debe romper la tabla.
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    cargarLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    cargarResumen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.system_id, filters.date_from, filters.date_to]);

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
      status_code: "",
      method: "",
      date_from: "",
      date_to: "",
    });

    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));
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
            Logs de API externa
          </Typography>

          <Typography color="text.secondary">
            Consulta los consumos realizados por sistemas externos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            cargarLogs();
            cargarResumen();
          }}
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            alignSelf: { xs: "stretch", md: "center" },
            minHeight: 44,
          }}
        >
          Actualizar
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            md: "repeat(5, minmax(0, 1fr))",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="Total"
          value={summaryLoading ? "..." : summary.total}
        />

        <StatCard
          title="Correctos"
          value={summaryLoading ? "..." : summary.success}
        />

        <StatCard
          title="Errores 4xx"
          value={summaryLoading ? "..." : summary.errors_4xx}
        />

        <StatCard
          title="Errores 5xx"
          value={summaryLoading ? "..." : summary.errors_5xx}
        />

        <StatCard
          title="Rate limit"
          value={summaryLoading ? "..." : summary.rate_limited}
        />
      </Box>

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
                md: "repeat(3, minmax(0, 1fr))",
                lg: "2fr 1.4fr 1.2fr 1.4fr 1.2fr 1.2fr",
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
              placeholder="Sistema, endpoint, error, IP..."
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
              label="Método"
              size="small"
              value={filters.method}
              onChange={(e) => actualizarFiltro("method", e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="PATCH">PATCH</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Status code"
              size="small"
              value={filters.status_code}
              onChange={(e) => actualizarFiltro("status_code", e.target.value)}
              placeholder="201, 422, 429..."
            />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
                sx={{ display: "block", mb: 0.5 }}
              >
                Desde
              </Typography>

              <TextField
                fullWidth
                type="date"
                size="small"
                value={filters.date_from}
                onChange={(e) => actualizarFiltro("date_from", e.target.value)}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
                sx={{ display: "block", mb: 0.5 }}
              >
                Hasta
              </Typography>

              <TextField
                fullWidth
                type="date"
                size="small"
                value={filters.date_to}
                onChange={(e) => actualizarFiltro("date_to", e.target.value)}
              />
            </Box>
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
              onClick={cargarLogs}
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
          <Typography fontWeight={900}>Registros recientes</Typography>

          <Typography variant="body2" color="text.secondary">
            Mostrando {pagination.total} registros encontrados.
          </Typography>
        </Box>

        <Divider />

        {isMobile ? (
          <Box sx={{ p: 1.5 }}>
            {loading ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <CircularProgress size={28} />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Cargando logs...
                </Typography>
              </Box>
            ) : logs.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No se encontraron registros.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {logs.map((log) => (
                  <MobileLogCard key={log.id} log={log} />
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
                minWidth: 1250,
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
                  <TableCell>Token</TableCell>
                  <TableCell>Endpoint</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Referencia</TableCell>
                  <TableCell>Error</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Fecha</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={28} />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Cargando logs...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        No se encontraron registros.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const status = getStatusInfo(log.status_code);

                    return (
                      <TableRow key={log.id} hover>
                        <TableCell>{log.id}</TableCell>

                        <TableCell>
                          <Typography fontWeight={800} variant="body2">
                            {log.system_name || "Sin sistema"}
                          </Typography>

                          {log.system_id && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ID {log.system_id}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {log.token_name || "—"}
                          </Typography>

                          {log.token_prefix && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              {log.token_prefix}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Tooltip title={log.endpoint || ""}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 260,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontFamily:
                                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                              }}
                            >
                              {log.endpoint || "—"}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={log.method || "—"}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 900 }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                            sx={{ fontWeight: 900 }}
                          />
                        </TableCell>

                        <TableCell>
                          <Tooltip title={log.external_reference || ""}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 220,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {log.external_reference || "—"}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        <TableCell>
                          {log.error_code ? (
                            <Tooltip title={log.error_message || ""}>
                              <Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={800}
                                  color="error"
                                >
                                  {log.error_code}
                                </Typography>

                                {log.error_message && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: "block",
                                      maxWidth: 260,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {log.error_message}
                                  </Typography>
                                )}
                              </Box>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {log.request_ip || "—"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {formatFecha(log.created_at)}
                          </Typography>
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
    </Box>
  );
}
