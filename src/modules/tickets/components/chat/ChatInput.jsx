import { useState } from "react";

import {
  Box,
  Button,
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
    enviarMensaje(puedeGestionar ? tipoMensaje : "public");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (puedeEnviar) {
        enviar();
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

      <Stack spacing={1.5}>
        {puedeGestionar && (
          <TextField
            select
            size="small"
            label="Tipo de mensaje"
            value={tipoMensaje}
            onChange={(e) => setTipoMensaje(e.target.value)}
            sx={{ maxWidth: 260 }}
          >
            <MenuItem value="private">Nota interna</MenuItem>
            <MenuItem value="public">Responder al cliente</MenuItem>
          </TextField>
        )}

        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={3}
          placeholder="Escribe el mensaje..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Tooltip title="Adjuntar archivo">
            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachFileIcon />}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Adjuntar
              <input
                hidden
                type="file"
                accept="*/*"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              />
            </Button>
          </Tooltip>

          <Tooltip title="Enviar">
            <span>
              <Button
                variant="contained"
                disabled={!puedeEnviar}
                onClick={enviar}
                endIcon={!enviando ? <SendIcon /> : null}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  minWidth: 120,
                }}
              >
                {enviando ? "Enviando..." : "Enviar"}
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
