import {
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  Menu,
  Stack,
  styled,
  Tooltip,
  TooltipProps,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FilterList } from "@mui/icons-material";
import { ComponentProps, ComponentType, MouseEvent, useState } from "react";
import { concatFunctions } from "../../lib/std/concatFunctions";

type AnyFilter = Record<string, any>;

export interface FilterMenuProps<T extends AnyFilter>
  extends Omit<ComponentProps<typeof IconButton>, "form" | "title"> {
  title?: string;
  selectedText?: (numFilters: number) => TooltipProps["title"];
  filter: T;
  setFilter: (filter: T) => void;
  fields: ComponentType<{ value: T; onChange: (filter: T) => void }>;
}

export function FilterMenu<T extends AnyFilter>({
  title = "Filters",
  selectedText = (n) =>
    n === 0
      ? "No filters selected"
      : n === 1
      ? "1 filter selected"
      : `${n} filters selected`,
  onClick,
  filter,
  setFilter,
  fields: FilterForm,
  style,
  sx,
  className,
}: FilterMenuProps<T>) {
  const theme = useTheme();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const open = (e: MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget);
  const close = () => setAnchor(null);
  const isMenuOpen = Boolean(anchor);
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("md"));
  const numFilters = Object.keys(filter).length;

  let content = (
    <Box role="menu" aria-label="Filters" sx={{ padding: 2, paddingTop: 0 }}>
      <Stack
        sx={{ flex: 1, py: 1 }}
        spacing={2}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography>{title}</Typography>
        <Stack direction="row" spacing={1}>
          <Button onClick={() => setFilter({} as T)}>Clear</Button>
          <Button onClick={close}>Close</Button>
        </Stack>
      </Stack>
      <FieldsContainer>
        <FilterForm value={filter} onChange={setFilter} />
      </FieldsContainer>
    </Box>
  );

  if (isSmallDevice) {
    content = (
      <Drawer anchor="bottom" open={isMenuOpen} onClose={close}>
        {content}
      </Drawer>
    );
  } else {
    content = (
      <Menu
        anchorEl={anchor}
        open={isMenuOpen}
        keepMounted
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={close}
        MenuListProps={{ sx: { padding: 0 } }}
      >
        <div
          onKeyDown={
            // Disables built-in keyboard events for menu items that
            // would be triggered when typing in the form controls
            (e) => e.stopPropagation()
          }
        >
          {content}
        </div>
      </Menu>
    );
  }

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        {...{ style, sx, className }}
      >
        <Typography>{selectedText(numFilters)}</Typography>
        <div>
          <Tooltip title="Select filters">
            <IconButton
              aria-label={`Show ${title}`}
              onClick={concatFunctions(open, onClick)}
            >
              <Badge
                overlap="circular"
                color="info"
                badgeContent={numFilters}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <FilterList />
              </Badge>
            </IconButton>
          </Tooltip>
        </div>
      </Stack>
      {content}
    </>
  );
}

const FieldsContainer = styled("div")`
  display: grid;
  grid-gap: 16px;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: auto;
`;
