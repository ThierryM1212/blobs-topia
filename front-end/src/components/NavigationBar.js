import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import Logo from "../images/blobstopia.png";
import InputAddress from './InputAddress';

function NavigationBar(props) {
    return (
        <Navbar expand="lg" variant="dark" className="sticky-top w-100 color-nav">
            <Navbar.Brand href="/">
                <img src={Logo} alt="logo" className="hidden-mobile" />
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link href={"/"}>Home</Nav.Link>
                    <Nav.Link href={"/myblobs"}>My Blobs</Nav.Link>
                    <Nav.Link href={"/matchmaking"}>Match making</Nav.Link>
                    <Nav.Link href={"/fights"}>Figths</Nav.Link>
                    <Nav.Link href={"/blobsshop"}>Blobs shop</Nav.Link>
                    <Nav.Link href={"/oatmealshop"}>Oatmeal shop</Nav.Link>
                    <Nav.Link href={"/blobinator"}>Blobinators</Nav.Link>
                    <NavDropdown title="More" id="basic-nav-dropdown" variant="dark">
                        <NavDropdown.Item href={"/request-bot"}>Requests bot</NavDropdown.Item>
                        <NavDropdown.Item href={"/halloffame"}>Hall of fame</NavDropdown.Item>
                        <NavDropdown.Item href={"/about"}>About</NavDropdown.Item>
                        <NavDropdown.Item href={"/admin"}>Admin</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
            <InputAddress />
        </Navbar>
    );
}
export default NavigationBar;

