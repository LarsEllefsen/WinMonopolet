import React from 'react';
import {
  Container,
  Image,
  Menu
} from 'semantic-ui-react';
import logo from '../logo.svg';
import SearchBar from "./SearchBar"

function HeaderBar(){
  return(
    <div>
  <Menu fixed='top' inverted>
    <Container>
      <Menu.Item as='a' header>
        <Image size='mini' src={logo} style={{ marginRight: '1.5em' }} />
        Project Name
      </Menu.Item>
      <SearchBar/>
      <Menu.Item as='a'>Home</Menu.Item>
    </Container>
  </Menu>
</div>
  )
}

export default HeaderBar;
