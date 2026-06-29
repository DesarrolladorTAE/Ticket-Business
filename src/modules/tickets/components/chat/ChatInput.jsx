import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

export default function ChatInput({
  text,
  setText,
  archivo,
  setArchivo,
  visibility,
  setVisibility,
  puedeGestionar,
  enviando,
  enviarMensaje,
}) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      {archivo && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            p: 1,
            bgcolor: "#f0f0f0",
            borderRadius: 1,
          }}
        >
          <InsertDriveFileIcon fontSize="small" />
          <Typography variant="body2">{archivo.name}</Typography>
          <Button
            size="small"
            color="error"
            onClick={() => setArchivo(null)}
            sx={{ ml: "auto" }}
          >
            Quitar
          </Button>
        </Box>
      )}

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {puedeGestionar && (
          <TextField
            select
            label="Tipo"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            sx={{ minWidth: { xs: "100%", md: 190 } }}
          >
            <MenuItem value="external">Mensaje externo</MenuItem>
            <MenuItem value="internal">Nota interna</MenuItem>
          </TextField>
        )}

        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          placeholder={
            visibility === "internal"
              ? "Escribe una nota interna..."
              : "Escribe un mensaje..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button
          component="label"
          variant="outlined"
          startIcon={<AttachFileIcon />}
        >
          Archivo
          <input
            hidden
            type="file"
            accept="*/*"
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          />
        </Button>

        <Button
          variant="contained"
          disabled={enviando || (!text.trim() && !archivo)}
          onClick={enviarMensaje}
        >
          {enviando ? "Enviando..." : "Enviar"}
        </Button>
      </Stack>
    </Paper>
  );
}