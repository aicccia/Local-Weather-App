## Features

- Displays current weather for location
- Displays weather forecast for next 4 days
- Hover over each day to see weather predictions for that day, divided up into 6 hour blocks
- Input a zipcode to see the weather at that location
- Switch between fahrenheit and celsius

The api returning the weather forcast data returns the data in a very inconvenient set of 40 3-hours blocks of time(5 days). 

An intra-day weather forecast of every 6 or 12 hours made more sense to me and I settled on every 6 hours. 

So to create the weather forecast that you see when hovering over each day, I iterate over that api data, find the data corresponding to the relevant timeblock, combine it a meaningful way, find averages, highs, lows, generate a summary based off the predicted cloud coverage and rain fall, and then pick an icon based on the time, rain fall and cloud coverage. 

