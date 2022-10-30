import { useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  TypographyProps,
  useTheme,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { TextField, TFPropsVariant } from "../controls/TextField";

export function EditableText({
  value,
  sx,
  style,
  className,
  typographyProps,
  enabled = true,
  ...textFieldProps
}: TFPropsVariant<"text", string, false> & {
  typographyProps?: TypographyProps;
  enabled?: boolean;
}) {
  const sharedProps = { sx, style, className };
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    const textStyle =
      typographyProps?.variant && typographyProps?.variant !== "inherit"
        ? theme.typography[typographyProps.variant]
        : {};
    return (
      <TextField
        {...textFieldProps}
        {...sharedProps}
        variant="standard"
        value={value}
        onBlur={() => setIsEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            setIsEditing(false);
          }
        }}
        autoFocus
        InputProps={{
          disableUnderline: true,
          componentsProps: {
            input: {
              style: {
                ...(textStyle as any),
                height: textStyle["lineHeight"] + "em",
                padding: 0,
              },
            },
          },
        }}
      />
    );
  }

  return (
    <Typography gutterBottom={false} {...typographyProps} {...sharedProps}>
      <Box
        component="span"
        sx={{ position: "relative" }}
        onClick={enabled ? () => setIsEditing(true) : undefined}
      >
        {value}
        {enabled && (
          <IconButton
            sx={{
              position: "absolute",
              right: -8,
              top: "50%",
              transform: "translate(100%, -50%)",
            }}
          >
            <Edit />
          </IconButton>
        )}
      </Box>
    </Typography>
  );
}
