
const cheerio = require('cheerio')

const getWeather = async () => {
    const response = await fetch(`https://weather.com/weather/today/l/14623`)
    const body = await response.text()
    const $ = cheerio.load(body)
    $('.CurrentConditions--tempValue--MHmYY').each((i, el) => {
        const temperature = $(el).text()
        const location = $('.CurrentConditions--location--1YWj_').text()
        const phrase = $('.CurrentConditions--phraseValue--mZC_p').text()
        const hourlyWeather = []
        $('.HourlyWeatherCard--TableWrapper--1OobO .WeatherTable--columns--6JrVO .Column--column--3tAuz .Column--label--2s30x ').each((i, el) => {
            hourlyWeather.push($(el).text())
            $('.HourlyWeatherCard--TableWrapper--1OobO .WeatherTable--columns--6JrVO .Column--column--3tAuz .Column--temp--1sO_J').each((_, child) => {
                if(hourlyWeather[$(el).text()] == undefined) {
                    console.log($(child).text())
                }
            })
        })
        console.log({
            temperature,
            location,
            phrase,
            hourlyWeather
        })
    })
}

getWeather()