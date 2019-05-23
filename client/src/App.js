import React, { Component } from 'react';
import logo from './images/logo_rotated.svg';
import './App.css';
import './logo.css'
/*import sheet from './images/sheet.png'*/
import ItemTable from "./components/ItemTable_Functional"
import SearchBar from "./components/SearchBar"
import SidebarForm from "./components/SidebarForm"
import SidebarFormMobile from "./components/SidebarForm_mobile"
import Splash from "./components/Splash"
import { Menu, Container} from 'semantic-ui-react'
import { sortByDistance, geo_options, sortWithFilters } from './utilities.js'
import { ClipLoader } from 'react-spinners'
import About from './components/About'
import ReactSVG from 'react-svg'
import ReactGA from 'react-ga';


class App extends Component {
  constructor(props){
    super(props);
    this.returnResult = this.returnResult.bind(this);
    this.state= {
      stores: [],
      StoreValue: '',
      searchItems: null,
      closestStore: null,
      beer_styles: [],
      price: null,
      abv: null,
      new_only: false,
      beers: [],
      isFetching: false,
      beersToRender: [],
    };
  }


  componentDidMount(){
    this.getStores()
  }

  getStores(){
    fetch('/api/getStores', {
      headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }

    }).then((res) => {
      if(res.status !== 200){
        console.log("Problem fetching stores!")
      } else {
        res.text().then((data) => {
          var closestStore = null;
          var stores = JSON.parse(data)
          var searchItems = stores.flatMap(x => [{title: String(x.name), description: String(x.address), price: String("Category: " + x.category)}])
          this.setState({searchItems: searchItems, stores: stores, closestStore: closestStore})
        })
      }
    })
  }

  getBeers(store, returned_filters) {
    var filters = {
      "style": this.state.beer_styles,
      "price": this.state.price,
      "abv": this.state.abv,
      "new_only": this.state.new_only
    }
    fetch('/api/getFromStore/'+store+"/"+JSON.stringify(filters),{
      headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }

    }).then((res) => {
      if(res.status != 200){
        console.log(res.status)
      } else {
        res.text().then((data) => {
          var beer = JSON.parse(data)
          this.setState({beers: beer, StoreValue: store, isFetching: false, beersToRender: beer})
        })
      }
    })
  }

  getCoords() {
    return new Promise((resolve,reject) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position, err, geo_options) {
          if(!err){
            var user_loc = {lat: position.coords.latitude, lon: position.coords.longitude};
            resolve(user_loc)
          } else {
            reject(err.code)
          }

        });
      } else {
        reject("not supposrted")
      }
    })

  }

  returnResult(i){
    this.setState({isFetching: true})
    this.getBeers(i);
  }



  returnSearchFilters = (state) => {
    sortWithFilters(this.state.beers, state).then((filtered_beers) => this.setState({beersToRender: filtered_beers}))
  }

  renderItemTable(){
    this.handleAnimationHover()
    if(this.state.isFetching == false){
      if(this.state.StoreValue != '' && this.state.beers.length != 0){
        return(<ItemTable beers={this.state.beersToRender}/>)
      }
    } else {
      return(
        <div style={{margin:'auto', width:'10%', paddingTop:'200px'}}>
        <ClipLoader
          sizeUnit={"px"}
          size={150}
          color={'#123abc'}
        />
          </div>
      )
    }
  }

  renderSplashScreen(){
    if(this.state.StoreValue == '' && this.state.isFetching == false){
      return(<Splash/>)
    }
  }

  renderSideBar = () => {
    if(this.state.StoreValue != '' && window.innerWidth > 700){
      return(
          <SidebarForm returnresult={this.returnSearchFilters} beerChange={this.state.beers.length} isLoading={this.state.isFetching}/>
      )
    }
  }

  renderLogo = () => {
    if(this.state.StoreValue != '' && window.innerWidth > 1279){
      return(
          <ReactSVG src={logo} onMouseEnter={this.handleAnimationHover} />
      )
    } else if(this.state.StoreValue != '' && window.innerWidth < 1279){
      return(
        <div>
          <SidebarFormMobile returnresult={this.returnSearchFilters} beerChange={this.state.beers.length} isLoading={this.state.isFetching}/>
    </div>
      )
    }
  }

  animate = () => {
    var items = document.getElementsByClassName("letter")
    for (var i=0; i < items.length; i++) {
        items[i].classList.add('animated')
    }
  }

  stopAnimation = () => {
    var items = document.getElementsByClassName("letter")
    for (var i=0; i < items.length; i++) {
      items[i].classList.remove('animated')
    }
  }

  handleAnimationHover = () =>{
    if(document.getElementsByClassName("animated").length == 0){
      this.animate()
      setTimeout(() => {this.stopAnimation()}, 3000);
    }
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">

        <div className="menu-wrapper">
          <div className="header-menu">
            <Menu fixed='top' size="massive" style={{color:"F9F9F9"}}>
            {this.renderLogo()}
              <Container style={{marginLeft: "5px"}}>
                <SearchBar items={this.state.searchItems} returnresult={this.returnResult} initvalue={this.state.closestStore}/>
              </Container>
              <About />
            </Menu>
          </div>

          <div className="sidebar">
            {this.renderSideBar()}
          </div>

          </div>
        </header>
        <div className="storeTitle">
        <h1>{this.state.StoreValue}</h1>
        </div>

        <div className="test2">
        <div className="test">
        </div>
        {this.renderItemTable()}
        {this.renderSplashScreen()}
        </div>

      </div>

    );
  }
}

export default App;
