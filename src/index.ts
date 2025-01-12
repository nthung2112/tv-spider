import { Spider } from "./spider";

export class SpiderImplementation implements Spider {
  private siteKey: string = "";
  private siteType: number = 0;

  async init(cfg: { skey: string; stype: number; ext?: string }): Promise<void> {
    this.siteKey = cfg.skey;
    this.siteType = cfg.stype;
  }

  private async parseVodListFromUrl(link: string): Promise<Stringified<CategoryData>> {
    return JSON.stringify({
      page: 1,
      pagecount: 1,
      limit: 1,
      total: 1,
      list: [],
    });
  }

  async homeVod(): Promise<Stringified<VodData>> {
    console.log("VOD home page");
    return this.parseVodListFromUrl("");
  }

  async home(filter: boolean): Promise<Stringified<HomeData>> {
    console.log(`Home page with filter: ${filter}`);
    return JSON.stringify({ class: [], filters: {} });
  }

  async category(
    tid: string,
    pg: string,
    filter: boolean,
    extend: Record<string, string>
  ): Promise<Stringified<CategoryData>> {
    console.log(`Category page: tid=${tid}, pg=${pg}, filter=${filter}, extend=${extend}`);
    return this.parseVodListFromUrl("");
  }

  async detail(id: string): Promise<Stringified<VodData>> {
    console.log(`Detail page with id: ${id}`);
    return JSON.stringify({ list: [] });
  }

  async play(flag: string, id: string, vipFlags: string[]): Promise<Stringified<PlayData>> {
    console.log(`Play page: flag=${flag}, id=${id}, flags=${vipFlags}`);
    return JSON.stringify({ parse: 0, url: "" });
  }

  async search(wd: string, quick?: boolean, pg?: string): Promise<Stringified<CategoryData>> {
    console.log(`Search page: wd=${wd}, quick=${quick}`);
    return this.parseVodListFromUrl("");
  }
}

export function __jsEvalReturn() {
  return new SpiderImplementation();
}
