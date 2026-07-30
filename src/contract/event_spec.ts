import {
  ScSpecEntry,
  ScSpecEntryEventV0,
  ScSpecEventDataFormat,
  ScSpecEventParamLocationV0,
  ScSpecEventParamV0,
  ScSpecEventV0,
  ScVal,
} from "../xdr/index.js";
import type { Spec } from "./spec.js";

/**
 * The result of successfully matching an emitted contract event against one
 * of the event specs ({@link ScSpecEventV0}) defined in a {@link Spec}.
 *
 * @see Spec.parseEvent
 */
export interface ParsedEvent {
  /** The name of the matched event (the event spec's declared name). */
  name: string;
  /**
   * All decoded event params, keyed by param name — both the
   * `topicList`-located params and the data-located ones. Once an event is
   * parsed, where a param was carried (topic vs data) no longer matters;
   * the topic list is just a way to mark which fields are indexed.
   */
  data: Record<string, any>;
}

/**
 * Gets all the SEP-48 event spec entries (`scSpecEntryEventV0`) out of a
 * contract's spec entries.
 *
 * @param entries - the contract's XDR spec entries
 * @returns all event entries
 * @hidden
 */
export function events(entries: ScSpecEntry[]): ScSpecEventV0[] {
  return entries
    .filter(
      (entry): entry is ScSpecEntryEventV0 =>
        entry.type === "scSpecEntryEventV0",
    )
    .map((entry) => entry.value);
}

/**
 * Finds the event spec with the given name among a contract's event entries.
 * A contract may declare several events with the same name (e.g. composed
 * modules each emitting their own `transfer`); `occurrence` selects among
 * them, in declaration order.
 *
 * @param entries - the contract's XDR spec entries
 * @param name - the name of the event to find
 * @param occurrence - 0-based index among the events with that name
 * @returns the event spec, or `undefined` if the contract declares no event
 *          with that name (at that occurrence)
 * @throws if `occurrence` is not a non-negative integer
 * @hidden
 */
export function findEvent(
  entries: ScSpecEntry[],
  name: string,
  occurrence: number = 0,
): ScSpecEventV0 | undefined {
  if (!Number.isInteger(occurrence) || occurrence < 0) {
    throw new Error(
      `invalid occurrence for event ${name}: ${occurrence} (expected a non-negative integer)`,
    );
  }
  return events(entries).filter((e) => e.name.toString() === name)[occurrence];
}

/**
 * Returns the topic-list-located params of an event, in declaration order.
 * @hidden
 */
function topicListParams(event: ScSpecEventV0): ScSpecEventParamV0[] {
  return event.params.filter(
    (p) =>
      p.location.value ===
      ScSpecEventParamLocationV0.scSpecEventParamLocationTopicList.value,
  );
}

/**
 * Returns the data-located params of an event, in declaration order.
 * @hidden
 */
function dataParams(event: ScSpecEventV0): ScSpecEventParamV0[] {
  return event.params.filter(
    (p) =>
      p.location.value ===
      ScSpecEventParamLocationV0.scSpecEventParamLocationData.value,
  );
}

/**
 * Reads the text of a prefix topic ScVal. Prefix topics are declared as
 * symbols, but SEP-48 says parsers should also tolerate contracts that emit
 * them as strings, so we accept both `scvSymbol` and `scvString`.
 * @hidden
 */
function prefixTopicText(topic: ScVal): string | undefined {
  switch (topic.type) {
    case "scvSymbol":
    case "scvString":
      return topic.value.toString();
    default:
      return undefined;
  }
}

/**
 * Checks whether the given topics ScVals match an event's prefix topics +
 * topic-list params (matching against the prefix text and a minimum topic
 * count, not the topic-list values).
 *
 * The topic count must be at least `prefixTopics + topicListParams`, not an
 * exact match: some contracts emit trailing topics that the spec deliberately
 * leaves undeclared — e.g. SAC events carry a trailing SEP-11 asset topic.
 * @hidden
 */
function matchesTopics(
  event: ScSpecEventV0,
  topics: ScVal[],
): ScSpecEventParamV0[] | undefined {
  const prefixTopics = event.prefixTopics;
  const tlParams = topicListParams(event);
  if (topics.length < prefixTopics.length + tlParams.length) {
    return undefined;
  }
  for (let i = 0; i < prefixTopics.length; i++) {
    if (prefixTopicText(topics[i]) !== prefixTopics[i].toString()) {
      return undefined;
    }
  }
  return tlParams;
}

/**
 * Attempts to parse an emitted contract event (topics + data ScVals) against
 * the event specs (SEP-48) contained in a {@link Spec}.
 *
 * @param spec - the Spec instance to decode values with (for `scValToNative`)
 * @param entries - the contract's XDR spec entries
 * @param topics - the event's topics, as `ScVal[]` or base64 XDR strings
 * @param data - the event's data, as an `ScVal` or a base64 XDR string
 * @returns the parsed event, or `undefined` if no event spec matches
 *
 * Matching compares only the prefix topics and a minimum topic count, so if
 * two event specs share both (in particular, events with no prefix topics
 * match on arity alone), the first declared spec whose values decode
 * successfully wins.
 * @hidden
 */
export function parseEvent(
  spec: Spec,
  entries: ScSpecEntry[],
  topics: ScVal[] | string[],
  data: ScVal | string,
): ParsedEvent | undefined {
  let topicVals: ScVal[];
  let dataVal: ScVal;
  try {
    topicVals = topics.map((t) =>
      typeof t === "string" ? ScVal.fromXdr(t, "base64") : t,
    );
    dataVal = typeof data === "string" ? ScVal.fromXdr(data, "base64") : data;
  } catch {
    return undefined;
  }

  const specEvents = events(entries);
  for (const event of specEvents) {
    const tlParams = matchesTopics(event, topicVals);
    if (!tlParams) {
      continue;
    }

    // Topic matching is fuzzy (prefix symbols + arity only), so a candidate
    // event may still turn out not to fit once its values are decoded — e.g.
    // an unrelated contract's event sharing the same prefix and topic count.
    // Treat any decode failure as a non-match and try the next candidate.
    try {
      const prefixLen = event.prefixTopics.length;
      // Param names come from an untrusted, on-chain contract spec, so a
      // param literally named "__proto__" must not be able to reach the
      // object's prototype via normal property assignment. A null-prototype
      // object stores it as a plain own property instead.
      const dataOut: Record<string, any> = Object.create(null);
      tlParams.forEach((param, i) => {
        const val = topicVals[prefixLen + i];
        dataOut[param.name.toString()] = spec.scValToNative(val, param.type);
      });

      const dParams = dataParams(event);
      const format = event.dataFormat.value;
      if (
        format === ScSpecEventDataFormat.scSpecEventDataFormatSingleValue.value
      ) {
        const param = dParams[0];
        if (param) {
          dataOut[param.name.toString()] = spec.scValToNative(
            dataVal,
            param.type,
          );
        }
      } else if (
        format === ScSpecEventDataFormat.scSpecEventDataFormatVec.value
      ) {
        const vec = (dataVal.type === "scvVec" ? dataVal.value : null) ?? [];
        if (vec.length < dParams.length) {
          continue;
        }
        dParams.forEach((param, i) => {
          dataOut[param.name.toString()] = spec.scValToNative(
            vec[i],
            param.type,
          );
        });
      } else if (
        format === ScSpecEventDataFormat.scSpecEventDataFormatMap.value
      ) {
        const map = (dataVal.type === "scvMap" ? dataVal.value : null) ?? [];
        dParams.forEach((param) => {
          const name = param.name.toString();
          const entry = map.find(
            (e) =>
              e.key.type === "scvSymbol" && e.key.value.toString() === name,
          );
          if (entry) {
            dataOut[name] = spec.scValToNative(entry.val, param.type);
          }
        });
      }

      return {
        name: event.name.toString(),
        data: dataOut,
      };
    } catch {
      continue;
    }
  }

  return undefined;
}

/**
 * Builds a `getEvents` topic filter (a single row of `Api.EventFilter.topics`)
 * for the named event: the event's prefix topics (base64-encoded `scvSymbol`s)
 * followed by one entry per topic-list param — either the base64-encoded
 * ScVal for a value supplied in `topicValues`, or the wildcard `"*"`.
 *
 * @param spec - the Spec instance to encode values with (for `nativeToScVal`)
 * @param entries - the contract's XDR spec entries
 * @param name - the name of the event
 * @param topicValues - (optional) native values for topic-list params, keyed by param name
 * @param occurrence - (optional) 0-based index among same-named events, for
 *        contracts that declare the same event name more than once
 * @returns a single topic filter row
 * @throws if no event with the given name (at the given occurrence) exists,
 *         or if `occurrence` is not a non-negative integer
 * @hidden
 */
export function eventTopicFilter(
  spec: Spec,
  entries: ScSpecEntry[],
  name: string,
  topicValues?: Record<string, any>,
  occurrence: number = 0,
): string[] {
  const event = findEvent(entries, name, occurrence);
  if (!event) {
    throw new Error(
      occurrence > 0
        ? `no such event: ${name} (occurrence ${occurrence})`
        : `no such event: ${name}`,
    );
  }
  const filter: string[] = event.prefixTopics.map((topic) =>
    ScVal.scvSymbol(topic.toString()).toXdr("base64"),
  );

  topicListParams(event).forEach((param) => {
    const paramName = param.name.toString();
    if (
      topicValues &&
      Object.prototype.hasOwnProperty.call(topicValues, paramName)
    ) {
      const scVal = spec.nativeToScVal(topicValues[paramName], param.type);
      filter.push(scVal.toXdr("base64"));
    } else {
      filter.push("*");
    }
  });

  return filter;
}
