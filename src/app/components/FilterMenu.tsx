import {
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  Menu,
  Stack,
  styled,
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
  filter: T;
  setFilter: (filter: T) => void;
  fields: ComponentType<{ value: T; onChange: (filter: T) => void }>;
}

export function FilterMenu<T extends AnyFilter>({
  title = "Filters",
  onClick,
  children,
  filter,
  setFilter,
  fields: FilterForm,
  ...props
}: FilterMenuProps<T>) {
  const theme = useTheme();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const open = (e: MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget);
  const close = () => setAnchor(null);
  const isMenuOpen = Boolean(anchor);
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("md"));
  const numFilters = Object.keys(filter).length;

  let content = (
    <Box sx={{ padding: 2, paddingTop: 0 }}>
      <Stack
        sx={{ flex: 1, mb: 1, mt: 1 }}
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
        {content}
      </Menu>
    );
  }

  return (
    <>
      <IconButton
        aria-label={`Show ${title}`}
        onClick={concatFunctions(open, onClick)}
        {...props}
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
