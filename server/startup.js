Meteor.startup(function() {
  if (winners.find().count() === 0) { // incase db is deleted or something
    winners.insert({
      dimensions: "6 x 6",
      namedb: "Michael",
      bombsdb: 3,
      preset: "Easy",
      sweeptime: 132,
      sweeptimehr: "02 min, 12 sec",
      presetorder: 4,
      timestamp: 0
    })
    winners.insert({
      dimensions: "9 x 9",
      namedb: "Mike",
      bombsdb: 8,
      preset: "Medium",
      sweeptime: 241,
      sweeptimehr: "04 min, 01 sec",
      presetorder: 3,
      timestamp: 0
    })
    winners.insert({
      dimensions: "12 x 12",
      namedb: "Mic",
      bombsdb: 20,
      preset: "Difficult",
      sweeptime: 422,
      sweeptimehr: "07 min, 02 sec",
      presetorder: 2,
      timestamp: 0
    })
  }
});
