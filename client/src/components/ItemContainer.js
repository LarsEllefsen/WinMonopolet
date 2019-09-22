import React from 'react';
import { Icon, Image, Label, Grid} from 'semantic-ui-react'
import StarRatings from 'react-star-ratings';
import ReportError from './ReportError'
import default_label from '../images/default_label2.png'

function ItemContainer(props){
  const beer = props.item
  var position = props.position + 1
  var test = false; //Disables fetching of images during testing of logic


  const beer_data = JSON.parse(beer.data)

  const untappd_url = 'https://untappd.com/b/'+beer_data.untappd_url
  const vmp_url = beer_data.vmp_url
  const brewery = () => {
    if(beer.brewery != null){
      return beer.brewery.toUpperCase()
    } else {
      return "--Missing--"
    }
  }
  const beer_image = () => {
    if(beer_data.picture_url == "https://untappd.akamaized.net/site/assets/images/temp/badge-beer-default.png" || test == true || beer_data.picture_url == ""){
      return default_label
    } else {
      return beer_data.picture_url
    }
  }

  const isNew = () => {
    if(beer.new == 1){
      return(
        <div className="nyhet"><p className="nyhet_text">Nyhet!</p></div>
      )
    }
  }

  const starRating = () => {
    if(beer.untapped_score != null){
      return Math.round(beer.untapped_score * 100) / 100
      //return beer.untapped_score;
    } else {
      return 0
    }
  }

  const units = () => {
    return (beer.abv*beer_data.container_size);
  }

  const pricePerUnit = () => {
      var u = units();
      return beer.price/u;
  }


  if(window.innerWidth >= 700) {
  return(

      <div className="ItemContainerWrapper">
      <Grid>
        <Grid.Row>
          {/*<Label color='red' corner="left" size="medium">
            <p className="ranking">{"#"+position}</p>
          </Label>*/}
          <Grid.Column width={3} className="beer_grid">
            <div className="ranking_box"><p className="ranking">{position}.</p></div><a href={vmp_url} target="_blank" rel="noopener noreferrer"><Image src={beer_image()} size="small" /></a>
            {isNew()}
          </Grid.Column>
          <Grid.Column width={9}>
            <Grid.Row ><a href={vmp_url} target="_blank" rel="noopener noreferrer"><b className="beer_name">{beer.vmp_name.toUpperCase()}</b></a></Grid.Row>
                  {/*<Divider className="ItemContainerDivider"/>*/}
            <Grid.Row><h3 className="brewery_name">{brewery()}</h3></Grid.Row>
            <Grid.Row> <b className="beer_style">{beer_data.sub_category.toUpperCase()}</b></Grid.Row>
            <Grid.Row >
              <Grid.Column><h4 className="beer_details">
                <span>Pris: {beer.price}kr</span>
                <span>Styrke: {beer.abv}%</span> 
                <span>Størrelse: {beer_data.container_size}cl</span>
                  <br/>
                <span>Pris per alkoholenhet: {pricePerUnit().toFixed(1)} kr</span>
                <span>På lager: {beer.stockLevel}</span></h4></Grid.Column>
            </Grid.Row>
          </Grid.Column>
          <Grid.Column width={4}>
            <Grid.Row><StarRatings rating={starRating()} numberOfStars={5} starDimension="20px" starRatedColor="#3e47e8"/></Grid.Row>
            <Grid.Row><p className="untapped_rating">Rating: {starRating()}</p></Grid.Row>
            <Grid.Row className="beer_details">

            <Label as='a' href={untappd_url} rel="noopener noreferrer" target="_blank">
              <Icon className='untappd' /> Untappd
            </Label>

            <ReportError name={beer.vmp_name} id={beer.vmp_id}/>

            </Grid.Row>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      </div>
    );
  } else {
    return(
          <div className="mobile-item-container">
          <div className="mobile-beer-image">
            <div className="ranking_box_mobile"><p className="ranking_mobile">{position}.</p></div>
            <a href={vmp_url} target="_blank" rel="noopener noreferrer"><Image src={beer_image()} size="tiny" /></a>
            {isNew()}
          </div>
          <div className="mobile-beer-info">
            <b className="beer_name_mobile">{beer.vmp_name.toUpperCase()}</b>
            <p className="brewery-name-mobile">{brewery()}</p>
            <p className="beer-style-mobile">{beer_data.sub_category.toUpperCase()}</p>
            <p className="beer-details-mobile">
              <span>{beer.price}kr</span><Icon className="circle" size="mini"/><span>{beer.abv}%</span><Icon className="circle" size="mini"/><span>{beer_data.container_size}cl</span><br/>
              <span><Icon className="dolly"/>{beer.stockLevel}</span><span><Icon className="star"/>{starRating()}</span>
            </p>

          </div>

          <div className="report_button_mobile">
            <Label as='a' href={untappd_url} rel="noopener noreferrer" target="_blank">
              <Icon className='untappd' id="funk"/>
            </Label>
            <ReportError name={beer.vmp_name} id={beer.vmp_id}/>
          </div>

          </div>
        )
      }
    }

export default ItemContainer;
