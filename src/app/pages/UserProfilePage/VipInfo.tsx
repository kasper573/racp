import { useMemo } from "react";
import { Typography } from "@mui/material";
import { trpc } from "../../state/client";

export function VipInfo() {
  const { data: vipTime = 0 } = trpc.user.myVipTime.useQuery();
  const { isVip, endDate } = useMemo(() => {
    const now = new Date();
    const endDate = new Date(now.getTime() + vipTime * 60000);
    const isVip = endDate > now;
    return { endDate, isVip };
  }, [vipTime]);

  return (
    <>
      {isVip && (
        <Typography>
          You are VIP until {dateFormatter.format(endDate)}
        </Typography>
      )}
    </>
  );
}

const dateFormatter = new Intl.DateTimeFormat([], {
  dateStyle: "full",
  timeStyle: "long",
});
