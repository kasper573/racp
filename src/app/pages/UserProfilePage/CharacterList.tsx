import { ListItemText, Paper, Stack } from "@mui/material";
import { trpc } from "../../state/client";
import { Character } from "../../../api/services/character/types";
import { CardList } from "../../components/CardList";
import { LinkButton } from "../../components/Link";
import { routes } from "../../router";

export function CharacterList() {
  const { data: characters = [] } = trpc.character.mine.useQuery();
  return (
    <CardList>
      {characters.map((character) => (
        <CharacterListItem key={character.id} {...character} />
      ))}
    </CardList>
  );
}

function CharacterListItem({ name, job, baseLevel, jobLevel, id }: Character) {
  return (
    <Paper sx={{ px: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <ListItemText
          primary={name}
          secondary={`${job}, Lvl. ${baseLevel} / ${jobLevel}`}
        />
        <div>
          <LinkButton to={routes.character({ id })} size="small">
            View
          </LinkButton>
        </div>
      </Stack>
    </Paper>
  );
}
