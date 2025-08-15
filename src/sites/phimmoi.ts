import { load } from "cheerio";
import { getRequest, lodashMap, postRequest } from "../shared";

let url = "https://phimmoichill.bot";
let siteKey = "";
let siteType = 0;

async function parseVodListFromUrl(link: string): Promise<Stringified<CategoryData>> {
  const html = await getRequest<string>(link);

  const $ = load(html);
  const items = $("div#binlist ul li.item");
  const videos = lodashMap(items, (item) => {
    const img = $(item).find("img:first")[0];
    return {
      vod_id: $(item).find("a")[0].attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs["data-cfsrc"] || img.attribs.src,
      vod_remarks: $(item).find(".label").text().trim(),
    };
  });
  const lastPage = $(".pagination > ul li").eq(-2).text();
  const pgCount = lastPage ? parseInt(lastPage) : 1;
  const currentPage = $(".pagination .current").text();

  return JSON.stringify({
    page: parseInt(currentPage),
    pagecount: pgCount,
    limit: videos.length,
    total: videos.length * pgCount,
    list: videos,
  });
}

async function init(cfg: { skey: string; stype: number; ext?: string }): Promise<void> {
  siteKey = cfg.skey;
  siteType = cfg.stype;

  // Update domain changed
  const html = await getRequest<string>(`${url}`);
  const regex = /<base\s+href="([^"]*)"\s*\/>/;
  const match = html.match(regex);
  if (match) {
    url = match[1].slice(0, -1);
  }
}

async function home(filter: boolean): Promise<Stringified<HomeData>> {
  const dulieu = {
    "Phim thịnh hành": "/list/phim-hot",
    "Phim bộ": "/list/phim-bo",
    "Phim lẻ": "/list/phim-le",
    "Phim HD": "/list/phim-hd",
    "Chiếu rạp": "/genre/phim-chieu-rap",
    "TOP IMDB": "/list/top-imdb",
    Netflix: "/list/phim-netflix",
    "Thuyết minh": "/genre/phim-thuyet-minh",
    "Thể loại": "/the-loai",
    "Quốc gia": "/quoc-gia",
  };

  const theloai = {
    "Hành động": "/genre/phim-hanh-dong",
    "Võ thuật": "/genre/phim-vo-thuat",
    "Tình cảm": "/genre/phim-tinh-cam",
    "Tâm lý": "/genre/phim-tam-ly",
    Hài: "/genre/phim-hai-huoc",
    "Hoạt hình": "/genre/phim-hoat-hinh",
    Anime: "/genre/phim-anime",
    "Phiêu lưu": "/genre/phim-phieu-luu",
    "Kinh dị": "/genre/phim-ma-kinh-di",
    "Hình sự": "/genre/phim-hinh-su",
    "Chiến tranh": "/genre/phim-chien-tranh",
    "Thần thoại": "/genre/phim-than-thoai",
    "Viễn tưởng": "/genre/phim-vien-tuong",
    "Cổ trang": "/genre/phim-co-trang",
    "Âm nhạc": "/genre/phim-am-nhac",
    "Thể thao": "/genre/phim-the-thao",
    "Truyền hình": "/genre/phim-truyen-hinh",
    "TV Show": "/genre/game-show",
    "Khoa học": "/genre/phim-khoa-hoc",
  };

  const quocgia = {
    "Âu Mỹ": "/country/phim-au-my",
    "Hàn Quốc": "/country/phim-han-quoc",
    "Trung Quốc": "/country/phim-trung-quoc",
    "Hồng Kông": "/country/phim-hong-kong",
    "Đài Loan": "/country/phim-dai-loan",
    "Nhật Bản": "/country/phim-nhat-ban",
    "Ấn Độ": "/country/phim-an-do",
    "Thái Lan": "/country/phim-thai-lan",
    "Nước Khác": "/country/phim-tong-hop",
  };

  const classes = lodashMap(dulieu, (key, label) => ({
    id: key,
    name: label,
  }));

  let filterObj = {
    "/the-loai": [
      {
        key: "tag",
        init: "/genre/phim-hanh-dong",
        name: "Type",
        value: lodashMap(theloai, (key, label) => ({
          v: key,
          n: label,
        })),
      },
    ],
    "/quoc-gia": [
      {
        key: "tag",
        init: "/country/phim-au-my",
        name: "Type",
        value: lodashMap(quocgia, (key, label) => ({
          v: key,
          n: label,
        })),
      },
    ],
  };

  return JSON.stringify({
    class: classes,
    filters: filterObj,
  });
}

async function homeVod(): Promise<Stringified<VodData>> {
  return await parseVodListFromUrl(`${url}/list/phim-hot`);
}

async function category(
  tid: string,
  page: string,
  filter: boolean,
  extend: Record<string, string>
): Promise<Stringified<CategoryData>> {
  if (!page) page = "1";
  const pg = parseInt(page);
  let link = url;
  if (extend.tag || tid) {
    link = `${url}${extend.tag || tid}/${pg > 1 ? `page-${pg}` : ""}`;
  }

  return await parseVodListFromUrl(link);
}

async function detail(id: string): Promise<Stringified<VodData>> {
  const html = await getRequest<string>(id);
  const $ = load(html);
  const playDetailUrl = $("ul a.btn-see")[0].attribs["href"].replace("/info/", "/xem/");
  let vod = {
    vod_id: id,
    vod_pic: $("#detail-page > div.film-info > div.image > img")[0].attribs["src"],
    vod_remarks: $("ul.block-film > li:nth-child(1) > span").text().trim(),
    vod_name: $(".film-info h1").text().trim(),
    vod_area: "",
    vod_lang: "",
    vod_actor: "",
    vod_director: "",
    vod_content: $(".film-info #film-content").text(),
    vod_play_from: ["PMFAST", "PMHLS", "PMPRO", "PMBK"].join("$$$"),
    vod_play_url: Array.from({ length: 4 }, (_, x) => `Full$${playDetailUrl}`).join("$$$"),
  };

  const children = $("ul.block-film li").children();
  for (let i = 0; i < children.length; i++) {
    const element = children.eq(i);
    if (element.text().includes("Diễn viên:")) {
      vod.vod_actor = children.eq(i + 1).text();
    }

    if (element.text().includes("Đạo diễn:")) {
      vod.vod_director = children.eq(i + 1).text();
    }

    if (element.text().includes("Quốc gia:")) {
      vod.vod_area = children.eq(i + 1).text();
    }

    if (element.text().includes("Ngôn ngữ:")) {
      vod.vod_lang = element.text();
    }
  }

  const htmlXem = await getRequest<string>(playDetailUrl);
  const $X = load(htmlXem);
  const listItem = $X("#list_episodes li a");
  if (listItem.length > 0) {
    const allItem = lodashMap(listItem, (item) => `${$X(item).text().trim()}$${item.attribs.href}`);
    const allUrl = allItem.join("#");

    vod.vod_play_url = [allUrl, allUrl, allUrl, allUrl].join("$$$");
  }

  return JSON.stringify({
    list: [vod],
  });
}

async function play(flag: string, id: string, vipFlags: string[]): Promise<Stringified<PlayData>> {
  let playUrl = "";
  if (id) {
    const matches = id.match(/pm(\d+)/);
    const content = await postRequest<string>(
      `${url}/chillsplayer.php`,
      { qcao: matches?.[1] },
      {
        referer: url,
        "x-requested-with": "XMLHttpRequest",
      }
    );

    if (content.includes("iniPlayers")) {
      const key = content.match(/iniPlayers\("([^"]+)"/)?.[1];
      const mapping: Record<string, string> = {
        PMFAST: `https://dash.motchills.net/raw/${key}/index.m3u8`,
        PMHLS: `https://sotrim.topphimmoi.org/raw/${key}/index.m3u8`,
        PMPRO: `https://dash.megacdn.xyz/raw/${key}/index.m3u8`,
        PMBK: `https://dash.megacdn.xyz/dast/${key}/index.m3u8`,
      };

      playUrl = mapping[flag];
    }
  }

  return JSON.stringify({
    parse: 0,
    url: playUrl,
  });
}

async function search(
  wd: string,
  quick?: boolean,
  pg?: string
): Promise<Stringified<CategoryData>> {
  return await parseVodListFromUrl(`${url}/tim-kiem/${wd.replace(" ", "+")}`);
}

export function __jsEvalReturn() {
  return {
    init,
    home,
    homeVod,
    category,
    detail,
    play,
    search,
  };
}
