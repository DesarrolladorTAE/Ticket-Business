import { Box, Typography } from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function SystemMessage({ message }) {
  const texto = message?.message || "";
  const fecha = parseFecha(message?.created_at);

  const textoLower = texto.toLowerCase();

  const esCambioEstado = textoLower.includes("estado cambiado");
  const esCreacion = textoLower.includes("ticket creado");

  const titulo = esCambioEstado
    ? "Cambio de estado"
    : esCreacion
      ? "Ticket creado"
      : "Evento del sistema";

  const config = esCambioEstado
    ? {
        icono: <SwapHorizIcon sx={{ fontSize: 16 }} />,
        bgcolor: "#f1f5f9",
        border: "#cbd5e1",
        color: "#475569",
      }
    : esCreacion
      ? {
          icono: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,
          bgcolor: "#ecfdf5",
          border: "#bbf7d0",
          color: "#047857",
        }
      : {
          icono: <InfoOutlinedIcon sx={{ fontSize: 16 }} />,
          bgcolor: "#eff6ff",
          border: "#bfdbfe",
          color: "#1d4ed8",
        };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        px: { xs: 1, sm: 2 },
        my: { xs: 1.2, md: 1.6 },
      }}
    >
      <Box
        sx={{
          width: "fit-content",
          maxWidth: { xs: "94%", sm: 460, md: 520 },
          px: { xs: 1.4, sm: 1.8 },
          py: { xs: 1, sm: 1.15 },
          borderRadius: 3,
          bgcolor: config.bgcolor,
          color: config.color,
          textAlign: "center",
          border: `1px solid ${config.border}`,
          boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 0.7,
            mb: 0.55,
            color: config.color,
          }}
        >
          {config.icono}

          <Typography
            sx={{
              fontSize: { xs: 11.5, sm: 12 },
              fontWeight: 900,
              color: config.color,
              lineHeight: 1.2,
            }}
          >
            {titulo}
          </Typography>
        </Box>

        {esCambioEstado ? (
          <CambioEstado texto={texto} />
        ) : (
          <Typography
            sx={{
              fontSize: { xs: 12.2, sm: 13 },
              fontWeight: 600,
              lineHeight: 1.45,
              color: "#334155",
              whiteSpace: "pre-line",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {texto}
          </Typography>
        )}

        <Typography
          sx={{
            mt: 0.65,
            fontSize: { xs: 10.5, sm: 11 },
            color: "#64748b",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {fecha}
        </Typography>
      </Box>
    </Box>
  );
}

function CambioEstado({ texto }) {
  const match = texto.match(/Estado cambiado de (.+) a (.+) por (.+)/i);

  if (!match) {
    return (
      <Typography
        sx={{
          fontSize: { xs: 12.2, sm: 13 },
          fontWeight: 600,
          lineHeight: 1.45,
          color: "#334155",
          whiteSpace: "pre-line",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {texto}
      </Typography>
    );
  }

  const anterior = match[1];
  const nuevo = match[2];
  const usuario = match[3];

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: { xs: 11.5, sm: 12 },
          color: "#64748b",
          fontWeight: 800,
          mb: 0.6,
          wordBreak: "break-word",
        }}
      >
        {usuario}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr auto 1fr",
          },
          gap: { xs: 0.4, sm: 1 },
          alignItems: "center",
        }}
      >
        <EstadoTexto texto={anterior} tipo="anterior" />

        <Typography
          sx={{
            fontSize: { xs: 17, sm: 18 },
            fontWeight: 900,
            color: "#64748b",
            lineHeight: 1,
            transform: {
              xs: "rotate(90deg)",
              sm: "none",
            },
          }}
        >
          →
        </Typography>

        <EstadoTexto texto={nuevo} tipo="nuevo" />
      </Box>
    </Box>
  );
}

function EstadoTexto({ texto, tipo }) {
  const esNuevo = tipo === "nuevo";

  return (
    <Box
      sx={{
        px: 1,
        py: 0.65,
        borderRadius: 2,
        bgcolor: esNuevo ? "#dcfce7" : "#ffffff",
        border: esNuevo ? "1px solid #86efac" : "1px solid #e2e8f0",
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 12, sm: 12.5 },
          fontWeight: 900,
          color: esNuevo ? "#166534" : "#475569",
          lineHeight: 1.3,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {texto}
      </Typography>
    </Box>
  );
}

function parseFecha(fecha) {
  if (!fecha) return "";

  const parsed = new Date(String(fecha).replace(" ", "T"));

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}