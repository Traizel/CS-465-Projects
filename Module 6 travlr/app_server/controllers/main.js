// Render the index page through the Handlebars view engine.
const index = (req, res) => {
  res.render('index', { title: 'Travlr Getaways', isHome: true });
};

module.exports = { index };
