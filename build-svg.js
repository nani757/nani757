const WEATHER_API_KEY = process.env.WEATHER_API_KEY

let fs = require('fs')
let got = require('got')
let qty = require('js-quantities')
let formatDistance = require('date-fns/formatDistance')

// AccuWeather API setup
let WEATHER_DOMAIN = 'http://dataservice.accuweather.com'

// Weather emoji mapping
const emojis = {
  1: '☀️',
  2: '☀️',
  3: '🌤',
  4: '🌤',
  5: '🌤',
  6: '🌥',
  7: '☁️',
  8: '☁️',
  11: '🌫',
  12: '🌧',
  13: '🌦',
  14: '🌦',
  15: '⛈',
  16: '⛈',
  17: '🌦',
  18: '🌧',
  19: '🌨',
  20: '🌨',
  21: '🌨',
  22: '❄️',
  23: '❄️',
  24: '🌧',
  25: '🌧',
  26: '🌧',
  29: '🌧',
  30: '🥵',
  31: '🥶',
  32: '💨',
}

// Day bubble widths for animation
const dayBubbleWidths = {
  Monday: 235,
  Tuesday: 235,
  Wednesday: 260,
  Thursday: 245,
  Friday: 220,
  Saturday: 245,
  Sunday: 230,
}

// Get current date information
const today = new Date()
const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today)

async function generateSVG() {
  try {
    // Use a reliable default in case API fails
    let weatherData = {
      temperature: { F: 73, C: 28 },
      icon: 1  // sunny
    }

    try {
      // Hyderabad, India location key for AccuWeather
      const locationKey = "202190" // Hyderabad location key
      let url = `forecasts/v1/daily/1day/${locationKey}?apikey=${WEATHER_API_KEY}`
      
      const response = await got(url, { prefixUrl: WEATHER_DOMAIN })
      const json = JSON.parse(response.body)
      
      const degF = Math.round(json.DailyForecasts[0].Temperature.Maximum.Value)
      const degC = Math.round(qty(`${degF} tempF`).to('tempC').scalar)
      const icon = json.DailyForecasts[0].Day.Icon
      
      weatherData = {
        temperature: { F: degF, C: degC },
        icon: icon
      }
      
      console.log("Weather data retrieved successfully")
    } catch (error) {
      console.error("Error fetching weather:", error.message)
      // Continue with default values if API fails
    }

    // Read the template file
    const templateContent = fs.readFileSync('template.svg', 'utf-8')
    
    // Replace placeholders with actual values
    let svgContent = templateContent
      .replace('{degF}', weatherData.temperature.F)
      .replace('{degC}', weatherData.temperature.C)
      .replace('{weatherEmoji}', emojis[weatherData.icon] || '☀️')
      .replace('{todayDay}', todayDay)
      .replace('{dayBubbleWidth}', dayBubbleWidths[todayDay] || 235)
    
    // Write the final SVG file
    fs.writeFileSync('chat.svg', svgContent)
    console.log('SVG generated successfully!')
    
  } catch (error) {
    console.error('Error generating SVG:', error)
  }
}

// Run the function
generateSVG()