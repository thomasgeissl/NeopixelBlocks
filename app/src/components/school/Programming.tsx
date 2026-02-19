import { Box, Typography } from "@mui/material";
import TabPanel from "./TabPanel";
import { useTranslation } from "react-i18next";

const Programming = ({
  tabValue,
  index,
}: {
  tabValue: number;
  index: number;
}) => {
  const { t } = useTranslation();
  return (
    <TabPanel value={tabValue} index={index}>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" gutterBottom>
          {t("programmingIntro")}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {t("programmingConcepts")}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {t("programmingConceptsDescription")}:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li" variant="body2">
            <strong>{t("programmingConceptsCommands")}</strong>
            {t("programmingConceptsCommandsExplanation")}
          </Typography>
          <Typography component="li" variant="body2">
            <strong>{t("programmingConceptsVariables")}</strong>
            {t("programmingConceptsVariablesExplanation")}
          </Typography>
          <Typography component="li" variant="body2">
            <strong>{t("programmingConceptsFunctions")}</strong>
            {t("programmingConceptsFunctionsExplanation")}
          </Typography>
          <Typography component="li" variant="body2">
            <strong>{t("programmingConceptsLoops")}</strong>
            {t("programmingConceptsLoopsExplanation")}
          </Typography>
          <Typography component="li" variant="body2">
            <strong>{t("programmingConceptsConditionals")}</strong>
            {t("programmingConceptsConditionalsExplanation")}
          </Typography>
          <Typography component="li" variant="body2">
            <strong>{t("programmingConceptsConditionals")}</strong>
            {t("programmingConceptsConditionalsExplanation")}
          </Typography>
          <Typography component="li" variant="body2">
            {t("programmingConceptsConditionalsExample")}
          </Typography>
        </Box>
      </Box>
    </TabPanel>
  );
};

export default Programming;
