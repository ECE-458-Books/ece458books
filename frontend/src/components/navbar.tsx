import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {LinkContainer} from 'react-router-bootstrap'

interface NavigationBarButtonProps {
  urlExtension: string
  buttonText: string
}

function NavigationBarButton(props: NavigationBarButtonProps){
  return (
    <LinkContainer to={props.urlExtension}>
      <Nav.Link>{props.buttonText}</Nav.Link>
    </LinkContainer>
  )
}

function NavigationBarBrand(props: NavigationBarButtonProps){
  return (
    <LinkContainer to={props.urlExtension}>
      <Navbar.Brand>{props.buttonText}</Navbar.Brand>
    </LinkContainer>
  )
}

function NavigationBar() {
  return (
    <>
      <Navbar bg="primary" variant="dark">
          <NavigationBarBrand urlExtension='/' buttonText='Hypothetical'/>
          <Nav className = "me-auto">
            <NavigationBarButton urlExtension='/books' buttonText='Books'/>
            <NavigationBarButton urlExtension='/genres' buttonText='Genres'/>
            <NavigationBarButton urlExtension='/orders' buttonText='Orders'/>
          </Nav>
      </Navbar>
    </>
  );
}

export default NavigationBar;

