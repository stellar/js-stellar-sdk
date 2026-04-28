import BigNumber from "./bignumber.js";

const MAX_INT = ((1 << 31) >>> 0) - 1;
const MAX_INT_BN = new BigNumber(MAX_INT);

/**
 * Calculates and returns the best rational approximation of the given real
 * number as `[n, d]` where `n` is the numerator and `d` is the denominator.
 *
 * @param rawNumber - real number to approximate
 * @throws when the best rational approximation cannot be found
 */
export function best_r(
  rawNumber: BigNumber | number | string,
): [number, number] {
  let number = new BigNumber(rawNumber);
  let a;
  let f;
  const fractions: [BigNumber, BigNumber][] = [
    [new BigNumber(0), new BigNumber(1)],
    [new BigNumber(1), new BigNumber(0)],
  ];
  let i = 2;

  while (true) {
    if (number.gt(MAX_INT)) {
      break;
    }
    a = number.integerValue(BigNumber.ROUND_FLOOR);
    f = number.minus(a);
    const prev1 = fractions[i - 1];
    const prev2 = fractions[i - 2];
    if (!prev1 || !prev2) {
      throw new Error(
        `Continued fraction approximation failed: missing fraction elements at indices ${i - 1} and/or ${i - 2}`,
      );
    }
    const h = a.times(prev1[0]).plus(prev2[0]);
    const k = a.times(prev1[1]).plus(prev2[1]);
    if (h.gt(MAX_INT) || k.gt(MAX_INT)) {
      break;
    }
    fractions.push([h, k]);
    if (f.eq(0)) {
      break;
    }
    number = new BigNumber(1).div(f);
    i += 1;
  }
  const lastFraction = fractions[fractions.length - 1];
  if (!lastFraction) {
    throw new Error(
      "Missing last fraction element in continued fraction approximation",
    );
  }
  const [n, d] = lastFraction;

  if (n.isZero() || d.isZero()) {
    // Standard convergents produced a degenerate fraction (e.g. for values
    // where 1/value > MAX_INT). Recover by computing a semi-convergent: find
    // the largest coefficient that keeps both n and d within int32 bounds.
    // Skip recovery for genuinely zero input — there is no valid approximation.
    const input = new BigNumber(rawNumber);

    if (input.isZero()) {
      throw new Error("Couldn't find approximation");
    }

    const prev1 = fractions[fractions.length - 1];
    const prev2 = fractions[fractions.length - 2];

    if (prev1 && prev2) {
      let aMax = MAX_INT_BN;

      if (prev1[0].gt(0)) {
        aMax = BigNumber.min(
          aMax,
          MAX_INT_BN.minus(prev2[0])
            .div(prev1[0])
            .integerValue(BigNumber.ROUND_FLOOR),
        );
      }

      if (prev1[1].gt(0)) {
        aMax = BigNumber.min(
          aMax,
          MAX_INT_BN.minus(prev2[1])
            .div(prev1[1])
            .integerValue(BigNumber.ROUND_FLOOR),
        );
      }

      if (aMax.gte(1)) {
        const hn = aMax.times(prev1[0]).plus(prev2[0]);
        const kn = aMax.times(prev1[1]).plus(prev2[1]);

        if (!hn.isZero() && !kn.isZero()) {
          return [hn.toNumber(), kn.toNumber()];
        }
      }
    }

    throw new Error("Couldn't find approximation");
  }

  return [n.toNumber(), d.toNumber()];
}
