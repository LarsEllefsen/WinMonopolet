const fs = require('fs');

const server_log_path = "server/logs/server_log.txt"
const info_log_path = "server/logs/info_log.txt"

function currentTime(){
  var current_time = new Date()
   var day = current_time.getDate()
   var month = String(current_time.getMonth() + 1).padStart(2, '0'); //January is 0!
   var year = current_time.getFullYear()

   var hour = current_time.getHours()
   var minutes = current_time.getMinutes()
   var seconds = current_time.getSeconds()

   var date = day.toString() +"."+ month +"."+ year.toString() + " - " + hour.toString() + ":" + minutes.toString() + "." + seconds.toString()
   return date

}

module.exports = {
  log: function (message){
    stamped_message = currentTime() + "  " + message + '\r\n'
    fs.appendFile(server_log_path, stamped_message, function(err) {
      if(err) {
        console.log(err);
      }
    });
  },

  info: function(message){
    stamped_message = currentTime() + "  " + message + '\r\n'
    fs.appendFile(info_log_path, stamped_message, function(err) {
      if(err) {
        console.log(err);
      }
    });
  },

  getInfoLogs: function(){
    if (fs.existsSync(info_log_path)) {
      //file exists
      log = fs.readFileSync(info_log_path)
      return log
    } else {
      return null;
    }
  },

  time_now: function(){
    return currentTime();
  },

  flush_log: function(){
    fs.unlink(info_log_path, function (err) {
      if (err) throw err;
      });
  }



}
