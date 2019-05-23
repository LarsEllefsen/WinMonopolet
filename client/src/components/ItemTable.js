import React, { Component } from 'react';
import ItemContainer from "./ItemContainer"
import ReactProgressiveList from "react-progressive-list"
import { css } from 'react-emotion';
import { ClipLoader, ClimbingBoxLoader } from 'react-spinners';

const override = css`
    text-align: center;
`;

const testJson = {
  "style": ["Barley Wine", "Porters & Stout"],
  "news_only": 1,
}

var test = JSON.stringify(testJson)

class ItemTable extends Component{
  constructor(props){
    super(props);
    this.state = {
      beers: null,
      store: '',
      activeItems: [],
      hasMoreItems: true,
      currentIndex: 0,
      isLoading: false,
    }
  }

  componentDidMount() {
    this.getBeers();
  }

  createElements(objects){
    var array = [];
    var index = this.state.currentIndex;
    for(var i = index; i<(index+20); i++){
      console.log("jeg kalles?")
      array.push(<ItemContainer item={objects[i]} position={i}/>);
    }
    var new_index = index + 20
    this.setState({currentIndex: new_index})
    return array;
  }

  getBeers() {
    var filters = {
      "style": this.props.searchFilters.beer_styles,
      "price": this.props.searchFilters.price,
      "abv": this.props.searchFilters.abv,
      "new_only": this.props.searchFilters.new_only
    }
    fetch('http://localhost:3001/getFromStore/'+this.props.store+"/"+JSON.stringify(filters)).then((res) => {
      if(res.status != 200){
        console.log("Problem fetching!")
      } else {
        res.text().then((data) => {
          var beer = JSON.parse(data)
          this.setState({beers: beer})
        })
      }
    })
  }

  componentDidUpdate(prevProps){
    // if(prevProps.store != this.props.store && this.state.isLoading == false){
    //   this.getBeers()
    // }
    console.log(prevProps)
    if(prevProps != this.props && this.state.isLoading == false){
      this.getBeers();
    }
  }

  renderRow = index => {
    console.log("!!!!!")
    return <ItemContainer item={this.state.beers[index]} position={index} />;
  }

  spinningLoader = () => {
    return(
      <div style={{margin:'auto', width:'10%'}}>
      <ClipLoader className={override}
        sizeUnit={"px"}
        size={150}
        color={'#123abc'}
      />
        </div>
    );
  }



  renderList(){
    if(this.state.beers != null){
      var initialItems = () => {
        if(this.state.beers.length < 40){
          return this.state.beers.length;
        } else {
          return 40
        }
      }
      return(
        <ReactProgressiveList
        initialAmount={initialItems()}
        progressiveAmount={20}
        renderItem={this.renderRow}
        renderLoader={() => this.spinningLoader()}
        rowCount={this.state.beers.length}
      />
      )
    } else if(this.state.beers == null || this.state.isLoading == true){
      return(
        <div style={{margin:'auto', width:'10%', paddingTop:'200px'}}>
        <ClipLoader className={override}
          sizeUnit={"px"}
          size={150}
          color={'#123abc'}
        />
          </div>
      )
    }
  }


  render(){
    return(
      <div className="ItemTable">

      {this.renderList()}
      </div>
    )
  }

}

export default ItemTable;
