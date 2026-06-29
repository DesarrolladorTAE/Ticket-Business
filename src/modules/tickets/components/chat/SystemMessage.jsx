import { Box, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function SystemMessage({ message }) {
  const fecha = new Date(message.created_at);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        my: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 420,
          width: "fit-content",
          px: 2.5,
          py: 1.5,
          bgcolor: "#eef6ff",
          border: "1px solid #d6e8ff",
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            mb: 0.8,
          }}
        >
          <InfoOutlinedIcon
            sx={{
              fontSize: 18,
              color: "#1976d2",
            }}
          />

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 13,
              color: "#1976d2",
              letterSpacing: .3,
            }}
          >
            Evento del sistema
          </Typography>
        </Box>

        <Typography
          sx={{
            color: "#374151",
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {message.message}
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "#6b7280",
            fontSize: 11,
          }}
        >
          {fecha.toLocaleDateString("es-MX", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Typography>

        <Typography
          sx={{
            color: "#9ca3af",
            fontSize: 11,
          }}
        >
          {fecha.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Box>
    </Box>
  );
}