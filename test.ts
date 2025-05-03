import "./src/wrapper/index.js";
import { __jsEvalReturn } from "./src/sites/thapcamtv.js";

var spider = __jsEvalReturn();

async function test() {
  var spType = "";
  var spVid = "";
  // spType = '';
  // spVid = '95873';

  await spider.init({ skey: "siteKey", stype: 0 });
  var home = JSON.parse(await spider.home(true));
  console.log("home", home);
  var homeVod = JSON.parse(await spider.homeVod());
  console.log("homeVod", homeVod);
  if (home.class && home.class.length > 0) {
    var page = JSON.parse(await spider.category(spType || home.class[0].id, "0", false, {}));
    console.log("page", page);
    if (page.list && page.list.length > 0) {
      for (const k in page.list) {
        if (k >= 2) break;
        var detail = JSON.parse(await spider.detail(spVid || page.list[k].vod_id));
        console.log(detail);
        if (detail.list && detail.list.length > 0) {
          var pFlag = detail.list[0].vod_play_from.split("$$$");
          var pUrls = detail.list[0].vod_play_url.split("$$$");
          if (pFlag.length > 0 && pUrls.length > 0) {
            for (const i in pFlag) {
              var flag = pFlag[i];
              var urls = pUrls[i].split("#");
              if (urls.length > 0) {
                var url = urls[0].split("$")[1];
                console.log(flag, url);
                var playUrl = await spider.play(flag, url, []);
                console.log(playUrl);
              }
            }
          }
        }
        if (spVid) break;
      }
    }
  }
  var search = JSON.parse(await spider.search("a"));
  console.log("search a", search);

  search = JSON.parse(await spider.search("new"));
  console.log("search new", search);
}

test();
