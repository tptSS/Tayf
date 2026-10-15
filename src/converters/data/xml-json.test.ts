import { describe, expect, it } from "vitest";
import xmlJsonConverter from "./xml-json";
import { xmlFromRows } from "./shared";

describe("xml-json", () => {
  it("XML'i JSON'a çevirir", async () => {
    const rows = [{ ad: "Ayşe", sehir: "İstanbul" }];
    const xml = await xmlFromRows(rows);
    const encoder = new TextEncoder();

    const outputs = await xmlJsonConverter.run(
      { files: [{ name: "x.xml", data: encoder.encode(xml).buffer }] },
      { pretty: false },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("x.json");
    expect(JSON.parse(outputs[0].data as string)).toEqual(rows);
  });
});
