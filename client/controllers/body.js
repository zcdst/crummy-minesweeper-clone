gameover = 0; // tracks whether the game is over
winner = 0; // tracks whether the game is completed
cleared = 0; // tracks the number of cells that have been cleared
clearcells = []; // array of cell id's that need to be cleared, after clicking an empty cell
gametime = 0; // tracks the time since the first cell is clicked
cheated = 0; // tracks whether the player has cheated at some point during a game
timer = 0; // timer variable
gamepreset = "Easy"; // actual string representing the preset chosen
presetno = 0; // tracks the preset, but with ints this time, for sorting in the collection
topscore = 0; // lowest time for the current preset
stats = 0; // current winner's entry into the database



gameTimer = function() { // track time if eligible
  if (gameover == 1 || winner == 1) {
    clearInterval(timer);
  }
  else {
    gametime += 1;
    if (gametime != 0) {
      Session.set("barpercent", (100 - gametime / Math.floor(topscore) * 100)) // calculate progress bar percentage based on best time for that preset
      Session.set("bartime", parseInt(topscore - gametime))
    }
  }
}

topScore = function() { // get top score, set easy default otherwise
  if (gamepreset != "Custom") {
    try {
      topscore = parseInt(winners.findOne({
        preset: gamepreset
      }, {
        sort: {
          sweeptime: 1
        }
      }).sweeptime)
    }
    catch (err) {
      if (gamepreset == "Easy") {
        topscore = 33
      }
      else if (gamepreset == "Medium") {
        topscore = 127
      }
      else {
        topscore = 217
      }
    }
  }
}

playclick = function() { // play pleasant click sound
  var audio = document.getElementById("clickaudio");
  audio.play();
}

playlose = function() { // play scary "game over" sound
  var audio = document.getElementById("loseaudio");
  audio.play();
}

playwin = function() { // play winner sound
  var audio = document.getElementById("winaudio");
  audio.play();
}

isInt = function(n) { // checks whether a number is an integer. Validates the "custom game" form
  return n != "";
}

removefirst = function() { // removes the slowest time for the easiest difficulty, makes room for new winner
  if (winners.find().count() > 14) {
    var x = winners.findOne({}, {
      sort: {
        presetorder: -1,
        sweeptime: -1
      }
    })._id
    winners.remove({
      _id: x
    })
  }
}


buttonsize = function() { // make buttons a good size based on width of div. The div itself is sized based on user agent's window
  Session.set("buttonsizestatic", Math.floor((document.getElementById("minediv").offsetWidth * 0.8 / Session.get("columns"))) + "px");
}

clearCell = function() { // when an empty cell is clicked, recursively check for and clear other surrounding empty cells
  for (var p = 0; p < buttons.length; p += 1) {
    if (buttons[p].clicked == true && buttons[p].num == 0) {
      if (buttons[p].id != 0 && buttons[p].left == false) { // checks to the left, ignores first cell
        if (buttons[p - 1].num == 0 && buttons[p - 1].clicked == false) {
          clearcells.push(p - 1);
        }
      }
      if (buttons[p].id != Session.get("columns") * (Session.get("rows")) - 1) { // checks to the right, ignores last cell
        if (buttons[p + 1].num == 0 && buttons[p].right == false && buttons[p + 1].clicked == false) {
          clearcells.push(p + 1);
        }
      }
      if (buttons[p].top == false) {
        if (buttons[p - Session.get("columns")].num == 0 && buttons[p - Session.get("columns")].clicked == false) { // checks the one above
          clearcells.push(p - Session.get("columns"));
        }
        if (buttons[p].left == false) {
          if (buttons[p - Session.get("columns") - 1].num == 0 && buttons[p - Session.get("columns") - 1].clicked == false) { // checks the top-left
            clearcells.push(p - Session.get("columns") - 1);
          }
        }
        if (buttons[p].right == false) {
          if (buttons[p - Session.get("columns") + 1].num == 0 && buttons[p - Session.get("columns") + 1].clicked == false) { // checks the top-right
            clearcells.push(p - Session.get("columns") + 1);
          }
        }
      }
      if (buttons[p].bottom == false) {
        if (buttons[p + Session.get("columns")].num == 0 && buttons[p + Session.get("columns")].clicked == false) { // checks the one below
          clearcells.push(p + Session.get("columns"));
        }
        if (buttons[p].left == false) {
          if (buttons[p + Session.get("columns") - 1].num == 0 && buttons[p + Session.get("columns") - 1].clicked == false) { // checks the bottom-left
            clearcells.push(p + Session.get("columns") - 1);
          }
        }
        if (buttons[p].right == false) {
          if (buttons[p + Session.get("columns") + 1].num == 0 && buttons[p + Session.get("columns") + 1].clicked == false) { // checks the bottom-right
            clearcells.push(p + Session.get("columns") + 1);
          }
        }
      }
      if (clearcells.length > 0) {
        for (var t = 0; t < clearcells.length; t += 1) {
          buttons[clearcells[t]].clicked = true;
        }
        Session.set("buttons", buttons);
        clearcells.length = 0;
        clearCell();
      }
    }
  }
  Session.set("buttons", buttons);
}

newGame = function() { // begin new game
  gameover = 0;
  winner = 0
  buttons = [];
  cleared = 0;
  gametime = 0;
  cheated = 0;
  bgset = 0;
  stats = 0;
  topScore();
  clearcells = [];
  bombCells = [];
  Session.set("barpercent", 0);
  Session.set("bartime", 0);
  clearInterval(timer);
  for (var i = 0; i < Session.get("rows") * Session.get("columns"); i = i + 1) { // create array for cells
    buttons[i] = {
      id: i,
      cheat: false,
      bomb: false,
      clicked: false,
      left: false,
      right: false,
      top: false,
      bottom: false,
      flagged: false,
      num: 0,
    };
    if (i < Session.get("columns")) { // identify cells in top row
      buttons[i].top = true;
    }
    if (i != 0 && i != 1 && ((i + 1) % Session.get("columns") == 0)) { // identify right-most cells
      buttons[i].right = true;
    }
    if (i % Session.get("columns") == 0) { // identify left-most cells
      buttons[i].left = true;
    }
    if (i > (Session.get("columns") * (Session.get("rows") - 1)) - 1) { //identify last row cells
      buttons[i].bottom = true;
    }
    Session.set("buttons", buttons); // update display
  }
  bombs = Math.min(Session.get("numbombs"), Math.floor(Session.get("columns") * Session.get("rows") * 0.15)); // bombs do not exceed 15% of cells
  bombCells = []; // get first random cell that will contain a bomb
  while (bombCells.length < bombs) { // generate unique random numbers to decide which cells gets a bomb
    var dupe = 0;
    var r = Math.floor((Math.random() * (Session.get("columns") * Session.get("rows"))));
    for (var k = 0; k < bombCells.length; k += 1) {
      if (bombCells[k] == r)
        dupe = 1; // bad random number, cell is already destined for a bomb
    }
    if (dupe == 0) {
      buttons[r].bomb = true;
      bombCells.push(r);
    }
  }
  for (var z = 0; z < buttons.length; z += 1) { // loop through array, set "number of bombs surrounding this cell" value
    var numBombs = 0;
    if (buttons[z].id != 0 && buttons[z].left == false) { // checks to the left, ignores first cell
      if (buttons[z - 1].bomb) {
        numBombs += 1;
      }
    }
    if (buttons[z].id != Session.get("columns") * (Session.get("rows")) - 1) { // checks to the right, ignores last cell
      if (buttons[z + 1].bomb && buttons[z].right == false) {
        numBombs += 1;
      }
    }
    if (buttons[z].top == false) {
      if (buttons[z - Session.get("columns")].bomb) { // checks the one above
        numBombs += 1;
      }
      if (buttons[z].left == false) {
        if (buttons[z - Session.get("columns") - 1].bomb) { // checks the top-left
          numBombs += 1;
        }
      }
      if (buttons[z].right == false) {
        if (buttons[z - Session.get("columns") + 1].bomb) { // checks the top-right
          numBombs += 1;
        }
      }
    }
    if (buttons[z].bottom == false) {
      if (buttons[z + Session.get("columns")].bomb) { // checks the one below
        numBombs += 1;
      }
      if (buttons[z].left == false) {
        if (buttons[z + Session.get("columns") - 1].bomb) { // checks the bottom-left
          numBombs += 1;
        }
      }
      if (buttons[z].right == false) {
        if (buttons[z + Session.get("columns") + 1].bomb) { // checks the bottom-right
          numBombs += 1;
        }
      }
    }
    if (buttons[z].bomb == false) { // not a bomb, return number
      buttons[z].num = numBombs;
    }
    if (Session.get("currentContent") == "opts") { // only resize grid when a new game is started, rather than reset
      buttonsize();
    }
    Session.set("currentContent", "mines");
    Session.set("buttons", buttons);

  }
}

buttons = []; // array of objects represnting cells with their properties
Session.set("rows", 7); // defaults
Session.set("columns", 12);
Session.set("buttons", buttons);
Session.set("numbombs", 12);
Session.set("currentContent", "opts"); // show main menu on startup
Session.set("bartime", 0);

Template.body.helpers({
  "showopts": function() {
    return Session.get("currentContent") === "opts" ? true : false;
  },
  "showmines": function() {
    return Session.get("currentContent") === "mines" ? true : false;
  },
  "showwinners": function() {
    return Session.get("currentContent") === "winners" ? true : false;
  }
})