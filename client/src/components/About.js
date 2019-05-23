import React, {Component} from 'react'
import {Modal, Button, Image, Header} from 'semantic-ui-react'
import pbu from '../images/pbu_40_grey.png'
import profile_pic from '../images/lars_transparent2.png'

class About extends Component {
  state={
    modalOpen : false
  }

  handleOpen = () => this.setState({modalOpen: true})
  handleClose = () => this.setState({modalOpen: false})


  render(){
    return(
      <Modal trigger={<Button onClick={this.handleOpen} className="about_button">Om</Button>} open={this.state.modalOpen} onClose={this.handleClose}>
      <Button icon="close" className="closeButton" onClick={this.handleClose}></Button>
      <Modal.Header>Om Winmonopolet</Modal.Header>
      <Modal.Content image>
      <Image wrapped size='large' src={profile_pic} className="profile_picture"/>
          {/*<ReactSVG src={snirkel} svgStyle={{ width: 150, heigth: 600 }} className="snirkel"/>*/}
        <Modal.Description>

        <Header>Om siden</Header>
        <p>Siden er laget og vedlikeholdt av Lars Moe Ellefsen, og drives kun på en hobbybasis. Følg meg gjerne på <a href="https://github.com/larsellefsen" rel="noopener noreferrer" target="_blank">Github!</a><br/>
        Jeg tjener ingenting på siden, og jeg betaler selv serverkostnadene ut av mine bittesmå studentlommer.</p>
        <p>Hvis du har spørsmål angående siden, forslag til forbedringer eller ris/ros kan jeg nåes på <a href="mailto:lars@winmonopolet.com" target="_top">lars@winmonopolet.com</a></p>


          <Header>Om dataen</Header>
          <div style={{overflow: "hidden"}}>
          <p>All data om lagerstatus, butikker og annen logistisk info er hentet fra <a href="https://vinmonopolet.no" rel="noopener noreferrer" target="_blank">Vinmonopolet</a> sine nettsider.<br/>
          Bilde, rating og diverse ekstra info om hver enkelt øl hentes fra <a href="https://untappd.com" rel="noopener noreferrer" target="_blank">Untappd</a>.</p>
          <p>Det å matche tusenvis av øl på Vinmonopolet opp mot Untappd er ikke lett. På grunn av manglende konsistens mellom Vinmonopolet og Untappd sin navngiving av øl, så det kan
          det forekomme feil. (Det burde virkelig finnes en ISBN for øl)</p>

          <p>Siden oppdaterer fra Vinmonopolet hver natt, så lagerstatusen kan ha en liten feilmargin. Data fra Untappd hentes når en ny øl blir lagt til, og øl-ratinger oppdateres kontinuerlig for å holde
          siden så oppdatert som mulig. På grunn av en alt for lav API-grense har jeg ikke mulighet til å holde alle øl oppdatert til enhver tid, så noen utdaterte ratinger kan forekomme.</p>


          <Image src={pbu} as='a' href='http://untappd.com' target='_blank' style={{float:"right"}}/>
          </div>
        </Modal.Description>
      </Modal.Content>
    </Modal>
    )
  }
}


export default About;
