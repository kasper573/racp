import { memo } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { ErrorLike, ErrorMessage } from "../../components/ErrorMessage";

export const AssetErrorList = memo(function ({
  errors,
}: {
  errors: ErrorLike[];
}) {
  return (
    <Accordion
      expanded={errors.length > 0}
      sx={{ [`&&`]: { marginTop: 0, marginBottom: 2 } }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>Errors during upload ({errors.length})</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {errors.map((error, index) => (
          <ErrorMessage key={`error${index}`} error={error} />
        ))}
      </AccordionDetails>
    </Accordion>
  );
});
