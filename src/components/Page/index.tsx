import Paper from "@mui/material/Paper";
import styled from "styled-components";
import {styled as muiStyled} from "@mui/material/styles";
import {ChildProps} from "../../types";

const Background = styled.div`
  min-height: 100vh;
  overflow: auto;
  width: 100%;
  background-color: ${props => props.theme?.palette?.background?.default};
  position: relative;
`;

const PageContainer = styled.div<{margin?: string}>`
  position: absolute;
  width: 100vw;
  height: calc(100vh - ${props => props.theme?.componentStyles?.Header?.desktop?.height});
  margin: ${props => props.margin || "1em"};
  @media screen and (max-width: 600px) {
    height: calc(100vh - ${props => props.theme?.componentStyles?.Header?.mobile?.height});
  }
`;

const StyledPaper = muiStyled(Paper)`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Page = ({children, containerMargin}: {children?: ChildProps; containerMargin?: string}) => {
  return (
    <Background>
      <StyledPaper>
        <PageContainer className="page-container" margin={containerMargin}>
          {children}
        </PageContainer>
      </StyledPaper>
    </Background>
  )
}

export default Page;
