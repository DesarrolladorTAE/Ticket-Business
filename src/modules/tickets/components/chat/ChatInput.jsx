import { useState } from "react";

import {
  Box,
  IconButton,
  MenuItem,
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
  const [tipoMensaje, setTipoMensaje] = useState("private");

  const puedeEnviar = !enviando && (text.trim() || archivo);

  const enviar = () => {
    if (!puedeEnviar) return;
    enviarMensaje(puedeGestionar ? tipoMensaje : "public");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <Paper
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        bgcolor: "#f8fafc",
      }}
    >
      {archivo && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            p: 1,
            bgcolor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
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

      {puedeGestionar && (
        <TextField
          select
          size="small"
          label="Tipo de mensaje"
          value={tipoMensaje}
          onChange={(e) => setTipoMensaje(e.target.value)}
          sx={{
            mb: 1,
            width: { xs: "100%", sm: 260 },
            bgcolor: "#ffffff",
            borderRadius: 2,
          }}
        >
          <MenuItem value="private">Nota interna</MenuItem>
          <MenuItem value="public">Responder al cliente</MenuItem>
        </TextField>
      )}

      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-end"
        sx={{
          p: 0.7,
          borderRadius: 999,
          bgcolor: "#ffffff",
          border: "1px solid #e5e7eb",
        }}
      >
        <Tooltip title="Adjuntar archivo">
          <IconButton
            component="label"
            sx={{
              width: 40,
              height: 40,
              color: "#64748b",
              flexShrink: 0,
            }}
          >
            <AttachFileIcon />
            <input
              hidden
              type="file"
              accept="*/*"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
          </IconButton>
        </Tooltip>

        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={3}
          placeholder="Escribe el mensaje..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: 14,
              py: 1,
              maxHeight: 88,
              overflowY: "auto",
            },
          }}
        />

        <Tooltip title="Enviar">
          <span>
            <IconButton
              disabled={!puedeEnviar}
              onClick={enviar}
              sx={{
                width: 42,
                height: 42,
                bgcolor: puedeEnviar ? "#128c7e" : "#e5e7eb",
                color: puedeEnviar ? "#ffffff" : "#94a3b8",
                flexShrink: 0,
                "&:hover": {
                  bgcolor: puedeEnviar ? "#075e54" : "#e5e7eb",
                },
              }}
            >
              {enviando ? (
                <Typography sx={{ fontSize: 11, fontWeight: 800 }}>
                  ...
                </Typography>
              ) : (
                <SendIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Paper>
  );
}