import { CallBuilder } from './CallBuilder';

class FriendbotBuilder extends CallBuilder {
  constructor(url, address) {
    super(url);
    this.url.segment('friendbot');
    this.url.addQuery('addr', address);
  }
}

export { FriendbotBuilder };
