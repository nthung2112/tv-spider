interface Context {
  skey: string;
  stype: number;
  ext?: string;
}

export interface Spider {
  init(cfg: Context): Promise<void>;

  home(filter: boolean): Promise<Stringified<HomeData>>;

  homeVod(): Promise<Stringified<VodData>>;

  category(
    tid: string,
    page: string,
    filter: boolean,
    extend: Record<string, string>
  ): Promise<Stringified<CategoryData>>;

  detail(id: string): Promise<Stringified<VodData>>;

  play(flag: string, id: string, vipFlags: string[]): Promise<Stringified<PlayData>>;

  search(key: string, quick?: boolean, page?: string): Promise<Stringified<CategoryData>>;

  live?(url: string): Promise<string>;

  action?(action: string): Promise<string>;

  destroy?(): void;
}
