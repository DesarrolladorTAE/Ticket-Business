import { Box, Typography } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import ArticleIcon from "@mui/icons-material/Article";
import ArchiveIcon from "@mui/icons-material/Archive";
import MovieIcon from "@mui/icons-material/Movie";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

export default function AttachmentCard({ file, abrirArchivo, getArchivoUrl }) {
  const nombre = file?.nombre_archivo || "Archivo";
  const extension = nombre.split(".").pop()?.toLowerCase();

  const tipo = getTipoArchivo(extension);
  const esImagen = tipo.key === "imagen";
  const url = getArchivoUrl ? getArchivoUrl(file) : "";

  if (esImagen) {
    return (
      <Box
        onClick={() => abrirArchivo(file)}
        sx={{
          width: 240,
          maxWidth: "100%",
          borderRadius: 2.5,
          overflow: "hidden",
          cursor: "pointer",
          bgcolor: "#f8fafc",
          border: "1px solid #dbeafe",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
          transition: "0.15s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 10px rgba(15, 23, 42, 0.16)",
          },
        }}
      >
        <Box
          component="img"
          src={url}
          alt={nombre}
          sx={{
            width: "100%",
            height: 170,
            display: "block",
            objectFit: "cover",
            bgcolor: "#e5e7eb",
          }}
        />

        <Box sx={{ px: 1, py: 0.8 }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: "#1f2937",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {nombre}
          </Typography>

          <Typography sx={{ fontSize: 10.5, color: "#64748b" }}>
            Tocar para ampliar
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      onClick={() => abrirArchivo(file)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1,
        borderRadius: 2,
        bgcolor: tipo.bgcolor,
        border: `1px solid ${tipo.border}`,
        cursor: "pointer",
        transition: "0.15s ease",
        "&:hover": {
          bgcolor: tipo.hover,
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          bgcolor: tipo.iconBg,
          color: tipo.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {tipo.icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 800,
            color: tipo.color,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {tipo.label}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 800,
            color: "#1f2937",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 230,
          }}
        >
          {nombre}
        </Typography>

        <Typography sx={{ fontSize: 10.5, color: "#64748b" }}>
          Abrir archivo
        </Typography>
      </Box>
    </Box>
  );
}

function getTipoArchivo(extension) {
  const imagenes = ["jpg", "jpeg", "png", "webp", "gif", "jfif"];
  const videos = ["mp4", "mov", "avi", "webm", "mkv"];
  const pdfs = ["pdf"];
  const excels = ["xls", "xlsx", "csv"];
  const words = ["doc", "docx"];
  const zips = ["zip", "rar", "7z"];

  if (imagenes.includes(extension)) {
    return {
      key: "imagen",
      label: "Imagen",
      color: "#2563eb",
      bgcolor: "#eff6ff",
      hover: "#dbeafe",
      border: "#bfdbfe",
      iconBg: "#dbeafe",
      icon: <ImageIcon fontSize="small" />,
    };
  }

  if (videos.includes(extension)) {
    return {
      key: "video",
      label: "Video",
      color: "#7c3aed",
      bgcolor: "#f5f3ff",
      hover: "#ede9fe",
      border: "#ddd6fe",
      iconBg: "#ede9fe",
      icon: <MovieIcon fontSize="small" />,
    };
  }

  if (pdfs.includes(extension)) {
    return {
      key: "pdf",
      label: "PDF",
      color: "#dc2626",
      bgcolor: "#fef2f2",
      hover: "#fee2e2",
      border: "#fecaca",
      iconBg: "#fee2e2",
      icon: <PictureAsPdfIcon fontSize="small" />,
    };
  }

  if (excels.includes(extension)) {
    return {
      key: "excel",
      label: "Excel",
      color: "#15803d",
      bgcolor: "#f0fdf4",
      hover: "#dcfce7",
      border: "#bbf7d0",
      iconBg: "#dcfce7",
      icon: <TableChartIcon fontSize="small" />,
    };
  }

  if (words.includes(extension)) {
    return {
      key: "word",
      label: "Word",
      color: "#1d4ed8",
      bgcolor: "#eff6ff",
      hover: "#dbeafe",
      border: "#bfdbfe",
      iconBg: "#dbeafe",
      icon: <ArticleIcon fontSize="small" />,
    };
  }

  if (zips.includes(extension)) {
    return {
      key: "zip",
      label: "Comprimido",
      color: "#92400e",
      bgcolor: "#fffbeb",
      hover: "#fef3c7",
      border: "#fde68a",
      iconBg: "#fef3c7",
      icon: <ArchiveIcon fontSize="small" />,
    };
  }

  return {
    key: "archivo",
    label: "Archivo",
    color: "#475569",
    bgcolor: "#f8fafc",
    hover: "#f1f5f9",
    border: "#cbd5e1",
    iconBg: "#e2e8f0",
    icon: <InsertDriveFileIcon fontSize="small" />,
  };
}