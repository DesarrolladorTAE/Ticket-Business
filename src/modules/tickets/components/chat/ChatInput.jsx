import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

export default function ChatInput({
  text,
  setText,
  archivo,
  setArchivo,
  puedeGestionar,
  enviando,
  enviarMensaje,
}) {
  const puedeEnviar = !enviando && (text.trim() || archivo);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (puedeEnviar) {
        enviarMensaje();
      }
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        bgcolor: "#ffffff",
      }}
    >
      {archivo && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1.5,
            p: 1,
            bgcolor: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <InsertDriveFileIcon fontSize="small" color="primary" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: "#1f2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 260,
              }}
            >
              {archivo.name}
            </Typography>

            <Typography sx={{ fontSize: 10.5, color: "#64748b" }}>
              Archivo listo para enviar
            </Typography>
          </Box>

          <IconButton
            size="small"
            color="error"
            onClick={() => setArchivo(null)}
            sx={{ ml: "auto" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          placeholder={
            puedeGestionar
              ? "Escribe una respuesta o nota interna..."
              : "Escribe un mensaje..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Tooltip title="Adjuntar archivo">
          <Button component="label" variant="outlined" sx={{ minWidth: 52 }}>
            <AttachFileIcon />
            <input
              hidden
              type="file"
              accept="*/*"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
          </Button>
        </Tooltip>

        {puedeGestionar ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              disabled={!puedeEnviar}
              onClick={() => enviarMensaje("public")}
              sx={{
                minWidth: 170,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Responder al cliente
            </Button>

            <Button
              variant="outlined"
              disabled={!puedeEnviar}
              onClick={() => enviarMensaje("private")}
              sx={{
                minWidth: 150,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Nota interna
            </Button>
          </Stack>
        ) : (
          <Tooltip title="Enviar">
            <span>
              <Button
                variant="contained"
                disabled={!puedeEnviar}
                onClick={() => enviarMensaje("public")}
                sx={{
                  minWidth: 52,
                  borderRadius: 2,
                }}
              >
                {enviando ? "..." : <SendIcon />}
              </Button>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Paper>
  );
}
