import { Box, Paper, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function CategoryCard({ categoria, selected, onClick }) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 1.5,
        minHeight: 92,
        cursor: "pointer",
        borderRadius: 2,
        position: "relative",
        border: selected ? "2px solid #2563eb" : "1px solid #e5e7eb",
        bgcolor: selected ? "#eff6ff" : "#ffffff",
        transition: "0.18s ease",
        boxShadow: selected
          ? "0 4px 12px rgba(37,99,235,.18)"
          : "0 1px 4px rgba(0,0,0,.06)",
        "&:hover": {
          borderColor: "#2563eb",
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
            color: "#2563eb",
          }}
        />
      )}

      <Box>
        <Typography
          fontWeight={900}
          sx={{
            color: "#111827",
            pr: 2,
            fontSize: 14,
          }}
        >
          {categoria.nombre}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.7, fontSize: 12 }}
        >
          Tipo de problema
        </Typography>
      </Box>
    </Paper>
  );
}