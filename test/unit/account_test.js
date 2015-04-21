describe('Account.random', function() {

  it("creates an account correctly", function() {
    let account = StellarLib.Account.random();
    expect(account).to.be.instanceof(StellarLib.Account);
  });
});

describe('Account.fromSeed', function() {

  it("creates an account correctly", function() {
    let account = StellarLib.Account.fromSeed("s9aaUNPaT9t1x7vCeDzQYvLZDm5XxSUKkwnqQowV6D3kMr678uZ");
    expect(account).to.be.instanceof(StellarLib.Account);
  });

  it("throws an error if the arg isn't base58check encoded as a seed", function() {

    expect(() => StellarLib.Account.fromSeed("hel0")).to.throw()
    expect(() => StellarLib.Account.fromSeed("masterpassphrasemasterpassphrase")).to.throw()
    expect(() => StellarLib.Account.fromSeed("gsYRSEQhTffqA9opPepAENCr2WG6z5iBHHubxxbRzWaHf8FBWcu")).to.throw()

  });
});

describe('Account.fromAddress', function() {

  it("creates an account correctly", function() {
    let account = StellarLib.Account.fromAddress("gM4gu1GLe3vm8LKFfRJcmTt1eaEuQEbo61a8BVkGcou78m21K7");
    expect(account).to.be.instanceof(StellarLib.Account);
  });

  it("throws an error if the arg isn't base58check encoded as a accountid", function() {

    expect(() => StellarLib.Keypair.fromAddress("hel0")).to.throw()
    expect(() => StellarLib.Keypair.fromAddress("masterpassphrasemasterpassphrase")).to.throw()
    expect(() => StellarLib.Keypair.fromAddress("sfyjodTxbwLtRToZvi6yQ1KnpZriwTJ7n6nrASFR6goRviCU3Ff")).to.throw()

  });
});

describe('Account.master', function() {

  it("creates an account correctly", function() {
    let account = StellarLib.Account.fromMaster();
    expect(account).to.be.instanceof(StellarLib.Account);
  });
});
