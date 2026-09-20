const fs = require('fs');
const path = require('path');

// Load the local prototype data once at startup, as in the Module Three guide.
// Resolve from this file so the data path does not depend on the working directory.
const trips = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../../data/trips.json'), 'utf8'
));

// Pass the trip collection to the Handlebars view through the MVC controller.
const travel = (req, res) => {
  res.render('travel', { title: 'Travlr Getaways', isTravel: true, trips });
};

module.exports = { travel };
