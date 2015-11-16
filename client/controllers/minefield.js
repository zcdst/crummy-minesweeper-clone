  Template.minefield.helpers({
    buttoncolour: function() { // return "contents" of a cell. ie empty, bomb, number of surrounding bombs, cheats
      if (buttons[this.id].clicked) {
        if (buttons[this.id].bomb == true && winner == 1) {
          return "url('minesuccess.png')"
        }
        else if (buttons[this.id].bomb == true) {
          return "url('mine.png')" // contains bomb, make it red
        }
        else if (buttons[this.id].num == false) { // empty, make it grey
          return "url('dark.png')";
        }
        else {
          return "url('cellnum.png')"; // surrounded by bomb(s), make it orange
        }
      }
      else if (buttons[this.id].flagged == true) { // flag glyphicon if cell is marked as flagged
        return "url('flag.png')";
      }
      else { // not clicked yet, default texture
        return "url('cell.png')";
      }
      Session.set("buttons", buttons);
    },
    "buttonsizestatic": function() { // exists to stop cells from resizing unless new dimensions are specified
      return Session.get("buttonsizestatic");
    },
    numbuttons: function() {
      return Session.get("rows") * Session.get("columns");
    },
    buttons: function() {
      return Session.get("buttons");
    },
    newrow: function() { // decides the line break for cell rows
      if ((this.id + 1) % Session.get("columns") == 0) {
        return true;
      }
      else {
        return false;
      }
    },
    surrounds: function() { // returns the number of surrounding bombs where applicable. Returns "B" for cheat mode
      if (buttons[this.id].clicked && buttons[this.id].num > 0 && buttons[this.id].cheat == false) {
        return buttons[this.id].num;
      }
      else if (buttons[this.id].cheat && buttons[this.id].bomb && winner == 0) {
        return "B";
      }
      else {
        return "";
      }
      Session.set("buttons", buttons);
    },
    "barprogress": function() { // tracks progress bar
      return Math.max(parseInt(Session.get("barpercent")), 0);
    },
    "bartimehr": function() { // tracks progress bar
      if (parseInt(Session.get("bartime")) < 1 && cleared == 0) {
        return "BEAT THE RECORD!"
      }
      else {
        x = Math.max(parseInt(Session.get("bartime")), 0);
        return (("0" + Math.floor(x / 60)).substr(-2, 2) + " min, " + ("0" + (x % 60)).substr(-2, 2) + " sec") + " Remaining"; // human-readable format for progress bar
      }
    },
    "ispreset": function() { // shows progress bar when appropriate
      if (gamepreset != "Custom") {
        return true
      }
      else {
        return false;
      }
    }
  });

  Template.minefield.events({
    'click .cell': function(event, template) { // cell is clicked, begin timer and reveal contents
      if (cleared == 0 && cheated == 0) {
        timer = setInterval(function() {
          gameTimer()
        }, 1000);
      }

      if (buttons[this.id].cheat == false && buttons[this.id].clicked == false) {
        buttons[this.id].clicked = true;
        if (buttons[this.id].num == 0) {
          clearCell();
        }
      }
      if (buttons[this.id].bomb && buttons[this.id].cheat == false) { // bomb clicked, game over, reveal all cells
        if (gameover == 0) {
          playlose();
          gameover = 1;
          for (var w = 0; w < buttons.length; w += 1) {
            buttons[w].clicked = true;
          }
          clearInterval(timer);
          Session.set("buttons", buttons);
          alert("Game Over!");
          stats = 0;
        }

      }
      cleared = 0;
      for (var y = 0; y < buttons.length; y += 1) { // check if we've cleared the number of cells needed to win
        if (buttons[y].clicked == true) {
          cleared += 1;
        }
      }
      if (winner == 0 && gameover == 0 && cleared + bombs == buttons.length) { // winner
        gameover = 1;
        winner = 1
        playwin();
        for (var w = 0; w < buttons.length; w += 1) {
          buttons[w].clicked = true;
        }
        clearInterval(timer);
        if (gamepreset == "Custom") { // not eligible for leaderboard proper
          gametime = "N/A";
        }
        else if (cheated == 1) { // no cheaters!
          gametime = "Cheater!"
        }
        if (gametime < 2 || gametime > 3600) { // block invalid times
          gametime = "N/A"
        }
        Session.set("buttons", buttons);
        if (gamepreset == "N/A" || gamepreset == "Custom") { // annoying, but necessary for proper table sorting and selection for deletion
          presetno = 5
        }
        else if (gamepreset == "Easy") {
          presetno = 4
        }
        else if (gamepreset == "Medium") {
          presetno = 3
        }
        else if (gamepreset == "Difficult") {
          presetno = 2
        }
        var username = prompt('Minefield sweeped! Please enter your name:');
        if (username == null || username == "") { //incase no name entered
          username = "Anonymous";
        }
        removefirst(); // name limit exceeded, delete oldest one
        stats = {
            dimensions: Session.get('columns') + " x " + Session.get('rows'),
            namedb: username,
            bombsdb: bombs,
            preset: gamepreset,
            sweeptime: gametime,
            sweeptimehr: (("0" + Math.floor(gametime / 60)).substr(-2, 2) + " min, " + ("0" + (gametime % 60)).substr(-2, 2) + " sec"), // time to human-readable format
            presetorder: presetno,
            timestamp: (new Date()).getTime()
          } // new winner
        winners.insert(stats);
        Session.set("currentContent", "winners");
      }

      Session.set("buttons", buttons);
      playclick();
    },
    'mousedown .cell': function(e) { // return flag glyphicon on right-click
      if (e.button == 2) {
        if (buttons[this.id].clicked == false && gameover == 0) {
          if (buttons[this.id].flagged == false) {
            buttons[this.id].flagged = true;
          }
          else {
            buttons[this.id].flagged = false
          }
        }
        Session.set("buttons", buttons);
      }
    },
    'contextmenu .cell': function(e) { // disable pesky right-click menu on cells
      return false;
    },
    'contextmenu #minefielddiv': function(e) { // disable pesky right-click menu in div containing cells
      return false;
    },
    'click #resetgame': function() { // new game, same parameters
      newGame();
    },
    'click #back': function() { // go back to options
      clearInterval(timer);
      Session.set("currentContent", "opts");
    },
    'click #cheat': function(event, template) { // toggle cheats if game is still running
      cheated = 1;
      clearInterval(timer);
      if (gameover == 0) {
        for (var x = 0; x < buttons.length; x += 1) {
          if (buttons[x].cheat == false && buttons[x].bomb == true) {
            buttons[x].cheat = true;
          }
          else {
            buttons[x].cheat = false;
          }
        }
        Session.set("buttons", buttons);
      }
    },
  });