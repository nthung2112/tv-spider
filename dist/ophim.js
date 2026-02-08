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

// src/sites/ophim.ts
var url = "https://ophim1.com";
var siteKey = "";
var siteType = 0;
async function init(cfg) {
  siteKey = cfg.skey;
  siteKey = cfg.skey;
  siteType = cfg.stype;
}
async function home(filter) {
  const dulieu = {
    "Phim M\u1EDBi": "/danh-sach/phim-moi",
    "Phim B\u1ED9": "/danh-sach/phim-bo",
    "Phim L\u1EBB": "/danh-sach/phim-le",
    "TV Shows": "/danh-sach/tv-shows",
    "Ho\u1EA1t H\xECnh": "/danh-sach/hoat-hinh",
    "Phim ph\u1EE5 \u0111\u1EC1": "/danh-sach/subteam",
    "Th\u1EC3 lo\u1EA1i": "the-loai",
    "Qu\u1ED1c gia": "quoc-gia"
  };
  const theloai = {
    "H\xE0nh \u0110\u1ED9ng": "/the-loai/hanh-dong",
    "T\xECnh C\u1EA3m": "/the-loai/tinh-cam",
    "H\xE0i H\u01B0\u1EDBc": "/the-loai/hai-huoc",
    "C\u1ED5 Trang": "/the-loai/co-trang",
    "T\xE2m L\xFD": "/the-loai/tam-ly",
    "H\xECnh S\u1EF1": "/the-loai/hinh-su",
    "Chi\u1EBFn Tranh": "/the-loai/chien-tranh",
    "Th\u1EC3 Thao": "/the-loai/the-thao",
    "V\xF5 Thu\u1EADt": "/the-loai/vo-thuat",
    "Vi\u1EC5n T\u01B0\u1EDFng": "/the-loai/vien-tuong",
    "Phi\xEAu L\u01B0u": "/the-loai/phieu-luu",
    "Khoa H\u1ECDc": "/the-loai/khoa-hoc",
    "Kinh D\u1ECB": "/the-loai/kinh-di",
    "\xC2m Nh\u1EA1c": "/the-loai/am-nhac",
    "Th\u1EA7n Tho\u1EA1i": "/the-loai/than-thoai",
    "T\xE0i Li\u1EC7u": "/the-loai/tai-lieu",
    "Gia \u0110\xECnh": "/the-loai/gia-dinh",
    "Ch\xEDnh k\u1ECBch": "/the-loai/chinh-kich",
    "B\xED \u1EA9n": "/the-loai/bi-an",
    "H\u1ECDc \u0110\u01B0\u1EDDng": "/the-loai/hoc-duong",
    "Kinh \u0110i\u1EC3n": "/the-loai/kinh-dien"
  };
  const quocgia = {
    "Trung Qu\u1ED1c": "/quoc-gia/trung-quoc",
    "H\xE0n Qu\u1ED1c": "/quoc-gia/han-quoc",
    "Nh\u1EADt B\u1EA3n": "/quoc-gia/nhat-ban",
    "Th\xE1i Lan": "/quoc-gia/thai-lan",
    "\xC2u M\u1EF9": "/quoc-gia/au-my",
    "\u0110\xE0i Loan": "/quoc-gia/dai-loan",
    "H\u1ED3ng K\xF4ng": "/quoc-gia/hong-kong",
    "\u1EA4n \u0110\u1ED9": "/quoc-gia/an-do",
    Anh: "/quoc-gia/anh",
    Ph\u00E1p: "/quoc-gia/phap",
    Canada: "/quoc-gia/canada",
    "Qu\u1ED1c Gia Kh\xE1c": "/quoc-gia/quoc-gia-khac",
    \u0110\u1EE9c: "/quoc-gia/duc",
    "T\xE2y Ban Nha": "/quoc-gia/tay-ban-nha",
    "Th\u1ED5 Nh\u0129 K\u1EF3": "/quoc-gia/tho-nhi-ky",
    "H\xE0 Lan": "/quoc-gia/ha-lan",
    Indonesia: "/quoc-gia/indonesia",
    Nga: "/quoc-gia/nga",
    Mexico: "/quoc-gia/mexico",
    "Ba lan": "/quoc-gia/ba-lan",
    \u00DAc: "/quoc-gia/uc",
    "Th\u1EE5y \u0110i\u1EC3n": "/quoc-gia/thuy-dien",
    Malaysia: "/quoc-gia/malaysia",
    Brazil: "/quoc-gia/brazil",
    Philippines: "/quoc-gia/philippines",
    "B\u1ED3 \u0110\xE0o Nha": "/quoc-gia/bo-dao-nha",
    \u00DD: "/quoc-gia/y",
    "\u0110an M\u1EA1ch": "/quoc-gia/dan-mach",
    UAE: "/quoc-gia/uae",
    "Na Uy": "/quoc-gia/na-uy",
    "Th\u1EE5y S\u0129": "/quoc-gia/thuy-si",
    "Ch\xE2u Phi": "/quoc-gia/chau-phi",
    "Nam Phi": "/quoc-gia/nam-phi",
    Ukraina: "/quoc-gia/ukraina",
    "\u1EA2 R\u1EADp X\xEA \xDAt": "/quoc-gia/a-rap-xe-ut"
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
  const data = JSON.parse(await getRequest(`${url}/danh-sach/phim-moi-cap-nhat`));
  const list = data.items.map((item) => {
    return {
      vod_id: item.slug,
      vod_name: item.name,
      vod_pic: `${data.pathImage}${item.thumb_url}`,
      vod_remarks: item.year
    };
  });
  return JSON.stringify({
    list
  });
}
async function category(tid, page, filter, extend) {
  if (!page) page = "1";
  const pg = parseInt(page);
  let link = url;
  if (extend.tag) {
    link = `${url}/v1/api${extend.tag}?page=${pg}`;
  } else if (tid) {
    link = `${url}/v1/api${tid}?page=${pg}`;
  }
  const data = JSON.parse(await getRequest(link)).data;
  const list = data.items.map((item) => {
    return {
      vod_id: item.slug,
      vod_name: item.name,
      vod_pic: `${data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/${item.thumb_url}`,
      vod_remarks: item.episode_current
    };
  });
  return JSON.stringify({
    page: data.params.pagination.currentPage,
    pagecount: Math.ceil(
      data.params.pagination.totalItems / data.params.pagination.totalItemsPerPage
    ),
    limit: data.params.pagination.totalItemsPerPage,
    total: data.params.pagination.totalItemsPerPage,
    list
  });
}
async function detail(id) {
  const data = JSON.parse(await getRequest(`${url}/v1/api/phim/${id}`)).data;
  const vod = {
    vod_id: data.item.slug,
    vod_pic: data.seoOnPage.seoSchema.image,
    vod_remarks: data.item.episode_current,
    vod_name: `${data.item.name} (${data.item.origin_name})`,
    vod_area: data.item.country.map((c) => c.name).join(", "),
    vod_year: data.item.year,
    vod_director: data.item.director.join(", "),
    vod_actor: data.item.actor.join(", "),
    vod_content: data.item.content,
    vod_play_from: data.item.episodes.map((e) => e.server_name).join("$$$"),
    vod_play_url: data.item.episodes.map((e) => e.server_data.map((d) => `${d.name}$${d.link_m3u8}`).join("#")).join("$$$")
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
  const data = JSON.parse(
    await getRequest(`${url}/v1/api/tim-kiem?keyword=${wd.replace(" ", "+")}`)
  ).data;
  const list = data.items.map((item) => {
    return {
      vod_id: item.slug,
      vod_name: item.name,
      vod_pic: `${data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/${item.thumb_url}`,
      vod_remarks: item.episode_current
    };
  });
  return JSON.stringify({
    page: data.params.pagination.currentPage,
    pagecount: Math.ceil(
      data.params.pagination.totalItems / data.params.pagination.totalItemsPerPage
    ),
    limit: data.params.pagination.totalItemsPerPage,
    total: data.params.pagination.totalItemsPerPage,
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
