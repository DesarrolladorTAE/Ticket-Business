import { Box, Chip, Paper, Typography } from "@mui/material";

export default function SystemCard({ sistema, selected, onClick }) {
  const color = sistema.color || "#2563eb";
  const colorSecundario = sistema.color_secundario || "#eff6ff";
  const logoUrl = sistema.logo ? `/${sistema.logo}` : null;

  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 1.5,
        minHeight: 150,
        cursor: "pointer",
        borderRadius: 2,
        border: selected ? `2px solid ${color}` : "1px solid #e5e7eb",
        bgcolor: selected ? colorSecundario : "#ffffff",
        boxShadow: selected
          ? `0 4px 12px ${color}33`
          : "0 1px 4px rgba(0,0,0,.06)",
        transition: "0.18s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 6px 14px ${color}22`,
          borderColor: color,
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: colorSecundario,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 13,
          mb: 1,
          overflow: "hidden",
          border: `1px solid ${color}22`,
        }}
      >
        {logoUrl ? (
          <Box
            component="img"
            src={logoUrl}
            alt={sistema.nombre}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              p: 0.5,
            }}
          />
        ) : (
          sistema.prefijo
        )}
      </Box>

      <Typography fontWeight={900} sx={{ color: "#111827" }}>
        {sistema.nombre}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 0.3,
          minHeight: 34,
          fontSize: 13,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {sistema.descripcion || "Sistema disponible para soporte."}
      </Typography>

      <Chip
        label={`Prefijo: ${sistema.prefijo}`}
        size="small"
        sx={{
          mt: 1,
          height: 22,
          bgcolor: colorSecundario,
          color,
          fontWeight: 800,
          fontSize: 11,
        }}
      />
    </Paper>
  );
}