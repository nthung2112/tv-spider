// src/sites/nguonc.ts
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

// src/sites/nguonc.ts
var url = "https://phim.nguonc.com";
var siteKey = "";
var siteType = 0;
async function parseVodListFromUrl(link) {
  const data = await getRequest(link);
  const $ = load(data);
  const items = $("table tbody tr");
  const total = $("font-medium mx-1");
  const list = lodashMap(items, (item) => {
    const mainTitle = $(item).find("td h3").text().trim();
    const subTitle = $(item).find("td h4").text().trim();
    return {
      vod_id: $(item).find("td a")[0].attribs.href.split("/").pop() || "",
      vod_name: `${mainTitle} (${subTitle})`,
      vod_pic: $(item).find("img:first")[0].attribs["data-src"],
      vod_remarks: $($(item).find("td")[1]).text().trim()
    };
  });
  return JSON.stringify({
    page: total[0] ? Number($(total[0]).text().trim()) : 1,
    pagecount: total[1] ? Number($(total[1]).text().trim()) : 1,
    limit: items.length,
    total: total[2] ? Number($(total[2]).text().trim()) : items.length,
    list
  });
}
async function init(cfg) {
  siteKey = cfg.skey;
  siteType = cfg.stype;
}
async function home(filter) {
  const dulieu = {
    "Phim \u0111ang chi\u1EBFu": "/danh-sach/phim-dang-chieu",
    "Phim B\u1ED9": "/danh-sach/phim-bo",
    "Phim L\u1EBB": "/danh-sach/phim-le",
    "TV Shows": "/danh-sach/tv-shows",
    "Th\u1EC3 lo\u1EA1i": "the-loai",
    "Qu\u1ED1c gia": "quoc-gia"
  };
  const theloai = {
    "H\xE0nh \u0110\u1ED9ng": "/the-loai/hanh-dong",
    "Phi\xEAu L\u01B0u": "/the-loai/phieu-luu",
    "Ho\u1EA1t H\xECnh": "/the-loai/hoat-hinh",
    H\u00E0i: "/the-loai/phim-hai",
    "H\xECnh S\u1EF1": "/the-loai/hinh-su",
    "T\xE0i Li\u1EC7u": "/the-loai/tai-lieu",
    "Ch\xEDnh K\u1ECBch": "/the-loai/chinh-kich",
    "Gia \u0110\xECnh": "/the-loai/gia-dinh",
    "Gi\u1EA3 T\u01B0\u1EE3ng": "/the-loai/gia-tuong",
    "L\u1ECBch S\u1EED": "/the-loai/lich-su",
    "Kinh D\u1ECB": "/the-loai/kinh-di",
    Nh\u1EA1c: "/the-loai/phim-nhac",
    "B\xED \u1EA8n": "/the-loai/bi-an",
    "L\xE3ng M\u1EA1n": "/the-loai/lang-man",
    "Khoa H\u1ECDc Vi\u1EC5n T\u01B0\u1EDFng": "/the-loai/khoa-hoc-vien-tuong",
    "G\xE2y C\u1EA5n": "/the-loai/gay-can",
    "Chi\u1EBFn Tranh": "/the-loai/chien-tranh",
    "T\xE2m L\xFD": "/the-loai/tam-ly",
    "T\xECnh C\u1EA3m": "/the-loai/tinh-cam",
    "C\u1ED5 Trang": "/the-loai/co-trang",
    "Mi\u1EC1n T\xE2y": "/the-loai/mien-tay"
  };
  const quocgia = {
    "\xC2u M\u1EF9": "/quoc-gia/au-my",
    Anh: "/quoc-gia/anh",
    "Trung Qu\u1ED1c": "/quoc-gia/trung-quoc",
    Indonesia: "/quoc-gia/indonesia",
    "Vi\u1EC7t Nam": "/quoc-gia/viet-nam",
    Ph\u00E1p: "/quoc-gia/phap",
    "H\u1ED3ng K\xF4ng": "/quoc-gia/hong-kong",
    "H\xE0n Qu\u1ED1c": "/quoc-gia/han-quoc",
    "Nh\u1EADt B\u1EA3n": "/quoc-gia/nhat-ban",
    "Th\xE1i Lan": "/quoc-gia/thai-lan",
    "\u0110\xE0i Loan": "/quoc-gia/dai-loan",
    Nga: "/quoc-gia/nga",
    "H\xE0 Lan": "/quoc-gia/ha-lan",
    Philippines: "/quoc-gia/philippines",
    "\u1EA4n \u0110\u1ED9": "/quoc-gia/an-do",
    "Qu\u1ED1c gia kh\xE1c": "/quoc-gia/quoc-gia-khac"
  };
  const classes = lodashMap(dulieu, (key, label) => ({
    id: key,
    name: label
  }));
  const filterObj = {
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
        init: "/quoc-gia/au-my",
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
  const link = `${url}/danh-sach-phim`;
  return await parseVodListFromUrl(link);
}
async function category(tid, pg, filter, extend) {
  if (!pg) pg = "1";
  let link = url;
  if (extend.tag || tid) {
    link = `${url}${extend.tag || tid}?page=${pg}`;
  }
  return await parseVodListFromUrl(link);
}
async function detail(id) {
  const data = JSON.parse(await getRequest(`${url}/api/film/${id}`));
  const vod = {
    vod_id: data.movie.slug,
    vod_pic: data.movie.poster_url,
    vod_remarks: data.movie.episode_current,
    vod_name: `${data.movie.name} (${data.movie.original_name})`,
    vod_director: data.movie.director,
    vod_actor: data.movie.casts,
    vod_content: data.movie.description,
    vod_play_from: data.movie.episodes.map((e) => e.server_name).join("$$$"),
    vod_play_url: data.movie.episodes.map((e) => e.items.map((d) => `${d.name}$${d.m3u8}`).join("#")).join("$$$")
  };
  return JSON.stringify({
    list: [vod]
  });
}
async function play(flag, id, vipFlags) {
  return JSON.stringify({
    parse: 0,
    url: id
  });
}
async function search(wd, quick, pg) {
  const link = `${url}/tim-kiem?keyword=${wd.replace(" ", "+")}`;
  return await parseVodListFromUrl(link);
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
