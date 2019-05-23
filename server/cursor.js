"use strict";

// file system module to perform file operations
const fs = require('fs');

class Cursor {
  constructor(){
    try{
      let stored_state = fs.readFileSync('server/cursor.json')
      let stored_pos = JSON.parse(stored_state)
      this._pos = stored_pos["pos"];
    } catch(err) {
      this._pos = 0;
    }

  }

  inc() {
    this._pos++;
  }

  savePos() {
    var state = {"pos": this._pos}
    var state_string = JSON.stringify(state)
    fs.writeFile("server/cursor.json", state_string, 'utf8', function (err) {
      if (err) {
        console.log("An error occured while writing Cursor Object to File.");
      }

      console.log("Cursor state has been saved to file Cursor.json");
    });
  }

  resetPos() {
    this._pos = 0;
  }

}

module.exports = Cursor;
