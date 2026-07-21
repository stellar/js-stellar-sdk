import { xdr } from "../base/index.js";
import type { Spec } from "./spec.js";

/**
 * The result of successfully matching an emitted contract event against one
 * of the event specs (`xdr.ScSpecEventV0`) defined in a {@link Spec}.
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
 * Gets all the CAP-67 event spec entries (`xdr.ScSpecEntryKind.scSpecEntryEventV0`)
 * out of a contract's spec entries.
 *
 * @param entries - the contract's XDR spec entries
 * @returns all event entries
 * @hidden
 */
export function events(entries: xdr.ScSpecEntry[]): xdr.ScSpecEventV0[] {
  return entries
    .filter(
      (entry) =>
        entry.switch().value === xdr.ScSpecEntryKind.scSpecEntryEventV0().value,
    )
    .map((entry) => entry.eventV0());
}

/**
 * Finds the event spec with the given name among a contract's event entries.
 *
 * @param entries - the contract's XDR spec entries
 * @param name - the name of the event to find
 * @returns the event spec
 * @throws if no event with the given name exists
 * @hidden
 */
export function findEvent(
  entries: xdr.ScSpecEntry[],
  name: string,
): xdr.ScSpecEventV0 {
  const found = events(entries).find((e) => e.name().toString() === name);
  if (!found) {
    throw new Error(`no such event: ${name}`);
  }
  return found;
}

/**
 * Returns the topic-list-located params of an event, in declaration order.
 * @hidden
 */
function topicListParams(event: xdr.ScSpecEventV0): xdr.ScSpecEventParamV0[] {
  return event
    .params()
    .filter(
      (p) =>
        p.location().value ===
        xdr.ScSpecEventParamLocationV0.scSpecEventParamLocationTopicList()
          .value,
    );
}

/**
 * Returns the data-located params of an event, in declaration order.
 * @hidden
 */
function dataParams(event: xdr.ScSpecEventV0): xdr.ScSpecEventParamV0[] {
  return event
    .params()
    .filter(
      (p) =>
        p.location().value ===
        xdr.ScSpecEventParamLocationV0.scSpecEventParamLocationData().value,
    );
}

/**
 * Checks whether the given topics ScVals match an event's prefix topics +
 * topic-list params (matching against structure/length + symbol equality of
 * the prefix, not the topic-list values).
 * @hidden
 */
function matchesTopics(
  event: xdr.ScSpecEventV0,
  topics: xdr.ScVal[],
): xdr.ScSpecEventParamV0[] | undefined {
  const prefixTopics = event.prefixTopics();
  const tlParams = topicListParams(event);
  if (topics.length !== prefixTopics.length + tlParams.length) {
    return undefined;
  }
  for (let i = 0; i < prefixTopics.length; i++) {
    const topic = topics[i];
    if (topic.switch().value !== xdr.ScValType.scvSymbol().value) {
      return undefined;
    }
    const expected = prefixTopics[i].toString();
    if (topic.sym().toString() !== expected) {
      return undefined;
    }
  }
  return tlParams;
}

/**
 * Attempts to parse an emitted contract event (topics + data ScVals) against
 * the event specs (CAP-67) contained in a {@link Spec}.
 *
 * @param spec - the Spec instance to decode values with (for `scValToNative`)
 * @param entries - the contract's XDR spec entries
 * @param topics - the event's topics, as `xdr.ScVal[]` or base64 XDR strings
 * @param data - the event's data, as an `xdr.ScVal` or a base64 XDR string
 * @returns the parsed event, or `undefined` if no event spec matches
 *
 * Matching compares only the prefix topics and the topic count, so if two
 * event specs share both (in particular, events with no prefix topics match
 * on arity alone), the first declared spec whose values decode successfully
 * wins.
 * @hidden
 */
export function parseEvent(
  spec: Spec,
  entries: xdr.ScSpecEntry[],
  topics: xdr.ScVal[] | string[],
  data: xdr.ScVal | string,
): ParsedEvent | undefined {
  let topicVals: xdr.ScVal[];
  let dataVal: xdr.ScVal;
  try {
    topicVals = topics.map((t) =>
      typeof t === "string" ? xdr.ScVal.fromXDR(t, "base64") : t,
    );
    dataVal =
      typeof data === "string" ? xdr.ScVal.fromXDR(data, "base64") : data;
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
      const prefixLen = event.prefixTopics().length;
      const dataOut: Record<string, any> = {};
      tlParams.forEach((param, i) => {
        const val = topicVals[prefixLen + i];
        dataOut[param.name().toString()] = spec.scValToNative(
          val,
          param.type(),
        );
      });

      const dParams = dataParams(event);
      const format = event.dataFormat().value;
      if (
        format ===
        xdr.ScSpecEventDataFormat.scSpecEventDataFormatSingleValue().value
      ) {
        const param = dParams[0];
        if (param) {
          dataOut[param.name().toString()] = spec.scValToNative(
            dataVal,
            param.type(),
          );
        }
      } else if (
        format === xdr.ScSpecEventDataFormat.scSpecEventDataFormatVec().value
      ) {
        const vec = dataVal.vec() ?? [];
        if (vec.length < dParams.length) {
          continue;
        }
        dParams.forEach((param, i) => {
          dataOut[param.name().toString()] = spec.scValToNative(
            vec[i],
            param.type(),
          );
        });
      } else if (
        format === xdr.ScSpecEventDataFormat.scSpecEventDataFormatMap().value
      ) {
        const map = dataVal.map() ?? [];
        dParams.forEach((param) => {
          const name = param.name().toString();
          const entry = map.find(
            (e) =>
              e.key().switch().value === xdr.ScValType.scvSymbol().value &&
              e.key().sym().toString() === name,
          );
          if (entry) {
            dataOut[name] = spec.scValToNative(entry.val(), param.type());
          }
        });
      }

      return {
        name: event.name().toString(),
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
 * @returns a single topic filter row
 * @throws if no event with the given name exists
 * @hidden
 */
export function eventTopicFilter(
  spec: Spec,
  entries: xdr.ScSpecEntry[],
  name: string,
  topicValues?: Record<string, any>,
): string[] {
  const event = findEvent(entries, name);
  const filter: string[] = event
    .prefixTopics()
    .map((topic) => xdr.ScVal.scvSymbol(topic.toString()).toXDR("base64"));

  topicListParams(event).forEach((param) => {
    const paramName = param.name().toString();
    if (
      topicValues &&
      Object.prototype.hasOwnProperty.call(topicValues, paramName)
    ) {
      const scVal = spec.nativeToScVal(topicValues[paramName], param.type());
      filter.push(scVal.toXDR("base64"));
    } else {
      filter.push("*");
    }
  });

  return filter;
}
