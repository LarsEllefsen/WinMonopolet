import React from 'react'
import DuckImage from '../assets/Duck.jpg'
import './HomeView.scss'

export const HomeView = () => (
  <div>
    <h4>Whalecum!!</h4>
    <img alt='Fuck all of yall!' className='.duck' src={DuckImage} />
  </div>
)

export default HomeView
