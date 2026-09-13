// Render the travel page through the Handlebars view engine.
const travel = (req, res) => {
  res.render('travel', { title: 'Travlr Getaways', isTravel: true });
};

module.exports = { travel };
