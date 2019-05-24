import { CallBuilder } from './call_builder';

export class FriendbotBuilder extends CallBuilder<any> {
  constructor(serverUrl: uri.URI, address: string) {
    super(serverUrl);
    this.url.segment('friendbot');
    this.url.setQuery('addr', address);
  }
}
