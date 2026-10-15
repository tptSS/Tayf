import { describe, expect, it } from "vitest";
import * as yaml from "js-yaml";
import jsonYamlConverter from "./json-yaml";

describe("json-yaml", () => {
  it("JSON'u YAML'a çevirir", async () => {
    const data = { ad: "Ayşe", sehir: "İstanbul", etiketler: ["a", "b"] };
    const encoder = new TextEncoder();

    const outputs = await jsonYamlConverter.run(
      { files: [{ name: "x.json", data: encoder.encode(JSON.stringify(data)).buffer }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("x.yaml");
    expect(yaml.load(outputs[0].data as string)).toEqual(data);
  });
});
