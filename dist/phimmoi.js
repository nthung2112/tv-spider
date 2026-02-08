// src/sites/phimmoi.ts
import { load } from "./lib/cat.js";

// src/shared.ts
var UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
async function getRequest(reqUrl, headers, withRaw = false) {
  const res = await req(reqUrl, {
    method: "get",
    headers: {
      "User-Agent": UA,
      ...headers
    }
  });
  if (withRaw) {
    return res;
  }
  return res.content;
}
async function postRequest(reqUrl, data, headers) {
  const res = await req(reqUrl, {
    method: "post",
    postType: "form",
    headers: {
      "User-Agent": UA,
      "x-requested-with": "XMLHttpRequest",
      ...headers
    },
    data
  });
  return res.content;
}
function isArrayLike(item) {
  if (Array.isArray(item)) {
    return true;
  }
  if (typeof item !== "object" || !Object.prototype.hasOwnProperty.call(item, "length") || typeof item.length !== "number" || item.length < 0) {
    return false;
  }
  for (let i = 0; i < item.length; i++) {
    if (!(i in item)) {
      return false;
    }
  }
  return true;
}
function mapArray(items, callback) {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    results.push(callback(items[i], i));
  }
  return results;
}
function lodashMap(items, iteratee) {
  if (isArrayLike(items)) {
    return mapArray(items, iteratee);
  }
  return Object.keys(items).map((key) => iteratee(items[key], key));
}

// src/sites/phimmoi.ts
var url = "https://phimmoichill.now";
var siteKey = "";
var siteType = 0;
async function parseVodListFromUrl(link) {
  const html = await getRequest(link);
  const $ = load(html);
  const items = $("div#binlist ul li.item");
  const videos = lodashMap(items, (item) => {
    const img = $(item).find("img:first")[0];
    return {
      vod_id: $(item).find("a")[0].attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs["data-cfsrc"] || img.attribs.src,
      vod_remarks: $(item).find(".label").text().trim()
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
    list: videos
  });
}
async function init(cfg) {
  siteKey = cfg.skey;
  siteType = cfg.stype;
  const html = await getRequest(`${url}`);
  const regex = /<base\s+href="([^"]*)"\s*\/>/;
  const match = html.match(regex);
  if (match) {
    url = match[1].slice(0, -1);
  }
}
async function home(filter) {
  const dulieu = {
    "Phim th\u1ECBnh h\xE0nh": "/list/phim-hot",
    "Phim b\u1ED9": "/list/phim-bo",
    "Phim l\u1EBB": "/list/phim-le",
    "Phim HD": "/list/phim-hd",
    "Chi\u1EBFu r\u1EA1p": "/genre/phim-chieu-rap",
    "TOP IMDB": "/list/top-imdb",
    Netflix: "/list/phim-netflix",
    "Thuy\u1EBFt minh": "/genre/phim-thuyet-minh",
    "Th\u1EC3 lo\u1EA1i": "/the-loai",
    "Qu\u1ED1c gia": "/quoc-gia"
  };
  const theloai = {
    "H\xE0nh \u0111\u1ED9ng": "/genre/phim-hanh-dong",
    "V\xF5 thu\u1EADt": "/genre/phim-vo-thuat",
    "T\xECnh c\u1EA3m": "/genre/phim-tinh-cam",
    "T\xE2m l\xFD": "/genre/phim-tam-ly",
    H\u00E0i: "/genre/phim-hai-huoc",
    "Ho\u1EA1t h\xECnh": "/genre/phim-hoat-hinh",
    Anime: "/genre/phim-anime",
    "Phi\xEAu l\u01B0u": "/genre/phim-phieu-luu",
    "Kinh d\u1ECB": "/genre/phim-ma-kinh-di",
    "H\xECnh s\u1EF1": "/genre/phim-hinh-su",
    "Chi\u1EBFn tranh": "/genre/phim-chien-tranh",
    "Th\u1EA7n tho\u1EA1i": "/genre/phim-than-thoai",
    "Vi\u1EC5n t\u01B0\u1EDFng": "/genre/phim-vien-tuong",
    "C\u1ED5 trang": "/genre/phim-co-trang",
    "\xC2m nh\u1EA1c": "/genre/phim-am-nhac",
    "Th\u1EC3 thao": "/genre/phim-the-thao",
    "Truy\u1EC1n h\xECnh": "/genre/phim-truyen-hinh",
    "TV Show": "/genre/game-show",
    "Khoa h\u1ECDc": "/genre/phim-khoa-hoc"
  };
  const quocgia = {
    "\xC2u M\u1EF9": "/country/phim-au-my",
    "H\xE0n Qu\u1ED1c": "/country/phim-han-quoc",
    "Trung Qu\u1ED1c": "/country/phim-trung-quoc",
    "H\u1ED3ng K\xF4ng": "/country/phim-hong-kong",
    "\u0110\xE0i Loan": "/country/phim-dai-loan",
    "Nh\u1EADt B\u1EA3n": "/country/phim-nhat-ban",
    "\u1EA4n \u0110\u1ED9": "/country/phim-an-do",
    "Th\xE1i Lan": "/country/phim-thai-lan",
    "N\u01B0\u1EDBc Kh\xE1c": "/country/phim-tong-hop"
  };
  const classes = lodashMap(dulieu, (key, label) => ({
    id: key,
    name: label
  }));
  let filterObj = {
    "/the-loai": [
      {
        key: "tag",
        init: "/genre/phim-hanh-dong",
        name: "Type",
        value: lodashMap(theloai, (key, label) => ({
          v: key,
          n: label
        }))
      }
    ],
    "/quoc-gia": [
      {
        key: "tag",
        init: "/country/phim-au-my",
        name: "Type",
        value: lodashMap(quocgia, (key, label) => ({
          v: key,
          n: label
        }))
      }
    ]
  };
  return JSON.stringify({
    class: classes,
    filters: filterObj
  });
}
async function homeVod() {
  return await parseVodListFromUrl(`${url}/list/phim-hot`);
}
async function category(tid, page, filter, extend) {
  if (!page) page = "1";
  const pg = parseInt(page);
  let link = url;
  if (extend.tag || tid) {
    link = `${url}${extend.tag || tid}/${pg > 1 ? `page-${pg}` : ""}`;
  }
  return await parseVodListFromUrl(link);
}
async function detail(id) {
  const html = await getRequest(id);
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
    vod_play_url: Array.from({ length: 4 }, (_, x) => `Full$${playDetailUrl}`).join("$$$")
  };
  const children = $("ul.block-film li").children();
  for (let i = 0; i < children.length; i++) {
    const element = children.eq(i);
    if (element.text().includes("Di\u1EC5n vi\xEAn:")) {
      vod.vod_actor = children.eq(i + 1).text();
    }
    if (element.text().includes("\u0110\u1EA1o di\u1EC5n:")) {
      vod.vod_director = children.eq(i + 1).text();
    }
    if (element.text().includes("Qu\u1ED1c gia:")) {
      vod.vod_area = children.eq(i + 1).text();
    }
    if (element.text().includes("Ng\xF4n ng\u1EEF:")) {
      vod.vod_lang = element.text();
    }
  }
  const htmlXem = await getRequest(playDetailUrl);
  const $X = load(htmlXem);
  const listItem = $X("#list_episodes li a");
  if (listItem.length > 0) {
    const allItem = lodashMap(listItem, (item) => `${$X(item).text().trim()}$${item.attribs.href}`);
    const allUrl = allItem.join("#");
    vod.vod_play_url = [allUrl, allUrl, allUrl, allUrl].join("$$$");
  }
  return JSON.stringify({
    list: [vod]
  });
}
async function play(flag, id, vipFlags) {
  let playUrl = "";
  if (id) {
    const matches = id.match(/pm(\d+)/);
    const content = await postRequest(
      `${url}/chillsplayer.php`,
      { qcao: matches?.[1] },
      {
        referer: url,
        "x-requested-with": "XMLHttpRequest"
      }
    );
    if (content.includes("iniPlayers")) {
      const key = content.match(/iniPlayers\("([^"]+)"/)?.[1];
      const mapping = {
        PMFAST: `https://dash.motchills.net/raw/${key}/index.m3u8`,
        PMHLS: `https://sotrim.topphimmoi.org/raw/${key}/index.m3u8`,
        PMPRO: `https://dash.megacdn.xyz/raw/${key}/index.m3u8`,
        PMBK: `https://dash.megacdn.xyz/dast/${key}/index.m3u8`
      };
      playUrl = mapping[flag];
    }
  }
  return JSON.stringify({
    parse: 0,
    url: playUrl
  });
}
async function search(wd, quick, pg) {
  return await parseVodListFromUrl(`${url}/tim-kiem/${wd.replace(" ", "+")}`);
}
function __jsEvalReturn() {
  return {
    init,
    home,
    homeVod,
    category,
    detail,
    play,
    search
  };
}
export {
  __jsEvalReturn
};
