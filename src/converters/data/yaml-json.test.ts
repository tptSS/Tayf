import { describe, expect, it } from "vitest";
import * as yaml from "js-yaml";
import yamlJsonConverter from "./yaml-json";

describe("yaml-json", () => {
  it("YAML'ı JSON'a çevirir", async () => {
    const data = { ad: "Ayşe", sehir: "İstanbul" };
    const yamlText = yaml.dump(data);
    const encoder = new TextEncoder();

    const outputs = await yamlJsonConverter.run(
      { files: [{ name: "x.yaml", data: encoder.encode(yamlText).buffer }] },
      { pretty: false },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("x.json");
    expect(JSON.parse(outputs[0].data as string)).toEqual(data);
  });
});
