var S="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";async function u(t,e){return(await req(t,{method:"get",headers:{"User-Agent":S,...e}})).content}function x(t){if(Array.isArray(t))return!0;if(typeof t!="object"||!Object.prototype.hasOwnProperty.call(t,"length")||typeof t.length!="number"||t.length<0)return!1;for(let e=0;e<t.length;e++)if(!(e in t))return!1;return!0}function M(t,e){let n=[];for(let a=0;a<t.length;a++)n.push(e(t[a],a));return n}function y(t,e){return x(t)?M(t,e):Object.keys(t).map(n=>e(t[n],n))}function d(t){return t==null||typeof t=="object"&&Object.keys(t).length===0||typeof t=="string"&&t.trim().length===0}function m(t,e){return t.reduce((n,a)=>{let r=typeof e=="string"?_(a,e):e(a),s=n[r]||[];return s.push(a),{...n,[r]:s}},{})}function _(t,e,n){let a=e.split(/[.[\]]/).filter(Boolean).reduce((r,s)=>r?.[s],t);return a!==void 0?a:n}function h(t){return new Date(t).toLocaleString("vi-VN",{hour:"numeric",minute:"numeric",day:"2-digit",month:"2-digit"})}var g="https://api.thapcam.xyz",v="",w=0;async function O(t){v=t.skey,w=t.stype}async function L(t){let e=JSON.parse(await u(`${g}/api/match/featured/mt`)).data,n=JSON.parse(await u(`${g}/api/match/featured`)).data,a={},r=m(e,c=>n.some(l=>l.id===c.id)?"featured":c.match_status),s={featured:"N\u1ED5i b\u1EADt",live:"\u0110ang di\u1EC5n ra",pending:"S\u1EAFp di\u1EC5n ra"},i={featured:0,live:1,pending:2},o=Object.entries(r).map(([c,l])=>{let T=m(l.sort((p,b)=>b.tournament.priority-p.tournament.priority),"tournament.name"),f={key:"tag",name:"Type",init:"",value:Object.entries(T).map(([p])=>({n:p,v:p}))};return f.value.length>0&&(f.init=f.value[0].v,a[c]=[f]),{id:c,name:s[c]||"Kh\xF4ng x\xE1c \u0111\u1ECBnh"}}).sort((c,l)=>i[c.id]-i[l.id]);return JSON.stringify({class:o,filters:a})}async function R(){let e=JSON.parse(await u(g+"/api/match/featured")).data.sort((n,a)=>a.tournament.priority-n.tournament.priority).map(n=>({vod_id:n.id,vod_name:n.name,vod_pic:n.tournament.logo,vod_remarks:h(n.timestamp)}));return JSON.stringify({list:e})}async function P(t,e,n,a){let r=[];t==="featured"?r=JSON.parse(await u(g+"/api/match/featured")).data:(r=JSON.parse(await u(g+"/api/match/featured/mt")).data,t&&(r=r.filter(o=>o.match_status===t))),a.tag&&(r=r.filter(o=>o.tournament.name===a.tag));let s=r.length,i=r.sort((o,c)=>c.tournament.priority-o.tournament.priority).map(o=>({vod_id:o.id,vod_name:o.name,vod_pic:o.tournament.logo,vod_remarks:h(o.timestamp)}));return JSON.stringify({page:1,pagecount:1,limit:s,total:s,list:i})}async function C(t){let e=JSON.parse(await u(g+`/api/match/${t}`)).data,n=JSON.parse(await u(g+`/api/match/${t}/meta`)).data,a=e.away?`${e.scores.away} ${e.away.name}`:"",r=a?`${e.home.name} ${e.scores.home}`:`${e.home.name}`,s={vod_id:t,vod_pic:e.tournament.logo,vod_name:[r,a].filter(Boolean).join(" - "),vod_play_from:d(n.play_urls)?"":"ThapCamTV",vod_play_url:d(n.play_urls)?"":n.play_urls.map(i=>`${i.name}$${i.url}`).join("#"),vod_remarks:e.tournament.name,vod_actor:n.commentators?n.commentators.map(i=>i.name).join(" vs "):"",vod_content:e.name};return JSON.stringify({list:[s]})}async function j(t,e,n){return JSON.stringify({parse:0,url:e})}async function D(t,e,n){let r=JSON.parse(await u(g+"/api/match/featured/mt")).data.filter(i=>i.name.toLowerCase().includes(t.toLowerCase())),s=y(r,i=>({vod_id:i.id,vod_name:i.name,vod_pic:i.tournament.logo,vod_remarks:i.date}));return JSON.stringify({list:s})}function $(){return{init:O,home:L,homeVod:R,category:P,detail:C,play:j,search:D}}export{$ as __jsEvalReturn};
