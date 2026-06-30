import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

export default function AttachmentPreview({
  previewOpen,
  previewFile,
  cerrarPreview,
  esImagenArchivo,
  esVideoArchivo,
  esPdfArchivo,
  getArchivoUrl,
  descargarArchivo,
}) {
  return (
    <Dialog
      open={previewOpen}
      onClose={cerrarPreview}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography fontWeight={800} noWrap>
          {previewFile?.nombre_archivo || "Vista previa"}
        </Typography>

        <IconButton onClick={cerrarPreview}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {previewFile && esImagenArchivo(previewFile) && (
          <Box
            component="img"
            src={getArchivoUrl(previewFile)}
            alt={previewFile.nombre_archivo}
            sx={{
              width: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: 2,
            }}
          />
        )}

        {previewFile && esVideoArchivo(previewFile) && (
          <Box
            component="video"
            src={getArchivoUrl(previewFile)}
            controls
            sx={{
              width: "100%",
              maxHeight: "70vh",
              borderRadius: 2,
            }}
          />
        )}

        {previewFile && esPdfArchivo(previewFile) && (
          <Box
            component="iframe"
            src={getArchivoUrl(previewFile)}
            sx={{
              width: "100%",
              height: "70vh",
              border: "none",
              borderRadius: 2,
            }}
          />
        )}

        {previewFile &&
          !esImagenArchivo(previewFile) &&
          !esVideoArchivo(previewFile) &&
          !esPdfArchivo(previewFile) && (
            <Box textAlign="center" py={4}>
              <InsertDriveFileIcon color="primary" sx={{ fontSize: 60 }} />

              <Typography fontWeight={800} mt={2}>
                Este archivo no tiene vista previa.
              </Typography>

              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
                onClick={() => descargarArchivo(previewFile)}
              >
                Descargar archivo
              </Button>
            </Box>
          )}
      </DialogContent>
    </Dialog>
  );
}