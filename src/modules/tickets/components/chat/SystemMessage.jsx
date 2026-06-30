import { Box, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function SystemMessage({ message }) {
  const texto = message?.message || "";
  const fecha = message?.created_at ? new Date(message.created_at) : new Date();

  const textoLower = texto.toLowerCase();

  const esCambioEstado = textoLower.includes("estado cambiado");
  const esCreacion = textoLower.includes("ticket creado");

  const titulo = esCambioEstado
    ? "Cambio de estado"
    : esCreacion
      ? "Ticket creado"
      : "Evento del sistema";

  const icono = esCambioEstado ? (
    <SwapHorizIcon sx={{ fontSize: 17, color: "#54656f" }} />
  ) : esCreacion ? (
    <CheckCircleOutlineIcon sx={{ fontSize: 17, color: "#54656f" }} />
  ) : (
    <InfoOutlinedIcon sx={{ fontSize: 17, color: "#54656f" }} />
  );

  return (
    <Box sx={{ width: "100%", my: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 1,
        }}
      >
        <Box sx={{ flex: 1, height: "1px", bgcolor: "#d1d7db" }} />

        <Typography
          sx={{
            fontSize: 11,
            color: "#667781",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {fecha.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Typography>

        <Box sx={{ flex: 1, height: "1px", bgcolor: "#d1d7db" }} />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            px: 2,
            py: 1.1,
            maxWidth: 420,
            borderRadius: 3,
            bgcolor: "#e9edef",
            color: "#54656f",
            textAlign: "center",
            boxShadow: "0 1px 2px rgba(0,0,0,.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.8,
              mb: 0.6,
            }}
          >
            {icono}

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: "#54656f",
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
                fontSize: 13,
                fontWeight: 500,
                lineHeight: 1.45,
                color: "#3b4a54",
                whiteSpace: "pre-line",
              }}
            >
              {texto}
            </Typography>
          )}

          <Typography
            sx={{
              mt: 0.7,
              fontSize: 11,
              color: "#8696a0",
              fontWeight: 600,
            }}
          >
            {fecha.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box>
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
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.45,
          color: "#3b4a54",
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
    <Box>
      <Typography sx={{ fontSize: 12, color: "#667781", mb: 0.4 }}>
        {usuario}
      </Typography>

      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#3b4a54" }}>
        {anterior}
      </Typography>

      <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#667781" }}>
        ↓
      </Typography>

      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#3b4a54" }}>
        {nuevo}
      </Typography>
    </Box>
  );
}