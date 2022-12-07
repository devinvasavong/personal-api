require('dotenv').config()
const cheerio = require('cheerio')
const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000

var corsOptions = {
    credentials: true,
    origin: "https://weather.com"
}

app.use(cors(corsOptions))

const getHours = async () => {
    let fetchData = await fetch(`https://www.rit.edu/fa/diningservices/places-to-eat/hours?format=day`)
    let body = await fetchData.text()
    let $ = cheerio.load(body)

    const timeArray = new Object()
    const stores = new Object()
    let day = ""

    $('.view-content .panel-default .panel-body').each((i, el) => {
        if(!day) day = $(el).text().trim().split("        ")[0]
        timeArray[i] = $(el).text().trim().split("        ")[1]
    })

    $('.view-content .hours-title ').each((i, el) => {
        stores[$(el).text().trim()] = timeArray[i]
    })

    return { day, stores }
}

const getWeather = async (code) => {
    const response = await fetch(`https://weather.com/weather/today/l/${code}`)
    const body = await response.text()
    const $ = cheerio.load(body)
    let array = new Object()
    $('.CurrentConditions--tempValue--MHmYY').each((i, el) => {
        const temperature = $(el).text()
        const location = $('.CurrentConditions--location--1YWj_').text()
        const phrase = $('.CurrentConditions--phraseValue--mZC_p').text()
        const hourlyWeather = {}
        $('.HourlyWeatherCard--TableWrapper--1OobO .WeatherTable--columns--6JrVO .Column--column--3tAuz .Column--label--2s30x ').each((i, el) => {
            $('.HourlyWeatherCard--TableWrapper--1OobO .WeatherTable--columns--6JrVO .Column--column--3tAuz .Column--temp--1sO_J').each((iv, child) => {
                if(hourlyWeather[$(el).text()] == undefined) {
                    if(i == iv) {
                        if($(el).text() != 'Now') {
                            hourlyWeather[$(el).text()] = $(child).text()
                        }
                    }
                } // hi
            })
        })
        array['temperature'] = temperature
        array['location'] = location
        array['phrase'] = phrase
        array['hourlyWeather'] = hourlyWeather
    })
    return array
}

app.get('/weather/:postal', async (req, res) => {
    let code = req.params.postal
    if(!code) {
        res.status(400).send('Please provide a postal code')
    } else {
        try {
            let weather = await getWeather(code)
            if(weather) {
                res.status(200).json(weather)
            } else {
                res.status(404).send('No weather found')
            }
        } catch(e) {
            res.status(500).send('Something went wrong')
        }
    }
})

app.get('/rit/restaurants/hours', async (req, res) => {
    let hours = await getHours()
    if(hours) {
        res.status(200).json(hours)
    } else {
        res.status(404).send('No hours found')
    }
})

app.all("*", function(req, res) {
    if(!res.headersSent) {
        res.status(404).sendFile(__dirname + "/files/404.html")
    }
})

app.listen(PORT, "localhost", () => {
    console.log(`🚀 @ ${PORT}`)
})