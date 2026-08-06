import { Box } from "@mui/material";

import LandingHeader from "../components/LandingHeader";
import LandingBeneficios from "../components/LandingBeneficios";
import LandingCta from "../components/LandingCta";
import LandingFooter from "../components/LandingFooter";

function BeneficiosPage() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#f8fafc",
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
          display: "flex",
          flexDirection: "column",
          pt: {
            xs: "70px",
            md: "80px",
          },
        }}
      >
        <LandingBeneficios />
        <LandingCta />
      </Box>

      <LandingFooter />
    </Box>
  );
}

export default BeneficiosPage;