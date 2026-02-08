// src/sites/ohitv.ts
import { load } from "cheerio";

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

// src/sites/ohitv.ts
var url = "https://ohitv.link";
var siteKey = "";
var siteType = 0;
async function init(cfg) {
  siteKey = cfg.skey;
  siteType = cfg.stype;
}
async function parseVodListFromUrl(link) {
  const data = await getRequest(link);
  const $ = load(data);
  const items = $(".content article");
  const videos = lodashMap(items, (item) => {
    const img = $(item).find("img")[0];
    return {
      vod_id: $(item).find("a")[0].attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs["data-src"] || img.attribs.src,
      vod_remarks: $(item).find(".quality").text().trim()
    };
  });
  const lastPage = $(".pagination span").text().slice(10);
  const currentPage = $(".pagination .current").text();
  const pgCount = lastPage ? parseInt(lastPage) : 1;
  return JSON.stringify({
    page: Number(currentPage),
    pagecount: pgCount,
    limit: videos.length,
    total: videos.length * pgCount,
    list: videos
  });
}
async function home(filter) {
  const dulieu = {
    "Phim th\u1ECBnh h\xE0nh": "/trending",
    "Phim b\u1ED9": "/phim-bo",
    "Phim l\u1EBB": "/phim-le",
    "Phim HD": "/phim-hd",
    "Chi\u1EBFu r\u1EA1p": "/the-loai/phim-chieu-rap",
    "TOP IMDB": "/imdb",
    "Th\u1EC3 lo\u1EA1i": "/the-loai",
    "Qu\u1ED1c gia": "/quoc-gia"
  };
  const theloai = {
    "H\xE0nh \u0111\u1ED9ng": "/the-loai/phim-hanh-dong",
    "V\xF5 thu\u1EADt": "/the-loai/phim-vo-thuat",
    "T\xECnh c\u1EA3m": "/the-loai/phim-tinh-cam",
    "T\xE2m l\xFD": "/the-loai/phim-tam-ly",
    H\u00E0i: "/the-loai/phim-hai-huoc",
    "Ho\u1EA1t h\xECnh": "/the-loai/phim-hoat-hinh",
    Anime: "/the-loai/phim-anime",
    "Phi\xEAu l\u01B0u": "/the-loai/phim-phieu-luu",
    "Kinh d\u1ECB": "/the-loai/phim-ma-kinh-di",
    "H\xECnh s\u1EF1": "/the-loai/phim-hinh-su",
    "Chi\u1EBFn tranh": "/the-loai/phim-chien-tranh",
    "Th\u1EA7n tho\u1EA1i": "/the-loai/phim-than-thoai",
    "Vi\u1EC5n t\u01B0\u1EDFng": "/the-loai/phim-vien-tuong",
    "C\u1ED5 trang": "/the-loai/phim-co-trang",
    "\xC2m nh\u1EA1c": "/the-loai/phim-am-nhac",
    "Th\u1EC3 thao": "/the-loai/phim-the-thao",
    "Truy\u1EC1n h\xECnh": "/the-loai/phim-truyen-hinh",
    "TV Show": "/the-loai/game-show",
    "Khoa h\u1ECDc": "/the-loai/phim-khoa-hoc"
  };
  const quocgia = {
    "\xC2u M\u1EF9": "/quoc-gia/phim-au-my",
    "H\xE0n Qu\u1ED1c": "/quoc-gia/phim-han-quoc",
    "Trung Qu\u1ED1c": "/quoc-gia/phim-trung-quoc",
    "H\u1ED3ng K\xF4ng": "/quoc-gia/phim-hong-kong",
    "\u0110\xE0i Loan": "/quoc-gia/phim-dai-loan",
    "Nh\u1EADt B\u1EA3n": "/quoc-gia/phim-nhat-ban",
    "\u1EA4n \u0110\u1ED9": "/quoc-gia/phim-an-do",
    "Th\xE1i Lan": "/quoc-gia/phim-thai-lan",
    "N\u01B0\u1EDBc Kh\xE1c": "/quoc-gia/phim-tong-hop"
  };
  const classes = lodashMap(dulieu, (key, label) => ({
    id: key,
    name: label
  }));
  let filterObj = {
    "/the-loai": [
      {
        key: "tag",
        init: "/the-loai/phim-hanh-dong",
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
        init: "/quoc-gia/phim-au-my",
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
  return await parseVodListFromUrl(`${url}/trending`);
}
async function category(tid, page, filter, extend) {
  if (!page) page = "1";
  const pg = parseInt(page);
  let link = url;
  if (extend.tag || tid) {
    link = `${url}${extend.tag || tid}/${pg > 1 ? `page/${pg}` : ""}`;
  }
  return await parseVodListFromUrl(link);
}
async function detail(id) {
  const html = await getRequest(id);
  const $ = load(html);
  const postId = $("body")?.attr("class")?.split(" ").find((item) => item.includes("postid")) || "";
  const firmId = postId.split("-")[1];
  const chapters = $(".episodios li a");
  const vod = {
    vod_id: firmId,
    vod_pic: $("#single .poster img")[0].attribs["data-src"],
    vod_remarks: "",
    vod_name: $("#single h1").text().trim(),
    vod_area: "",
    vod_lang: "",
    vod_actor: "",
    vod_director: "",
    vod_content: $(".wp-content").text(),
    vod_play_from: "OHITV",
    vod_play_url: ""
  };
  if (chapters.length > 0) {
    const items = lodashMap(chapters, (chapter, index) => {
      return `${$(chapter).text()}$${chapter.attribs.href}`;
    });
    vod.vod_play_url = items.join("#");
  } else {
    vod.vod_play_url = `Full$${id}`;
  }
  return JSON.stringify({
    list: [vod]
  });
}
async function play(flag, id, vipFlags) {
  const html = await getRequest(id);
  const $ = load(html);
  const postId = $("body")?.attr("class")?.split(" ").find((item) => item.includes("postid")) || "";
  const firmId = postId.split("-")[1];
  const content = await postRequest(`${url}/wp-admin/admin-ajax.php`, {
    action: "doo_player_ajax",
    type: "tv",
    post: firmId,
    nume: 1
  });
  const movieId = JSON.parse(content).embed_url.match(/play%2F([^&]+)/)[1];
  const newHtml = await getRequest(`https://storage-1.ohitv.org/play/${movieId}`);
  const playUrls = JSON.parse(newHtml.match(/JSON\.parse\('([^']*)'\);/)?.[1] || "{}");
  return JSON.stringify({
    parse: 0,
    url: playUrls[0].link
  });
}
async function search(wd, quick, pg) {
  return await parseVodListFromUrl(`${url}?s=${wd.replace(" ", "+")}`);
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
