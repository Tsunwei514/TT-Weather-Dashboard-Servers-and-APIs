import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor (city: string, date: string, icon: string, iconDescription: string, tempF: number,  windSpeed: number, humidity: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;
  private cityName?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(
        `${this.baseURL}/weather?q=${query}&appid=${this.apiKey}`
      );
      const data = await response.json();  
      return data;
    } catch (err) {
      console.log('Error:', err);
      return err;
    }
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
   const { lat, lon } = locationData;
   return { lat, lon }; 
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const { baseURL, apiKey, cityName} = this;
    return `${baseURL}/geo/1.0/direct?q=${cityName}&appid=${apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { baseURL, apiKey } = this;
    const { lat, lon } = coordinates;
    return `${baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&apiKey=${apiKey}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const query = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const query = this.buildWeatherQuery(coordinates);
    const response = await fetch(query);
    const text = await response.text();
    const data = JSON.parse(text);
    return data;
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const { name: city, weather, main, wind } = response;
    const { icon, description: iconDescription } = weather[0];
    const date = new Date(response.list[0].dt_txt).toDateString();
    const tempF = (main.temp - 273.15) * 9/5 + 32;
    const windSpeed = wind.speed;
    const humidity = main.humidity;
    
    return {
      city,
      date,
      icon,
      iconDescription,
      tempF,
      windSpeed,
      humidity
    };
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any) {
    let forecastArray: Weather[] = [];
    forecastArray.push(currentWeather);
    let { list } = weatherData;
    // TODO: Filter list for only one entry per day
    list = list.filter((item: any) => {
      return item.dt_txt.includes('12:00:00') && (new Date(item.dt_txt).toDateString() !== new Date().toDateString());
    });
    for (let i = 0; i < list.length; i++) {
      const forecast = new Weather(
        weatherData.city.name, 
        new Date(list[i].dt_txt).toDateString(),
        list[i].weather[0].icon, 
        list[i].weather[0].description,
        list[i].main.temp,
        list[i].wind.speed,
        list[i].main.humidity
      );
      forecastArray.push(forecast);
    }
    return forecastArray;
  }
  //  DONE: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData);
    return forecastArray;
  }
}

export default new WeatherService();
