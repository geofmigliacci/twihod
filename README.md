[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg?style=for-the-badge)](LICENSE.md)

[![Coverage](https://img.shields.io/sonar/coverage/geofmigliacci_twihod?server=https%3A%2F%2Fsonarcloud.io&style=for-the-badge)](https://sonarcloud.io/dashboard?id=geofmigliacci_twihod)

[![Twitter Followers](https://img.shields.io/twitter/follow/geofmigliacci.svg?logo=twitter&style=for-the-badge&label=Follow)](https://twitter.com/geofmigliacci)
[![Github Followers](https://img.shields.io/github/followers/geofmigliacci?logo=github&style=for-the-badge)](https://github.com/geofmigliacci)
[![PayPal](https://img.shields.io/badge/Donate-PayPal-ff3f59.svg?style=for-the-badge)](https://www.paypal.com/paypalme/myerffoeg)

## Twihod

Twihod is a project made to update your profil location accordingly with the number of your followers making a progress bar with emojis.

The idea is a re-write in NestJs from the following [repository](https://github.com/guillaume-rygn/Twitter-header-bot) made by [guillaume-rygn](https://github.com/guillaume-rygn).

## Description

Twihod is a project made with NestJs to update your profil location accordingly with the number of your followers making a progress bar with emojis.

## Installation

Replace the banner with your banner inside ```src/assets/twitter-banner.png``` the banner will be converted to a 1500 x 500 png image. 

To make sure your banner doesn't get distorted use this size or a ratio of 3:2.

Then, install dependencies:

```
npm ci
```

Create a ```.env``` file at the root of the project containing the Twitter's API values. If you're not sure what to put inside your ```.env``` take a look at the ```.env.example``` file.

## Gotcha

Don't forget that your Twitter application should have the right to read & write.