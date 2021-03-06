'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const log = require('../../lib/log')

module.exports = class PackagistPhpVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get url() {
    return {
      base: 'packagist/php-v',
    }
  }

  static get examples() {
    return [
      {
        title: 'PHP from Packagist',
        previewUrl: 'symfony/symfony',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/packagist\/php-v\/([^/]+\/[^/]+)(?:\/([^/]+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const userRepo = match[1] // eg, espadrine/sc
        const version = match[2] ? match[2] : 'dev-master'
        const format = match[3]
        const options = {
          method: 'GET',
          uri: `https://packagist.org/p/${userRepo}.json`,
        }
        const badgeData = getBadgeData('php', data)
        request(options, (err, res, buffer) => {
          if (err !== null) {
            log.error(`Packagist error: ${err.stack}`)
            if (res) {
              log.error(`${res}`)
            }
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
            return
          }

          try {
            const data = JSON.parse(buffer)
            badgeData.text[1] = data.packages[userRepo][version].require.php
            badgeData.colorscheme = 'blue'
          } catch (e) {
            badgeData.text[1] = 'invalid'
          }
          sendBadge(format, badgeData)
        })
      })
    )
  }
}
