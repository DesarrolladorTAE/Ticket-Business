import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

const API_BASE_URL = "https://api.thebusinessticket.com/api";

const demoToken = "TOKEN_DEL_SISTEMA_DEMO";
const demoFolio = "TBT-YYYYMMDD-XXXXXX";
const demoExternalCustomerId = "demo-client-001";

const endpoints = [
  {
    label: "Crear cliente",
    method: "POST",
    path: "/external/customers",
    url: `${API_BASE_URL}/external/customers`,
    description:
      "Registra o actualiza un cliente externo asociado al sistema autorizado por token/API Key.",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${demoToken}`,
    },
    body: {
      name: "Cliente Demo API",
      email: "cliente.demo.api@example.com",
      phone: "7441234567",
      external_customer_id: demoExternalCustomerId,
    },
    response: {
      ok: true,
      message: "Cliente externo registrado correctamente.",
      customer: {
        external_customer_id: demoExternalCustomerId,
        name: "Cliente Demo API",
        email: "cliente.demo.api@example.com",
        phone: "7441234567",
      },
    },
    notes: [
      "El sistema externo debe enviar un external_customer_id único para identificar al cliente.",
      "Si el cliente ya existe para ese sistema, la API puede actualizar sus datos.",
      "El origen del cliente se identifica por el token/API Key, no por system_id en el body.",
    ],
  },
  {
    label: "Ver detalle cliente",
    method: "GET",
    path: "/external/customers/{external_customer_id}",
    url: `${API_BASE_URL}/external/customers/${demoExternalCustomerId}`,
    description:
      "Consulta los datos de un cliente externo usando su external_customer_id.",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${demoToken}`,
    },
    body: null,
    response: {
      ok: true,
      customer: {
        external_customer_id: demoExternalCustomerId,
        name: "Cliente Demo API",
        email: "cliente.demo.api@example.com",
        phone: "7441234567",
        created_at: "YYYY-MM-DD HH:mm:ss",
        updated_at: "YYYY-MM-DD HH:mm:ss",
      },
    },
    notes: [
      "Solo se pueden consultar clientes asociados al sistema del token.",
      "El valor enviado en la URL debe ser el external_customer_id del sistema externo.",
      "Si el cliente no existe para ese sistema, la API responderá CUSTOMER_NOT_FOUND.",
    ],
  },
  {
    label: "Listar tickets del cliente",
    method: "GET",
    path: "/external/customers/{external_customer_id}/tickets",
    url: `${API_BASE_URL}/external/customers/${demoExternalCustomerId}/tickets?per_page=20&page=1`,
    description:
      "Consulta únicamente los tickets asociados al cliente externo indicado.",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${demoToken}`,
    },
    body: null,
    response: {
      ok: true,
      customer: {
        external_customer_id: demoExternalCustomerId,
        name: "Cliente Demo API",
        email: "cliente.demo.api@example.com",
        phone: "7441234567",
      },
      tickets: [
        {
          folio: demoFolio,
          subject: "Error al procesar una operación",
          description:
            "El usuario intentó completar una operación, pero el sistema mostró un error inesperado.",
          tracking_url:
            "https://facturas.thebusinessticket.com/public/tickets/PUB-YYYYMMDD-XXXXXXXX",
          status: {
            id: 1,
            name: "Reciente",
            color: "#2563eb",
          },
          priority: {
            id: 1,
            name: "Baja",
            color: "#16a34a",
          },
          section: {
            id: 1,
            name: "Soporte general",
          },
          created_at: "YYYY-MM-DD HH:mm:ss",
          updated_at: "YYYY-MM-DD HH:mm:ss",
          resolved_at: null,
        },
      ],
      meta: {
        current_page: 1,
        per_page: 20,
        last_page: 1,
        total: 1,
      },
    },
    notes: [
      "La consulta se filtra por system_id y external_customer_id.",
      "Una integración no puede listar tickets pertenecientes a otro cliente externo.",
      "tracking_url permite abrir la vista pública o copiar el enlace de seguimiento.",
      "per_page acepta valores de 1 a 50 y page indica la página solicitada.",
    ],
  },
  {
    label: "Crear ticket",
    method: "POST",
    path: "/external/tickets",
    url: `${API_BASE_URL}/external/tickets`,
    description:
      "Crea un ticket en The Business Ticket desde un sistema autorizado.",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${demoToken}`,
    },
    body: {
      customer: {
        name: "Cliente Demo",
        email: "cliente.demo@example.com",
        phone: "7441234567",
        external_customer_id: demoExternalCustomerId,
      },
      ticket: {
        section_code: "soporte-general",
        priority_id: 1,
        subject: "Error al procesar una operación",
        description:
          "El usuario intentó completar una operación, pero el sistema mostró un error inesperado.",
        external_reference: "demo-operation-1001",
      },
    },
    response: {
      ok: true,
      message: "Ticket externo creado correctamente.",
      ticket: {
        folio: "TBT-YYYYMMDD-XXXXXX",
        status: "Reciente",
        tracking_url:
          "https://facturas.thebusinessticket.com/public/tickets/PUB-YYYYMMDD-XXXXXXXX",
        created_at: "YYYY-MM-DD HH:mm:ss",
      },
    },
    notes: [
      "El sistema no debe enviar system_id.",
      "El origen se identifica por el token/API Key.",
      "El section_code debe pertenecer al sistema asociado al token.",
      "El cliente puede crearse antes con POST /external/customers o enviarse directamente dentro del ticket.",
    ],
  },
  {
    label: "Consultar ticket",
    method: "GET",
    path: "/external/tickets/{folio}",
    url: `${API_BASE_URL}/external/tickets/${demoFolio}?external_customer_id=${demoExternalCustomerId}`,
    description:
      "Consulta un ticket validando que pertenezca al cliente externo indicado.",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${demoToken}`,
    },
    body: null,
    response: {
      ok: true,
      ticket: {
        folio: "TBT-YYYYMMDD-XXXXXX",
        status: "Reciente",
        subject: "Error al procesar una operación",
        tracking_url:
          "https://facturas.thebusinessticket.com/public/tickets/PUB-YYYYMMDD-XXXXXXXX",
        created_at: "YYYY-MM-DD HH:mm:ss",
      },
    },
    notes: [
      "external_customer_id es obligatorio y puede enviarse como query o en X-External-Customer-ID.",
      "El ticket debe pertenecer al sistema del token y al cliente externo indicado.",
      "La API responde 404 si el folio no pertenece al cliente y 422 si falta external_customer_id.",
      "El folio lo devuelve la API al crear el ticket.",
    ],
  },
  {
    label: "Agregar comentario",
    method: "POST",
    path: "/external/tickets/{folio}/comments",
    url: `${API_BASE_URL}/external/tickets/${demoFolio}/comments`,
    description:
      "Agrega un comentario público al ticket desde el sistema autorizado.",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${demoToken}`,
    },
    body: {
      external_customer_id: demoExternalCustomerId,
      message: "El usuario informa que el problema continúa.",
      author_name: "Sistema Integral Demo",
      external_reference: "demo-comment-1001",
    },
    response: {
      ok: true,
      message: "Comentario agregado correctamente.",
      data: {
        folio: demoFolio,
        external_reference: "demo-comment-1001",
        created_at: "YYYY-MM-DD HH:mm:ss",
      },
    },
    notes: [
      "external_customer_id es obligatorio para validar la propiedad del ticket.",
      "El comentario queda asociado únicamente al ticket del cliente indicado.",
      "La API responde 404 si el ticket no pertenece al cliente y 422 si falta external_customer_id.",
      "external_reference ayuda a relacionar el comentario con el sistema origen.",
    ],
  },
  {
    label: "Adjuntar archivos",
    method: "POST",
    path: "/external/tickets/{folio}/attachments",
    url: `${API_BASE_URL}/external/tickets/${demoFolio}/attachments`,
    description:
      "Adjunta evidencias al ticket. Puede usarse multipart/form-data o base64.",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${demoToken}`,
    },
    body: {
      external_customer_id: demoExternalCustomerId,
      message: "Se adjunta evidencia del error.",
      author_name: "Sistema Integral Demo",
      external_reference: "demo-attachment-1001",
      attachments_base64: [
        {
          filename: "evidencia-error.txt",
          mime: "text/plain",
          content: "cHJ1ZWJhIGRlIGFyY2hpdm8=",
        },
      ],
    },
    response: {
      ok: true,
      message: "Archivos adjuntos agregados correctamente.",
      data: {
        folio: demoFolio,
        external_reference: "demo-attachment-1001",
        attachments: [
          {
            nombre_archivo: "evidencia-error.txt",
            ruta: "ticket_attachments/archivo-generado.txt",
          },
        ],
        created_at: "YYYY-MM-DD HH:mm:ss",
      },
    },
    notes: [
      "external_customer_id es obligatorio para validar la propiedad del ticket.",
      "La API responde 404 si el ticket no pertenece al cliente y 422 si falta external_customer_id.",
      "Extensiones permitidas: jpg, jpeg, png, webp, pdf, doc, docx, xls, xlsx, txt, zip.",
      "Tamaño máximo por archivo: 10 MB.",
      "Para pruebas en Postman Web puede usarse base64.",
      "Para backend real también puede usarse multipart/form-data con attachments[].",
    ],
  },
];

const methodColor = {
  GET: "info",
  POST: "success",
  PATCH: "warning",
  DELETE: "error",
};

function CodeBlock({ value }) {
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
        overflowX: "auto",
        fontSize: 13,
        lineHeight: 1.6,
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      }}
    >
      {text}
    </Box>
  );
}

export default function ExternalApiEndpoints() {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState("");

  const selectedEndpoint = endpoints[tab];

  const curlExample = useMemo(() => {
    const endpoint = selectedEndpoint;

    const headers = Object.entries(endpoint.headers)
      .map(([key, value]) => `  -H "${key}: ${value}"`)
      .join(" \\\n");

    const body = endpoint.body
      ? ` \\\n  -d '${JSON.stringify(endpoint.body, null, 2)}'`
      : "";

    return `curl -X ${endpoint.method} "${endpoint.url}" \\
${headers}${body}`;
  }, [selectedEndpoint]);

  const copiarTexto = async (label, value) => {
    const text =
      typeof value === "string" ? value : JSON.stringify(value, null, 2);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch (error) {
      setCopied("");
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
            Endpoints de integración
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Consulta los endpoints disponibles para probar la integración desde
            Postman o desde el backend de un sistema real.
          </Typography>
        </Box>

        <Alert severity="info">
          Estos ejemplos usan un sistema ficticio. Para una prueba real se debe
          reemplazar el token, folio, datos del cliente, sección y referencia
          externa por los datos del sistema autorizado.
        </Alert>

        {copied && (
          <Alert severity="success">
            {copied} copiado al portapapeles.
          </Alert>
        )}

        <Paper
          sx={{
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              borderBottom: "1px solid #e5e7eb",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 900,
                minHeight: 54,
              },
            }}
          >
            {endpoints.map((endpoint) => (
              <Tab key={endpoint.label} label={endpoint.label} />
            ))}
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
                spacing={1.5}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={selectedEndpoint.method}
                      color={methodColor[selectedEndpoint.method] || "default"}
                      size="small"
                      sx={{ fontWeight: 900 }}
                    />

                    <Typography fontWeight={900} sx={{ fontSize: 20 }}>
                      {selectedEndpoint.label}
                    </Typography>
                  </Stack>

                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    {selectedEndpoint.description}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  onClick={() =>
                    copiarTexto("URL del endpoint", selectedEndpoint.url)
                  }
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  Copiar URL
                </Button>
              </Stack>

              <Divider />

              <Box>
                <Typography fontWeight={900} sx={{ mb: 1 }}>
                  Endpoint
                </Typography>

                <CodeBlock
                  value={`${selectedEndpoint.method} ${selectedEndpoint.url}`}
                />
              </Box>

              <Box>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={1}
                  sx={{ mb: 1 }}
                >
                  <Typography fontWeight={900}>Headers</Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      copiarTexto("Headers", selectedEndpoint.headers)
                    }
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 800,
                    }}
                  >
                    Copiar headers
                  </Button>
                </Stack>

                <CodeBlock value={selectedEndpoint.headers} />
              </Box>

              {selectedEndpoint.body && (
                <Box>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    <Typography fontWeight={900}>Body de ejemplo</Typography>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        copiarTexto("Body", selectedEndpoint.body)
                      }
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 800,
                      }}
                    >
                      Copiar body
                    </Button>
                  </Stack>

                  <CodeBlock value={selectedEndpoint.body} />
                </Box>
              )}

              <Box>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={1}
                  sx={{ mb: 1 }}
                >
                  <Typography fontWeight={900}>Ejemplo cURL</Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => copiarTexto("cURL", curlExample)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 800,
                    }}
                  >
                    Copiar cURL
                  </Button>
                </Stack>

                <CodeBlock value={curlExample} />
              </Box>

              <Box>
                <Typography fontWeight={900} sx={{ mb: 1 }}>
                  Respuesta esperada
                </Typography>

                <CodeBlock value={selectedEndpoint.response} />
              </Box>

              <Box>
                <Typography fontWeight={900} sx={{ mb: 1 }}>
                  Notas de integración
                </Typography>

                <Stack spacing={0.75}>
                  {selectedEndpoint.notes.map((note) => (
                    <Typography
                      key={note}
                      variant="body2"
                      color="text.secondary"
                    >
                      • {note}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}