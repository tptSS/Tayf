import { describe, expect, it } from "vitest";
import jsonXmlConverter from "./json-xml";
import { rowsFromXmlText } from "./shared";

describe("json-xml", () => {
  it("JSON'u XML'e çevirir", async () => {
    const rows = [{ ad: "Ayşe", sehir: "İstanbul" }];
    const encoder = new TextEncoder();

    const outputs = await jsonXmlConverter.run(
      { files: [{ name: "x.json", data: encoder.encode(JSON.stringify(rows)).buffer }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("x.xml");
    expect(await rowsFromXmlText(outputs[0].data as string)).toEqual(rows);
  });
});
