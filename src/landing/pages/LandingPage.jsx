import { Box } from "@mui/material";

import LandingHeader from "../components/LandingHeader";
import LandingHero from "../components/LandingHero";
import LandingConfianza from "../components/LandingConfianza";
import LandingFlujoResumen from "../components/LandingFlujoResumen";
import LandingAccesosRapidos from "../components/LandingAccesosRapidos";
import LandingVistaPanel from "../components/LandingVistaPanel";
import LandingTiposUsuario from "../components/LandingTiposUsuario";
import LandingCta from "../components/LandingCta";
import LandingFooter from "../components/LandingFooter";

function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#ffffff",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <LandingHeader />

      <Box
        component="main"
        sx={{
          flex: 1,
        }}
      >
        <LandingHero />
        <LandingConfianza />
        <LandingFlujoResumen />
        <LandingAccesosRapidos />
        <LandingVistaPanel />
        <LandingTiposUsuario />
        <LandingCta />
      </Box>

      <LandingFooter />
    </Box>
  );
}

export default LandingPage;