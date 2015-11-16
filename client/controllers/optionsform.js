  Template.optionsform.events({ // populate new array, decide where bombs are
    'click #newgame': function(event, template) {
      if (isInt(document.getElementById('inputrows').value) && isInt(document.getElementById('inputcolumns').value) && isInt(document.getElementById('inputbombs').value)) { // make sure form contains numbers
        Session.set("rows", Math.min(Math.max(document.getElementById('inputrows').value, 5), 12)) // apply limits on dimensions/bombs as necessary
        Session.set("columns", Math.min(Math.max(document.getElementById('inputcolumns').value, 5), 12))
        Session.set("numbombs", Math.max(parseInt(document.getElementById('inputbombs').value), 3))
        gamepreset = "Custom"
        newGame();
      }
    },
    'click #towinners': function() { // show winners table
      Session.set("currentContent", "winners");
    },
    'click #help': function() { // intro/instructions
      alert("- This is a Mine Sweeper clone \n- Left-click to reveal contents of a cell \n- Right-click a cell to flag it \n- Clear the minefield as quickly as possible to get your name on the leader board! \n- Enabling cheats during a game will disqualify your time for that game \n- Custom games are not timed \n- Enjoy!\n");
    },
    'click #easy': function(event, template) { // presets!
      Session.set("rows", 6);
      Session.set("columns", 6);
      Session.set("numbombs", 3);
      gamepreset = "Easy";
      newGame();
    },
    'click #medium': function(event, template) {
      Session.set("rows", 9);
      Session.set("columns", 9);
      Session.set("numbombs", 8);
      gamepreset = "Medium";
      newGame();
    },
    'click #difficult': function(event, template) {
      Session.set("rows", 12);
      Session.set("columns", 12);
      Session.set("numbombs", 20);
      gamepreset = "Difficult";
      newGame();
    }

  });