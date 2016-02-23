describe('Browser version tests', function() {
  it("lodash is not exported globally", function () {
    if (typeof window !== "undefined") {
      expect(_).to.be.undefined;
    }
  });
});
