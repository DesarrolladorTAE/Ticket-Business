import { useState } from "react";

import {
  Box,
  CircularProgress,
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

  const seleccionarArchivo = (e) => {
    const file = e.target.files?.[0] || null;

    setArchivo(file);

    e.target.value = "";
  };

  const quitarArchivo = () => {
    setArchivo(null);
  };

  const formatoPeso = (bytes) => {
    if (!bytes) return "0 KB";

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <Paper
      sx={{
        p: { xs: 1, sm: 1.4 },
        borderRadius: { xs: 3, sm: 4 },
        border: "1px solid #e5e7eb",
        bgcolor: "#f8fafc",
        boxShadow: "0 -2px 8px rgba(15,23,42,0.05)",
      }}
    >
      <Stack spacing={1}>
        {archivo && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1,
              bgcolor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 2.5,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <InsertDriveFileIcon fontSize="small" />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontSize: { xs: 11.5, sm: 12 },
                  fontWeight: 900,
                  color: "#1f2937",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.25,
                }}
              >
                {archivo.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: 10.5,
                  color: "#64748b",
                  mt: 0.2,
                }}
              >
                Archivo listo para enviar · {formatoPeso(archivo.size)}
              </Typography>
            </Box>

            <IconButton
              size="small"
              color="error"
              onClick={quitarArchivo}
              disabled={enviando}
              sx={{
                flexShrink: 0,
                bgcolor: "#fff1f2",
                width: 30,
                height: 30,
                "&:hover": {
                  bgcolor: "#ffe4e6",
                },
              }}
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
            disabled={enviando}
            sx={{
              width: { xs: "100%", sm: 270 },
              bgcolor: "#ffffff",
              borderRadius: 2,
              "& .MuiInputBase-root": {
                borderRadius: 2,
                fontWeight: 800,
                fontSize: 13,
              },
              "& .MuiInputLabel-root": {
                fontSize: 13,
              },
            }}
          >
            <MenuItem value="private">Nota interna</MenuItem>
            <MenuItem value="public">Responder al cliente</MenuItem>
          </TextField>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: { xs: 0.7, sm: 1 },
            p: { xs: 0.65, sm: 0.75 },
            borderRadius: 4,
            bgcolor: "#ffffff",
            border: "1px solid #e5e7eb",
            minWidth: 0,
          }}
        >
          <Tooltip title="Adjuntar archivo">
            <span>
              <IconButton
                component="label"
                disabled={enviando}
                sx={{
                  width: { xs: 38, sm: 40 },
                  height: { xs: 38, sm: 40 },
                  color: "#64748b",
                  flexShrink: 0,
                  bgcolor: "#f8fafc",
                  "&:hover": {
                    bgcolor: "#f1f5f9",
                  },
                }}
              >
                <AttachFileIcon fontSize="small" />

                <input
                  hidden
                  type="file"
                  accept="*/*"
                  onChange={seleccionarArchivo}
                />
              </IconButton>
            </span>
          </Tooltip>

          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            placeholder="Escribe el mensaje..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={enviando}
            variant="standard"
            sx={{
              minWidth: 0,
              flex: 1,
            }}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: { xs: 13.5, sm: 14 },
                lineHeight: 1.45,
                py: 0.9,
                px: 0.3,
                maxHeight: 112,
                overflowY: "auto",
                color: "#111827",
                "& textarea": {
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                },
              },
            }}
          />

          <Tooltip title="Enviar">
            <span>
              <IconButton
                disabled={!puedeEnviar}
                onClick={enviar}
                sx={{
                  width: { xs: 40, sm: 42 },
                  height: { xs: 40, sm: 42 },
                  bgcolor: puedeEnviar ? "#128c7e" : "#e5e7eb",
                  color: puedeEnviar ? "#ffffff" : "#94a3b8",
                  flexShrink: 0,
                  boxShadow: puedeEnviar
                    ? "0 2px 6px rgba(18,140,126,0.28)"
                    : "none",
                  "&:hover": {
                    bgcolor: puedeEnviar ? "#075e54" : "#e5e7eb",
                  },
                }}
              >
                {enviando ? (
                  <CircularProgress size={18} sx={{ color: "#ffffff" }} />
                ) : (
                  <SendIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Typography
          sx={{
            display: { xs: "none", sm: "block" },
            fontSize: 11,
            color: "#64748b",
            pl: 0.5,
          }}
        >
          Presiona Enter para enviar. Usa Shift + Enter para salto de línea.
        </Typography>
      </Stack>
    </Paper>
  );
}