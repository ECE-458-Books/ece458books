import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {LinkContainer} from 'react-router-bootstrap'

function NavigationBar() {
  return (
    <>
      <Navbar bg="primary" variant="dark">
        <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Hypothetical Books</Navbar.Brand>
          </LinkContainer>
          <Nav>
            <LinkContainer to="/books">
              <Nav.Link>Books</Nav.Link>
              </LinkContainer>
            <LinkContainer to="/genres">
              <Nav.Link>Genres</Nav.Link>
              </LinkContainer>
            <LinkContainer to="/orders">
              <Nav.Link>Orders</Nav.Link>
              </LinkContainer>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}

export default NavigationBar;

