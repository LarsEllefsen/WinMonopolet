import React from 'react';
import snirkel from '../images/snirkel.svg'
import logo from '../images/wmp_splash_title.svg';
import ReactSVG from 'react-svg'
import dashes from '../images/dashes.svg'

function Splash(){

  return(

    <div className="splash">
      <ReactSVG src={logo} svgStyle={{ height: 200 }} svgClassName="splash-title"/>
      <div className="splash-text-container">
        <p className="splash-info-text">WinMonopolet rangerer alle ølene på ditt foretrukne Vinmonopol basert på scores fra Untappd.<br/><br/>
        Slik blir det enklere for deg å finne den beste ølen og skjulte perler! Skriv inn navnet på din foretrukne butikk øverst, og filtrer etter dine ønsker!
      <br/><br/> Merk at siden er fortsatt i tidlig utvikling, så noen feil kan forekomme. Siden er på ingen måte affiliert med Vinmonopolet.
        </p>
      </div>
      <div className="snirkel-container">
        <ReactSVG src={snirkel} svgStyle={{ width: 200, heigth: 600 }} className="snirkel" svgClassName="snirkel"/>
      </div>

    </div>

  )
}

export default Splash;
