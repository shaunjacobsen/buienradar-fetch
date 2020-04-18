const express = require('express');
const axios = require('axios');

const app = express();
const router = express.Router();

app.use(express.json());

const BUIENRADAR_URL = 'https://data.buienradar.nl/2.0/feed/json';

async function fetchResults() {
  const { data } = await axios.get(BUIENRADAR_URL);
  const actual = data.actual;
  const stations = actual.stationmeasurements;
  return { data, actual, stations };
}

router.get('/stations', async (req, res) => {
  try {
    const { stations } = await fetchResults();
    const filtered = stations.map((station) => {
      return {
        stationId: station.stationid,
        name: station.stationname,
        regio: station.regio,
      };
    });
    res.json(filtered);
  } catch (e) {
    res.status(400).json(e);
  }
});

router.get('/:stationId', async (req, res) => {
  const stationId = Number(req.params.stationId);
  try {
    const { stations } = await fetchResults();
    const desiredStation = stations.find(
      (station) => station.stationid === stationId,
    );
    if (desiredStation) {
      res.json(desiredStation);
    } else {
      res.json({ error: 'Cannot locate that station ID.' });
    }
  } catch (e) {
    res.status(400).json(e);
  }
});

app.use('/', router);

const port = process.env.PORT || 4000;

app.listen(port, function () {
  console.log(`Up on ${port}`);
});
