import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {  Search } from 'semantic-ui-react'
import _ from 'lodash'
import {levenshteinDistance} from "../utilities.js"

class SearchBar extends Component{

  state = {
    stores: [],
    results: [],
    isLoading: false,
    value: '',
    searchItems: null,
  }


  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })

  handleResultSelect = (e, { result }) => {
    this.setState({ value: result.title });
    this.props.returnresult(result.title)
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })
    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent()

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      const isMatch = result => re.test(result.title)

      var filtered = _.filter(this.state.searchItems, isMatch)
      var sorted = filtered.sort(function(a,b){
        return levenshteinDistance(a.title , value) - levenshteinDistance(b.title, value)
      })



      this.setState({
        isLoading: false,
        // results: _.filter(this.state.searchItems, isMatch),
        results: sorted,
      })
    }, 300)
  }

  componentDidUpdate(){
    if(this.props.items != null && this.state.searchItems == null){
      this.setState({searchItems: this.props.items});
    }
  }



  render(){
    const { isLoading, value, results } = this.state
    return(
      <Search
            placeholder={"Search for your prefered Vimonopol.."}
            input={{ fluid: true}}
            loading={isLoading}
            onResultSelect={this.handleResultSelect}
            onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
            results={results}
            value={value}
            {...this.props}
          />


        )
  }
}

SearchBar.propTypes = {
  returnresult: PropTypes.func
}

export default SearchBar;
