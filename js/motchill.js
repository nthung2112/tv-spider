import { load, _ } from "./lib/cat.js";
import { stringToSlug } from "./lib/similarity.js";

let url = "https://motchill.info";
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
  let filterObj = {};
  const html = await request(url);
  const $ = load(html);
  const series = $("#header .container .menu-item");

  let classes = _.map(series, (s) => {
    const typeName = $(s).find("> a").text();
    const typeId = stringToSlug(typeName);
    const subcates = $(s).find(".sub-menu-item a");
    let tag = {
      key: "tag",
      name: "Type",
      value: _.map(subcates, (n) => {
        return { n: $(n).text(), v: $(n).attr("href") };
      }),
    };

    if (tag.value.length > 0) {
      tag["init"] = tag.value[0].v;
      filterObj[typeId] = [tag];
    }

    return {
      type_id: typeId,
      type_name: typeName,
    };
  });
  return JSON.stringify({
    class: classes,
    filters: filterObj,
  });
}

async function homeVod() {
  const html = await request(url);
  const $ = load(html);
  const items = $(".list-films > ul > li");
  const videos = _.map(items, (item) => {
    const img = $(item).find("img:first")[0];
    return {
      vod_id: $(item).find("a")[0].attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs.src,
      vod_remarks: $(item).find(".label").text().trim(),
    };
  });
  return JSON.stringify({
    list: videos,
  });
}

async function category(tid, pg, filter, extend) {
  if (pg <= 0) pg = 1;
  let link = url;
  if (extend.tag) {
    link = url + extend.tag.replace(".html", pg > 1 ? `-${pg}.html` : ".html");
  }
  const html = await request(link);
  const $ = load(html);
  const items = $(".list-films > ul > li > a");
  let videos = _.map(items, (item) => {
    const img = $(item).find("img:first")[0];
    return {
      vod_id: item.attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs.src,
      vod_remarks: "",
    };
  });
  const lastPage = $("#page-info .pagination > ul li").eq(-2).text();
  const pgCount = lastPage ? parseInt(lastPage) : 1;
  return JSON.stringify({
    page: parseInt(pg),
    pagecount: pgCount,
    limit: 24,
    total: 24 * pgCount,
    list: videos,
  });
}

async function detail(id) {
  const html = await request(url + id);
  const $ = load(html);
  let vod = {
    vod_id: id,
    vod_pic: $(".adspruce-streamlink img")[0].attribs["src"],
    vod_remarks: $("#div_average").text().trim(),
    vod_name: $(".adspruce-streamlink")[0].attribs["title"],
    vod_area: "",
    vod_lang: "",
    vod_actor: "",
    vod_content: $("#info-film .tab").text(),
    vod_play_from: "",
    vod_play_url: url + $(".btn-stream-link")[0].attribs["href"],
  };

  const children = $(".dinfo dl").children();
  for (let i = 0; i < children.length; i++) {
    const element = children.eq(i);
    if (element.text() === "Diễn viên:") {
      vod.vod_actor = children.eq(i + 1).text();
    }

    if (element.text() === "Quốc gia:") {
      vod.vod_area = children.eq(i + 1).text();
    }

    if (element.text() === "Ngôn ngữ:") {
      vod.vod_lang = children.eq(i + 1).text();
    }
  }

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
  const html = await request(url + "/search?q=" + wd);
  const $ = load(html);
  const items = $(".list-films > ul > li > a");
  let videos = _.map(items, (item) => {
    const img = $(item).find("img:first")[0];
    return {
      vod_id: item.attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs.src,
      vod_remarks: "",
    };
  });
  return JSON.stringify({
    list: videos,
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
