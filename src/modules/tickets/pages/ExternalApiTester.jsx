import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const API_BASE_URL = "https://api.thebusinessticket.com/api";

const TEST_ENDPOINTS = [
  {
    key: "create-customer",
    label: "Crear cliente",
    method: "POST",
    path: "/external/customers",
    bodyMode: "json",
    needsFolio: false,
    needsExternalCustomerId: false,
    needsFile: false,
    buildUrl: () => `${API_BASE_URL}/external/customers`,
    defaultBody: {
      name: "Cliente Demo API",
      email: "cliente.demo.api@example.com",
      phone: "7441234567",
      external_customer_id: "demo-client-001",
    },
  },
  {
    key: "show-customer",
    label: "Ver detalle cliente",
    method: "GET",
    path: "/external/customers/{external_customer_id}",
    bodyMode: null,
    needsFolio: false,
    needsExternalCustomerId: true,
    needsFile: false,
    buildUrl: ({ externalCustomerId }) =>
      `${API_BASE_URL}/external/customers/${encodeURIComponent(
        externalCustomerId,
      )}`,
    defaultBody: null,
  },
  {
    key: "list-customer-tickets",
    label: "Listar tickets del cliente",
    method: "GET",
    path: "/external/customers/{external_customer_id}/tickets",
    bodyMode: null,
    needsFolio: false,
    needsExternalCustomerId: true,
    needsFile: false,
    buildUrl: ({ externalCustomerId }) =>
      `${API_BASE_URL}/external/customers/${encodeURIComponent(
        externalCustomerId,
      )}/tickets?per_page=20&page=1`,
    defaultBody: null,
  },
  {
    key: "create-ticket",
    label: "Crear ticket",
    method: "POST",
    path: "/external/tickets",
    bodyMode: "json",
    needsFolio: false,
    needsExternalCustomerId: false,
    needsFile: false,
    buildUrl: () => `${API_BASE_URL}/external/tickets`,
    defaultBody: {
      customer: {
        name: "Cliente Demo API",
        email: "cliente.demo.api@example.com",
        phone: "7441234567",
        external_customer_id: "demo-client-001",
      },
      ticket: {
        section_code: "reportes",
        priority_id: 1,
        subject: "Prueba desde panel de API externa",
        description:
          "Ticket creado desde el apartado de pruebas reales del dashboard.",
        external_reference: "tester-ticket-001",
      },
    },
  },
  {
    key: "show-ticket",
    label: "Consultar ticket",
    method: "GET",
    path: "/external/tickets/{folio}",
    bodyMode: null,
    needsFolio: true,
    needsExternalCustomerId: true,
    needsFile: false,
    buildUrl: ({ folio, externalCustomerId }) =>
      `${API_BASE_URL}/external/tickets/${encodeURIComponent(
        folio,
      )}?external_customer_id=${encodeURIComponent(externalCustomerId)}`,
    defaultBody: null,
  },
  {
    key: "create-comment",
    label: "Agregar comentario",
    method: "POST",
    path: "/external/tickets/{folio}/comments",
    bodyMode: "json",
    needsFolio: true,
    needsExternalCustomerId: true,
    sendExternalCustomerIdInBody: true,
    needsFile: false,
    buildUrl: ({ folio }) =>
      `${API_BASE_URL}/external/tickets/${encodeURIComponent(folio)}/comments`,
    defaultBody: {
      message: "Comentario enviado desde el panel de pruebas reales.",
      author_name: "Sistema Integral Demo",
      external_reference: "tester-comment-001",
    },
  },
  {
    key: "create-attachment-base64",
    label: "Adjuntar archivo base64",
    method: "POST",
    path: "/external/tickets/{folio}/attachments",
    bodyMode: "json",
    needsFolio: true,
    needsExternalCustomerId: true,
    sendExternalCustomerIdInBody: true,
    needsFile: false,
    buildUrl: ({ folio }) =>
      `${API_BASE_URL}/external/tickets/${encodeURIComponent(
        folio,
      )}/attachments`,
    defaultBody: {
      message: "Archivo enviado desde el panel de pruebas reales.",
      author_name: "Sistema Integral Demo",
      external_reference: "tester-attachment-base64-001",
      attachments_base64: [
        {
          filename: "evidencia-error.txt",
          mime: "text/plain",
          content: "cHJ1ZWJhIGRlIGFyY2hpdm8=",
        },
      ],
    },
  },
  {
    key: "create-attachment-file",
    label: "Adjuntar archivo seleccionado",
    method: "POST",
    path: "/external/tickets/{folio}/attachments",
    bodyMode: "multipart",
    needsFolio: true,
    needsExternalCustomerId: true,
    sendExternalCustomerIdInBody: true,
    needsFile: true,
    buildUrl: ({ folio }) =>
      `${API_BASE_URL}/external/tickets/${encodeURIComponent(
        folio,
      )}/attachments`,
    defaultBody: {
      message: "Archivo físico enviado desde el panel de pruebas reales.",
      author_name: "Sistema Integral Demo",
      external_reference: "tester-attachment-file-001",
    },
  },
];

const methodColor = {
  GET: "info",
  POST: "success",
};

function formatJson(value) {
  if (!value) return "";

  return JSON.stringify(value, null, 2);
}

function CodeResult({ value }) {
  const text =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);

  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 2,
        borderRadius: 2,
        bgcolor: "#0f172a",
        color: "#e5e7eb",
        fontSize: 13,
        lineHeight: 1.6,
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {text}
    </Box>
  );
}

export default function ExternalApiTester() {
  const [endpointKey, setEndpointKey] = useState("create-customer");
  const [token, setToken] = useState("");
  const [folio, setFolio] = useState("");
  const [externalCustomerId, setExternalCustomerId] =
    useState("demo-client-001");
  const [bodyText, setBodyText] = useState(
    formatJson(TEST_ENDPOINTS[0].defaultBody),
  );
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseData, setResponseData] = useState(null);

  const selectedEndpoint = useMemo(() => {
    return (
      TEST_ENDPOINTS.find((endpoint) => endpoint.key === endpointKey) ||
      TEST_ENDPOINTS[0]
    );
  }, [endpointKey]);

  const finalUrl = useMemo(() => {
    return selectedEndpoint.buildUrl({
      folio,
      externalCustomerId,
    });
  }, [selectedEndpoint, folio, externalCustomerId]);

  const cambiarEndpoint = (event) => {
    const nextKey = event.target.value;
    const nextEndpoint =
      TEST_ENDPOINTS.find((endpoint) => endpoint.key === nextKey) ||
      TEST_ENDPOINTS[0];

    setEndpointKey(nextKey);
    setError("");
    setResponseStatus(null);
    setResponseData(null);
    setSelectedFile(null);
    setBodyText(formatJson(nextEndpoint.defaultBody));
  };

  const ejecutarPrueba = async () => {
    setError("");
    setResponseStatus(null);
    setResponseData(null);

    const cleanToken = token.trim();

    if (!cleanToken) {
      setError("Debes pegar un token externo/API Key para ejecutar la prueba.");
      return;
    }

    if (selectedEndpoint.needsFolio && !folio.trim()) {
      setError("Este endpoint necesita un folio de ticket.");
      return;
    }

    if (
      selectedEndpoint.needsExternalCustomerId &&
      !externalCustomerId.trim()
    ) {
      setError("Este endpoint necesita un external_customer_id.");
      return;
    }

    if (selectedEndpoint.needsFile && !selectedFile) {
      setError("Debes seleccionar un archivo para esta prueba.");
      return;
    }

    let parsedBody = null;

    if (
      selectedEndpoint.bodyMode === "json" ||
      selectedEndpoint.bodyMode === "multipart"
    ) {
      try {
        parsedBody = bodyText.trim() ? JSON.parse(bodyText) : {};
      } catch (jsonError) {
        setError(
          "El body no es un JSON válido. Revisa comas, llaves y comillas.",
        );
        return;
      }
    }

    setLoading(true);

    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${cleanToken}`,
      };

      const options = {
        method: selectedEndpoint.method,
        headers,
      };

      if (selectedEndpoint.bodyMode === "json") {
        headers["Content-Type"] = "application/json";

        const requestBody = {
          ...(parsedBody || {}),
        };

        if (selectedEndpoint.sendExternalCustomerIdInBody) {
          requestBody.external_customer_id =
            externalCustomerId.trim();
        }

        options.body = JSON.stringify(requestBody);
      }

      if (selectedEndpoint.bodyMode === "multipart") {
        const formData = new FormData();

        const requestBody = {
          ...(parsedBody || {}),
        };

        if (selectedEndpoint.sendExternalCustomerIdInBody) {
          requestBody.external_customer_id =
            externalCustomerId.trim();
        }

        Object.entries(requestBody).forEach(([key, value]) => {
          if (value === null || value === undefined) return;

          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
            return;
          }

          formData.append(key, value);
        });

        formData.append("attachments[]", selectedFile);

        options.body = formData;
      }

      const response = await fetch(finalUrl, options);
      const rawText = await response.text();

      let parsedResponse;

      try {
        parsedResponse = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        parsedResponse = rawText || null;
      }

      setResponseStatus(response.status);
      setResponseData(parsedResponse);
    } catch (requestError) {
      setError(
        "No se pudo ejecutar la solicitud. Revisa CORS, conexión o URL de la API.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copiarRespuesta = async () => {
    if (!responseData) return;

    try {
      await navigator.clipboard.writeText(
        typeof responseData === "string"
          ? responseData
          : JSON.stringify(responseData, null, 2),
      );
    } catch (copyError) {
      // No bloquea la prueba si falla el copiado.
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1, md: 2 },
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography
            fontWeight={900}
            sx={{
              fontSize: { xs: 22, md: 28 },
              lineHeight: 1.15,
            }}
          >
            Pruebas reales de API externa
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Ejecuta solicitudes reales contra los endpoints externos usando un
            token/API Key activo.
          </Typography>
        </Box>

        <Alert severity="warning">
          Herramienta de uso interno. Esta sección ejecuta solicitudes reales
          contra la API externa. Úsala solo con tokens autorizados y para
          pruebas controladas. El token no se guarda en localStorage.
        </Alert>

        {error && <Alert severity="error">{error}</Alert>}

        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                select
                fullWidth
                label="Endpoint a probar"
                value={endpointKey}
                onChange={cambiarEndpoint}
              >
                {TEST_ENDPOINTS.map((endpoint) => (
                  <MenuItem key={endpoint.key} value={endpoint.key}>
                    {endpoint.label}
                  </MenuItem>
                ))}
              </TextField>

              <Box
                sx={{
                  minWidth: { xs: "100%", md: 260 },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={selectedEndpoint.method}
                    color={methodColor[selectedEndpoint.method] || "default"}
                    size="small"
                    sx={{ fontWeight: 900 }}
                  />

                  <Typography fontWeight={900}>
                    {selectedEndpoint.path}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <TextField
              fullWidth
              label="Token externo / API Key"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="tbt_ext_..."
              type="password"
              helperText="Pega aquí el token completo generado en API externa → Tokens externos."
            />

            <TextField
              fullWidth
              label="URL final"
              value={finalUrl}
              InputProps={{
                readOnly: true,
              }}
            />

            {selectedEndpoint.needsExternalCustomerId && (
              <TextField
                fullWidth
                label="external_customer_id"
                value={externalCustomerId}
                onChange={(event) =>
                  setExternalCustomerId(event.target.value)
                }
                placeholder="demo-client-001"
                helperText="Identificador estable del cliente dentro del sistema externo."
              />
            )}

            {selectedEndpoint.needsFolio && (
              <TextField
                fullWidth
                label="Folio del ticket"
                value={folio}
                onChange={(event) => setFolio(event.target.value)}
                placeholder="TBT-YYYYMMDD-XXXXXX"
              />
            )}

            {(selectedEndpoint.bodyMode === "json" ||
              selectedEndpoint.bodyMode === "multipart") && (
              <TextField
                fullWidth
                multiline
                minRows={selectedEndpoint.bodyMode === "multipart" ? 5 : 10}
                label={
                  selectedEndpoint.bodyMode === "multipart"
                    ? "Datos del formulario"
                    : "Body JSON"
                }
                value={bodyText}
                onChange={(event) => setBodyText(event.target.value)}
                helperText={
                  selectedEndpoint.bodyMode === "multipart"
                    ? "Estos campos se enviarán como FormData junto con el archivo seleccionado."
                    : "Este contenido se enviará como JSON."
                }
                sx={{
                  "& textarea": {
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                    fontSize: 13,
                    lineHeight: 1.5,
                  },
                }}
              />
            )}

            {selectedEndpoint.needsFile && (
              <Box>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{
                      minHeight: 38,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Seleccionar archivo
                    <input
                      hidden
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setSelectedFile(file);
                      }}
                    />
                  </Button>

                  <Typography variant="body2" color="text.secondary">
                    {selectedFile
                      ? `${selectedFile.name} (${Math.round(
                          selectedFile.size / 1024,
                        )} KB)`
                      : "No has seleccionado archivo."}
                  </Typography>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  Permitidos: jpg, jpeg, png, webp, pdf, doc, docx, xls, xlsx,
                  txt y zip. Tamaño máximo recomendado: 10 MB.
                </Typography>
              </Box>
            )}

            <Divider />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Typography variant="body2" color="text.secondary">
                Ejecutará una solicitud real contra la API de producción.
              </Typography>

              <Button
                variant="contained"
                onClick={ejecutarPrueba}
                disabled={loading}
                sx={{
                  minHeight: 38,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} color="inherit" />
                    <span>Ejecutando...</span>
                  </Stack>
                ) : (
                  "Ejecutar prueba"
                )}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={1}
            >
              <Box>
                <Typography fontWeight={900} sx={{ fontSize: 20 }}>
                  Resultado de la prueba
                </Typography>

                <Typography color="text.secondary">
                  Aquí aparecerá el status HTTP y la respuesta devuelta por la
                  API.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                {responseStatus && (
                  <Chip
                    label={`Status ${responseStatus}`}
                    color={
                      responseStatus >= 200 && responseStatus < 300
                        ? "success"
                        : "error"
                    }
                    sx={{ fontWeight: 900 }}
                  />
                )}

                <Button
                  variant="outlined"
                  size="small"
                  onClick={copiarRespuesta}
                  disabled={!responseData}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  Copiar respuesta
                </Button>
              </Stack>
            </Stack>

            {responseData ? (
              <CodeResult value={responseData} />
            ) : (
              <Alert severity="info">
                Aún no se ha ejecutado ninguna prueba.
              </Alert>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}