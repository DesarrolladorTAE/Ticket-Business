import { Box, Typography } from "@mui/material";

export default function TicketInfoItem({ label, value, multiline = false }) {
  return (
    <Box
      sx={{
        border: "1px solid #e5e7eb",
        p: 2,
        borderRadius: 2,
        minHeight: multiline ? 100 : 70,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography
        fontWeight={600}
        sx={{ whiteSpace: multiline ? "pre-line" : "normal" }}
      >
        {value}
      </Typography>
    </Box>
  );
}