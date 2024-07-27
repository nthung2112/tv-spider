import { load, _ } from './lib/cat.js';

let url = 'https://ohitv.net';
let siteKey = '';
let siteType = 0;

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

async function request(reqUrl, agentSp) {
  let res = await req(reqUrl, {
    method: 'get',
    headers: {
      'User-Agent': agentSp || UA,
      referer: url,
      'x-requested-with': 'XMLHttpRequest',
    },
  });
  return res.content;
}

async function requestPost(reqUrl, agentSp) {
  let res = await req(reqUrl, {
    method: 'post',
    headers: {
      'User-Agent': agentSp || UA,
      referer: url,
      'x-requested-with': 'XMLHttpRequest',
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
    'Phim thịnh hành': '/trending',
    'Phim bộ': '/phim-bo',
    'Phim lẻ': '/phim-le',
    'Phim HD': '/phim-hd',
    'Chiếu rạp': '/the-loai/phim-chieu-rap',
    'TOP IMDB': '/imdb',
    'Thể loại': '/the-loai',
    'Quốc gia': '/quoc-gia',
  };

  const theloai = {
    'Hành động': '/the-loai/phim-hanh-dong',
    'Võ thuật': '/the-loai/phim-vo-thuat',
    'Tình cảm': '/the-loai/phim-tinh-cam',
    'Tâm lý': '/the-loai/phim-tam-ly',
    Hài: '/the-loai/phim-hai-huoc',
    'Hoạt hình': '/the-loai/phim-hoat-hinh',
    Anime: '/the-loai/phim-anime',
    'Phiêu lưu': '/the-loai/phim-phieu-luu',
    'Kinh dị': '/the-loai/phim-ma-kinh-di',
    'Hình sự': '/the-loai/phim-hinh-su',
    'Chiến tranh': '/the-loai/phim-chien-tranh',
    'Thần thoại': '/the-loai/phim-than-thoai',
    'Viễn tưởng': '/the-loai/phim-vien-tuong',
    'Cổ trang': '/the-loai/phim-co-trang',
    'Âm nhạc': '/the-loai/phim-am-nhac',
    'Thể thao': '/the-loai/phim-the-thao',
    'Truyền hình': '/the-loai/phim-truyen-hinh',
    'TV Show': '/the-loai/game-show',
    'Khoa học': '/the-loai/phim-khoa-hoc',
  };

  const quocgia = {
    'Âu Mỹ': '/quoc-gia/phim-au-my',
    'Hàn Quốc': '/quoc-gia/phim-han-quoc',
    'Trung Quốc': '/quoc-gia/phim-trung-quoc',
    'Hồng Kông': '/quoc-gia/phim-hong-kong',
    'Đài Loan': '/quoc-gia/phim-dai-loan',
    'Nhật Bản': '/quoc-gia/phim-nhat-ban',
    'Ấn Độ': '/quoc-gia/phim-an-do',
    'Thái Lan': '/quoc-gia/phim-thai-lan',
    'Nước Khác': '/quoc-gia/phim-tong-hop',
  };

  const classes = _.map(dulieu, (key, label) => ({
    type_id: key,
    type_name: label,
  }));

  let filterObj = {
    '/the-loai': [
      {
        key: 'tag',
        init: '/the-loai/phim-hanh-dong',
        name: 'Type',
        value: _.map(theloai, (key, label) => ({
          v: key,
          n: label,
        })),
      },
    ],
    '/quoc-gia': [
      {
        key: 'tag',
        init: '/quoc-gia/phim-au-my',
        name: 'Type',
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
  const html = await request(`${url}/trending`);
  const $ = load(html);
  const items = $('.items article');
  const videos = _.map(items, (item) => {
    const img = $(item).find('img')[0];
    return {
      vod_id: $(item).find('h3 a')[0].attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs['data-src'] || img.attribs.src,
      vod_remarks: $(item).find('.quality').text().trim(),
    };
  });
  return JSON.stringify({
    list: videos,
  });
}

async function category(tid, pg, filter, extend) {
  if (pg <= 0) pg = 1;
  let link = url;
  if (extend.tag || tid) {
    link = `${url}${extend.tag || tid}/${pg > 1 ? `page/${pg}` : ''}`;
  }
  const html = await request(link);
  const $ = load(html);

  const items = $('.items article');
  const videos = _.map(items, (item) => {
    const img = $(item).find('img')[0];
    return {
      vod_id: $(item).find('h3 a')[0].attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs['data-src'] || img.attribs.src,
      vod_remarks: $(item).find('.quality').text().trim(),
    };
  });
  const lastPage = $('.pagination span').text().slice(10);
  const pgCount = lastPage ? parseInt(lastPage) : 1;
  return JSON.stringify({
    page: parseInt(pg),
    pagecount: pgCount,
    limit: videos.length,
    total: videos.length * pgCount,
    list: videos,
  });
}

async function detail(id) {
  const html = await request(id);
  const $ = load(html);
  const postId = $('body')
    .attr('class')
    .split(' ')
    .find((item) => item.includes('postid'));
  const firmId = postId.split('-')[1];
  const chapters = $('.episodios li a');
  let vod = {
    vod_id: firmId,
    vod_pic: $('#single .poster img')[0].attribs['data-src'],
    vod_remarks: '',
    vod_name: $('#single h1').text().trim(),
    vod_area: '',
    vod_lang: '',
    vod_actor: '',
    vod_director: '',
    vod_content: $('.wp-content').text(),
    vod_play_from: 'OHITV',
    vod_play_url: '',
  };

  if (chapters.length > 0) {
    const items = _.map(chapters, (chapter, index) => {
      return `${$(chapter).text()}$${chapter.attribs.href}`;
    });

    vod.vod_play_url = items.join('#');
  } else {
    vod.vod_play_url = `Full$${id}`;
  }

  return JSON.stringify({
    list: [vod],
  });
}

async function play(flag, id, flags) {
  const html = await request(id);
  const $ = load(html);
  const postId = $('body')
    .attr('class')
    .split(' ')
    .find((item) => item.includes('postid'));
  const firmId = postId.split('-')[1];
  let res = await req(`${url}/wp-admin/admin-ajax.php`, {
    method: 'post',
    data: {
      action: 'doo_player_ajax',
      type: 'tv',
      post: firmId,
      nume: 1,
    },
    postType: 'form',
  });
  const movieId = JSON.parse(res.content).embed_url.match(/play%2F([^&]+)/)[1];

  const newHtml = await request(`https://storage-1.ohitv.org/play/${movieId}`);
  const playUrls = JSON.parse(newHtml.match(/JSON\.parse\('([^']*)'\);/)[1]);

  return JSON.stringify({
    parse: 0,
    url: playUrls[0].link,
  });
}

async function search(wd, quick) {
  const html = await request(url + '?s=' + wd.replace(' ', '+'));
  const $ = load(html);
  const items = $('.search-page .result-item');
  let videos = _.map(items, (item) => {
    const img = $(item).find('img:first')[0];
    return {
      vod_id: $(item).find('a')[0].attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs['data-src'] || img.attribs.src,
      vod_remarks: $($(item).find('a span')[0]).text().trim(),
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
