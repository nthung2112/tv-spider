// src/sites/xemphim1080.ts
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

// src/sites/xemphim1080.ts
var url = "https://phim1080.in";
var siteKey = "";
var siteType = 0;
function customGetRequest(reqUrl) {
  return getRequest(reqUrl, {
    referer: `${url}/loki`,
    "x-requested-with": "XMLHttpRequest",
    Cookie: "phimnhanh=%3D"
  });
}
async function parseVodListFromUrl(link) {
  const html = await customGetRequest(link);
  const $ = load(html);
  const items = $(".tray-left .tray-item");
  const videos = lodashMap(items, (item) => {
    if (!item.attribs.id) return;
    const img = $(item).find("img:first")[0];
    return {
      vod_id: item.attribs.id.replace("film-id-", "").replace("film-id-", ""),
      vod_name: $(item).find(".tray-item-title").text().trim(),
      vod_pic: img.attribs["data-src"],
      vod_remarks: $(item).find(".tray-film-likes").text().trim()
    };
  });
  const lastPage = $(".pagination li").eq(-2).text();
  const pgCount = lastPage ? parseInt(lastPage) : 1;
  const currentPage = $(".page-item.active").text();
  const limit = $(".pagination li").length;
  return JSON.stringify({
    page: parseInt(currentPage),
    pagecount: pgCount,
    limit,
    total: limit * pgCount,
    list: videos.filter((item) => !!item)
  });
}
async function init(cfg) {
  siteKey = cfg.skey;
  siteType = cfg.stype;
  const html = await customGetRequest(`${url}`);
  const regex = /<meta\s+property="og:url"\s+content="([^"]*)"\s*\/>/;
  const match = html.match(regex);
  if (match) {
    url = match[1];
  }
}
async function home(filter) {
  const dulieu = {
    "B\u1EA3ng x\u1EBFp h\u1EA1ng": "/bang-xep-hang",
    "Phim \u0111\u1EC1 c\u1EED": "/phim-de-cu",
    "Phim l\u1EBB": "/phim-le",
    "Phim b\u1ED9": "/phim-bo",
    "Chi\u1EBFu r\u1EA1p": "/phim-chieu-rap",
    "H\xF4m nay xem g\xEC": "/hom-nay-xem-gi",
    "Th\u1EC3 lo\u1EA1i": "the-loai",
    "Qu\u1ED1c gia": "quoc-gia"
  };
  const theloai = {
    "H\xE0nh \u0111\u1ED9ng": "/the-loai/hanh-dong",
    "Phi\xEAu l\u01B0u": "/the-loai/phieu-luu",
    "Kinh d\u1ECB": "/the-loai/kinh-di",
    "T\xECnh c\u1EA3m": "/the-loai/tinh-cam",
    "Ho\u1EA1t h\xECnh": "/the-loai/hoat-hinh",
    "V\xF5 thu\u1EADt": "/the-loai/vo-thuat",
    "H\xE0i h\u01B0\u1EDBc": "/the-loai/hai-huoc",
    "T\xE2m l\xFD": "/the-loai/tam-ly",
    "Vi\u1EC5n t\u01B0\u1EDFng": "/the-loai/vien-tuong",
    "Th\u1EA7n tho\u1EA1i": "/the-loai/than-thoai",
    "Chi\u1EBFn tranh": "/the-loai/chien-tranh",
    "C\u1ED5 trang": "/the-loai/co-trang",
    "\xC2m nh\u1EA1c": "/the-loai/am-nhac",
    "H\xECnh s\u1EF1": "/the-loai/hinh-su",
    "TV Show": "/the-loai/tv-show",
    "Khoa h\u1ECDc": "/the-loai/khoa-hoc",
    "T\xE0i li\u1EC7u": "/the-loai/tai-lieu",
    Kh\u00E1c: "/the-loai/other",
    "L\u1ECBch s\u1EED": "/the-loai/lich-su",
    "Gia \u0111\xECnh": "/the-loai/gia-dinh",
    "Th\u1EC3 thao": "/the-loai/the-thao",
    "Ki\u1EBFm hi\u1EC7p": "/the-loai/kiem-hiep",
    "K\u1ECBch t\xEDnh": "/the-loai/kich-tinh",
    "B\xED \u1EA9n": "/the-loai/bi-an",
    "Ti\u1EC3u s\u1EED": "/the-loai/tieu-su",
    "Thanh xu\xE2n": "/the-loai/thanh-xuan",
    "H\u1ECDc \u0111\u01B0\u1EDDng": "/the-loai/hoc-duong",
    "Huy\u1EC1n huy\u1EC5n": "/the-loai/huyen-huyen",
    "Ti\xEAn hi\u1EC7p": "/the-loai/tien-hiep",
    "\u0110am m\u1EF9": "/the-loai/dam-my",
    "Trinh th\xE1m": "/the-loai/trinh-tham",
    "Gay c\u0103ng": "/the-loai/gay-can",
    "\u0110\u1ED9ng v\u1EADt": "/the-loai/dong-vat"
  };
  const quocgia = {
    "Trung Qu\u1ED1c": "/phim-trung-quoc",
    "H\xE0n Qu\u1ED1c": "/phim-han-quoc",
    "\u0110\xE0i Loan": "/phim-dai-loan",
    M\u1EF9: "/phim-my",
    "Ch\xE2u \xC2u": "/phim-chau-au",
    "Nh\u1EADt B\u1EA3n": "/phim-nhat-ban",
    "H\u1ED3ng K\xF4ng": "/phim-hong-kong",
    "Th\xE1i Lan": "/phim-thai-lan",
    "Ch\xE2u \xC1": "/phim-chau-a",
    "\u1EA4n \u0110\u1ED9": "/phim-an-do",
    Ph\u00E1p: "/phim-phap",
    Anh: "/phim-anh",
    Canada: "/phim-canada",
    \u0110\u1EE9c: "/phim-duc",
    "T\xE2y Ban Nha": "/phim-tay-ban-nha",
    Nga: "/phim-nga",
    \u00DAc: "/phim-uc",
    Kh\u00E1c: "/phim-khac"
  };
  const classes = lodashMap(dulieu, (key, label) => ({
    id: key,
    name: label
  }));
  let filterObj = {
    "the-loai": [
      {
        key: "tag",
        init: "/the-loai/hanh-dong",
        name: "Type",
        value: lodashMap(theloai, (key, label) => ({
          v: key,
          n: label
        }))
      }
    ],
    "quoc-gia": [
      {
        key: "tag",
        init: "/phim-han-quoc",
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
  return await parseVodListFromUrl(`${url}/hom-nay-xem-gi`);
}
async function category(tid, page, filter, extend) {
  if (!page) page = "1";
  const pg = parseInt(page);
  const link = extend.tag || tid ? `${url}${extend.tag || tid}?page=${pg}` : url;
  return parseVodListFromUrl(link);
}
var decode_1080 = (e, t) => {
  let a = "";
  for (let i = 0; i < e.length; i++) {
    const r = e.charCodeAt(i);
    const o = r ^ t;
    a += String.fromCharCode(o);
  }
  return a;
};
async function detail(id) {
  const data = JSON.parse(await customGetRequest(`${url}/api/v2/films/${id}`));
  const vod = {
    vod_id: id,
    vod_pic: data.poster,
    vod_remarks: data.time,
    vod_name: `${data.name} (${data.name_en || ""})`,
    vod_area: "",
    vod_lang: "",
    vod_actor: "",
    vod_year: data.year,
    vod_content: data.description,
    vod_play_from: "Phim1080",
    vod_play_url: ""
  };
  const episodes = JSON.parse(
    await customGetRequest(`${url}/api/v2/films/${id}/episodes?sort=name`)
  );
  vod.vod_play_url = episodes.data.map((d) => `${d.full_name}$${id}/episodes/${d.id}`).join("#");
  return JSON.stringify({
    list: [vod]
  });
}
async function play(flag, urlId, vipFlags) {
  const data = JSON.parse(await customGetRequest(`${url}/api/v2/films/${urlId}`));
  const result = data.sources.m3u8.opt ? decode_1080(data.sources.m3u8.opt, 69).trim() : "";
  return JSON.stringify({
    parse: 0,
    url: result
  });
}
async function search(wd, quick, pg) {
  const videos = JSON.parse(await customGetRequest(`${url}/api/v2/search?q=${wd}&limit=20`)).data;
  const list = videos.map((item) => {
    return {
      vod_id: item.slug,
      vod_name: item.name,
      vod_pic: item.thumbnail,
      vod_remarks: item.time
    };
  });
  return JSON.stringify({
    list
  });
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
