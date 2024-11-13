import { Transaction } from "@stellar/stellar-base";

/**
 * Miscellaneous utilities.
 *
 * @hideconstructor
 */
export class Utils {
  /**
   * Verifies if the current date is within the transaction's timebounds
   *
   * @param {Transaction} transaction The transaction whose timebounds will be validated.
   * @param {number} [gracePeriod=0] An additional window of time that should be considered valid on either end of the transaction's time range.
   *
   * @returns {boolean} Returns true if the current time is within the transaction's [minTime, maxTime] range.
   *
   * @static
   */
  static validateTimebounds(
    transaction: Transaction,
    gracePeriod: number = 0,
  ): boolean {
    if (!transaction.timeBounds) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const { minTime, maxTime } = transaction.timeBounds;

    return (
      now >= Number.parseInt(minTime, 10) - gracePeriod &&
      now <= Number.parseInt(maxTime, 10) + gracePeriod
    );
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
