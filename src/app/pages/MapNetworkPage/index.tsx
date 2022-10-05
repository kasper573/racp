import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { Box } from "@mui/material";
import useResizeObserver from "use-resize-observer";
import { Header } from "../../layout/Header";
import { trpc } from "../../state/client";
import { router } from "../../router";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Center } from "../../components/Center";
import { Spaceless } from "../../components/Spaceless";
import { renderNetwork } from "./renderNetwork";

export default function MapNetworkPage() {
  const [isNetworkReady, setNetworkReady] = useState(false);
  const history = useHistory();
  const { data: network } = trpc.map.getNetwork.useQuery();
  const svgRef = useRef<SVGSVGElement>(null);
  const {
    ref: containerRef,
    width,
    height,
  } = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    (async () => {
      setNetworkReady(false);
      if (
        svgRef.current &&
        network &&
        width !== undefined &&
        height !== undefined
      ) {
        await renderNetwork(svgRef.current, width, height, network, (id) =>
          history.push(router.map().view({ id }).$)
        );
        setNetworkReady(true);
      }
    })();
  }, [history, network, width, height]);

  return (
    <Box sx={{ flex: 1 }} ref={containerRef}>
      <Spaceless sx={{ display: isNetworkReady ? "visible" : "none" }}>
        <svg
          opacity={isNetworkReady ? 1 : 0}
          width={width}
          height={height}
          ref={svgRef}
        />
      </Spaceless>
      <Header sx={{ position: "absolute" }}>Map node network experiment</Header>
      {!isNetworkReady && (
        <Center>
          <LoadingSpinner size={64} />
        </Center>
      )}
    </Box>
  );
}
