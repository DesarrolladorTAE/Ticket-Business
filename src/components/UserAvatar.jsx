import { Avatar } from "@mui/material";

const obtenerIniciales = (user) => {
  const iniciales = [
    user?.name,
    user?.apellido_paterno,
  ]
    .filter(Boolean)
    .map((valor) =>
      String(valor).trim().charAt(0).toUpperCase(),
    )
    .join("")
    .slice(0, 2);

  return iniciales || "U";
};

export default function UserAvatar({
  user,
  size = 42,
  fontSize = 14,
  sx = {},
}) {
  const nombreCompleto = [
    user?.name,
    user?.apellido_paterno,
    user?.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const avatarUrl = user?.avatar_url || undefined;

  return (
    <Avatar
      src={avatarUrl}
      alt={nombreCompleto || "Usuario"}
      sx={{
        width: size,
        height: size,
        bgcolor: "#2563eb",
        fontSize,
        fontWeight: 900,
        flexShrink: 0,
        ...sx,
      }}
    >
      {!avatarUrl && obtenerIniciales(user)}
    </Avatar>
  );
}