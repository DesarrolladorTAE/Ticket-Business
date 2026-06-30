import { Box, Paper, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function PriorityCard({ prioridad, selected, onClick }) {
  const color = prioridad.color || "#2563eb";

  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 1.5,
        minHeight: 86,
        cursor: "pointer",
        borderRadius: 2,
        position: "relative",
        border: selected ? `2px solid ${color}` : "1px solid #e5e7eb",
        bgcolor: selected ? `${color}14` : "#ffffff",
        boxShadow: selected
          ? `0 4px 12px ${color}22`
          : "0 1px 4px rgba(0,0,0,.06)",
        transition: "0.18s ease",
        "&:hover": {
          borderColor: color,
          transform: "translateY(-2px)",
        },
      }}
    >
      {selected && (
        <CheckCircleIcon
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 18,
            color,
          }}
        />
      )}

      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          bgcolor: `${color}22`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          mb: 1,
        }}
      >
        {prioridad.nombre?.charAt(0)?.toUpperCase() || "P"}
      </Box>

      <Typography fontWeight={900} sx={{ color: "#111827", fontSize: 14 }}>
        {prioridad.nombre}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
        Nivel de atención
      </Typography>
    </Paper>
  );
}