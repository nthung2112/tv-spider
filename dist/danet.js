var d="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";async function o(e,t){return(await req(e,{method:"get",headers:{"User-Agent":d,...t}})).content}var a="https://danet.vn",p="",c=0;async function g(e){p=e.skey,c=e.stype}async function y(){let t=JSON.parse(await o(`${a}/api/movie-playlists/133/movies?limit=20&page=1`)).results.map(n=>({vod_id:n.uid,vod_name:`${n.title}`,vod_pic:n.poster,vod_remarks:n.quality}));return JSON.stringify({list:t})}async function f(e){let n=JSON.parse(await o(`${a}/api/movie-playlists?limit=10&module_id=2&page=1`)).results.map(s=>({id:s.id,name:s.name}));return JSON.stringify({class:n,filters:{}})}async function m(e,t,n,s){let r=[];e&&(r=JSON.parse(await o(`${a}/api/movie-playlists/${e}/movies?limit=20&page=1`)).results);let i=r.length,u=r.map(l=>({vod_id:l.uid,vod_name:l.title,vod_pic:l.poster,vod_remarks:l.quality}));return JSON.stringify({page:1,pagecount:1,limit:i,total:i,list:u})}async function T(e){let t=JSON.parse(await o(`${a}/api/movies/${e}`)),n=JSON.parse(await o(`${a}/api/movies/${e}/episodes?limit=50&page=1`)).results,s={vod_id:t.uid,vod_pic:t.poster,vod_name:t.title,vod_play_from:"Danet",vod_play_url:"",vod_director:t.movie_directors.map(r=>r.name).join(","),vod_area:t.movie_country?t.movie_country.name:"",vod_actor:"",vod_year:t.release_year,vod_content:t.summary};return s.vod_play_url=n.map(r=>`${r.title}$${t.uid}-${r.uid}`).join("#"),JSON.stringify({list:[s]})}async function v(e,t,n){let[s,r]=t.split("-"),u=JSON.parse(await o(`${a}/api/movies/${s}/episodes/${r}/locations`)).streams?.[0]?.file_location;return JSON.stringify({parse:0,url:u})}async function _(e,t,n){let r=JSON.parse(await o(`${a}/api/movies?limit=20&page=1&q=${e}`)).results.map(i=>({vod_id:i.uid,vod_name:i.title,vod_pic:i.poster,vod_remarks:i.quality}));return JSON.stringify({list:r})}function S(){return{init:g,home:f,homeVod:y,category:m,detail:T,play:v,search:_}}export{S as __jsEvalReturn};