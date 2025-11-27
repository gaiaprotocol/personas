(self.webpackChunkpersonas=self.webpackChunkpersonas||[]).push([[7294],{2731:(e,t)=>{const i=new Uint8Array(512),n=new Uint8Array(256);!function(){let e=1;for(let t=0;t<255;t++)i[t]=e,n[e]=t,e<<=1,256&e&&(e^=285);for(let e=255;e<512;e++)i[e]=i[e-255]}(),t.log=function(e){if(e<1)throw new Error("log("+e+")");return n[e]},t.exp=function(e){return i[e]},t.mul=function(e,t){return 0===e||0===t?0:i[n[e]+n[t]]}},6421:(e,t,i)=>{const n=i(56886).getSymbolSize;t.getRowColCoords=function(e){if(1===e)return[];const t=Math.floor(e/7)+2,i=n(e),o=145===i?26:2*Math.ceil((i-13)/(2*t-2)),r=[i-7];for(let e=1;e<t-1;e++)r[e]=r[e-1]-o;return r.push(6),r.reverse()},t.getPositions=function(e){const i=[],n=t.getRowColCoords(e),o=n.length;for(let e=0;e<o;e++)for(let t=0;t<o;t++)0===e&&0===t||0===e&&t===o-1||e===o-1&&0===t||i.push([n[e],n[t]]);return i}},7756:(e,t,i)=>{const n=i(56886).getSymbolSize;t.getPositions=function(e){const t=n(e);return[[0,0],[t-7,0],[0,t-7]]}},8820:e=>{function t(e){if(!e||e<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=e,this.data=new Uint8Array(e*e),this.reservedBit=new Uint8Array(e*e)}t.prototype.set=function(e,t,i,n){const o=e*this.size+t;this.data[o]=i,n&&(this.reservedBit[o]=!0)},t.prototype.get=function(e,t){return this.data[e*this.size+t]},t.prototype.xor=function(e,t,i){this.data[e*this.size+t]^=i},t.prototype.isReserved=function(e,t){return this.reservedBit[e*this.size+t]},e.exports=t},11433:(e,t,i)=>{const n=i(30208),o=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function r(e){this.mode=n.ALPHANUMERIC,this.data=e}r.getBitsLength=function(e){return 11*Math.floor(e/2)+e%2*6},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(e){let t;for(t=0;t+2<=this.data.length;t+=2){let i=45*o.indexOf(this.data[t]);i+=o.indexOf(this.data[t+1]),e.put(i,11)}this.data.length%2&&e.put(o.indexOf(this.data[t]),6)},e.exports=r},21878:(e,t)=>{t.isValid=function(e){return!isNaN(e)&&e>=1&&e<=40}},24357:(e,t,i)=>{const n=i(30208);function o(e){this.mode=n.NUMERIC,this.data=e.toString()}o.getBitsLength=function(e){return 10*Math.floor(e/3)+(e%3?e%3*3+1:0)},o.prototype.getLength=function(){return this.data.length},o.prototype.getBitsLength=function(){return o.getBitsLength(this.data.length)},o.prototype.write=function(e){let t,i,n;for(t=0;t+3<=this.data.length;t+=3)i=this.data.substr(t,3),n=parseInt(i,10),e.put(n,10);const o=this.data.length-t;o>0&&(i=this.data.substr(t),n=parseInt(i,10),e.put(n,3*o+1))},e.exports=o},24861:(e,t,i)=>{const n=i(30208),o=i(56886);function r(e){this.mode=n.KANJI,this.data=e}r.getBitsLength=function(e){return 13*e},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(e){let t;for(t=0;t<this.data.length;t++){let i=o.toSJIS(this.data[t]);if(i>=33088&&i<=40956)i-=33088;else{if(!(i>=57408&&i<=60351))throw new Error("Invalid SJIS character: "+this.data[t]+"\nMake sure your charset is UTF-8");i-=49472}i=192*(i>>>8&255)+(255&i),e.put(i,13)}},e.exports=r},25822:(e,t,i)=>{const n=i(69049),o=i(30208);function r(e){this.mode=o.BYTE,"string"==typeof e&&(e=n(e)),this.data=new Uint8Array(e)}r.getBitsLength=function(e){return 8*e},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(e){for(let t=0,i=this.data.length;t<i;t++)e.put(this.data[t],8)},e.exports=r},29801:(e,t,i)=>{const n=i(30208),o=i(24357),r=i(11433),s=i(25822),a=i(24861),l=i(67044),c=i(56886),d=i(76320);function u(e){return unescape(encodeURIComponent(e)).length}function h(e,t,i){const n=[];let o;for(;null!==(o=e.exec(i));)n.push({data:o[0],index:o.index,mode:t,length:o[0].length});return n}function p(e){const t=h(l.NUMERIC,n.NUMERIC,e),i=h(l.ALPHANUMERIC,n.ALPHANUMERIC,e);let o,r;return c.isKanjiModeEnabled()?(o=h(l.BYTE,n.BYTE,e),r=h(l.KANJI,n.KANJI,e)):(o=h(l.BYTE_KANJI,n.BYTE,e),r=[]),t.concat(i,o,r).sort(function(e,t){return e.index-t.index}).map(function(e){return{data:e.data,mode:e.mode,length:e.length}})}function g(e,t){switch(t){case n.NUMERIC:return o.getBitsLength(e);case n.ALPHANUMERIC:return r.getBitsLength(e);case n.KANJI:return a.getBitsLength(e);case n.BYTE:return s.getBitsLength(e)}}function w(e,t){let i;const l=n.getBestModeForData(e);if(i=n.from(t,l),i!==n.BYTE&&i.bit<l.bit)throw new Error('"'+e+'" cannot be encoded with mode '+n.toString(i)+".\n Suggested mode is: "+n.toString(l));switch(i!==n.KANJI||c.isKanjiModeEnabled()||(i=n.BYTE),i){case n.NUMERIC:return new o(e);case n.ALPHANUMERIC:return new r(e);case n.KANJI:return new a(e);case n.BYTE:return new s(e)}}t.fromArray=function(e){return e.reduce(function(e,t){return"string"==typeof t?e.push(w(t,null)):t.data&&e.push(w(t.data,t.mode)),e},[])},t.fromString=function(e,i){const o=function(e){const t=[];for(let i=0;i<e.length;i++){const o=e[i];switch(o.mode){case n.NUMERIC:t.push([o,{data:o.data,mode:n.ALPHANUMERIC,length:o.length},{data:o.data,mode:n.BYTE,length:o.length}]);break;case n.ALPHANUMERIC:t.push([o,{data:o.data,mode:n.BYTE,length:o.length}]);break;case n.KANJI:t.push([o,{data:o.data,mode:n.BYTE,length:u(o.data)}]);break;case n.BYTE:t.push([{data:o.data,mode:n.BYTE,length:u(o.data)}])}}return t}(p(e,c.isKanjiModeEnabled())),r=function(e,t){const i={},o={start:{}};let r=["start"];for(let s=0;s<e.length;s++){const a=e[s],l=[];for(let e=0;e<a.length;e++){const c=a[e],d=""+s+e;l.push(d),i[d]={node:c,lastCount:0},o[d]={};for(let e=0;e<r.length;e++){const s=r[e];i[s]&&i[s].node.mode===c.mode?(o[s][d]=g(i[s].lastCount+c.length,c.mode)-g(i[s].lastCount,c.mode),i[s].lastCount+=c.length):(i[s]&&(i[s].lastCount=c.length),o[s][d]=g(c.length,c.mode)+4+n.getCharCountIndicator(c.mode,t))}}r=l}for(let e=0;e<r.length;e++)o[r[e]].end=0;return{map:o,table:i}}(o,i),s=d.find_path(r.map,"start","end"),a=[];for(let e=1;e<s.length-1;e++)a.push(r.table[s[e]].node);return t.fromArray(a.reduce(function(e,t){const i=e.length-1>=0?e[e.length-1]:null;return i&&i.mode===t.mode?(e[e.length-1].data+=t.data,e):(e.push(t),e)},[]))},t.rawSplit=function(e){return t.fromArray(p(e,c.isKanjiModeEnabled()))}},30208:(e,t,i)=>{const n=i(21878),o=i(67044);t.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},t.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},t.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},t.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},t.MIXED={bit:-1},t.getCharCountIndicator=function(e,t){if(!e.ccBits)throw new Error("Invalid mode: "+e);if(!n.isValid(t))throw new Error("Invalid version: "+t);return t>=1&&t<10?e.ccBits[0]:t<27?e.ccBits[1]:e.ccBits[2]},t.getBestModeForData=function(e){return o.testNumeric(e)?t.NUMERIC:o.testAlphanumeric(e)?t.ALPHANUMERIC:o.testKanji(e)?t.KANJI:t.BYTE},t.toString=function(e){if(e&&e.id)return e.id;throw new Error("Invalid mode")},t.isValid=function(e){return e&&e.bit&&e.ccBits},t.from=function(e,i){if(t.isValid(e))return e;try{return function(e){if("string"!=typeof e)throw new Error("Param is not a string");switch(e.toLowerCase()){case"numeric":return t.NUMERIC;case"alphanumeric":return t.ALPHANUMERIC;case"kanji":return t.KANJI;case"byte":return t.BYTE;default:throw new Error("Unknown mode: "+e)}}(e)}catch(e){return i}}},31427:(e,t,i)=>{const n=i(56886),o=i(97518),r=i(49953),s=i(30208),a=i(21878),l=n.getBCHDigit(7973);function c(e,t){return s.getCharCountIndicator(e,t)+4}function d(e,t){let i=0;return e.forEach(function(e){const n=c(e.mode,t);i+=n+e.getBitsLength()}),i}t.from=function(e,t){return a.isValid(e)?parseInt(e,10):t},t.getCapacity=function(e,t,i){if(!a.isValid(e))throw new Error("Invalid QR Code version");void 0===i&&(i=s.BYTE);const r=8*(n.getSymbolTotalCodewords(e)-o.getTotalCodewordsCount(e,t));if(i===s.MIXED)return r;const l=r-c(i,e);switch(i){case s.NUMERIC:return Math.floor(l/10*3);case s.ALPHANUMERIC:return Math.floor(l/11*2);case s.KANJI:return Math.floor(l/13);case s.BYTE:default:return Math.floor(l/8)}},t.getBestVersionForData=function(e,i){let n;const o=r.from(i,r.M);if(Array.isArray(e)){if(e.length>1)return function(e,i){for(let n=1;n<=40;n++)if(d(e,n)<=t.getCapacity(n,i,s.MIXED))return n}(e,o);if(0===e.length)return 1;n=e[0]}else n=e;return function(e,i,n){for(let o=1;o<=40;o++)if(i<=t.getCapacity(o,n,e))return o}(n.mode,n.getLength(),o)},t.getEncodedBits=function(e){if(!a.isValid(e)||e<7)throw new Error("Invalid QR Code version");let t=e<<12;for(;n.getBCHDigit(t)-l>=0;)t^=7973<<n.getBCHDigit(t)-l;return e<<12|t}},47899:(e,t,i)=>{const n=i(92726);t.render=function(e,t,i){let o=i,r=t;void 0!==o||t&&t.getContext||(o=t,t=void 0),t||(r=function(){try{return document.createElement("canvas")}catch(e){throw new Error("You need to specify a canvas element")}}()),o=n.getOptions(o);const s=n.getImageWidth(e.modules.size,o),a=r.getContext("2d"),l=a.createImageData(s,s);return n.qrToImageData(l.data,e,o),function(e,t,i){e.clearRect(0,0,t.width,t.height),t.style||(t.style={}),t.height=i,t.width=i,t.style.height=i+"px",t.style.width=i+"px"}(a,r,s),a.putImageData(l,0,0),r},t.renderToDataURL=function(e,i,n){let o=n;void 0!==o||i&&i.getContext||(o=i,i=void 0),o||(o={});const r=t.render(e,i,o),s=o.type||"image/png",a=o.rendererOpts||{};return r.toDataURL(s,a.quality)}},49953:(e,t)=>{t.L={bit:1},t.M={bit:0},t.Q={bit:3},t.H={bit:2},t.isValid=function(e){return e&&void 0!==e.bit&&e.bit>=0&&e.bit<4},t.from=function(e,i){if(t.isValid(e))return e;try{return function(e){if("string"!=typeof e)throw new Error("Param is not a string");switch(e.toLowerCase()){case"l":case"low":return t.L;case"m":case"medium":return t.M;case"q":case"quartile":return t.Q;case"h":case"high":return t.H;default:throw new Error("Unknown EC Level: "+e)}}(e)}catch(e){return i}}},56756:(e,t,i)=>{const n=i(92726);function o(e,t){const i=e.a/255,n=t+'="'+e.hex+'"';return i<1?n+" "+t+'-opacity="'+i.toFixed(2).slice(1)+'"':n}function r(e,t,i){let n=e+t;return void 0!==i&&(n+=" "+i),n}t.render=function(e,t,i){const s=n.getOptions(t),a=e.modules.size,l=e.modules.data,c=a+2*s.margin,d=s.color.light.a?"<path "+o(s.color.light,"fill")+' d="M0 0h'+c+"v"+c+'H0z"/>':"",u="<path "+o(s.color.dark,"stroke")+' d="'+function(e,t,i){let n="",o=0,s=!1,a=0;for(let l=0;l<e.length;l++){const c=Math.floor(l%t),d=Math.floor(l/t);c||s||(s=!0),e[l]?(a++,l>0&&c>0&&e[l-1]||(n+=s?r("M",c+i,.5+d+i):r("m",o,0),o=0,s=!1),c+1<t&&e[l+1]||(n+=r("h",a),a=0)):o++}return n}(l,a,s.margin)+'"/>',h='viewBox="0 0 '+c+" "+c+'"',p='<svg xmlns="http://www.w3.org/2000/svg" '+(s.width?'width="'+s.width+'" height="'+s.width+'" ':"")+h+' shape-rendering="crispEdges">'+d+u+"</svg>\n";return"function"==typeof i&&i(null,p),p}},56886:(e,t)=>{let i;const n=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];t.getSymbolSize=function(e){if(!e)throw new Error('"version" cannot be null or undefined');if(e<1||e>40)throw new Error('"version" should be in range from 1 to 40');return 4*e+17},t.getSymbolTotalCodewords=function(e){return n[e]},t.getBCHDigit=function(e){let t=0;for(;0!==e;)t++,e>>>=1;return t},t.setToSJISFunction=function(e){if("function"!=typeof e)throw new Error('"toSJISFunc" is not a valid function.');i=e},t.isKanjiModeEnabled=function(){return void 0!==i},t.toSJIS=function(e){return i(e)}},64713:(e,t,i)=>{const n=i(2731);t.mul=function(e,t){const i=new Uint8Array(e.length+t.length-1);for(let o=0;o<e.length;o++)for(let r=0;r<t.length;r++)i[o+r]^=n.mul(e[o],t[r]);return i},t.mod=function(e,t){let i=new Uint8Array(e);for(;i.length-t.length>=0;){const e=i[0];for(let o=0;o<t.length;o++)i[o]^=n.mul(t[o],e);let o=0;for(;o<i.length&&0===i[o];)o++;i=i.slice(o)}return i},t.generateECPolynomial=function(e){let i=new Uint8Array([1]);for(let o=0;o<e;o++)i=t.mul(i,new Uint8Array([1,n.exp(o)]));return i}},67044:(e,t)=>{const i="[0-9]+";let n="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";n=n.replace(/u/g,"\\u");const o="(?:(?![A-Z0-9 $%*+\\-./:]|"+n+")(?:.|[\r\n]))+";t.KANJI=new RegExp(n,"g"),t.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),t.BYTE=new RegExp(o,"g"),t.NUMERIC=new RegExp(i,"g"),t.ALPHANUMERIC=new RegExp("[A-Z $%*+\\-./:]+","g");const r=new RegExp("^"+n+"$"),s=new RegExp("^"+i+"$"),a=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");t.testKanji=function(e){return r.test(e)},t.testNumeric=function(e){return s.test(e)},t.testAlphanumeric=function(e){return a.test(e)}},67294:(e,t,i)=>{"use strict";i.r(t),i.d(t,{W3mAllWalletsView:()=>at,W3mConnectingWcBasicView:()=>Ie,W3mDownloadsView:()=>ut});var n=i(86161),o=i(25707),r=i(26742),s=i(57019),a=i(88249),l=i(27508),c=i(52855),d=(i(60310),i(81413)),u=i(24376),h=i(36010),p=i(94702),g=i(90184),w=i(78508),f=(i(51479),function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s});let m=class extends n.WF{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=h.a.state.connectors,this.count=a.N.state.count,this.filteredCount=a.N.state.filteredWallets.length,this.isFetchingRecommendedWallets=a.N.state.isFetchingRecommendedWallets,this.unsubscribe.push(h.a.subscribeKey("connectors",e=>this.connectors=e),a.N.subscribeKey("count",e=>this.count=e),a.N.subscribeKey("filteredWallets",e=>this.filteredCount=e.length),a.N.subscribeKey("isFetchingRecommendedWallets",e=>this.isFetchingRecommendedWallets=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=this.connectors.find(e=>"walletConnect"===e.id),{allWallets:t}=s.H.state;if(!e||"HIDE"===t)return null;if("ONLY_MOBILE"===t&&!r.w.isMobile())return null;const i=a.N.state.featured.length,o=this.count+i,l=o<10?o:10*Math.floor(o/10),c=this.filteredCount>0?this.filteredCount:l;let h=`${c}`;this.filteredCount>0?h=`${this.filteredCount}`:c<o&&(h=`${c}+`);const g=p.x.hasAnyConnection(u.o.CONNECTOR_ID.WALLET_CONNECT);return n.qy`
      <wui-list-wallet
        name="Search Wallet"
        walletIcon="search"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${h}
        tagVariant="info"
        data-testid="all-wallets"
        tabIdx=${(0,d.J)(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        ?disabled=${g}
        size="sm"
      ></wui-list-wallet>
    `}onAllWallets(){g.E.sendEvent({type:"track",event:"CLICK_ALL_WALLETS"}),w.I.push("AllWallets",{redirectView:w.I.state.data?.redirectView})}};f([(0,o.MZ)()],m.prototype,"tabIdx",void 0),f([(0,o.wk)()],m.prototype,"connectors",void 0),f([(0,o.wk)()],m.prototype,"count",void 0),f([(0,o.wk)()],m.prototype,"filteredCount",void 0),f([(0,o.wk)()],m.prototype,"isFetchingRecommendedWallets",void 0),m=f([(0,c.EM)("w3m-all-wallets-widget")],m);var y=i(73337),b=i(27601),v=i(35306),x=i(56092);const $=c.AH`
  :host {
    margin-top: ${({spacing:e})=>e[1]};
  }
  wui-separator {
    margin: ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1)
      ${({spacing:e})=>e[2]} calc(${({spacing:e})=>e[3]} * -1);
    width: calc(100% + ${({spacing:e})=>e[3]} * 2);
  }
`;var k=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let C=class extends n.WF{constructor(){super(),this.unsubscribe=[],this.connectors=h.a.state.connectors,this.recommended=a.N.state.recommended,this.featured=a.N.state.featured,this.explorerWallets=a.N.state.explorerWallets,this.connections=p.x.state.connections,this.connectorImages=y.j.state.connectorImages,this.loadingTelegram=!1,this.unsubscribe.push(h.a.subscribeKey("connectors",e=>this.connectors=e),p.x.subscribeKey("connections",e=>this.connections=e),y.j.subscribeKey("connectorImages",e=>this.connectorImages=e),a.N.subscribeKey("recommended",e=>this.recommended=e),a.N.subscribeKey("featured",e=>this.featured=e),a.N.subscribeKey("explorerFilteredWallets",e=>{this.explorerWallets=e?.length?e:a.N.state.explorerWallets}),a.N.subscribeKey("explorerWallets",e=>{this.explorerWallets?.length||(this.explorerWallets=e)})),r.w.isTelegram()&&r.w.isIos()&&(this.loadingTelegram=!p.x.state.wcUri,this.unsubscribe.push(p.x.subscribeKey("wcUri",e=>this.loadingTelegram=!e)))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return n.qy`
      <wui-flex flexDirection="column" gap="2"> ${this.connectorListTemplate()} </wui-flex>
    `}mapConnectorsToExplorerWallets(e,t){return e.map(e=>{if("MULTI_CHAIN"===e.type&&e.connectors){const i=e.connectors.map(e=>e.id),n=e.connectors.map(e=>e.name),o=e.connectors.map(e=>e.info?.rdns),r=t?.find(e=>i.includes(e.id)||n.includes(e.name)||e.rdns&&(o.includes(e.rdns)||i.includes(e.rdns)));return e.explorerWallet=r??e.explorerWallet,e}const i=t?.find(t=>t.id===e.id||t.rdns===e.info?.rdns||t.name===e.name);return e.explorerWallet=i??e.explorerWallet,e})}processConnectorsByType(e,t=!0){const i=x.g.sortConnectorsByExplorerWallet([...e]);return t?i.filter(x.g.showConnector):i}connectorListTemplate(){const e=this.mapConnectorsToExplorerWallets(this.connectors,this.explorerWallets??[]),t=x.g.getConnectorsByType(e,this.recommended,this.featured),i=this.processConnectorsByType(t.announced.filter(e=>"walletConnect"!==e.id)),n=this.processConnectorsByType(t.injected),o=this.processConnectorsByType(t.multiChain.filter(e=>"WalletConnect"!==e.name),!1),s=t.custom,a=t.recent,l=this.processConnectorsByType(t.external.filter(e=>e.id!==u.o.CONNECTOR_ID.COINBASE_SDK)),c=t.recommended,d=t.featured,h=x.g.getConnectorTypeOrder({custom:s,recent:a,announced:i,injected:n,multiChain:o,recommended:c,featured:d,external:l}),p=this.connectors.find(e=>"walletConnect"===e.id),g=r.w.isMobile(),w=[];for(const e of h)switch(e){case"walletConnect":!g&&p&&w.push({kind:"connector",subtype:"walletConnect",connector:p});break;case"recent":x.g.getFilteredRecentWallets().forEach(e=>w.push({kind:"wallet",subtype:"recent",wallet:e}));break;case"injected":o.forEach(e=>w.push({kind:"connector",subtype:"multiChain",connector:e})),i.forEach(e=>w.push({kind:"connector",subtype:"announced",connector:e})),n.forEach(e=>w.push({kind:"connector",subtype:"injected",connector:e}));break;case"featured":d.forEach(e=>w.push({kind:"wallet",subtype:"featured",wallet:e}));break;case"custom":x.g.getFilteredCustomWallets(s??[]).forEach(e=>w.push({kind:"wallet",subtype:"custom",wallet:e}));break;case"external":l.forEach(e=>w.push({kind:"connector",subtype:"external",connector:e}));break;case"recommended":x.g.getCappedRecommendedWallets(c).forEach(e=>w.push({kind:"wallet",subtype:"recommended",wallet:e}));break;default:console.warn(`Unknown connector type: ${e}`)}return w.map((e,t)=>"connector"===e.kind?this.renderConnector(e,t):this.renderWallet(e,t))}renderConnector(e,t){const i=e.connector,o=b.$.getConnectorImage(i)||this.connectorImages[i?.imageId??""],r=(this.connections.get(i.chain)??[]).some(e=>v.y.isLowerCaseMatch(e.connectorId,i.id));let s,a;"multiChain"===e.subtype?(s="multichain",a="info"):"walletConnect"===e.subtype?(s="qr code",a="accent"):"injected"===e.subtype||"announced"===e.subtype?(s=r?"connected":"installed",a=r?"info":"success"):(s=void 0,a=void 0);const l=p.x.hasAnyConnection(u.o.CONNECTOR_ID.WALLET_CONNECT),c=("walletConnect"===e.subtype||"external"===e.subtype)&&l;return n.qy`
      <w3m-list-wallet
        displayIndex=${t}
        imageSrc=${(0,d.J)(o)}
        .installed=${!0}
        name=${i.name??"Unknown"}
        .tagVariant=${a}
        tagLabel=${(0,d.J)(s)}
        data-testid=${`wallet-selector-${i.id.toLowerCase()}`}
        size="sm"
        @click=${()=>this.onClickConnector(e)}
        tabIdx=${(0,d.J)(this.tabIdx)}
        ?disabled=${c}
        rdnsId=${(0,d.J)(i.explorerWallet?.rdns||void 0)}
        walletRank=${(0,d.J)(i.explorerWallet?.order)}
      >
      </w3m-list-wallet>
    `}onClickConnector(e){const t=w.I.state.data?.redirectView;return"walletConnect"===e.subtype?(h.a.setActiveConnector(e.connector),void(r.w.isMobile()?w.I.push("AllWallets"):w.I.push("ConnectingWalletConnect",{redirectView:t}))):"multiChain"===e.subtype?(h.a.setActiveConnector(e.connector),void w.I.push("ConnectingMultiChain",{redirectView:t})):"injected"===e.subtype?(h.a.setActiveConnector(e.connector),void w.I.push("ConnectingExternal",{connector:e.connector,redirectView:t,wallet:e.connector.explorerWallet})):"announced"===e.subtype?"walletConnect"===e.connector.id?void(r.w.isMobile()?w.I.push("AllWallets"):w.I.push("ConnectingWalletConnect",{redirectView:t})):void w.I.push("ConnectingExternal",{connector:e.connector,redirectView:t,wallet:e.connector.explorerWallet}):void w.I.push("ConnectingExternal",{connector:e.connector,redirectView:t})}renderWallet(e,t){const i=e.wallet,o=b.$.getWalletImage(i),r=p.x.hasAnyConnection(u.o.CONNECTOR_ID.WALLET_CONNECT),s=this.loadingTelegram,a="recent"===e.subtype?"recent":void 0,l="recent"===e.subtype?"info":void 0;return n.qy`
      <w3m-list-wallet
        displayIndex=${t}
        imageSrc=${(0,d.J)(o)}
        name=${i.name??"Unknown"}
        @click=${()=>this.onClickWallet(e)}
        size="sm"
        data-testid=${`wallet-selector-${i.id}`}
        tabIdx=${(0,d.J)(this.tabIdx)}
        ?loading=${s}
        ?disabled=${r}
        rdnsId=${(0,d.J)(i.rdns||void 0)}
        walletRank=${(0,d.J)(i.order)}
        tagLabel=${(0,d.J)(a)}
        .tagVariant=${l}
      >
      </w3m-list-wallet>
    `}onClickWallet(e){const t=w.I.state.data?.redirectView;if("featured"===e.subtype)return void h.a.selectWalletConnector(e.wallet);if("recent"===e.subtype){if(this.loadingTelegram)return;return void h.a.selectWalletConnector(e.wallet)}if("custom"===e.subtype){if(this.loadingTelegram)return;return void w.I.push("ConnectingWalletConnect",{wallet:e.wallet,redirectView:t})}if(this.loadingTelegram)return;const i=h.a.getConnector({id:e.wallet.id,rdns:e.wallet.rdns});i?w.I.push("ConnectingExternal",{connector:i,redirectView:t}):w.I.push("ConnectingWalletConnect",{wallet:e.wallet,redirectView:t})}};C.styles=$,k([(0,o.MZ)({type:Number})],C.prototype,"tabIdx",void 0),k([(0,o.wk)()],C.prototype,"connectors",void 0),k([(0,o.wk)()],C.prototype,"recommended",void 0),k([(0,o.wk)()],C.prototype,"featured",void 0),k([(0,o.wk)()],C.prototype,"explorerWallets",void 0),k([(0,o.wk)()],C.prototype,"connections",void 0),k([(0,o.wk)()],C.prototype,"connectorImages",void 0),k([(0,o.wk)()],C.prototype,"loadingTelegram",void 0),C=k([(0,c.EM)("w3m-connector-list")],C);var E=i(36875),R=i(60475),I=i(21871),T=i(84833),M=i(35940),P=i(88770),S=i(26109),A=i(43494),W=(i(97632),i(72081),i(67569));const L=W.AH`
  :host {
    flex: 1;
    height: 100%;
  }

  button {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    column-gap: ${({spacing:e})=>e[1]};
    color: ${({tokens:e})=>e.theme.textSecondary};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: transparent;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-active='true'] {
    color: ${({tokens:e})=>e.theme.textPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundTertiary};
  }

  button:hover:enabled:not([data-active='true']),
  button:active:enabled:not([data-active='true']) {
    wui-text,
    wui-icon {
      color: ${({tokens:e})=>e.theme.textPrimary};
    }
  }
`;var B=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};const N={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},O={lg:"md",md:"sm",sm:"sm"};let j=class extends n.WF{constructor(){super(...arguments),this.icon="mobile",this.size="md",this.label="",this.active=!1}render(){return n.qy`
      <button data-active=${this.active}>
        ${this.icon?n.qy`<wui-icon size=${O[this.size]} name=${this.icon}></wui-icon>`:""}
        <wui-text variant=${N[this.size]}> ${this.label} </wui-text>
      </button>
    `}};j.styles=[S.W5,S.fD,L],B([(0,o.MZ)()],j.prototype,"icon",void 0),B([(0,o.MZ)()],j.prototype,"size",void 0),B([(0,o.MZ)()],j.prototype,"label",void 0),B([(0,o.MZ)({type:Boolean})],j.prototype,"active",void 0),j=B([(0,A.E)("wui-tab-item")],j);const q=W.AH`
  :host {
    display: inline-flex;
    align-items: center;
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[32]};
    padding: ${({spacing:e})=>e["01"]};
    box-sizing: border-box;
  }

  :host([data-size='sm']) {
    height: 26px;
  }

  :host([data-size='md']) {
    height: 36px;
  }
`;var z=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let D=class extends n.WF{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.size="md",this.activeTab=0}render(){return this.dataset.size=this.size,this.tabs.map((e,t)=>{const i=t===this.activeTab;return n.qy`
        <wui-tab-item
          @click=${()=>this.onTabClick(t)}
          icon=${e.icon}
          size=${this.size}
          label=${e.label}
          ?active=${i}
          data-active=${i}
          data-testid="tab-${e.label?.toLowerCase()}"
        ></wui-tab-item>
      `})}onTabClick(e){this.activeTab=e,this.onTabChange(e)}};D.styles=[S.W5,S.fD,q],z([(0,o.MZ)({type:Array})],D.prototype,"tabs",void 0),z([(0,o.MZ)()],D.prototype,"onTabChange",void 0),z([(0,o.MZ)()],D.prototype,"size",void 0),z([(0,o.wk)()],D.prototype,"activeTab",void 0),D=z([(0,A.E)("wui-tabs")],D);var _=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let U=class extends n.WF{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=this.generateTabs();return n.qy`
      <wui-flex justifyContent="center" .padding=${["0","0","4","0"]}>
        <wui-tabs .tabs=${e} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){const e=this.platforms.map(e=>"browser"===e?{label:"Browser",icon:"extension",platform:"browser"}:"mobile"===e?{label:"Mobile",icon:"mobile",platform:"mobile"}:"qrcode"===e?{label:"Mobile",icon:"mobile",platform:"qrcode"}:"web"===e?{label:"Webapp",icon:"browser",platform:"web"}:"desktop"===e?{label:"Desktop",icon:"desktop",platform:"desktop"}:{label:"Browser",icon:"extension",platform:"unsupported"});return this.platformTabs=e.map(({platform:e})=>e),e}onTabChange(e){const t=this.platformTabs[e];t&&this.onSelectPlatfrom?.(t)}};_([(0,o.MZ)({type:Array})],U.prototype,"platforms",void 0),_([(0,o.MZ)()],U.prototype,"onSelectPlatfrom",void 0),U=_([(0,c.EM)("w3m-connecting-header")],U);var Z=i(68996);i(58461),i(51636),i(12851),i(45101);const F=W.AH`
  :host {
    display: block;
    width: 100px;
    height: 100px;
  }

  svg {
    width: 100px;
    height: 100px;
  }

  rect {
    fill: none;
    stroke: ${e=>e.colors.accent100};
    stroke-width: 3px;
    stroke-linecap: round;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`;var H=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let J=class extends n.WF{constructor(){super(...arguments),this.radius=36}render(){return this.svgLoaderTemplate()}svgLoaderTemplate(){const e=this.radius>50?50:this.radius,t=36-e,i=116+t,o=245+t,r=360+1.75*t;return n.qy`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect
          x="2"
          y="2"
          width="106"
          height="106"
          rx=${e}
          stroke-dasharray="${i} ${o}"
          stroke-dashoffset=${r}
        />
      </svg>
    `}};J.styles=[S.W5,F],H([(0,o.MZ)({type:Number})],J.prototype,"radius",void 0),J=H([(0,A.E)("wui-loading-thumbnail")],J),i(45090),i(91383),i(69807),i(19384);const K=W.AH`
  wui-flex {
    width: 100%;
    height: 52px;
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    padding-left: ${({spacing:e})=>e[3]};
    padding-right: ${({spacing:e})=>e[3]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[6]};
  }

  wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  wui-icon {
    width: 12px;
    height: 12px;
  }
`;var V=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let Y=class extends n.WF{constructor(){super(...arguments),this.disabled=!1,this.label="",this.buttonLabel=""}render(){return n.qy`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="inherit">${this.label}</wui-text>
        <wui-button variant="accent-secondary" size="sm">
          ${this.buttonLabel}
          <wui-icon name="chevronRight" color="inherit" size="inherit" slot="iconRight"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};Y.styles=[S.W5,S.fD,K],V([(0,o.MZ)({type:Boolean})],Y.prototype,"disabled",void 0),V([(0,o.MZ)()],Y.prototype,"label",void 0),V([(0,o.MZ)()],Y.prototype,"buttonLabel",void 0),Y=V([(0,A.E)("wui-cta-button")],Y);const Q=c.AH`
  :host {
    display: block;
    padding: 0 ${({spacing:e})=>e[5]} ${({spacing:e})=>e[5]};
  }
`;var X=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let G=class extends n.WF{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display="none",null;const{name:e,app_store:t,play_store:i,chrome_store:o,homepage:s}=this.wallet,a=r.w.isMobile(),l=r.w.isIos(),d=r.w.isAndroid(),u=[t,i,s,o].filter(Boolean).length>1,h=c.Zv.getTruncateString({string:e,charsStart:12,charsEnd:0,truncate:"end"});return u&&!a?n.qy`
        <wui-cta-button
          label=${`Don't have ${h}?`}
          buttonLabel="Get"
          @click=${()=>w.I.push("Downloads",{wallet:this.wallet})}
        ></wui-cta-button>
      `:!u&&s?n.qy`
        <wui-cta-button
          label=${`Don't have ${h}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:t&&l?n.qy`
        <wui-cta-button
          label=${`Don't have ${h}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:i&&d?n.qy`
        <wui-cta-button
          label=${`Don't have ${h}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display="none",null)}onAppStore(){this.wallet?.app_store&&r.w.openHref(this.wallet.app_store,"_blank")}onPlayStore(){this.wallet?.play_store&&r.w.openHref(this.wallet.play_store,"_blank")}onHomePage(){this.wallet?.homepage&&r.w.openHref(this.wallet.homepage,"_blank")}};G.styles=[Q],X([(0,o.MZ)({type:Object})],G.prototype,"wallet",void 0),G=X([(0,c.EM)("w3m-mobile-download-links")],G);const ee=c.AH`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-wallet-image {
    width: 56px;
    height: 56px;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e[1]} * -1);
    bottom: calc(${({spacing:e})=>e[1]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition-property: opacity, transform;
    transition-duration: ${({durations:e})=>e.lg};
    transition-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:e})=>e[4]};
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:e})=>e["ease-out-power-2"]} both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  w3m-mobile-download-links {
    padding: 0px;
    width: 100%;
  }
`;var te=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};class ie extends n.WF{constructor(){super(),this.wallet=w.I.state.data?.wallet,this.connector=w.I.state.data?.connector,this.timeout=void 0,this.secondaryBtnIcon="refresh",this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=b.$.getConnectorImage(this.connector)??b.$.getWalletImage(this.wallet),this.name=this.wallet?.name??this.connector?.name??"Wallet",this.isRetrying=!1,this.uri=p.x.state.wcUri,this.error=p.x.state.wcError,this.ready=!1,this.showRetry=!1,this.label=void 0,this.secondaryBtnLabel="Try again",this.secondaryLabel="Accept connection request in the wallet",this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(p.x.subscribeKey("wcUri",e=>{this.uri=e,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,this.onConnect?.())}),p.x.subscribeKey("wcError",e=>this.error=e)),(r.w.isTelegram()||r.w.isSafari())&&r.w.isIos()&&p.x.state.wcUri&&this.onConnect?.()}firstUpdated(){this.onAutoConnect?.(),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),p.x.setWcError(!1),clearTimeout(this.timeout)}render(){this.onRender?.(),this.onShowRetry();const e=this.error?"Connection can be declined if a previous request is still active":this.secondaryLabel;let t="";return this.label?t=this.label:(t=`Continue in ${this.name}`,this.error&&(t="Connection declined")),n.qy`
      <wui-flex
        data-error=${(0,d.J)(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="6"
      >
        <wui-flex gap="2" justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${(0,d.J)(this.imageSrc)}></wui-wallet-image>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="6"> <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["2","0","0","0"]}
        >
          <wui-text align="center" variant="lg-medium" color=${this.error?"error":"primary"}>
            ${t}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">${e}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel?n.qy`
                <wui-button
                  variant="neutral-secondary"
                  size="md"
                  ?disabled=${this.isRetrying||this.isLoading}
                  @click=${this.onTryAgain.bind(this)}
                  data-testid="w3m-connecting-widget-secondary-button"
                >
                  <wui-icon
                    color="inherit"
                    slot="iconLeft"
                    name=${this.secondaryBtnIcon}
                  ></wui-icon>
                  ${this.secondaryBtnLabel}
                </wui-button>
              `:null}
      </wui-flex>

      ${this.isWalletConnect?n.qy`
              <wui-flex .padding=${["0","5","5","5"]} justifyContent="center">
                <wui-link
                  @click=${this.onCopyUri}
                  variant="secondary"
                  icon="copy"
                  data-testid="wui-link-copy"
                >
                  Copy link
                </wui-link>
              </wui-flex>
            `:null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links></wui-flex>
      </wui-flex>
    `}onShowRetry(){if(this.error&&!this.showRetry){this.showRetry=!0;const e=this.shadowRoot?.querySelector("wui-button");e?.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"})}}onTryAgain(){p.x.setWcError(!1),this.onRetry?(this.isRetrying=!0,this.onRetry?.()):this.onConnect?.()}loaderTemplate(){const e=Z.W.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4;return n.qy`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(r.w.copyToClopboard(this.uri),I.P.showSuccess("Link copied"))}catch{I.P.showError("Failed to copy")}}}ie.styles=ee,te([(0,o.wk)()],ie.prototype,"isRetrying",void 0),te([(0,o.wk)()],ie.prototype,"uri",void 0),te([(0,o.wk)()],ie.prototype,"error",void 0),te([(0,o.wk)()],ie.prototype,"ready",void 0),te([(0,o.wk)()],ie.prototype,"showRetry",void 0),te([(0,o.wk)()],ie.prototype,"label",void 0),te([(0,o.wk)()],ie.prototype,"secondaryBtnLabel",void 0),te([(0,o.wk)()],ie.prototype,"secondaryLabel",void 0),te([(0,o.wk)()],ie.prototype,"isLoading",void 0),te([(0,o.MZ)({type:Boolean})],ie.prototype,"isMobile",void 0),te([(0,o.MZ)()],ie.prototype,"onRetry",void 0);let ne=class extends ie{constructor(){if(super(),!this.wallet)throw new Error("w3m-connecting-wc-browser: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),g.E.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:w.I.state.view}})}async onConnectProxy(){try{this.error=!1;const{connectors:e}=h.a.state,t=e.find(e=>"ANNOUNCED"===e.type&&e.info?.rdns===this.wallet?.rdns||"INJECTED"===e.type||e.name===this.wallet?.name);if(!t)throw new Error("w3m-connecting-wc-browser: No connector found");await p.x.connectExternal(t,t.chain),T.W.close(),g.E.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:"browser",name:this.wallet?.name||"Unknown",view:w.I.state.view,walletRank:this.wallet?.order}})}catch(e){e instanceof M.A&&e.originalName===E.RQ.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?g.E.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:e.message}}):g.E.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:e?.message??"Unknown"}}),this.error=!0}}};ne=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s}([(0,c.EM)("w3m-connecting-wc-browser")],ne);let oe=class extends ie{constructor(){if(super(),!this.wallet)throw new Error("w3m-connecting-wc-desktop: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),g.E.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"desktop",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:w.I.state.view}})}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onConnectProxy(){if(this.wallet?.desktop_link&&this.uri)try{this.error=!1;const{desktop_link:e,name:t}=this.wallet,{redirect:i,href:n}=r.w.formatNativeUrl(e,this.uri);p.x.setWcLinking({name:t,href:n}),p.x.setRecentWallet(this.wallet),r.w.openHref(i,"_blank")}catch{this.error=!0}}};oe=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s}([(0,c.EM)("w3m-connecting-wc-desktop")],oe);var re=i(62944),se=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let ae=class extends ie{constructor(){if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=s.H.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{if(this.wallet?.mobile_link&&this.uri)try{this.error=!1;const{mobile_link:e,link_mode:t,name:i}=this.wallet,{redirect:n,redirectUniversalLink:o,href:s}=r.w.formatNativeUrl(e,this.uri,t);this.redirectDeeplink=n,this.redirectUniversalLink=o,this.target=r.w.isIframe()?"_top":"_self",p.x.setWcLinking({name:i,href:s}),p.x.setRecentWallet(this.wallet),this.preferUniversalLinks&&this.redirectUniversalLink?r.w.openHref(this.redirectUniversalLink,this.target):r.w.openHref(this.redirectDeeplink,this.target)}catch(e){g.E.sendEvent({type:"track",event:"CONNECT_PROXY_ERROR",properties:{message:e instanceof Error?e.message:"Error parsing the deeplink",uri:this.uri,mobile_link:this.wallet.mobile_link,name:this.wallet.name}}),this.error=!0}},!this.wallet)throw new Error("w3m-connecting-wc-mobile: No wallet provided");this.secondaryBtnLabel="Open",this.secondaryLabel=re.oU.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.onHandleURI(),this.unsubscribe.push(p.x.subscribeKey("wcUri",()=>{this.onHandleURI()})),g.E.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"mobile",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:w.I.state.view}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onTryAgain(){p.x.setWcError(!1),this.onConnect?.()}};se([(0,o.wk)()],ae.prototype,"redirectDeeplink",void 0),se([(0,o.wk)()],ae.prototype,"redirectUniversalLink",void 0),se([(0,o.wk)()],ae.prototype,"target",void 0),se([(0,o.wk)()],ae.prototype,"preferUniversalLinks",void 0),se([(0,o.wk)()],ae.prototype,"isLoading",void 0),ae=se([(0,c.EM)("w3m-connecting-wc-mobile")],ae),i(36887);var le=i(87583);function ce(e,t,i){return e!==t&&(e-t<0?t-e:e-t)<=i+.1}const de={generate({uri:e,size:t,logoSize:i,padding:o=8,dotColor:r="var(--apkt-colors-black)"}){const s=[],a=function(e){const t=Array.prototype.slice.call(le.create(e,{errorCorrectionLevel:"Q"}).modules.data,0),i=Math.sqrt(t.length);return t.reduce((e,t,n)=>(n%i===0?e.push([t]):e[e.length-1].push(t))&&e,[])}(e),l=(t-2*o)/a.length,c=[{x:0,y:0},{x:1,y:0},{x:0,y:1}];c.forEach(({x:e,y:t})=>{const i=(a.length-7)*l*e+o,d=(a.length-7)*l*t+o,u=.45;for(let e=0;e<c.length;e+=1){const t=l*(7-2*e);s.push(n.JW`
            <rect
              fill=${2===e?"var(--apkt-colors-black)":"var(--apkt-colors-white)"}
              width=${0===e?t-10:t}
              rx= ${0===e?(t-10)*u:t*u}
              ry= ${0===e?(t-10)*u:t*u}
              stroke=${r}
              stroke-width=${0===e?10:0}
              height=${0===e?t-10:t}
              x= ${0===e?d+l*e+5:d+l*e}
              y= ${0===e?i+l*e+5:i+l*e}
            />
          `)}});const d=Math.floor((i+25)/l),u=a.length/2-d/2,h=a.length/2+d/2-1,p=[];a.forEach((e,t)=>{e.forEach((e,i)=>{if(a[t][i]&&!(t<7&&i<7||t>a.length-8&&i<7||t<7&&i>a.length-8||t>u&&t<h&&i>u&&i<h)){const e=t*l+l/2+o,n=i*l+l/2+o;p.push([e,n])}})});const g={};return p.forEach(([e,t])=>{g[e]?g[e]?.push(t):g[e]=[t]}),Object.entries(g).map(([e,t])=>{const i=t.filter(e=>t.every(t=>!ce(e,t,l)));return[Number(e),i]}).forEach(([e,t])=>{t.forEach(t=>{s.push(n.JW`<circle cx=${e} cy=${t} fill=${r} r=${l/2.5} />`)})}),Object.entries(g).filter(([e,t])=>t.length>1).map(([e,t])=>{const i=t.filter(e=>t.some(t=>ce(e,t,l)));return[Number(e),i]}).map(([e,t])=>{t.sort((e,t)=>e<t?-1:1);const i=[];for(const e of t){const t=i.find(t=>t.some(t=>ce(e,t,l)));t?t.push(e):i.push([e])}return[e,i.map(e=>[e[0],e[e.length-1]])]}).forEach(([e,t])=>{t.forEach(([t,i])=>{s.push(n.JW`
              <line
                x1=${e}
                x2=${e}
                y1=${t}
                y2=${i}
                stroke=${r}
                stroke-width=${l/1.25}
                stroke-linecap="round"
              />
            `)})}),s}},ue=W.AH`
  :host {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    width: 100%;
    height: 100%;
    background-color: ${({colors:e})=>e.white};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
  }

  :host {
    border-radius: ${({borderRadius:e})=>e[4]};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host([data-clear='true']) > wui-icon {
    display: none;
  }

  svg:first-child,
  wui-image,
  wui-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    box-shadow: inset 0 0 0 4px ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: ${({borderRadius:e})=>e[6]};
  }

  wui-image {
    width: 25%;
    height: 25%;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  wui-icon {
    width: 100%;
    height: 100%;
    color: #3396ff !important;
    transform: translateY(-50%) translateX(-50%) scale(0.25);
  }

  wui-icon > svg {
    width: inherit;
    height: inherit;
  }
`;var he=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let pe=class extends n.WF{constructor(){super(...arguments),this.uri="",this.size=500,this.theme="dark",this.imageSrc=void 0,this.alt=void 0,this.arenaClear=void 0,this.farcaster=void 0}render(){return this.dataset.theme=this.theme,this.dataset.clear=String(this.arenaClear),n.qy`<wui-flex
      alignItems="center"
      justifyContent="center"
      class="wui-qr-code"
      direction="column"
      gap="4"
      width="100%"
      style="height: 100%"
    >
      ${this.templateVisual()} ${this.templateSvg()}
    </wui-flex>`}templateSvg(){return n.JW`
      <svg viewBox="0 0 ${this.size} ${this.size}" width="100%" height="100%">
        ${de.generate({uri:this.uri,size:this.size,logoSize:this.arenaClear?0:this.size/4})}
      </svg>
    `}templateVisual(){return this.imageSrc?n.qy`<wui-image src=${this.imageSrc} alt=${this.alt??"logo"}></wui-image>`:this.farcaster?n.qy`<wui-icon
        class="farcaster"
        size="inherit"
        color="inherit"
        name="farcaster"
      ></wui-icon>`:n.qy`<wui-icon size="inherit" color="inherit" name="walletConnect"></wui-icon>`}};pe.styles=[S.W5,ue],he([(0,o.MZ)()],pe.prototype,"uri",void 0),he([(0,o.MZ)({type:Number})],pe.prototype,"size",void 0),he([(0,o.MZ)()],pe.prototype,"theme",void 0),he([(0,o.MZ)()],pe.prototype,"imageSrc",void 0),he([(0,o.MZ)()],pe.prototype,"alt",void 0),he([(0,o.MZ)({type:Boolean})],pe.prototype,"arenaClear",void 0),he([(0,o.MZ)({type:Boolean})],pe.prototype,"farcaster",void 0),pe=he([(0,A.E)("wui-qr-code")],pe);const ge=W.AH`
  :host {
    display: block;
    background: linear-gradient(
      90deg,
      ${({tokens:e})=>e.theme.foregroundSecondary} 0%,
      ${({tokens:e})=>e.theme.foregroundTertiary} 50%,
      ${({tokens:e})=>e.theme.foregroundSecondary} 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1s ease-in-out infinite;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;var we=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let fe=class extends n.WF{constructor(){super(...arguments),this.width="",this.height="",this.variant="default",this.rounded=!1}render(){return this.style.cssText=`\n      width: ${this.width};\n      height: ${this.height};\n    `,this.dataset.rounded=this.rounded?"true":"false",n.qy`<slot></slot>`}};fe.styles=[ge],we([(0,o.MZ)()],fe.prototype,"width",void 0),we([(0,o.MZ)()],fe.prototype,"height",void 0),we([(0,o.MZ)()],fe.prototype,"variant",void 0),we([(0,o.MZ)({type:Boolean})],fe.prototype,"rounded",void 0),fe=we([(0,A.E)("wui-shimmer")],fe),i(99530);const me=c.AH`
  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;var ye=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let be=class extends ie{constructor(){super(),this.basic=!1}firstUpdated(){this.basic||g.E.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet?.name??"WalletConnect",platform:"qrcode",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:w.I.state.view}})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.forEach(e=>e())}render(){return this.onRenderProxy(),n.qy`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["0","5","5","5"]}
        gap="5"
      >
        <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>
        <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0)}qrCodeTemplate(){if(!this.uri||!this.ready)return null;const e=this.wallet?this.wallet.name:void 0;return p.x.setWcLinking(void 0),p.x.setRecentWallet(this.wallet),n.qy` <wui-qr-code
      theme=${Z.W.state.themeMode}
      uri=${this.uri}
      imageSrc=${(0,d.J)(b.$.getWalletImage(this.wallet))}
      color=${(0,d.J)(Z.W.state.themeVariables["--w3m-qr-color"])}
      alt=${(0,d.J)(e)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`}copyTemplate(){const e=!this.uri||!this.ready;return n.qy`<wui-button
      .disabled=${e}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      Copy link
      <wui-icon size="sm" color="inherit" name="copy" slot="iconRight"></wui-icon>
    </wui-button>`}};be.styles=me,ye([(0,o.MZ)({type:Boolean})],be.prototype,"basic",void 0),be=ye([(0,c.EM)("w3m-connecting-wc-qrcode")],be);let ve=class extends n.WF{constructor(){if(super(),this.wallet=w.I.state.data?.wallet,!this.wallet)throw new Error("w3m-connecting-wc-unsupported: No wallet provided");g.E.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:w.I.state.view}})}render(){return n.qy`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="5"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${(0,d.J)(b.$.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="md-regular" color="primary">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};ve=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s}([(0,c.EM)("w3m-connecting-wc-unsupported")],ve);var xe=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let $e=class extends ie{constructor(){if(super(),this.isLoading=!0,!this.wallet)throw new Error("w3m-connecting-wc-web: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel="Open",this.secondaryLabel=re.oU.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.updateLoadingState(),this.unsubscribe.push(p.x.subscribeKey("wcUri",()=>{this.updateLoadingState()})),g.E.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"web",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:w.I.state.view}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){if(this.wallet?.webapp_link&&this.uri)try{this.error=!1;const{webapp_link:e,name:t}=this.wallet,{redirect:i,href:n}=r.w.formatUniversalUrl(e,this.uri);p.x.setWcLinking({name:t,href:n}),p.x.setRecentWallet(this.wallet),r.w.openHref(i,"_blank")}catch{this.error=!0}}};xe([(0,o.wk)()],$e.prototype,"isLoading",void 0),$e=xe([(0,c.EM)("w3m-connecting-wc-web")],$e);const ke=c.AH`
  :host([data-mobile-fullscreen='true']) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :host([data-mobile-fullscreen='true']) wui-ux-by-reown {
    margin-top: auto;
  }
`;var Ce=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let Ee=class extends n.WF{constructor(){super(),this.wallet=w.I.state.data?.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=Boolean(s.H.state.siwx),this.remoteFeatures=s.H.state.remoteFeatures,this.displayBranding=!0,this.basic=!1,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(s.H.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return s.H.state.enableMobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),n.qy`
      ${this.headerTemplate()}
      <div class="platform-container">${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding&&this.displayBranding?n.qy`<wui-ux-by-reown></wui-ux-by-reown>`:null}async initializeConnection(e=!1){if("browser"!==this.platform&&(!s.H.state.manualWCControl||e))try{const{wcPairingExpiry:t,status:i}=p.x.state,{redirectView:n}=w.I.state.data??{};if(e||s.H.state.enableEmbedded||r.w.isPairingExpired(t)||"connecting"===i){const e=p.x.getConnections(R.W.state.activeChain),t=this.remoteFeatures?.multiWallet,i=e.length>0;await p.x.connectWalletConnect({cache:"never"}),this.isSiwxEnabled||(i&&t?(w.I.replace("ProfileWallets"),I.P.showSuccess("New Wallet Added")):n?w.I.replace(n):T.W.close())}}catch(e){if(e instanceof Error&&e.message.includes("An error occurred when attempting to switch chain")&&!s.H.state.enableNetworkSwitch&&R.W.state.activeChain)return R.W.setActiveCaipNetwork(P.R.getUnsupportedNetwork(`${R.W.state.activeChain}:${R.W.state.activeCaipNetwork?.id}`)),void R.W.showUnsupportedChainUI();e instanceof M.A&&e.originalName===E.RQ.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?g.E.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:e.message}}):g.E.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:e?.message??"Unknown"}}),p.x.setWcError(!0),I.P.showError(e.message??"Connection error"),p.x.resetWcConnection(),w.I.goBack()}}determinePlatforms(){if(!this.wallet)return this.platforms.push("qrcode"),void(this.platform="qrcode");if(this.platform)return;const{mobile_link:e,desktop_link:t,webapp_link:i,injected:n,rdns:o}=this.wallet,a=n?.map(({injected_id:e})=>e).filter(Boolean),l=[...o?[o]:a??[]],c=!s.H.state.isUniversalProvider&&l.length,d=e,u=i,h=p.x.checkInstalled(l),g=c&&h,w=t&&!r.w.isMobile();g&&!R.W.state.noAdapters&&this.platforms.push("browser"),d&&this.platforms.push(r.w.isMobile()?"mobile":"qrcode"),u&&this.platforms.push("web"),w&&this.platforms.push("desktop"),g||!c||R.W.state.noAdapters||this.platforms.push("unsupported"),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case"browser":return n.qy`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case"web":return n.qy`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case"desktop":return n.qy`
          <w3m-connecting-wc-desktop .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-desktop>
        `;case"mobile":return n.qy`
          <w3m-connecting-wc-mobile isMobile .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-mobile>
        `;case"qrcode":return n.qy`<w3m-connecting-wc-qrcode ?basic=${this.basic}></w3m-connecting-wc-qrcode>`;default:return n.qy`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`}}headerTemplate(){return this.platforms.length>1?n.qy`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `:null}async onSelectPlatform(e){const t=this.shadowRoot?.querySelector("div");t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.platform=e,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}};Ee.styles=ke,Ce([(0,o.wk)()],Ee.prototype,"platform",void 0),Ce([(0,o.wk)()],Ee.prototype,"platforms",void 0),Ce([(0,o.wk)()],Ee.prototype,"isSiwxEnabled",void 0),Ce([(0,o.wk)()],Ee.prototype,"remoteFeatures",void 0),Ce([(0,o.MZ)({type:Boolean})],Ee.prototype,"displayBranding",void 0),Ce([(0,o.MZ)({type:Boolean})],Ee.prototype,"basic",void 0),Ee=Ce([(0,c.EM)("w3m-connecting-wc-view")],Ee);var Re=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let Ie=class extends n.WF{constructor(){super(),this.unsubscribe=[],this.isMobile=r.w.isMobile(),this.remoteFeatures=s.H.state.remoteFeatures,this.unsubscribe.push(s.H.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(this.isMobile){const{featured:e,recommended:t}=a.N.state,{customWallets:i}=s.H.state,o=l.i.getRecentWallets(),r=e.length||t.length||i?.length||o.length;return n.qy`<wui-flex flexDirection="column" gap="2" .margin=${["1","3","3","3"]}>
        ${r?n.qy`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return n.qy`<wui-flex flexDirection="column" .padding=${["0","0","4","0"]}>
        <w3m-connecting-wc-view ?basic=${!0} .displayBranding=${!1}></w3m-connecting-wc-view>
        <wui-flex flexDirection="column" .padding=${["0","3","0","3"]}>
          <w3m-all-wallets-widget></w3m-all-wallets-widget>
        </wui-flex>
      </wui-flex>
      ${this.reownBrandingTemplate()} `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding?n.qy` <wui-flex flexDirection="column" .padding=${["1","0","1","0"]}>
      <wui-ux-by-reown></wui-ux-by-reown>
    </wui-flex>`:null}};Re([(0,o.wk)()],Ie.prototype,"isMobile",void 0),Re([(0,o.wk)()],Ie.prototype,"remoteFeatures",void 0),Ie=Re([(0,c.EM)("w3m-connecting-wc-basic-view")],Ie);var Te=i(48015);const Me=W.AH`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  label {
    position: relative;
    display: inline-block;
    user-select: none;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({colors:e})=>e.neutrals300};
    border-radius: ${({borderRadius:e})=>e.round};
    border: 1px solid transparent;
    will-change: border;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  span:before {
    content: '';
    position: absolute;
    background-color: ${({colors:e})=>e.white};
    border-radius: 50%;
  }

  /* -- Sizes --------------------------------------------------------- */
  label[data-size='lg'] {
    width: 48px;
    height: 32px;
  }

  label[data-size='md'] {
    width: 40px;
    height: 28px;
  }

  label[data-size='sm'] {
    width: 32px;
    height: 22px;
  }

  label[data-size='lg'] > span:before {
    height: 24px;
    width: 24px;
    left: 4px;
    top: 3px;
  }

  label[data-size='md'] > span:before {
    height: 20px;
    width: 20px;
    left: 4px;
    top: 3px;
  }

  label[data-size='sm'] > span:before {
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
  }

  /* -- Focus states --------------------------------------------------- */
  input:focus-visible:not(:checked) + span,
  input:focus:not(:checked) + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    background-color: ${({tokens:e})=>e.theme.textTertiary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  input:focus-visible:checked + span,
  input:focus:checked + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Checked states --------------------------------------------------- */
  input:checked + span {
    background-color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  label[data-size='lg'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='md'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='sm'] > input:checked + span:before {
    transform: translateX(calc(100% - 7px));
  }

  /* -- Hover states ------------------------------------------------------- */
  label:hover > input:not(:checked):not(:disabled) + span {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  label:hover > input:checked:not(:disabled) + span {
    background-color: ${({colors:e})=>e.accent080};
  }

  /* -- Disabled state --------------------------------------------------- */
  label:has(input:disabled) {
    pointer-events: none;
    user-select: none;
  }

  input:not(:checked):disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:checked:disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:not(:checked):disabled + span::before {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  input:checked:disabled + span::before {
    background-color: ${({tokens:e})=>e.theme.textTertiary};
  }
`;var Pe=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let Se=class extends n.WF{constructor(){super(...arguments),this.inputElementRef=(0,Te._)(),this.checked=!1,this.disabled=!1,this.size="md"}render(){return n.qy`
      <label data-size=${this.size}>
        <input
          ${(0,Te.K)(this.inputElementRef)}
          type="checkbox"
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent("switchChange",{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};Se.styles=[S.W5,S.fD,Me],Pe([(0,o.MZ)({type:Boolean})],Se.prototype,"checked",void 0),Pe([(0,o.MZ)({type:Boolean})],Se.prototype,"disabled",void 0),Pe([(0,o.MZ)()],Se.prototype,"size",void 0),Se=Pe([(0,A.E)("wui-toggle")],Se);const Ae=W.AH`
  :host {
    height: auto;
  }

  :host > wui-flex {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`;var We=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let Le=class extends n.WF{constructor(){super(...arguments),this.checked=!1}render(){return n.qy`
      <wui-flex>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-toggle
          ?checked=${this.checked}
          size="sm"
          @switchChange=${this.handleToggleChange.bind(this)}
        ></wui-toggle>
      </wui-flex>
    `}handleToggleChange(e){e.stopPropagation(),this.checked=e.detail,this.dispatchSwitchEvent()}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent("certifiedSwitchChange",{detail:this.checked,bubbles:!0,composed:!0}))}};Le.styles=[S.W5,S.fD,Ae],We([(0,o.MZ)({type:Boolean})],Le.prototype,"checked",void 0),Le=We([(0,A.E)("wui-certified-switch")],Le);const Be=W.AH`
  :host {
    position: relative;
    width: 100%;
    display: inline-flex;
    flex-direction: column;
    gap: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.textPrimary};
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  .wui-input-text-container {
    position: relative;
    display: flex;
  }

  input {
    width: 100%;
    border-radius: ${({borderRadius:e})=>e[4]};
    color: inherit;
    background: transparent;
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[3]} ${({spacing:e})=>e[10]};
    font-size: ${({textSize:e})=>e.large};
    line-height: ${({typography:e})=>e["lg-regular"].lineHeight};
    letter-spacing: ${({typography:e})=>e["lg-regular"].letterSpacing};
    font-weight: ${({fontWeight:e})=>e.regular};
    font-family: ${({fontFamily:e})=>e.regular};
  }

  input[data-size='lg'] {
    padding: ${({spacing:e})=>e[4]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[4]} ${({spacing:e})=>e[10]};
  }

  @media (hover: hover) and (pointer: fine) {
    input:hover:enabled {
      border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    }
  }

  input:disabled {
    cursor: unset;
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
  }

  input::placeholder {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  input:focus:enabled {
    border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    -webkit-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
    -moz-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
    box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  div.wui-input-text-container:has(input:disabled) {
    opacity: 0.5;
  }

  wui-icon.wui-input-text-left-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    left: ${({spacing:e})=>e[4]};
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button.wui-input-text-submit-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: ${({borderRadius:e})=>e[2]};
    color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  button.wui-input-text-submit-button:disabled {
    opacity: 1;
  }

  button.wui-input-text-submit-button.loading wui-icon {
    animation: spin 1s linear infinite;
  }

  button.wui-input-text-submit-button:hover {
    background: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  input:has(+ .wui-input-text-submit-button) {
    padding-right: ${({spacing:e})=>e[12]};
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  /* -- Keyframes --------------------------------------------------- */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;var Ne=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let Oe=class extends n.WF{constructor(){super(...arguments),this.inputElementRef=(0,Te._)(),this.disabled=!1,this.loading=!1,this.placeholder="",this.type="text",this.value="",this.size="md"}render(){return n.qy` <div class="wui-input-text-container">
        ${this.templateLeftIcon()}
        <input
          data-size=${this.size}
          ${(0,Te.K)(this.inputElementRef)}
          data-testid="wui-input-text"
          type=${this.type}
          enterkeyhint=${(0,d.J)(this.enterKeyHint)}
          ?disabled=${this.disabled}
          placeholder=${this.placeholder}
          @input=${this.dispatchInputChangeEvent.bind(this)}
          @keydown=${this.onKeyDown}
          .value=${this.value||""}
        />
        ${this.templateSubmitButton()}
        <slot class="wui-input-text-slot"></slot>
      </div>
      ${this.templateError()} ${this.templateWarning()}`}templateLeftIcon(){return this.icon?n.qy`<wui-icon
        class="wui-input-text-left-icon"
        size="md"
        data-size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`:null}templateSubmitButton(){return this.onSubmit?n.qy`<button
        class="wui-input-text-submit-button ${this.loading?"loading":""}"
        @click=${this.onSubmit?.bind(this)}
        ?disabled=${this.disabled||this.loading}
      >
        ${this.loading?n.qy`<wui-icon name="spinner" size="md"></wui-icon>`:n.qy`<wui-icon name="chevronRight" size="md"></wui-icon>`}
      </button>`:null}templateError(){return this.errorText?n.qy`<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`:null}templateWarning(){return this.warningText?n.qy`<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`:null}dispatchInputChangeEvent(){this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value?.value,bubbles:!0,composed:!0}))}};Oe.styles=[S.W5,S.fD,Be],Ne([(0,o.MZ)()],Oe.prototype,"icon",void 0),Ne([(0,o.MZ)({type:Boolean})],Oe.prototype,"disabled",void 0),Ne([(0,o.MZ)({type:Boolean})],Oe.prototype,"loading",void 0),Ne([(0,o.MZ)()],Oe.prototype,"placeholder",void 0),Ne([(0,o.MZ)()],Oe.prototype,"type",void 0),Ne([(0,o.MZ)()],Oe.prototype,"value",void 0),Ne([(0,o.MZ)()],Oe.prototype,"errorText",void 0),Ne([(0,o.MZ)()],Oe.prototype,"warningText",void 0),Ne([(0,o.MZ)()],Oe.prototype,"onSubmit",void 0),Ne([(0,o.MZ)()],Oe.prototype,"size",void 0),Ne([(0,o.MZ)({attribute:!1})],Oe.prototype,"onKeyDown",void 0),Oe=Ne([(0,A.E)("wui-input-text")],Oe);const je=W.AH`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.iconDefault};
    cursor: pointer;
    padding: ${({spacing:e})=>e[2]};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
  }

  @media (hover: hover) {
    wui-icon:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }
`;var qe=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let ze=class extends n.WF{constructor(){super(...arguments),this.inputComponentRef=(0,Te._)(),this.inputValue=""}render(){return n.qy`
      <wui-input-text
        ${(0,Te.K)(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
        @inputChange=${this.onInputChange}
      >
        ${this.inputValue?n.qy`<wui-icon
              @click=${this.clearValue}
              color="inherit"
              size="sm"
              name="close"
            ></wui-icon>`:null}
      </wui-input-text>
    `}onInputChange(e){this.inputValue=e.detail||""}clearValue(){const e=this.inputComponentRef.value,t=e?.inputElementRef.value;t&&(t.value="",this.inputValue="",t.focus(),t.dispatchEvent(new Event("input")))}};ze.styles=[S.W5,je],qe([(0,o.MZ)()],ze.prototype,"inputValue",void 0),ze=qe([(0,A.E)("wui-search-bar")],ze);const De=n.JW`<svg  viewBox="0 0 48 54" fill="none">
  <path
    d="M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z"
  />
</svg>`,_e=W.AH`
  :host {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 104px;
    width: 104px;
    row-gap: ${({spacing:e})=>e[2]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    -webkit-clip-path: var(--apkt-path-network);
    clip-path: var(--apkt-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: ${({tokens:e})=>e.theme.foregroundSecondary};
    stroke-width: 1px;
  }

  @media (max-width: 350px) {
    :host {
      width: 100%;
    }
  }
`;var Ue=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let Ze=class extends n.WF{constructor(){super(...arguments),this.type="wallet"}render(){return n.qy`
      ${this.shimmerTemplate()}
      <wui-shimmer width="80px" height="20px"></wui-shimmer>
    `}shimmerTemplate(){return"network"===this.type?n.qy` <wui-shimmer data-type=${this.type} width="48px" height="54px"></wui-shimmer>
        ${De}`:n.qy`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}};Ze.styles=[S.W5,S.fD,_e],Ue([(0,o.MZ)()],Ze.prototype,"type",void 0),Ze=Ue([(0,A.E)("wui-card-select-loader")],Ze);var Fe=i(63612);const He=n.AH`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`;var Je=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let Ke=class extends n.WF{render(){return this.style.cssText=`\n      grid-template-rows: ${this.gridTemplateRows};\n      grid-template-columns: ${this.gridTemplateColumns};\n      justify-items: ${this.justifyItems};\n      align-items: ${this.alignItems};\n      justify-content: ${this.justifyContent};\n      align-content: ${this.alignContent};\n      column-gap: ${this.columnGap&&`var(--apkt-spacing-${this.columnGap})`};\n      row-gap: ${this.rowGap&&`var(--apkt-spacing-${this.rowGap})`};\n      gap: ${this.gap&&`var(--apkt-spacing-${this.gap})`};\n      padding-top: ${this.padding&&Fe.Z.getSpacingStyles(this.padding,0)};\n      padding-right: ${this.padding&&Fe.Z.getSpacingStyles(this.padding,1)};\n      padding-bottom: ${this.padding&&Fe.Z.getSpacingStyles(this.padding,2)};\n      padding-left: ${this.padding&&Fe.Z.getSpacingStyles(this.padding,3)};\n      margin-top: ${this.margin&&Fe.Z.getSpacingStyles(this.margin,0)};\n      margin-right: ${this.margin&&Fe.Z.getSpacingStyles(this.margin,1)};\n      margin-bottom: ${this.margin&&Fe.Z.getSpacingStyles(this.margin,2)};\n      margin-left: ${this.margin&&Fe.Z.getSpacingStyles(this.margin,3)};\n    `,n.qy`<slot></slot>`}};Ke.styles=[S.W5,He],Je([(0,o.MZ)()],Ke.prototype,"gridTemplateRows",void 0),Je([(0,o.MZ)()],Ke.prototype,"gridTemplateColumns",void 0),Je([(0,o.MZ)()],Ke.prototype,"justifyItems",void 0),Je([(0,o.MZ)()],Ke.prototype,"alignItems",void 0),Je([(0,o.MZ)()],Ke.prototype,"justifyContent",void 0),Je([(0,o.MZ)()],Ke.prototype,"alignContent",void 0),Je([(0,o.MZ)()],Ke.prototype,"columnGap",void 0),Je([(0,o.MZ)()],Ke.prototype,"rowGap",void 0),Je([(0,o.MZ)()],Ke.prototype,"gap",void 0),Je([(0,o.MZ)()],Ke.prototype,"padding",void 0),Je([(0,o.MZ)()],Ke.prototype,"margin",void 0),Ke=Je([(0,A.E)("wui-grid")],Ke);var Ve=i(65042);const Ye=c.AH`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[0]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: clamp(0px, ${({borderRadius:e})=>e[4]}, 20px);
    transition:
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textPrimary};
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:disabled > wui-flex > wui-text {
    color: ${({tokens:e})=>e.core.glass010};
  }

  [data-selected='true'] {
    background-color: ${({colors:e})=>e.accent020};
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: ${({colors:e})=>e.accent010};
    }
  }

  [data-selected='true']:active:enabled {
    background-color: ${({colors:e})=>e.accent010};
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`;var Qe=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let Xe=class extends n.WF{constructor(){super(),this.observer=new IntersectionObserver(()=>{}),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.isImpressed=!1,this.explorerId="",this.walletQuery="",this.certified=!1,this.displayIndex=0,this.wallet=void 0,this.observer=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting?(this.visible=!0,this.fetchImageSrc(),this.sendImpressionEvent()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){const e="certified"===this.wallet?.badge_type;return n.qy`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="1">
          <wui-text
            variant="md-regular"
            color="inherit"
            class=${(0,d.J)(e?"certified":void 0)}
            >${this.wallet?.name}</wui-text
          >
          ${e?n.qy`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){return!this.visible&&!this.imageSrc||this.imageLoading?this.shimmerTemplate():n.qy`
      <wui-wallet-image
        size="lg"
        imageSrc=${(0,d.J)(this.imageSrc)}
        name=${(0,d.J)(this.wallet?.name)}
        .installed=${this.wallet?.installed??!1}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `}shimmerTemplate(){return n.qy`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}async fetchImageSrc(){this.wallet&&(this.imageSrc=b.$.getWalletImage(this.wallet),this.imageSrc||(this.imageLoading=!0,this.imageSrc=await b.$.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}sendImpressionEvent(){this.wallet&&!this.isImpressed&&(this.isImpressed=!0,g.E.sendWalletImpressionEvent({name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.explorerId,view:w.I.state.view,query:this.walletQuery,certified:this.certified,displayIndex:this.displayIndex}))}};Xe.styles=Ye,Qe([(0,o.wk)()],Xe.prototype,"visible",void 0),Qe([(0,o.wk)()],Xe.prototype,"imageSrc",void 0),Qe([(0,o.wk)()],Xe.prototype,"imageLoading",void 0),Qe([(0,o.wk)()],Xe.prototype,"isImpressed",void 0),Qe([(0,o.MZ)()],Xe.prototype,"explorerId",void 0),Qe([(0,o.MZ)()],Xe.prototype,"walletQuery",void 0),Qe([(0,o.MZ)()],Xe.prototype,"certified",void 0),Qe([(0,o.MZ)()],Xe.prototype,"displayIndex",void 0),Qe([(0,o.MZ)({type:Object})],Xe.prototype,"wallet",void 0),Xe=Qe([(0,c.EM)("w3m-all-wallets-list-item")],Xe);const Ge=c.AH`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  w3m-all-wallets-list-item {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-inout-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-loading-spinner {
    padding-top: ${({spacing:e})=>e[4]};
    padding-bottom: ${({spacing:e})=>e[4]};
    justify-content: center;
    grid-column: 1 / span 4;
  }
`;var et=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};const tt="local-paginator";let it=class extends n.WF{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!a.N.state.wallets.length,this.wallets=a.N.state.wallets,this.recommended=a.N.state.recommended,this.featured=a.N.state.featured,this.filteredWallets=a.N.state.filteredWallets,this.mobileFullScreen=s.H.state.enableMobileFullScreen,this.unsubscribe.push(a.N.subscribeKey("wallets",e=>this.wallets=e),a.N.subscribeKey("recommended",e=>this.recommended=e),a.N.subscribeKey("featured",e=>this.featured=e),a.N.subscribeKey("filteredWallets",e=>this.filteredWallets=e))}firstUpdated(){this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.paginationObserver?.disconnect()}render(){return this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),n.qy`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${["0","3","3","3"]}
        gap="2"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){this.loading=!0;const e=this.shadowRoot?.querySelector("wui-grid");e&&(await a.N.fetchWalletsByPage({page:1}),await e.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.loading=!1,e.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}shimmerTemplate(e,t){return[...Array(e)].map(()=>n.qy`
        <wui-card-select-loader type="wallet" id=${(0,d.J)(t)}></wui-card-select-loader>
      `)}getWallets(){const e=[...this.featured,...this.recommended];this.filteredWallets?.length>0?e.push(...this.filteredWallets):e.push(...this.wallets);const t=r.w.uniqueBy(e,"id"),i=Ve.A.markWalletsAsInstalled(t);return Ve.A.markWalletsWithDisplayIndex(i)}walletsTemplate(){return this.getWallets().map((e,t)=>n.qy`
        <w3m-all-wallets-list-item
          data-testid="wallet-search-item-${e.id}"
          @click=${()=>this.onConnectWallet(e)}
          .wallet=${e}
          explorerId=${e.id}
          certified=${"certified"===this.badge}
          displayIndex=${t}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){const{wallets:e,recommended:t,featured:i,count:n,mobileFilteredOutWalletsLength:o}=a.N.state,r=window.innerWidth<352?3:4,s=e.length+t.length;let l=Math.ceil(s/r)*r-s+r;return l-=e.length?i.length%r:0,0===n&&i.length>0?null:0===n||[...i,...e,...t].length<n-(o??0)?this.shimmerTemplate(l,tt):null}createPaginationObserver(){const e=this.shadowRoot?.querySelector(`#${tt}`);e&&(this.paginationObserver=new IntersectionObserver(([e])=>{if(e?.isIntersecting&&!this.loading){const{page:e,count:t,wallets:i}=a.N.state;i.length<t&&a.N.fetchWalletsByPage({page:e+1})}}),this.paginationObserver.observe(e))}onConnectWallet(e){h.a.selectWalletConnector(e)}};it.styles=Ge,et([(0,o.wk)()],it.prototype,"loading",void 0),et([(0,o.wk)()],it.prototype,"wallets",void 0),et([(0,o.wk)()],it.prototype,"recommended",void 0),et([(0,o.wk)()],it.prototype,"featured",void 0),et([(0,o.wk)()],it.prototype,"filteredWallets",void 0),et([(0,o.wk)()],it.prototype,"badge",void 0),et([(0,o.wk)()],it.prototype,"mobileFullScreen",void 0),it=et([(0,c.EM)("w3m-all-wallets-list")],it),i(20880);const nt=n.AH`
  wui-grid,
  wui-loading-spinner,
  wui-flex {
    height: 360px;
  }

  wui-grid {
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
    height: auto;
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;var ot=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let rt=class extends n.WF{constructor(){super(...arguments),this.prevQuery="",this.prevBadge=void 0,this.loading=!0,this.mobileFullScreen=s.H.state.enableMobileFullScreen,this.query=""}render(){return this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),this.onSearch(),this.loading?n.qy`<wui-loading-spinner color="accent-primary"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){this.query.trim()===this.prevQuery.trim()&&this.badge===this.prevBadge||(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await a.N.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){const{search:e}=a.N.state,t=Ve.A.markWalletsAsInstalled(e);return e.length?n.qy`
      <wui-grid
        data-testid="wallet-list"
        .padding=${["0","3","3","3"]}
        rowGap="4"
        columngap="2"
        justifyContent="space-between"
      >
        ${t.map((e,t)=>n.qy`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(e)}
              .wallet=${e}
              data-testid="wallet-search-item-${e.id}"
              explorerId=${e.id}
              certified=${"certified"===this.badge}
              walletQuery=${this.query}
              displayIndex=${t}
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `:n.qy`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="3"
          flexDirection="column"
        >
          <wui-icon-box size="lg" color="default" icon="wallet"></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="secondary" variant="md-medium">
            No Wallet found
          </wui-text>
        </wui-flex>
      `}onConnectWallet(e){h.a.selectWalletConnector(e)}};rt.styles=nt,ot([(0,o.wk)()],rt.prototype,"loading",void 0),ot([(0,o.wk)()],rt.prototype,"mobileFullScreen",void 0),ot([(0,o.MZ)()],rt.prototype,"query",void 0),ot([(0,o.MZ)()],rt.prototype,"badge",void 0),rt=ot([(0,c.EM)("w3m-all-wallets-search")],rt);var st=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let at=class extends n.WF{constructor(){super(...arguments),this.search="",this.badge=void 0,this.onDebouncedSearch=r.w.debounce(e=>{this.search=e})}render(){const e=this.search.length>=2;return n.qy`
      <wui-flex .padding=${["1","3","3","3"]} gap="2" alignItems="center">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${"certified"===this.badge}
          @certifiedSwitchChange=${this.onCertifiedSwitchChange.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${e||this.badge?n.qy`<w3m-all-wallets-search
            query=${this.search}
            .badge=${this.badge}
          ></w3m-all-wallets-search>`:n.qy`<w3m-all-wallets-list .badge=${this.badge}></w3m-all-wallets-list>`}
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}onCertifiedSwitchChange(e){e.detail?(this.badge="certified",I.P.showSvg("Only WalletConnect certified",{icon:"walletConnectBrown",iconColor:"accent-100"})):this.badge=void 0}qrButtonTemplate(){return r.w.isMobile()?n.qy`
        <wui-icon-box
          size="xl"
          iconSize="xl"
          color="accent-primary"
          icon="qrCode"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){w.I.push("ConnectingWalletConnect")}};st([(0,o.wk)()],at.prototype,"search",void 0),st([(0,o.wk)()],at.prototype,"badge",void 0),at=st([(0,c.EM)("w3m-all-wallets-view")],at);const lt=W.AH`
  :host {
    width: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({spacing:e})=>e[3]};
    width: 100%;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      scale ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, scale;
  }

  wui-text {
    text-transform: capitalize;
  }

  wui-image {
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var ct=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let dt=class extends n.WF{constructor(){super(...arguments),this.imageSrc="google",this.loading=!1,this.disabled=!1,this.rightIcon=!0,this.rounded=!1,this.fullSize=!1}render(){return this.dataset.rounded=this.rounded?"true":"false",n.qy`
      <button
        ?disabled=${!!this.loading||Boolean(this.disabled)}
        data-loading=${this.loading}
        tabindex=${(0,d.J)(this.tabIdx)}
      >
        <wui-flex gap="2" alignItems="center">
          ${this.templateLeftIcon()}
          <wui-flex gap="1">
            <slot></slot>
          </wui-flex>
        </wui-flex>
        ${this.templateRightIcon()}
      </button>
    `}templateLeftIcon(){return this.icon?n.qy`<wui-image
        icon=${this.icon}
        iconColor=${(0,d.J)(this.iconColor)}
        ?boxed=${!0}
        ?rounded=${this.rounded}
      ></wui-image>`:n.qy`<wui-image
      ?boxed=${!0}
      ?rounded=${this.rounded}
      ?fullSize=${this.fullSize}
      src=${this.imageSrc}
    ></wui-image>`}templateRightIcon(){return this.rightIcon?this.loading?n.qy`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:n.qy`<wui-icon name="chevronRight" size="lg" color="default"></wui-icon>`:null}};dt.styles=[S.W5,S.fD,lt],ct([(0,o.MZ)()],dt.prototype,"imageSrc",void 0),ct([(0,o.MZ)()],dt.prototype,"icon",void 0),ct([(0,o.MZ)()],dt.prototype,"iconColor",void 0),ct([(0,o.MZ)({type:Boolean})],dt.prototype,"loading",void 0),ct([(0,o.MZ)()],dt.prototype,"tabIdx",void 0),ct([(0,o.MZ)({type:Boolean})],dt.prototype,"disabled",void 0),ct([(0,o.MZ)({type:Boolean})],dt.prototype,"rightIcon",void 0),ct([(0,o.MZ)({type:Boolean})],dt.prototype,"rounded",void 0),ct([(0,o.MZ)({type:Boolean})],dt.prototype,"fullSize",void 0),dt=ct([(0,A.E)("wui-list-item")],dt);let ut=class extends n.WF{constructor(){super(...arguments),this.wallet=w.I.state.data?.wallet}render(){if(!this.wallet)throw new Error("w3m-downloads-view");return n.qy`
      <wui-flex gap="2" flexDirection="column" .padding=${["3","3","4","3"]}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `}chromeTemplate(){return this.wallet?.chrome_store?n.qy`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Chrome Extension</wui-text>
    </wui-list-item>`:null}iosTemplate(){return this.wallet?.app_store?n.qy`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">iOS App</wui-text>
    </wui-list-item>`:null}androidTemplate(){return this.wallet?.play_store?n.qy`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Android App</wui-text>
    </wui-list-item>`:null}homepageTemplate(){return this.wallet?.homepage?n.qy`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="md-medium" color="primary">Website</wui-text>
      </wui-list-item>
    `:null}openStore(e){e.href&&this.wallet&&(g.E.sendEvent({type:"track",event:"GET_WALLET",properties:{name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.wallet.id,type:e.type}}),r.w.openHref(e.href,"_blank"))}onChromeStore(){this.wallet?.chrome_store&&this.openStore({href:this.wallet.chrome_store,type:"chrome_store"})}onAppStore(){this.wallet?.app_store&&this.openStore({href:this.wallet.app_store,type:"app_store"})}onPlayStore(){this.wallet?.play_store&&this.openStore({href:this.wallet.play_store,type:"play_store"})}onHomePage(){this.wallet?.homepage&&this.openStore({href:this.wallet.homepage,type:"homepage"})}};ut=function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s}([(0,c.EM)("w3m-downloads-view")],ut)},69049:e=>{"use strict";e.exports=function(e){for(var t=[],i=e.length,n=0;n<i;n++){var o=e.charCodeAt(n);if(o>=55296&&o<=56319&&i>n+1){var r=e.charCodeAt(n+1);r>=56320&&r<=57343&&(o=1024*(o-55296)+r-56320+65536,n+=1)}o<128?t.push(o):o<2048?(t.push(o>>6|192),t.push(63&o|128)):o<55296||o>=57344&&o<65536?(t.push(o>>12|224),t.push(o>>6&63|128),t.push(63&o|128)):o>=65536&&o<=1114111?(t.push(o>>18|240),t.push(o>>12&63|128),t.push(o>>6&63|128),t.push(63&o|128)):t.push(239,191,189)}return new Uint8Array(t).buffer}},74764:(e,t,i)=>{const n=i(64713);function o(e){this.genPoly=void 0,this.degree=e,this.degree&&this.initialize(this.degree)}o.prototype.initialize=function(e){this.degree=e,this.genPoly=n.generateECPolynomial(this.degree)},o.prototype.encode=function(e){if(!this.genPoly)throw new Error("Encoder not initialized");const t=new Uint8Array(e.length+this.degree);t.set(e);const i=n.mod(t,this.genPoly),o=this.degree-i.length;if(o>0){const e=new Uint8Array(this.degree);return e.set(i,o),e}return i},e.exports=o},76320:e=>{"use strict";var t={single_source_shortest_paths:function(e,i,n){var o={},r={};r[i]=0;var s,a,l,c,d,u,h,p=t.PriorityQueue.make();for(p.push(i,0);!p.empty();)for(l in a=(s=p.pop()).value,c=s.cost,d=e[a]||{})d.hasOwnProperty(l)&&(u=c+d[l],h=r[l],(void 0===r[l]||h>u)&&(r[l]=u,p.push(l,u),o[l]=a));if(void 0!==n&&void 0===r[n]){var g=["Could not find a path from ",i," to ",n,"."].join("");throw new Error(g)}return o},extract_shortest_path_from_predecessor_list:function(e,t){for(var i=[],n=t;n;)i.push(n),e[n],n=e[n];return i.reverse(),i},find_path:function(e,i,n){var o=t.single_source_shortest_paths(e,i,n);return t.extract_shortest_path_from_predecessor_list(o,n)},PriorityQueue:{make:function(e){var i,n=t.PriorityQueue,o={};for(i in e=e||{},n)n.hasOwnProperty(i)&&(o[i]=n[i]);return o.queue=[],o.sorter=e.sorter||n.default_sorter,o},default_sorter:function(e,t){return e.cost-t.cost},push:function(e,t){var i={value:e,cost:t};this.queue.push(i),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return 0===this.queue.length}}};e.exports=t},81332:(e,t)=>{t.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};function i(e,i,n){switch(e){case t.Patterns.PATTERN000:return(i+n)%2==0;case t.Patterns.PATTERN001:return i%2==0;case t.Patterns.PATTERN010:return n%3==0;case t.Patterns.PATTERN011:return(i+n)%3==0;case t.Patterns.PATTERN100:return(Math.floor(i/2)+Math.floor(n/3))%2==0;case t.Patterns.PATTERN101:return i*n%2+i*n%3==0;case t.Patterns.PATTERN110:return(i*n%2+i*n%3)%2==0;case t.Patterns.PATTERN111:return(i*n%3+(i+n)%2)%2==0;default:throw new Error("bad maskPattern:"+e)}}t.isValid=function(e){return null!=e&&""!==e&&!isNaN(e)&&e>=0&&e<=7},t.from=function(e){return t.isValid(e)?parseInt(e,10):void 0},t.getPenaltyN1=function(e){const t=e.size;let i=0,n=0,o=0,r=null,s=null;for(let a=0;a<t;a++){n=o=0,r=s=null;for(let l=0;l<t;l++){let t=e.get(a,l);t===r?n++:(n>=5&&(i+=n-5+3),r=t,n=1),t=e.get(l,a),t===s?o++:(o>=5&&(i+=o-5+3),s=t,o=1)}n>=5&&(i+=n-5+3),o>=5&&(i+=o-5+3)}return i},t.getPenaltyN2=function(e){const t=e.size;let i=0;for(let n=0;n<t-1;n++)for(let o=0;o<t-1;o++){const t=e.get(n,o)+e.get(n,o+1)+e.get(n+1,o)+e.get(n+1,o+1);4!==t&&0!==t||i++}return 3*i},t.getPenaltyN3=function(e){const t=e.size;let i=0,n=0,o=0;for(let r=0;r<t;r++){n=o=0;for(let s=0;s<t;s++)n=n<<1&2047|e.get(r,s),s>=10&&(1488===n||93===n)&&i++,o=o<<1&2047|e.get(s,r),s>=10&&(1488===o||93===o)&&i++}return 40*i},t.getPenaltyN4=function(e){let t=0;const i=e.data.length;for(let n=0;n<i;n++)t+=e.data[n];return 10*Math.abs(Math.ceil(100*t/i/5)-10)},t.applyMask=function(e,t){const n=t.size;for(let o=0;o<n;o++)for(let r=0;r<n;r++)t.isReserved(r,o)||t.xor(r,o,i(e,r,o))},t.getBestMask=function(e,i){const n=Object.keys(t.Patterns).length;let o=0,r=1/0;for(let s=0;s<n;s++){i(s),t.applyMask(s,e);const n=t.getPenaltyN1(e)+t.getPenaltyN2(e)+t.getPenaltyN3(e)+t.getPenaltyN4(e);t.applyMask(s,e),n<r&&(r=n,o=s)}return o}},84565:(e,t,i)=>{const n=i(56886),o=n.getBCHDigit(1335);t.getEncodedBits=function(e,t){const i=e.bit<<3|t;let r=i<<10;for(;n.getBCHDigit(r)-o>=0;)r^=1335<<n.getBCHDigit(r)-o;return 21522^(i<<10|r)}},87583:(e,t,i)=>{const n=i(91333),o=i(90157),r=i(47899),s=i(56756);function a(e,t,i,r,s){const a=[].slice.call(arguments,1),l=a.length,c="function"==typeof a[l-1];if(!c&&!n())throw new Error("Callback required as last argument");if(!c){if(l<1)throw new Error("Too few arguments provided");return 1===l?(i=t,t=r=void 0):2!==l||t.getContext||(r=i,i=t,t=void 0),new Promise(function(n,s){try{const s=o.create(i,r);n(e(s,t,r))}catch(e){s(e)}})}if(l<2)throw new Error("Too few arguments provided");2===l?(s=i,i=t,t=r=void 0):3===l&&(t.getContext&&void 0===s?(s=r,r=void 0):(s=r,r=i,i=t,t=void 0));try{const n=o.create(i,r);s(null,e(n,t,r))}catch(e){s(e)}}t.create=o.create,t.toCanvas=a.bind(null,r.render),t.toDataURL=a.bind(null,r.renderToDataURL),t.toString=a.bind(null,function(e,t,i){return s.render(e,i)})},90157:(e,t,i)=>{const n=i(56886),o=i(49953),r=i(99899),s=i(8820),a=i(6421),l=i(7756),c=i(81332),d=i(97518),u=i(74764),h=i(31427),p=i(84565),g=i(30208),w=i(29801);function f(e,t,i){const n=e.size,o=p.getEncodedBits(t,i);let r,s;for(r=0;r<15;r++)s=1==(o>>r&1),r<6?e.set(r,8,s,!0):r<8?e.set(r+1,8,s,!0):e.set(n-15+r,8,s,!0),r<8?e.set(8,n-r-1,s,!0):r<9?e.set(8,15-r-1+1,s,!0):e.set(8,15-r-1,s,!0);e.set(n-8,8,1,!0)}function m(e,t,i,o){let p;if(Array.isArray(e))p=w.fromArray(e);else{if("string"!=typeof e)throw new Error("Invalid data");{let n=t;if(!n){const t=w.rawSplit(e);n=h.getBestVersionForData(t,i)}p=w.fromString(e,n||40)}}const m=h.getBestVersionForData(p,i);if(!m)throw new Error("The amount of data is too big to be stored in a QR Code");if(t){if(t<m)throw new Error("\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: "+m+".\n")}else t=m;const y=function(e,t,i){const o=new r;i.forEach(function(t){o.put(t.mode.bit,4),o.put(t.getLength(),g.getCharCountIndicator(t.mode,e)),t.write(o)});const s=8*(n.getSymbolTotalCodewords(e)-d.getTotalCodewordsCount(e,t));for(o.getLengthInBits()+4<=s&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(0);const a=(s-o.getLengthInBits())/8;for(let e=0;e<a;e++)o.put(e%2?17:236,8);return function(e,t,i){const o=n.getSymbolTotalCodewords(t),r=o-d.getTotalCodewordsCount(t,i),s=d.getBlocksCount(t,i),a=s-o%s,l=Math.floor(o/s),c=Math.floor(r/s),h=c+1,p=l-c,g=new u(p);let w=0;const f=new Array(s),m=new Array(s);let y=0;const b=new Uint8Array(e.buffer);for(let e=0;e<s;e++){const t=e<a?c:h;f[e]=b.slice(w,w+t),m[e]=g.encode(f[e]),w+=t,y=Math.max(y,t)}const v=new Uint8Array(o);let x,$,k=0;for(x=0;x<y;x++)for($=0;$<s;$++)x<f[$].length&&(v[k++]=f[$][x]);for(x=0;x<p;x++)for($=0;$<s;$++)v[k++]=m[$][x];return v}(o,e,t)}(t,i,p),b=n.getSymbolSize(t),v=new s(b);return function(e,t){const i=e.size,n=l.getPositions(t);for(let t=0;t<n.length;t++){const o=n[t][0],r=n[t][1];for(let t=-1;t<=7;t++)if(!(o+t<=-1||i<=o+t))for(let n=-1;n<=7;n++)r+n<=-1||i<=r+n||(t>=0&&t<=6&&(0===n||6===n)||n>=0&&n<=6&&(0===t||6===t)||t>=2&&t<=4&&n>=2&&n<=4?e.set(o+t,r+n,!0,!0):e.set(o+t,r+n,!1,!0))}}(v,t),function(e){const t=e.size;for(let i=8;i<t-8;i++){const t=i%2==0;e.set(i,6,t,!0),e.set(6,i,t,!0)}}(v),function(e,t){const i=a.getPositions(t);for(let t=0;t<i.length;t++){const n=i[t][0],o=i[t][1];for(let t=-2;t<=2;t++)for(let i=-2;i<=2;i++)-2===t||2===t||-2===i||2===i||0===t&&0===i?e.set(n+t,o+i,!0,!0):e.set(n+t,o+i,!1,!0)}}(v,t),f(v,i,0),t>=7&&function(e,t){const i=e.size,n=h.getEncodedBits(t);let o,r,s;for(let t=0;t<18;t++)o=Math.floor(t/3),r=t%3+i-8-3,s=1==(n>>t&1),e.set(o,r,s,!0),e.set(r,o,s,!0)}(v,t),function(e,t){const i=e.size;let n=-1,o=i-1,r=7,s=0;for(let a=i-1;a>0;a-=2)for(6===a&&a--;;){for(let i=0;i<2;i++)if(!e.isReserved(o,a-i)){let n=!1;s<t.length&&(n=1==(t[s]>>>r&1)),e.set(o,a-i,n),r--,-1===r&&(s++,r=7)}if(o+=n,o<0||i<=o){o-=n,n=-n;break}}}(v,y),isNaN(o)&&(o=c.getBestMask(v,f.bind(null,v,i))),c.applyMask(o,v),f(v,i,o),{modules:v,version:t,errorCorrectionLevel:i,maskPattern:o,segments:p}}t.create=function(e,t){if(void 0===e||""===e)throw new Error("No input text");let i,r,s=o.M;return void 0!==t&&(s=o.from(t.errorCorrectionLevel,o.M),i=h.from(t.version),r=c.from(t.maskPattern),t.toSJISFunc&&n.setToSJISFunction(t.toSJISFunc)),m(e,i,s,r)}},91333:e=>{e.exports=function(){return"function"==typeof Promise&&Promise.prototype&&Promise.prototype.then}},92726:(e,t)=>{function i(e){if("number"==typeof e&&(e=e.toString()),"string"!=typeof e)throw new Error("Color should be defined as hex string");let t=e.slice().replace("#","").split("");if(t.length<3||5===t.length||t.length>8)throw new Error("Invalid hex color: "+e);3!==t.length&&4!==t.length||(t=Array.prototype.concat.apply([],t.map(function(e){return[e,e]}))),6===t.length&&t.push("F","F");const i=parseInt(t.join(""),16);return{r:i>>24&255,g:i>>16&255,b:i>>8&255,a:255&i,hex:"#"+t.slice(0,6).join("")}}t.getOptions=function(e){e||(e={}),e.color||(e.color={});const t=void 0===e.margin||null===e.margin||e.margin<0?4:e.margin,n=e.width&&e.width>=21?e.width:void 0,o=e.scale||4;return{width:n,scale:n?4:o,margin:t,color:{dark:i(e.color.dark||"#000000ff"),light:i(e.color.light||"#ffffffff")},type:e.type,rendererOpts:e.rendererOpts||{}}},t.getScale=function(e,t){return t.width&&t.width>=e+2*t.margin?t.width/(e+2*t.margin):t.scale},t.getImageWidth=function(e,i){const n=t.getScale(e,i);return Math.floor((e+2*i.margin)*n)},t.qrToImageData=function(e,i,n){const o=i.modules.size,r=i.modules.data,s=t.getScale(o,n),a=Math.floor((o+2*n.margin)*s),l=n.margin*s,c=[n.color.light,n.color.dark];for(let t=0;t<a;t++)for(let i=0;i<a;i++){let d=4*(t*a+i),u=n.color.light;t>=l&&i>=l&&t<a-l&&i<a-l&&(u=c[r[Math.floor((t-l)/s)*o+Math.floor((i-l)/s)]?1:0]),e[d++]=u.r,e[d++]=u.g,e[d++]=u.b,e[d]=u.a}}},97518:(e,t,i)=>{const n=i(49953),o=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],r=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];t.getBlocksCount=function(e,t){switch(t){case n.L:return o[4*(e-1)+0];case n.M:return o[4*(e-1)+1];case n.Q:return o[4*(e-1)+2];case n.H:return o[4*(e-1)+3];default:return}},t.getTotalCodewordsCount=function(e,t){switch(t){case n.L:return r[4*(e-1)+0];case n.M:return r[4*(e-1)+1];case n.Q:return r[4*(e-1)+2];case n.H:return r[4*(e-1)+3];default:return}}},99899:e=>{function t(){this.buffer=[],this.length=0}t.prototype={get:function(e){const t=Math.floor(e/8);return 1==(this.buffer[t]>>>7-e%8&1)},put:function(e,t){for(let i=0;i<t;i++)this.putBit(1==(e>>>t-i-1&1))},getLengthInBits:function(){return this.length},putBit:function(e){const t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0),e&&(this.buffer[t]|=128>>>this.length%8),this.length++}},e.exports=t}}]);