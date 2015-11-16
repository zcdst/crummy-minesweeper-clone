  Template.loading.onCreated(function() { // loading screen because database is not ready to access record time
    this.subscribe("bartime");
  });