import { Box, Typography } from "@mui/material";

export default function TicketInfoItem({ label, value, multiline = false }) {
  return (
    <Box
      sx={{
        border: "1px solid #e5e7eb",
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 2.5,
        minHeight: multiline ? { xs: 100, sm: 115 } : { xs: 64, sm: 70 },
        bgcolor: "#ffffff",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={800}
        sx={{
          display: "block",
          mb: 0.5,
          fontSize: { xs: 11, sm: 12 },
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>

      <Typography
        fontWeight={800}
        sx={{
          fontSize: { xs: 13, sm: 14 },
          lineHeight: 1.4,
          color: "#111827",
          whiteSpace: multiline ? "pre-line" : "normal",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}