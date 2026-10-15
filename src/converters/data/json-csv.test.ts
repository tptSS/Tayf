import { describe, expect, it } from "vitest";
import jsonCsvConverter from "./json-csv";

describe("json-csv", () => {
  it("JSON dizisini CSV'ye çevirir", async () => {
    const encoder = new TextEncoder();
    const json = JSON.stringify([{ ad: "Ayşe", sehir: "İstanbul" }]);

    const outputs = await jsonCsvConverter.run(
      { files: [{ name: "x.json", data: encoder.encode(json).buffer }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("x.csv");
    expect(outputs[0].data).toContain("ad,sehir");
    expect(outputs[0].data).toContain("Ayşe,İstanbul");
  });
});
