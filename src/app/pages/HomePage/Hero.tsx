import { styled } from "@mui/material";
import image from "./hero.png";

export const Hero = styled("div")`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  width: 100%;
  aspect-ratio: 16 / 3;
  overflow: hidden;
  background-size: cover;
  background-position: center 0;
  background-image: url(${image});
  font-style: normal;
  font-weight: bold;
  color: #eee;
  font-size: 11vmin;
  letter-spacing: 0.03em;
  line-height: 1;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.8);
`;
