import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, Eye, Gauge } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    rainChance: number;
  }>;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 72,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    pressure: 30.15,
    visibility: 10,
    forecast: [
      { day: 'Mon', high: 75, low: 58, condition: 'Sunny', rainChance: 10 },
      { day: 'Tue', high: 73, low: 56, condition: 'Cloudy', rainChance: 30 },
      { day: 'Wed', high: 68, low: 52, condition: 'Rainy', rainChance: 80 },
      { day: 'Thu', high: 70, low: 54, condition: 'Partly Cloudy', rainChance: 20 },
      { day: 'Fri', high: 74, low: 57, condition: 'Sunny', rainChance: 5 },
      { day: 'Sat', high: 76, low: 59, condition: 'Sunny', rainChance: 0 },
      { day: 'Sun', high: 72, low: 55, condition: 'Cloudy', rainChance: 40 }
    ]
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-500" />;
      default: return <Cloud className="w-8 h-8 text-gray-400" />;
    }
  };

  const getIrrigationRecommendation = () => {
    if (weather.forecast[0].rainChance > 60) {
      return { text: 'Heavy rain expected — consider delaying mobile service', color: 'text-blue-600', bg: 'bg-blue-50' };
    } else if (weather.humidity < 40) {
      return { text: 'Low humidity — good conditions for calibration', color: 'text-orange-600', bg: 'bg-orange-50' };
    } else {
      return { text: 'Normal operating conditions', color: 'text-green-600', bg: 'bg-green-50' };
    }
  };

  const recommendation = getIrrigationRecommendation();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Weather & Climate</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-5xl font-bold">{weather.temp}°F</p>
                <p className="text-blue-100 mt-2">{weather.condition}</p>
              </div>
              {getWeatherIcon(weather.condition)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-blue-200" />
                <div>
                  <p className="text-xs text-blue-200">Humidity</p>
                  <p className="font-semibold">{weather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center">
                <Wind className="w-5 h-5 mr-2 text-blue-200" />
                <div>
                  <p className="text-xs text-blue-200">Wind</p>
                  <p className="font-semibold">{weather.windSpeed} mph</p>
                </div>
              </div>
              <div className="flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-blue-200" />
                <div>
                  <p className="text-xs text-blue-200">Pressure</p>
                  <p className="font-semibold">{weather.pressure} in</p>
                </div>
              </div>
              <div className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-200" />
                <div>
                  <p className="text-xs text-blue-200">Visibility</p>
                  <p className="font-semibold">{weather.visibility} mi</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-4 p-4 rounded-lg ${recommendation.bg}`}>
            <p className="text-sm font-medium text-gray-700">Road Conditions Advisory</p>
            <p className={`text-lg font-semibold ${recommendation.color}`}>{recommendation.text}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">7-Day Forecast</h3>
          <div className="space-y-2">
            {weather.forecast.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <p className="font-medium w-12">{day.day}</p>
                  <div className="w-8">{getWeatherIcon(day.condition)}</div>
                  <p className="text-sm text-gray-600">{day.condition}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm">
                    <Droplets className="w-4 h-4 mr-1 text-blue-500" />
                    <span className="text-gray-600">{day.rainChance}%</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{day.high}°</span>
                    <span className="text-gray-500 ml-1">{day.low}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
