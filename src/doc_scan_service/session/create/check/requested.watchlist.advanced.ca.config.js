'use strict';

const Validation = require('../../../../yoti_common/validation');
const RequestedCaSources = require('./requested.ca.sources');
const RequestedCaMatchingStrategy = require('./requested.ca.matching.strategy');
const RequestedTypeListSources = require('./requested.type.list.sources');
const RequestedExactMatchingStrategy = require('./requested.exact.matching.strategy');

/**
 * The base configuration applied when creating a {@link RequestedWatchlistAdvancedCaCheck}
 *
 * @class RequestedWatchlistAdvancedCaConfig
 */
class RequestedWatchlistAdvancedCaConfig {
  /**
   *
   * @param removeDeceased {boolean}
   * @param shareUrl {boolean}
   * @param sources {RequestedCaSources}
   * @param matchingStrategy {RequestedCaMatchingStrategy}
   */
  constructor(removeDeceased = false, shareUrl = false, sources, matchingStrategy) {
    Validation.isBoolean(removeDeceased, 'removeDeceased');
    this.removeDeceased = removeDeceased;

    Validation.isBoolean(removeDeceased, 'shareUrl');
    this.shareUrl = shareUrl;

    if (sources) {
      Validation.instanceOf(sources, RequestedCaSources, 'sources');
      this.sources = sources;
    } else {
      this.sources = new RequestedTypeListSources();
    }

    if (matchingStrategy) {
      Validation.instanceOf(matchingStrategy, RequestedCaMatchingStrategy, 'matchingStrategy');
      this.matchingStrategy = matchingStrategy;
    } else {
      this.matchingStrategy = new RequestedExactMatchingStrategy();
    }
  }
}

module.exports = RequestedWatchlistAdvancedCaConfig;
