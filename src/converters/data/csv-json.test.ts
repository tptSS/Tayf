import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import csvJsonConverter, { convertCsvFileToJson } from "./csv-json";

const fixturePath = path.resolve(__dirname, "./fixtures/sample.csv");

describe("csv-json", () => {
  it("virgülle ayrılmış CSV'yi JSON dizisine çevirir", async () => {
    const csv = readFileSync(fixturePath, "utf-8");
    const json = await convertCsvFileToJson(csv, {
      delimiter: "auto",
      pretty: true,
    });
    const parsed = JSON.parse(json);

    expect(parsed).toEqual([
      { ad: "Ayşe", sehir: "İstanbul", yas: "29" },
      { ad: "Mehmet", sehir: "Ankara", yas: "34" },
    ]);
  });

  it("noktalı virgül ayırıcısını destekler", async () => {
    const csv = "ad;sehir\nAyşe;İstanbul\n";
    const json = await convertCsvFileToJson(csv, {
      delimiter: ";",
      pretty: false,
    });
    expect(JSON.parse(json)).toEqual([{ ad: "Ayşe", sehir: "İstanbul" }]);
  });

  it("run, her dosyayı ayrı ayrı işler (batch)", async () => {
    const encoder = new TextEncoder();
    const files = [
      { name: "a.csv", data: encoder.encode("x,y\n1,2\n").buffer },
      { name: "b.csv", data: encoder.encode("x,y\n3,4\n").buffer },
    ];
    let lastRatio = -1;
    const outputs = await csvJsonConverter.run(
      { files },
      { delimiter: "auto", pretty: false },
      {
        progress: (ratio) => {
          lastRatio = ratio;
        },
        signal: new AbortController().signal,
      },
    );

    expect(outputs).toHaveLength(2);
    expect(outputs[0].name).toBe("a.json");
    expect(JSON.parse(outputs[0].data as string)).toEqual([{ x: "1", y: "2" }]);
    expect(outputs[1].name).toBe("b.json");
    expect(lastRatio).toBe(1);
  });

  it("iptal edildiğinde AbortError fırlatır", async () => {
    const controller = new AbortController();
    controller.abort();
    const encoder = new TextEncoder();

    await expect(
      csvJsonConverter.run(
        { files: [{ name: "a.csv", data: encoder.encode("x\n1\n").buffer }] },
        { delimiter: "auto", pretty: false },
        { progress: () => {}, signal: controller.signal },
      ),
    ).rejects.toThrow("İptal edildi");
  });
});
