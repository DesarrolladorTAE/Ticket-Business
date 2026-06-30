import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function TicketHeader({
  ticket,
  estados,
  estadoNombre,
  agenteAsignado,
  puedeCambiarEstado,
  puedeResolver,
  puedeEliminar,
  cambiarEstado,
  resolverTicket,
  eliminarTicket,
  calcularTiempoResolucion,
  Info,
}) {
  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        boxShadow: 1,
        border: "1px solid #e5e7eb",
        mb: 3,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Chip
            label={ticket?.folio}
            sx={{
              fontWeight: 800,
              borderRadius: 2,
              bgcolor: "#eff6ff",
              color: "#1d4ed8",
            }}
          />

          <Typography>{ticket?.titulo}</Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          {puedeCambiarEstado ? (
            <TextField
              select
              size="small"
              label="Estado"
              value={ticket?.status_id || ""}
              onChange={(e) => cambiarEstado(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              {estados.map((estado) => (
                <MenuItem key={estado.id} value={estado.id}>
                  {estado.nombre}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Chip
              label={ticket?.status?.nombre || "Sin estado"}
              color="primary"
              size="small"
            />
          )}

          {puedeResolver && (
            <Button variant="contained" color="success" onClick={resolverTicket}>
              Resolver
            </Button>
          )}

          {puedeEliminar && (
            <Button color="error" variant="outlined" onClick={eliminarTicket}>
              Eliminar
            </Button>
          )}
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Info label="Estado" value={estadoNombre} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Info label="Agente asignado" value={agenteAsignado} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Info
            label="Resuelto por"
            value={ticket?.resolved_by?.name || "No resuelto"}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Info
            label="Tiempo de resolución"
            value={calcularTiempoResolucion()}
          />
        </Grid>

        <Grid item xs={12}>
          <Info
            label="Detalle"
            value={ticket?.descripcion || "Sin descripción"}
            multiline
          />
        </Grid>
      </Grid>
    </Paper>
  );
}