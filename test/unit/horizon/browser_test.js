describe('Browser version tests', function () {
  it('lodash is not exported globally', function () {
    if (typeof window !== 'undefined') {
      expect(typeof _ === 'undefined').to.be.true;
    }
  });

  it('defines globals', function () {
    expect(StellarSdk).to.not.be.undefined;
    expect(SorobanClient).to.not.be.undefined;
  });
});
