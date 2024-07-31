import { load } from 'cheerio';
import { getRequest, postRequest, lodashMap } from '../shared';

let url = 'https://ohitv.net';
let siteKey = '';
let siteType = 0;

// cfg = {skey: siteKey, ext: extend}
async function init(cfg: { skey: string; stype: number; ext?: string }): Promise<void> {
  siteKey = cfg.skey;
  siteType = cfg.stype;
}

async function parseVodListFromUrl(link: string): Promise<Stringified<CategoryData>> {
  const data = await getRequest<string>(link);
  const $ = load(data);
  const items = $('.content article');
  const videos = lodashMap(items, (item) => {
    const img = $(item).find('img')[0];
    return {
      vod_id: $(item).find('a')[0].attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs['data-src'] || img.attribs.src,
      vod_remarks: $(item).find('.quality').text().trim(),
    };
  });

  const lastPage = $('.pagination span').text().slice(10);
  const currentPage = $('.pagination .current').text();
  const pgCount = lastPage ? parseInt(lastPage) : 1;

  return JSON.stringify({
    page: Number(currentPage),
    pagecount: pgCount,
    limit: videos.length,
    total: videos.length * pgCount,
    list: videos,
  });
}

async function home(filter: boolean): Promise<Stringified<HomeData>> {
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

  const classes = lodashMap(dulieu, (key, label) => ({
    id: key,
    name: label,
  }));

  let filterObj = {
    '/the-loai': [
      {
        key: 'tag',
        init: '/the-loai/phim-hanh-dong',
        name: 'Type',
        value: lodashMap(theloai, (key, label) => ({
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
  return await parseVodListFromUrl(`${url}/trending`);
}

async function category(
  tid: string,
  page: string,
  filter: boolean,
  extend: Record<string, string>
): Promise<Stringified<CategoryData>> {
  if (!page) page = '1';
  const pg = parseInt(page);
  let link = url;
  if (extend.tag || tid) {
    link = `${url}${extend.tag || tid}/${pg > 1 ? `page/${pg}` : ''}`;
  }

  return await parseVodListFromUrl(link);
}

async function detail(id: string): Promise<Stringified<VodData>> {
  const html = await getRequest<string>(id);
  const $ = load(html);
  const postId =
    $('body')
      ?.attr('class')
      ?.split(' ')
      .find((item) => item.includes('postid')) || '';
  const firmId = postId.split('-')[1];
  const chapters = $('.episodios li a');
  const vod = {
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
    const items = lodashMap(chapters, (chapter, index) => {
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

async function play(flag: string, id: string, vipFlags: string[]): Promise<Stringified<PlayData>> {
  const html = await getRequest<string>(id);
  const $ = load(html);
  const postId =
    $('body')
      ?.attr('class')
      ?.split(' ')
      .find((item) => item.includes('postid')) || '';
  const firmId = postId.split('-')[1];
  const content = await postRequest<string>(`${url}/wp-admin/admin-ajax.php`, {
    action: 'doo_player_ajax',
    type: 'tv',
    post: firmId,
    nume: 1,
  });
  const movieId = JSON.parse(content).embed_url.match(/play%2F([^&]+)/)[1];

  const newHtml = await getRequest<string>(`https://storage-1.ohitv.org/play/${movieId}`);
  const playUrls = JSON.parse(newHtml.match(/JSON\.parse\('([^']*)'\);/)?.[1] || '{}');

  return JSON.stringify({
    parse: 0,
    url: playUrls[0].link,
  });
}

async function search(
  wd: string,
  quick?: boolean,
  pg?: string
): Promise<Stringified<CategoryData>> {
  return await parseVodListFromUrl(`${url}?s=${wd.replace(' ', '+')}`);
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
