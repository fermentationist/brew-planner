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

const PageContainer = styled.div`
  position: absolute;
  margin: 1em;
`;

const StyledPaper = muiStyled(Paper)`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Page = ({children}: ChildProps) => {
  return (
    <Background>
      <StyledPaper>
        <PageContainer className="page-container">
          {children}
        </PageContainer>
      </StyledPaper>
    </Background>
  )
}

export default Page;
