import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import pt from "../../messages/pt.json";

function keys(messages: object, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? keys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe("messages", () => {
  it.each([
    ["pt", pt],
    ["en", en],
  ])("%s has exactly the same texts as es", (_, messages) => {
    expect(keys(messages).sort()).toEqual(keys(es).sort());
  });
});
