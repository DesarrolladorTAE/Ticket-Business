import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
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
        p: { xs: 1.5, sm: 2, md: 3 },
        borderRadius: 3,
        boxShadow: 1,
        border: "1px solid #e5e7eb",
        mb: 2,
        overflow: "hidden",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "flex-start" }}
          spacing={2.5}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ mb: 1 }}
            >
              <Chip
                label={ticket?.folio || "Sin folio"}
                size="small"
                sx={{
                  fontWeight: 900,
                  borderRadius: 2,
                  bgcolor: "#eff6ff",
                  color: "#1d4ed8",
                  maxWidth: "100%",
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />

              <Chip
                label={estadoNombre || ticket?.status?.nombre || "Sin estado"}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                  maxWidth: "100%",
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            </Stack>

            <Typography
              fontWeight={900}
              sx={{
                fontSize: { xs: 18, sm: 20, md: 22 },
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                lineHeight: 1.25,
                color: "#0f172a",
              }}
            >
              {ticket?.titulo || "Sin título"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.8,
                fontSize: { xs: 12.5, sm: 13.5 },
              }}
            >
              Gestiona el estado, responsable e información general del ticket.
            </Typography>
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: 380 },
              flexShrink: 0,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 1,
              alignItems: "stretch",
            }}
          >
            {puedeCambiarEstado && (
              <TextField
                select
                size="small"
                label="Estado"
                value={ticket?.status_id || ""}
                onChange={(e) => cambiarEstado(e.target.value)}
                sx={{
                  gridColumn: { xs: "1", sm: "1 / -1" },
                  bgcolor: "#ffffff",
                  "& .MuiInputBase-root": {
                    borderRadius: 2,
                    fontWeight: 800,
                    fontSize: 13,
                  },
                }}
              >
                {estados.map((estado) => (
                  <MenuItem key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {puedeGestionar && !ticket?.responsable && (
              <Button
                variant="contained"
                color="primary"
                onClick={tomarTicket}
                sx={buttonStyle}
              >
                Tomar ticket
              </Button>
            )}

            {puedeResolver && (
              <Button
                variant="contained"
                color="success"
                onClick={resolverTicket}
                sx={buttonStyle}
              >
                Resolver
              </Button>
            )}

            {puedeEliminar && (
              <Button
                color="error"
                variant="outlined"
                onClick={eliminarTicket}
                sx={buttonStyle}
              >
                Eliminar
              </Button>
            )}

            <Button
              variant="outlined"
              onClick={() => setMostrarInfoTicket((prev) => !prev)}
              endIcon={
                mostrarInfoTicket ? (
                  <KeyboardArrowUpIcon />
                ) : (
                  <KeyboardArrowDownIcon />
                )
              }
              sx={buttonStyle}
            >
              {mostrarInfoTicket ? "Ocultar info" : "Ver info"}
            </Button>
          </Box>
        </Stack>

        <Divider />

        <Collapse in={mostrarInfoTicket} timeout="auto" unmountOnExit>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              <Box sx={infoBoxStyle}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={800}
                >
                  Agente asignado
                </Typography>

                <Box mt={1}>
                  {ticket?.responsable ? (
                    <Chip
                      color="success"
                      label={`Asignado a ${ticket.responsable.name}`}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        maxWidth: "100%",
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    />
                  ) : (
                    <Chip
                      color="warning"
                      label="Sin asignar"
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  )}
                </Box>
              </Box>

              <Info
                label="Resuelto por"
                value={ticket?.resolved_by?.name || "No resuelto"}
              />

              <Info
                label="Tiempo de resolución"
                value={calcularTiempoResolucion()}
              />
            </Box>

            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2.5,
                p: { xs: 1.5, sm: 2 },
                bgcolor: "#ffffff",
                minWidth: 0,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
              >
                Detalle
              </Typography>

              <Box
                sx={{
                  mt: 1,
                  maxHeight: { xs: 150, md: 120 },
                  overflowY: "auto",
                  pr: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 13.2, sm: 14 },
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                    color: "#111827",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {ticket?.descripcion || "Sin descripción"}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
}

const buttonStyle = {
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 900,
  minHeight: 40,
  px: 1.5,
  width: "100%",
  whiteSpace: "nowrap",
  fontSize: 13,
};

const infoBoxStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 2.5,
  p: 1.25,
  minHeight: 64,
  minWidth: 0,
  bgcolor: "#ffffff",
};