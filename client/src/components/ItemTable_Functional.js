import React from 'react';
import ItemContainer from "./ItemContainer"
import ReactProgressiveList from "react-progressive-list"
import { css } from 'react-emotion';
import { ClipLoader } from 'react-spinners';



function ItemTable (props){
  var beers = props.beers;

  const override = css`
      text-align: center;
  `;


  const renderRow = (index) => {
    return <ItemContainer item={beers[index]} position={index} />;
  }

  const spinningLoader = () => {
    return(
      <div style={{margin:'auto', width:'10%', paddingTop:'200px'}}>
      <ClipLoader className={override}
        sizeUnit={"px"}
        size={150}
        color={'#123abc'}
      />
        </div>
    );
  }

  const renderList= () => {
    if(beers != null){
      var initialItems = () => {
        if(beers.length < 40){
          return beers.length;
        } else {
          return 40
        }
      }
      return(
        <ReactProgressiveList
        initialAmount={initialItems()}
        progressiveAmount={20}
        renderItem={renderRow}
        renderLoader={() => spinningLoader()}
        rowCount={beers.length}
      />
      )
    } else if(beers == null){
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

    return(
      <div className="ItemTable">
        {renderList()}
      </div>
    )


}

export default ItemTable;
