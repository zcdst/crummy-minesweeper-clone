  Template.winnerstable.helpers({
    "winners": function() { // sort the list of winners by preset (highest to lowest difficulty) and then time
      return winners.find({}, {
        sort: {
          presetorder: 1,
          sweeptime: 1
        }
      });
    },
    "rowhighlight": function() { // highlight winner
      if (this._id == winners.findOne({}, {
          sort: {
            'timestamp': -1
          }
        })._id && stats != 0) {
        return "rgb(119, 158, 203)";
      }
      else {
        return ""
      }
    }
  });

  Template.winnerstable.events({
    'click #backtable': function() { // back to options
      clearInterval(timer);
      Session.set("currentContent", "opts");
    }
  });