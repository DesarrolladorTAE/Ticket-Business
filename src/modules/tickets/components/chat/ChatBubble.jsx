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

  const avatarUrl =
    msg.user?.avatar_url ||
    msg.user?.photo_url ||
    msg.user?.foto_url ||
    msg.user?.profile_photo_url ||
    null;

  const hora = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 0.8,
        flexDirection: propio ? "row-reverse" : "row",
        maxWidth: { xs: "96%", md: "76%" },
      }}
    >
      <Avatar
        src={avatarUrl || undefined}
        sx={{
          width: 32,
          height: 32,
          fontSize: 12,
          fontWeight: 900,
          bgcolor: propio ? "#128c7e" : "#64748b",
          color: "#ffffff",
          border: "2px solid rgba(255,255,255,0.95)",
          boxShadow: "0 1px 3px rgba(15,23,42,0.18)",
        }}
      >
        {!avatarUrl ? inicial(msg) : null}
      </Avatar>

      <Box
        sx={{
          position: "relative",
          px: 1.45,
          py: 0.9,
          minWidth: 120,
          maxWidth: "100%",
          borderRadius: propio
            ? "14px 14px 3px 14px"
            : "14px 14px 14px 3px",
          bgcolor: interno ? "#fff4bf" : propio ? "#d9fdd3" : "#ffffff",
          border: interno ? "1px solid #facc15" : "1px solid rgba(15,23,42,0.06)",
          boxShadow: "0 1px 1.5px rgba(15,23,42,0.14)",
          wordBreak: "break-word",
          "&:before": {
            content: '""',
            position: "absolute",
            bottom: 0,
            ...(propio
              ? {
                  right: -6,
                  borderLeft: `8px solid ${
                    interno ? "#fff4bf" : "#d9fdd3"
                  }`,
                  borderTop: "8px solid transparent",
                }
              : {
                  left: -6,
                  borderRight: `8px solid ${
                    interno ? "#fff4bf" : "#ffffff"
                  }`,
                  borderTop: "8px solid transparent",
                }),
          },
          "&:hover .delete-btn": {
            opacity: 1,
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.8}
          sx={{ mb: msg.message || msg.attachments?.length ? 0.45 : 0 }}
        >
          <Typography
            sx={{
              fontSize: 11.5,
              fontWeight: 900,
              color: propio ? "#075e54" : "#334155",
            }}
          >
            {msg.user?.name || "Usuario"}
          </Typography>

          {interno && (
            <Chip
              label="Interna"
              size="small"
              sx={{
                height: 17,
                fontSize: 9.5,
                fontWeight: 900,
                bgcolor: "#fde68a",
                color: "#92400e",
                "& .MuiChip-label": {
                  px: 0.75,
                },
              }}
            />
          )}
        </Stack>

        {msg.message && (
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.42,
              color: "#111827",
              whiteSpace: "pre-line",
            }}
          >
            {msg.message}
          </Typography>
        )}

        {msg.attachments?.length > 0 && (
          <Stack spacing={0.75} sx={{ mt: msg.message ? 0.8 : 0 }}>
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
            mt: 0.35,
            fontSize: 10,
            color: "#667781",
            textAlign: "right",
            fontWeight: 600,
          }}
        >
          {hora}
        </Typography>

        {puedeEliminarMensaje(msg) && (
          <IconButton
            className="delete-btn"
            size="small"
            color="error"
            onClick={() => eliminarMensaje(msg)}
            sx={{
              position: "absolute",
              top: 3,
              right: propio ? "auto" : 3,
              left: propio ? 3 : "auto",
              opacity: 0,
              transition: "0.15s ease",
              bgcolor: "rgba(255,255,255,0.92)",
              width: 26,
              height: 26,
              "&:hover": {
                bgcolor: "#fee2e2",
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}