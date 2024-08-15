import { BaseLayer } from "./BaseLayer";

export class CityJSONLayer extends BaseLayer {
  type: string = "CityJSONLayer";
  format: "cityjson" | "cityjsonseq";
  data?: string | object;
  url?: string;

  constructor(data: string | object, format?: "cityjson" | "cityjsonseq") {
    super();
    this.data = data;
    this.format = format || "cityjson";
  }

  getUrl(): string {
    if (this.url) {
      return this.url;
    } else if (this.data) {
      let data;
      if (typeof this.data !== "string") {
        data = JSON.stringify(this.data);
      } else {
        data = this.data;
      }
      let dataUrl = URL.createObjectURL(
        new Blob([data], { type: "text/plain" }),
      );
      if (this.format === "cityjsonseq") {
        dataUrl += "#format=jsonl";
      }
      return dataUrl;
    }
    throw new Error("No data or url provided");
  }
}
