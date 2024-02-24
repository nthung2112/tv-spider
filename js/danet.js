import { _ } from "./lib/cat.js";
import { showDateText } from "./lib/similarity.js";

let url = "https://danet.vn";
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
  const results = JSON.parse(
    await request(url + "/api/movie-playlists?limit=10&module_id=2&page=1")
  ).results;

  const classes = _.map(results, (item) => ({
    type_id: item.id,
    type_name: item.name,
  }));

  return JSON.stringify({
    class: classes,
    filters: {},
  });
}

async function homeVod() {
  const results = JSON.parse(
    await request(url + "/api/movie-playlists/133/movies?limit=20&page=1")
  ).results;

  const list = results.map((item) => {
    return {
      vod_id: item.uid,
      vod_name: `${item.title}`,
      vod_pic: item.poster,
      vod_remarks: item.quality,
    };
  });

  return JSON.stringify({
    list: list,
  });
}

async function category(tid, pg, filter, extend) {
  let matches = [];
  if (tid) {
    matches = JSON.parse(
      await request(`${url}/api/movie-playlists/${tid}/movies?limit=20&page=1`)
    ).results;
  }

  const total = matches.length;
  let list = matches.map((item) => {
    return {
      vod_id: item.uid,
      vod_name: item.title,
      vod_pic: item.poster,
      vod_remarks: item.quality,
    };
  });

  return JSON.stringify({
    page: 1,
    pagecount: 1,
    limit: total,
    total: total,
    list: list,
  });
}

async function detail(id) {
  const data = JSON.parse(await request(url + `/api/movies/${id}`));
  const episodes = JSON.parse(
    await request(url + `/api/movies/${id}/episodes?limit=50&page=1`)
  ).results;

  const vod = {
    vod_id: data.uid,
    vod_pic: data.poster,
    vod_name: data.title,
    vod_play_from: "Danet",
    vod_play_url: "",
    vod_director: _.map(data.movie_directors, (d) => d.name).join(","),
    vod_area: data.movie_country ? data.movie_country.name : "",
    vod_actor: "",
    vod_year: data.release_year,
    vod_content: data.summary,
  };

  const list = _.map(episodes, (item) => {
    return {
      ...vod,
      vod_play_url: `Danet$${data.uid}-${item.uid}$`,
    };
  });

  return JSON.stringify({
    list,
  });
}

async function play(flag, id, flags) {
  const [movieId, episodeId] = id.split("-");

  const streams = JSON.parse(
    await request(
      url + `/api/movies/${movieId}/episodes/${episodeId}/locations`
    )
  ).streams;

  const link = _.get(streams, "[0].file_location");
  return JSON.stringify({
    parse: 0,
    url: link,
  });
}

async function search(wd, quick) {
  const results = JSON.parse(
    await request(url + `/api/movies?limit=20&page=1&q=${wd}`)
  ).results;

  let list = _.map(results, (item) => {
    return {
      vod_id: item.uid,
      vod_name: item.title,
      vod_pic: item.poster,
      vod_remarks: item.quality,
    };
  });
  return JSON.stringify({
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
