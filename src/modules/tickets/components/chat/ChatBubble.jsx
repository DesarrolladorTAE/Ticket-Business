import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

export default function ChatBubble({
  msg,
  esMio,
  inicial,
  abrirArchivo,
  puedeEliminarMensaje,
  eliminarMensaje,
}) {
  return (
    <Box
      sx={{
        position: "relative",
        maxWidth: "75%",
        p: 1.5,
        borderRadius: 3,
        bgcolor: esMio(msg)
          ? "#dbeafe"
          : msg.visibility === "private"
            ? "#fef3c7"
            : "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: 1,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
          {inicial(msg)}
        </Avatar>

        <Typography fontWeight="bold" variant="body2">
          {msg.user?.name || "Usuario"}
        </Typography>

        {msg.visibility === "private" && (
          <Chip label="Interno" size="small" color="warning" sx={{ ml: 1 }} />
        )}
      </Stack>

      <Divider sx={{ my: 0.5 }} />

      {msg.message && <Typography sx={{ mt: 0.5 }}>{msg.message}</Typography>}

      <Typography sx={{ fontSize: "10px", color: "#999", mt: 0.5 }}>
        {new Date(msg.created_at).toLocaleString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Typography>

      {msg.attachments?.length > 0 && (
        <Box mt={1}>
          {msg.attachments.map((file) => (
            <Box
              key={file.id}
              onClick={() => abrirArchivo(file)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 0.5,
                p: 1,
                borderRadius: 1,
                bgcolor: "rgba(0,0,0,0.05)",
                cursor: "pointer",
                "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
              }}
            >
              <InsertDriveFileIcon fontSize="small" color="primary" />

              <Typography variant="body2" color="primary" fontWeight={500}>
                📎 {file.nombre_archivo}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {puedeEliminarMensaje(msg) && (
        <IconButton
          className="delete-btn"
          size="small"
          color="error"
          onClick={() => eliminarMensaje(msg)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}