import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachmentCard from "./AttachmentCard";

export default function ChatBubble({
  msg,
  esMio,
  inicial,
  abrirArchivo,
  getArchivoUrl,
  puedeEliminarMensaje,
  eliminarMensaje,
}) {
  const propio = esMio(msg);
  const interno = msg.visibility === "private";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        flexDirection: propio ? "row-reverse" : "row",
        maxWidth: { xs: "92%", md: "78%" },
      }}
    >
      <Avatar
        sx={{
          width: 30,
          height: 30,
          fontSize: 13,
          fontWeight: 800,
          bgcolor: propio ? "#93c5fd" : "#cbd5e1",
          color: "#1f2937",
        }}
      >
        {inicial(msg)}
      </Avatar>

      <Box
        sx={{
          position: "relative",
          px: 1.7,
          py: 1.2,
          minWidth: 120,
          maxWidth: "100%",
          borderRadius: propio ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          bgcolor: propio ? "#dbeafe" : interno ? "#fef3c7" : "#ffffff",
          border: interno ? "1px solid #facc15" : "1px solid #e5e7eb",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
          wordBreak: "break-word",
          "&:hover .delete-btn": {
            opacity: 1,
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mb: msg.message ? 0.6 : 0 }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: propio ? "#1d4ed8" : "#334155",
            }}
          >
            {msg.user?.name || "Usuario"}
          </Typography>

          {interno && (
            <Chip
              label="Interno"
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 800,
                bgcolor: "#fde68a",
                color: "#92400e",
              }}
            />
          )}
        </Stack>

        {msg.message && (
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.45,
              color: "#111827",
              whiteSpace: "pre-line",
              pr: 1,
            }}
          >
            {msg.message}
          </Typography>
        )}

        {msg.attachments?.length > 0 && (
          <Stack spacing={0.8} sx={{ mt: msg.message ? 1 : 0 }}>
            {msg.attachments.map((file) => (
              <AttachmentCard
                key={file.id}
                file={file}
                abrirArchivo={abrirArchivo}
                getArchivoUrl={getArchivoUrl}
              />
            ))}
          </Stack>
        )}

        <Typography
          sx={{
            mt: 0.7,
            fontSize: 10.5,
            color: "#64748b",
            textAlign: "right",
            fontWeight: 600,
          }}
        >
          {new Date(msg.created_at).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>

        {puedeEliminarMensaje(msg) && (
          <IconButton
            className="delete-btn"
            size="small"
            color="error"
            onClick={() => eliminarMensaje(msg)}
            sx={{
              position: "absolute",
              top: 4,
              right: propio ? "auto" : 4,
              left: propio ? 4 : "auto",
              opacity: 0,
              transition: "0.15s ease",
              bgcolor: "rgba(255,255,255,0.85)",
              "&:hover": {
                bgcolor: "#fee2e2",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
