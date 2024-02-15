import { load, _ } from "./lib/cat.js";

let url = "https://phim.nguonc.com";
let siteKey = "";
let siteType = 0;

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";

async function request(reqUrl, agentSp) {
  let res = await req(reqUrl, {
    method: "get",
    headers: {
      "User-Agent": agentSp || UA,
    },
  });
  return res.content;
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg) {
  siteKey = cfg.skey;
  siteType = cfg.stype;
}

async function home(filter) {
  const dulieu = {
    "Phim Mới": "/danh-sach/phim-moi",
    "Phim Bộ": "/danh-sach/phim-bo",
    "Phim Lẻ": "/danh-sach/phim-le",
    "TV Shows": "/danh-sach/tv-shows",
    "Thể loại": "the-loai",
    "Quốc gia": "quoc-gia",
  };
  const theloai = {
    "Hành Động": "/the-loai/hanh-dong",
    "Phiêu Lưu": "/the-loai/phieu-luu",
    "Hoạt Hình": "/the-loai/hoat-hinh",
    Hài: "/the-loai/phim-hai",
    "Hình Sự": "/the-loai/hinh-su",
    "Tài Liệu": "/the-loai/tai-lieu",
    "Chính Kịch": "/the-loai/chinh-kich",
    "Gia Đình": "/the-loai/gia-dinh",
    "Giả Tượng": "/the-loai/gia-tuong",
    "Lịch Sử": "/the-loai/lich-su",
    "Kinh Dị": "/the-loai/kinh-di",
    Nhạc: "/the-loai/phim-nhac",
    "Bí Ẩn": "/the-loai/bi-an",
    "Lãng Mạn": "/the-loai/lang-man",
    "Khoa Học Viễn Tưởng": "/the-loai/khoa-hoc-vien-tuong",
    "Gây Cấn": "/the-loai/gay-can",
    "Chiến Tranh": "/the-loai/chien-tranh",
    "Tâm Lý": "/the-loai/tam-ly",
    "Tình Cảm": "/the-loai/tinh-cam",
    "Cổ Trang": "/the-loai/co-trang",
    "Miền Tây": "/the-loai/mien-tay",
  };
  const quocgia = {
    "Âu Mỹ": "/quoc-gia/au-my",
    Anh: "/quoc-gia/anh",
    "Trung Quốc": "/quoc-gia/trung-quoc",
    Indonesia: "/quoc-gia/indonesia",
    "Việt Nam": "/quoc-gia/viet-nam",
    Pháp: "/quoc-gia/phap",
    "Hồng Kông": "/quoc-gia/hong-kong",
    "Hàn Quốc": "/quoc-gia/han-quoc",
    "Nhật Bản": "/quoc-gia/nhat-ban",
    "Thái Lan": "/quoc-gia/thai-lan",
    "Đài Loan": "/quoc-gia/dai-loan",
    Nga: "/quoc-gia/nga",
    "Hà Lan": "/quoc-gia/ha-lan",
    Philippines: "/quoc-gia/philippines",
    "Ấn Độ": "/quoc-gia/an-do",
    "Quốc gia khác": "/quoc-gia/quoc-gia-khac",
  };

  const classes = _.map(dulieu, (key, label) => ({
    type_id: key,
    type_name: label,
  }));

  let filterObj = {
    "the-loai": [
      {
        key: "tag",
        init: "/the-loai/hanh-dong",
        name: "Type",
        value: _.map(theloai, (key, label) => ({
          v: key,
          n: label,
        })),
      },
    ],
    "quoc-gia": [
      {
        key: "tag",
        init: "/quoc-gia/au-my",
        name: "Type",
        value: _.map(quocgia, (key, label) => ({
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

async function homeVod() {
  const data = await request(`${url}/danh-sach-phim`);
  const $ = load(data);
  const items = $("table tbody tr");

  let list = _.map(items, (item) => {
    const mainTitle = $(item).find("td h3").text().trim();
    const subTitle = $(item).find("td h4").text().trim();
    return {
      vod_id: $(item).find("td a")[0].attribs.href.split("/").pop(),
      vod_name: `${mainTitle} (${subTitle})`,
      vod_pic: $(item).find("img:first")[0].attribs["data-src"],
      vod_remarks: $($(item).find("td")[1]).text().trim(),
    };
  });

  return JSON.stringify({
    list,
  });
}

async function category(tid, pg, filter, extend) {
  if (pg <= 0) pg = 1;
  let link = url;

  if (extend.tag || tid) {
    link = `${url}${extend.tag || tid}?page=${pg}`;
  }

  const data = await request(link);
  const $ = load(data);
  const items = $("table tbody tr");
  const total = $("font-medium mx-1");

  let list = _.map(items, (item) => {
    const mainTitle = $(item).find("td h3").text().trim();
    const subTitle = $(item).find("td h4").text().trim();
    return {
      vod_id: $(item).find("td a")[0].attribs.href.split("/").pop(),
      vod_name: `${mainTitle} (${subTitle})`,
      vod_pic: $(item).find("img:first")[0].attribs["data-src"],
      vod_remarks: $($(item).find("td")[1]).text().trim(),
    };
  });

  return JSON.stringify({
    page: pg,
    pagecount: total[1] ? total[1].text().trim() : 1,
    limit: items.length,
    total: total[2] ? total[2].text().trim() : items.length,
    list,
  });
}

async function detail(id) {
  const data = JSON.parse(await request(`${url}/api/film/${id}`));
  let vod = {
    vod_id: data.movie.slug,
    vod_pic: data.movie.poster_url,
    vod_remarks: data.movie.episode_current,
    vod_name: `${data.movie.name} (${data.movie.original_name})`,
    vod_director: data.movie.director,
    vod_actor: data.movie.casts,
    vod_content: data.movie.description,
    vod_play_from: data.movie.episodes.map((e) => e.server_name).join("$$$"),
    vod_play_url: data.movie.episodes
      .map((e) => e.items.map((d) => `${d.name}$${d.m3u8}`).join("#"))
      .join("$$$"),
  };

  return JSON.stringify({
    list: [vod],
  });
}

async function play(flag, id, flags) {
  return JSON.stringify({
    parse: 0,
    url: id,
  });
}

async function search(wd, quick) {
  const data = await request(`${url}/tim-kiem?keyword=${wd.replace(" ", "+")}`);
  const $ = load(data);
  const items = $("table tbody tr");
  const total = $("font-medium mx-1");

  let list = _.map(items, (item) => {
    const mainTitle = $(item).find("td h3").text().trim();
    const subTitle = $(item).find("td h4").text().trim();
    return {
      vod_id: $(item).find("td a")[0].attribs.href.split("/").pop(),
      vod_name: `${mainTitle} (${subTitle})`,
      vod_pic: $(item).find("img:first")[0].attribs["data-src"],
      vod_remarks: $($(item).find("td")[1]).text().trim(),
    };
  });

  return JSON.stringify({
    page: total[0] ? total[0].text().trim() : 1,
    pagecount: total[1] ? total[1].text().trim() : 1,
    limit: items.length,
    total: total[2] ? total[2].text().trim() : items.length,
    list,
  });
}

export function __jsEvalReturn() {
  return {
    init: init,
    home: home,
    homeVod: homeVod,
    category: category,
    detail: detail,
    play: play,
    search: search,
  };
}
