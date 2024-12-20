import { Router , type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  const { cityName } = req.body;

  // TODO: GET weather data from city name
  const weatherData = await WeatherService.getWeatherForCity(cityName)
  // TODO: save city to search history
  await HistoryService.addCity(cityName);

  res.json(weatherData);
});

// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {
  const getCities = await HistoryService.getCities();
  res.json(getCities);
});
  
// * BONUS TODO: DELETE city from search history
// router.delete('/history/:id', async (req, res) => {});

export default router;
