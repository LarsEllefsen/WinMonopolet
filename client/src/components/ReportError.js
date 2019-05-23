import React, {Component} from 'react'
import {Label, Modal, Form, Header} from 'semantic-ui-react'

class ReportError extends Component {

  state = {
    open : false,
    option_selected: '',
    report_text: ''
  }

  handleOpen = () => this.setState({ open: true })

  handleClose = () => this.setState({ open: false })

  options = [
    {key: "1", text: "Feil øl på Untappd", value: "wrong_untappd"},
    {key: "2", text: "Feil eller manglende info", value: "wrong_info"},
    {key: "3", text: "Utdatert rating", value: "outdated_rating"},
    {key: "4", text: "Manglende bilde", value: "missing_picture"},
    {key: "5", text: "Annet", value: "other"}
  ]


  handleReportChange = (event, {value}) => {
      this.setState({option_selected: value})
  }

  handleTextChange = (event, {value}) => {
      this.setState({report_text: value})
  }

  submitReport = () => {
    if(this.state.option_selected != ""){
      fetch('/api/sendMail', {
      // fetch('http://localhost:3001/sendMail', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          from: 'Error Report <mail@mg.winmonopolet.com>',
          to: 'mail@winmonopolet.com',
          subject: '[REPORT] ' + this.props.name + " ["+this.props.id+"] : " + this.state.option_selected,
          text: "Feilbeskrivelse: " + this.state.report_text
        })
      }).then((res) => {
        alert("Takk for at du meldte ifra! Feilmeldingen har blitt sendt og fikses fortløpende!")
        this.setState({open: false})
      }).catch((err) => {
        alert(err.message)
      })
    } else {
      alert("Årsak må være valgt")
    }
  }


render(){
  return(
    <Modal trigger={<Label as='a' className="report_button" onClick={this.handleOpen}>Feil?</Label>} open={this.state.open} onClose={this.handleClose} closeIcon>
      <Modal.Header>Rapporter feil</Modal.Header>
      <Modal.Content image>
        <Modal.Description>
          <Header>{this.props.name}</Header>
            <p>Merk at noe utdaterte ratinger kan forekomme, så rapporter kun om forskjellen er veldig stor.</p>
            <p>Velg årsak til feilen:</p>
            <Form>
              <Form.Select label='Årsak' options={this.options} placeholder='Årsak' onChange={this.handleReportChange} />
              <Form.TextArea label='Beskriv feilen:' placeholder='Beskriv feilen (Valgfritt)' onChange={this.handleTextChange} />
              <Form.Button onClick={this.submitReport}>Send</Form.Button>
            </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  )
  }

}

export default ReportError;
