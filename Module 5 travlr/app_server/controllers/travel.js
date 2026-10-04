// The MVC controller consumes the REST API; database access lives in app_api.
const travel = async (req, res) => {
  const port = req.app.get('port') || process.env.PORT || '3000';
  const apiBase = process.env.API_BASE_URL || `http://127.0.0.1:${port}`;
  try {
    const response = await fetch(`${apiBase}/api/trips`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`Trip API returned HTTP ${response.status}`);
    const trips = await response.json();
    if (!Array.isArray(trips)) throw new Error('Trip API returned an invalid collection');
    return res.render('travel', {
      title: 'Travlr Getaways', isTravel: true, trips,
      message: trips.length === 0 ? 'No trips are currently available.' : ''
    });
  } catch (error) {
    console.error('Travel API request failed:', error.message);
    return res.status(500).render('travel', {
      title: 'Travlr Getaways', isTravel: true, trips: [],
      message: 'Unable to load trips. Please try again later.'
    });
  }
};

module.exports = { travel };
