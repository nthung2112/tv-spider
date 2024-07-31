import { load } from 'cheerio';
import { getRequest, lodashMap } from '../shared';

let url = 'https://phim1080.in';
let siteKey = '';
let siteType = 0;

function customGetRequest<T>(reqUrl: string) {
  return getRequest<T>(reqUrl, {
    referer: `${url}/loki`,
    'x-requested-with': 'XMLHttpRequest',
    Cookie: 'phimnhanh=%3D',
  });
}

async function parseVodListFromUrl(link: string): Promise<Stringified<CategoryData>> {
  const html = await customGetRequest<string>(link);
  const $ = load(html);
  const items = $('.tray-left .tray-item');
  const videos = lodashMap(items, (item) => {
    if (!item.attribs.id) return;
    const img = $(item).find('img:first')[0];
    return {
      vod_id: item.attribs.id.replace('film-id-', '').replace('film-id-', ''),
      vod_name: $(item).find('.tray-item-title').text().trim(),
      vod_pic: img.attribs['data-src'],
      vod_remarks: $(item).find('.tray-film-likes').text().trim(),
    };
  });

  const lastPage = $('.pagination li').eq(-2).text();
  const pgCount = lastPage ? parseInt(lastPage) : 1;
  const currentPage = $('.page-item.active').text();
  const limit = $('.pagination li').length;

  return JSON.stringify({
    page: parseInt(currentPage),
    pagecount: pgCount,
    limit,
    total: limit * pgCount,
    list: videos.filter((item) => !!item),
  });
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg: { skey: string; stype: number; ext?: string }): Promise<void> {
  siteKey = cfg.skey;
  siteType = cfg.stype;

  // Update domain changed
  const html = await customGetRequest<string>(`${url}`);
  const regex = /<meta\s+property="og:url"\s+content="([^"]*)"\s*\/>/;
  const match = html.match(regex);
  if (match) {
    url = match[1];
  }
}

async function home(filter: boolean): Promise<Stringified<HomeData>> {
  const dulieu = {
    'Bảng xếp hạng': '/bang-xep-hang',
    'Phim đề cử': '/phim-de-cu',
    'Phim lẻ': '/phim-le',
    'Phim bộ': '/phim-bo',
    'Chiếu rạp': '/phim-chieu-rap',
    'Hôm nay xem gì': '/hom-nay-xem-gi',
    'Thể loại': 'the-loai',
    'Quốc gia': 'quoc-gia',
  };

  const theloai = {
    'Hành động': '/the-loai/hanh-dong',
    'Phiêu lưu': '/the-loai/phieu-luu',
    'Kinh dị': '/the-loai/kinh-di',
    'Tình cảm': '/the-loai/tinh-cam',
    'Hoạt hình': '/the-loai/hoat-hinh',
    'Võ thuật': '/the-loai/vo-thuat',
    'Hài hước': '/the-loai/hai-huoc',
    'Tâm lý': '/the-loai/tam-ly',
    'Viễn tưởng': '/the-loai/vien-tuong',
    'Thần thoại': '/the-loai/than-thoai',
    'Chiến tranh': '/the-loai/chien-tranh',
    'Cổ trang': '/the-loai/co-trang',
    'Âm nhạc': '/the-loai/am-nhac',
    'Hình sự': '/the-loai/hinh-su',
    'TV Show': '/the-loai/tv-show',
    'Khoa học': '/the-loai/khoa-hoc',
    'Tài liệu': '/the-loai/tai-lieu',
    Khác: '/the-loai/other',
    'Lịch sử': '/the-loai/lich-su',
    'Gia đình': '/the-loai/gia-dinh',
    'Thể thao': '/the-loai/the-thao',
    'Kiếm hiệp': '/the-loai/kiem-hiep',
    'Kịch tính': '/the-loai/kich-tinh',
    'Bí ẩn': '/the-loai/bi-an',
    'Tiểu sử': '/the-loai/tieu-su',
    'Thanh xuân': '/the-loai/thanh-xuan',
    'Học đường': '/the-loai/hoc-duong',
    'Huyền huyễn': '/the-loai/huyen-huyen',
    'Tiên hiệp': '/the-loai/tien-hiep',
    'Đam mỹ': '/the-loai/dam-my',
    'Trinh thám': '/the-loai/trinh-tham',
    'Gay căng': '/the-loai/gay-can',
    'Động vật': '/the-loai/dong-vat',
  };

  const quocgia = {
    'Trung Quốc': '/phim-trung-quoc',
    'Hàn Quốc': '/phim-han-quoc',
    'Đài Loan': '/phim-dai-loan',
    Mỹ: '/phim-my',
    'Châu Âu': '/phim-chau-au',
    'Nhật Bản': '/phim-nhat-ban',
    'Hồng Kông': '/phim-hong-kong',
    'Thái Lan': '/phim-thai-lan',
    'Châu Á': '/phim-chau-a',
    'Ấn Độ': '/phim-an-do',
    Pháp: '/phim-phap',
    Anh: '/phim-anh',
    Canada: '/phim-canada',
    Đức: '/phim-duc',
    'Tây Ban Nha': '/phim-tay-ban-nha',
    Nga: '/phim-nga',
    Úc: '/phim-uc',
    Khác: '/phim-khac',
  };

  const classes = lodashMap(dulieu, (key, label) => ({
    id: key,
    name: label,
  }));

  let filterObj = {
    'the-loai': [
      {
        key: 'tag',
        init: '/the-loai/hanh-dong',
        name: 'Type',
        value: lodashMap(theloai, (key, label) => ({
          v: key,
          n: label,
        })),
      },
    ],
    'quoc-gia': [
      {
        key: 'tag',
        init: '/phim-han-quoc',
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
  return await parseVodListFromUrl(`${url}/hom-nay-xem-gi`);
}

async function category(
  tid: string,
  page: string,
  filter: boolean,
  extend: Record<string, string>
): Promise<Stringified<CategoryData>> {
  if (!page) page = '1';
  const pg = parseInt(page);
  const link = extend.tag || tid ? `${url}${extend.tag || tid}?page=${pg}` : url;

  return parseVodListFromUrl(link);
}

const decode_1080 = (e: string, t: number) => {
  let a = '';
  for (let i = 0; i < e.length; i++) {
    const r = e.charCodeAt(i);
    const o = r ^ t;
    a += String.fromCharCode(o);
  }
  return a;
};

async function detail(id: string): Promise<Stringified<VodData>> {
  const data = JSON.parse(await customGetRequest<string>(`${url}/api/v2/films/${id}`));
  const vod = {
    vod_id: id,
    vod_pic: data.poster,
    vod_remarks: data.time,
    vod_name: `${data.name} (${data.name_en || ''})`,
    vod_area: '',
    vod_lang: '',
    vod_actor: '',
    vod_year: data.year,
    vod_content: data.description,
    vod_play_from: 'Phim1080',
    vod_play_url: '',
  };

  const episodes = JSON.parse(
    await customGetRequest<string>(`${url}/api/v2/films/${id}/episodes?sort=name`)
  );

  vod.vod_play_url = episodes.data
    .map((d: any) => `${d.full_name}$${id}/episodes/${d.id}`)
    .join('#');

  return JSON.stringify({
    list: [vod],
  });
}

async function play(
  flag: string,
  urlId: string,
  vipFlags: string[]
): Promise<Stringified<PlayData>> {
  const data = JSON.parse(await customGetRequest<string>(`${url}/api/v2/films/${urlId}`));
  const result = data.sources.m3u8.opt ? decode_1080(data.sources.m3u8.opt, 69).trim() : '';
  return JSON.stringify({
    parse: 0,
    url: result,
  });
}

async function search(wd: string, quick?: boolean, pg?: string): Promise<Stringified<VodData>> {
  const videos = JSON.parse(await customGetRequest<string>(`${url}/api/v2/search?q=${wd}&limit=20`))
    .data as any[];

  const list = videos.map((item) => {
    return {
      vod_id: item.slug,
      vod_name: item.name,
      vod_pic: item.thumbnail,
      vod_remarks: item.time,
    };
  });

  return JSON.stringify({
    list,
  });
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
