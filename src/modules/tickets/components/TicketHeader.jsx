import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import {
  Box,
  Button,
  Chip,
  Collapse,
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
  puedeCambiarEstado,
  puedeResolver,
  puedeEliminar,
  puedeGestionar,
  mostrarInfoTicket,
  setMostrarInfoTicket,
  cambiarEstado,
  tomarTicket,
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
        mb: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Chip
            label={ticket?.folio || "Sin folio"}
            sx={{
              fontWeight: 800,
              borderRadius: 2,
              bgcolor: "#eff6ff",
              color: "#1d4ed8",
              mb: 1,
            }}
          />
          <Typography
            fontWeight={700}
            sx={{
              whiteSpace: "normal",
              wordBreak: "break-word",
              lineHeight: 1.4,
            }}
          >
            {ticket?.titulo}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
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
              sx={{ fontWeight: 700 }}
            />
          )}

          {puedeGestionar && !ticket?.responsable && (
            <Button
              variant="contained"
              color="primary"
              onClick={tomarTicket}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Tomar ticket
            </Button>
          )}

          {puedeResolver && (
            <Button
              variant="contained"
              color="success"
              onClick={resolverTicket}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Resolver
            </Button>
          )}

          {puedeEliminar && (
            <Button
              color="error"
              variant="outlined"
              onClick={eliminarTicket}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Eliminar
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={() => setMostrarInfoTicket((prev) => !prev)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {mostrarInfoTicket ? "Ocultar información" : "Ver información"}
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Collapse in={mostrarInfoTicket} timeout="auto" unmountOnExit>
        <Grid container spacing={1.5} sx={{ mt: 1 }}>
          <Grid item xs={12} md={3}>
            <Info label="Estado" value={estadoNombre} />
          </Grid>

          <Grid item xs={12} md={3}>
            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 1.25,
                minHeight: 58,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Agente asignado
              </Typography>

              <Box mt={1}>
                {ticket?.responsable ? (
                  <Chip
                    color="success"
                    label={`Asignado a ${ticket.responsable.name}`}
                    sx={{ fontWeight: 700 }}
                  />
                ) : (
                  <Chip
                    color="warning"
                    label="Sin asignar"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Info
              label="Resuelto por"
              value={ticket?.resolved_by?.name || "No resuelto"}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Info
              label="Tiempo de resolución"
              value={calcularTiempoResolucion()}
            />
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 2,
                bgcolor: "#ffffff",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Detalle
              </Typography>

              <Box
                sx={{
                  mt: 1,
                  maxHeight: 90,
                  overflowY: "auto",
                  pr: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                    color: "#111827",
                  }}
                >
                  {ticket?.descripcion || "Sin descripción"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
}
