import React, {Component} from 'react'
import {Menu, Form, Divider} from 'semantic-ui-react'
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import _ from 'lodash';


class SidebarForm extends Component {

  state = {
    activeIndex: 0,
    price: [0, 1000],
    abv: [0, 20],
    styles: [],
    news: false,
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  handleCheckChange = (e, { value }) => {
    var styles = this.state.styles
    if(!_.includes(this.state.styles, value)){
      styles.push(value)
      this.setState({styles: styles}, function() {
        this.handleSubmit();
      })
    } else {
      styles.splice(styles.indexOf(value), 1)
      this.setState({styles: styles}, function() {
        this.handleSubmit();
      })
    }
  }

  onPriceSliderChange = (value) => {
    this.setState({price: value})
  }

  onAbvSliderChange = (value) => {
    this.setState({abv: value})
  }

  handleNewsChange = (value) => {
    var filterNews = this.state.news
    console.log(filterNews)
    this.setState({news: !filterNews}, function() {
      this.handleSubmit();
    })
  }

  handleSubmit = () => {
    this.props.returnresult(this.state);
  }

  resetForm = () => {
    this.setState({
      price: [0, 1000],
      abv: [0, 20],
      styles: [],
      news: false
    }, function() {
      this.handleSubmit();
    });
  }

  componentDidUpdate(prevProps){
    if(this.props.beerChange != prevProps.beerChange){
      this.setState({
        abv: [0, 20],
        price: [0, 1000],
        styles: [],
        news: false
      })
    }

  }

  isFormLoading = () => {
    if(this.props.isLoading ){
      return('<Form loading>')
    } else {
      return('<Form>')

    }
  }

  render() {
    const { activeIndex } = this.state

    return(
      <div>
      <Form loading={this.props.isLoading} >

        <Form.Group grouped>

          <div style={{width:"90%", margin:"auto"}}>
          <h3 style={{marginBottom: "0px"}}>Pris:</h3>
            <p style={{display:"inline-block", width:"50%", marginBottom:"2px"}}>{this.state.price[0] + "kr"}</p><p style={{display:"inline-block", width:"50%", textAlign:"right", marginBottom:"2px"}}>{this.state.price[1] + "kr"}</p>
            <Range allowCross={false} defaultValue={[this.state.price[0], this.state.price[1]]} min={0} max={1000} onChange={this.onPriceSliderChange} onAfterChange={this.handleSubmit} value={[this.state.price[0], this.state.price[1]]}/>
          </div>
        </Form.Group>

        <Divider/>

        <Form.Group grouped>

          <div style={{width:"90%", margin:"auto"}}>
          <h3 style={{marginBottom: "0px"}}>Abv:</h3>
            <p style={{display:"inline-block", width:"50%", marginBottom:"2px"}}>{this.state.abv[0]}</p><p style={{display:"inline-block", width:"50%", textAlign:"right", marginBottom:"2px"}}>{this.state.abv[1]}</p>
            <Range allowCross={false} defaultValue={[this.state.abv[0], this.state.abv[1]]} min={0} max={20} onChange={this.onAbvSliderChange} onAfterChange={this.handleSubmit} value={[this.state.abv[0], this.state.abv[1]]}/>
          </div>
        </Form.Group>

        <Divider/>
          <div style={{width:"90%", margin:"auto"}}>
            <Form.Checkbox label="Vis kun nyheter" name="nyheter" value="true" onChange={this.handleNewsChange} checked={this.state.news == true}/>
          </div>

        <Divider/>

        {/*<Accordion as={Menu} vertical style={{margin:"auto"}}>*/}
        <div style={{width:"90%", margin:"auto"}}>
         <Menu.Item>
         {/*<Accordion.Title
              active={activeIndex === 1}
              content='Stil'
              index={1}
              onClick={this.handleClick}
            />
            <Accordion.Content active={activeIndex === 1} content={*/}
              <Form.Group grouped >
                <Form.Checkbox label='Barley Wine' name='style' value='Barley wine' onChange={this.handleCheckChange} checked={this.state.styles.includes("Barley wine")}/>
                <Form.Checkbox label='Brown Ale' name='style' value='Brown ale' onChange={this.handleCheckChange} checked={this.state.styles.includes("Brown ale")}/>
                <Form.Checkbox label='Glutenfri' name='style' value='Gluten-Free' onChange={this.handleCheckChange} checked={this.state.styles.includes("Gluten-Free")}/>
                <Form.Checkbox label='Hveteøl' name='style' value='Hveteøl' onChange={this.handleCheckChange} checked={this.state.styles.includes("Hveteøl")}/>
                <Form.Checkbox label='India Pale Ale' name='style' value='India pale ale' onChange={this.handleCheckChange} checked={this.state.styles.includes("India pale ale")}/>
                <Form.Checkbox label='Klosterstil' name='style' value='Klosterstil' onChange={this.handleCheckChange} checked={this.state.styles.includes("Klosterstil")}/>
                <Form.Checkbox label='Lys ale' name='style' value='Lys ale' onChange={this.handleCheckChange} checked={this.state.styles.includes("Lys ale")}/>
                <Form.Checkbox label='Lys lager' name='style' value='Lys lager' onChange={this.handleCheckChange} checked={this.state.styles.includes("Lys lager")}/>
                <Form.Checkbox label='Mørk lager' name='style' value='Mørk lager' onChange={this.handleCheckChange} checked={this.state.styles.includes("Mørk lager")}/>
                <Form.Checkbox label='Pale ale' name='style' value='Pale ale' onChange={this.handleCheckChange} checked={this.state.styles.includes("Pale ale")}/>
                <Form.Checkbox label='Porter & Stout' name='style' value='Porter & stout' onChange={this.handleCheckChange} checked={this.state.styles.includes("Porter & stout")}/>
                <Form.Checkbox label='Red/Amber' name='style' value='Red/amber' onChange={this.handleCheckChange} checked={this.state.styles.includes("Red/amber")}/>
                <Form.Checkbox label='Saison/Farmhouse ale' name='style' value='Saison farmhouse ale' onChange={this.handleCheckChange} checked={this.state.styles.includes("Saison farmhouse ale")} />
                <Form.Checkbox label='Scotch Ale' name='style' value='Scotch ale' onChange={this.handleCheckChange} checked={this.state.styles.includes("Scotch ale")}/>
                <Form.Checkbox label='Spesial' name='style' value='Spesial' onChange={this.handleCheckChange} checked={this.state.styles.includes("Spesial")}/>
                <Form.Checkbox label='Surøl' name='style' value='Surøl' onChange={this.handleCheckChange} checked={this.state.styles.includes("Surøl")}/>
              </Form.Group>

          </Menu.Item>
          </div>
        {/*</Accordion>*/}

      </Form>
      </div>
    )
  }
}

export default SidebarForm;
