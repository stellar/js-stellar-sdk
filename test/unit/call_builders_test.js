const URI = require("urijs");
const CallBuilder = require('../../lib/call_builder').CallBuilder;

describe('CallBuilder functions', function() {
  
  it('doesn\'t mutate the constructor passed url argument (it clones it instead)', function() {
    let arg = URI('https://onedomain');
    const builder = new CallBuilder(arg);
    builder.url.segment('one_segment');
    builder.checkFilter();
    
    expect(arg.toString()).not.to.be.equal('https://onedomain');
    expect(builder.url.toString()).to.be.equal('https://onedomain/one_segment');
  });
  
});

