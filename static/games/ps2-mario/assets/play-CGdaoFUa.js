import{t as e}from"./phaser-CFG0dBPV.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t=Array.isArray,n=Array.prototype.indexOf,r=Array.prototype.includes,i=Array.from,a=Object.defineProperty,o=Object.getOwnPropertyDescriptor,s=Object.prototype,c=Array.prototype,l=Object.getPrototypeOf,u=Object.isExtensible,d=()=>{};function f(e){for(var t=0;t<e.length;t++)e[t]()}function p(){var e,t;return{promise:new Promise((n,r)=>{e=n,t=r}),resolve:e,reject:t}}var m=1024,h=2048,g=4096,_=8192,v=16384,y=32768,ee=1<<25,te=65536,ne=1<<19,re=1<<20,ie=65536,ae=1<<21,oe=1<<23,se=Symbol(`$state`),ce=Symbol(`legacy props`),le=Symbol(`attributes`),ue=Symbol(`class`),de=Symbol(`style`),fe=Symbol(`text`),pe=new class extends Error{name=`StaleReactionError`;message="The reaction that called `getAbortSignal()` was re-run or destroyed"};globalThis.document?.contentType;function me(e){throw Error(`https://svelte.dev/e/lifecycle_outside_component`)}function he(e){throw Error(`https://svelte.dev/e/effect_in_teardown`)}function ge(){throw Error(`https://svelte.dev/e/effect_in_unowned_derived`)}function _e(e){throw Error(`https://svelte.dev/e/effect_orphan`)}function ve(){throw Error(`https://svelte.dev/e/effect_update_depth_exceeded`)}function ye(e){throw Error(`https://svelte.dev/e/props_invalid_value`)}function be(){throw Error(`https://svelte.dev/e/state_descriptors_fixed`)}function xe(){throw Error(`https://svelte.dev/e/state_prototype_fixed`)}function Se(){throw Error(`https://svelte.dev/e/state_unsafe_mutation`)}function Ce(){throw Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`)}var we={},b=Symbol(`uninitialized`);function Te(){console.warn(`https://svelte.dev/e/derived_inert`)}function Ee(e){console.warn(`https://svelte.dev/e/hydration_mismatch`)}function De(){console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`)}var x=!1;function Oe(e){x=e}var S;function ke(e){if(e===null)throw Ee(),we;return S=e}function Ae(){return ke(qt(S))}function je(e=1){if(x){for(var t=e,n=S;t--;)n=qt(n);S=n}}function Me(e=!0){for(var t=0,n=S;;){if(n.nodeType===8){var r=n.data;if(r===`]`){if(t===0)return n;--t}else(r===`[`||r===`[!`||r[0]===`[`&&!isNaN(Number(r.slice(1))))&&(t+=1)}var i=qt(n);e&&n.remove(),n=i}}function Ne(e){if(!e||e.nodeType!==8)throw Ee(),we;return e.data}function Pe(e){return e===this.v}function Fe(e,t){return e==e?e!==t||typeof e==`object`&&!!e||typeof e==`function`:t==t}function Ie(e){return!Fe(e,this.v)}var C=null;function Le(e){C=e}function Re(e,t){return He(`setContext`).set(e,t),t}function ze(e,t=!1,n){C={p:C,i:!1,c:null,e:null,s:e,x:null,r:U,l:null}}function Be(e){var t=C,n=t.e;if(n!==null){t.e=null;for(var r of n)rn(r)}return e!==void 0&&(t.x=e),t.i=!0,C=t.p,e??{}}function Ve(){return!0}function He(e){return C===null&&me(e),C.c??=new Map(Ue(C)||void 0)}function Ue(e){let t=e.p;for(;t!==null;){let e=t.c;if(e!==null)return e;t=t.p}return null}var w=[];function We(){var e=w;w=[],f(e)}function T(e){if(w.length===0&&!St){var t=w;queueMicrotask(()=>{t===w&&We()})}w.push(e)}function Ge(e){var t=U;if(t===null)return B.f|=oe,e;if(!(t.f&32768)&&!(t.f&4))throw e;E(e,t)}function E(e,t){if(!(t!==null&&t.f&16384)){for(;t!==null;){if(t.f&128){if(!(t.f&32768))throw e;try{t.b.error(e);return}catch(t){e=t}}t=t.parent}throw e}}var Ke=~(h|g|m);function D(e,t){e.f=e.f&Ke|t}function qe(e){e.f&512||e.deps===null?D(e,m):D(e,g)}function Je(e){if(e!==null)for(let t of e)!(t.f&2)||!(t.f&65536)||(t.f^=ie,Je(t.deps))}function Ye(e,t,n){e.f&2048?t.add(e):e.f&4096&&n.add(e),Je(e.deps),D(e,m)}function Xe(e,t,n){if(e==null)return t(void 0),n&&n(void 0),d;let r=Pn(()=>e.subscribe(t,n));return r.unsubscribe?()=>r.unsubscribe():r}var Ze=[];function Qe(e,t=d){let n=null,r=new Set;function i(t){if(Fe(e,t)&&(e=t,n)){let t=!Ze.length;for(let t of r)t[1](),Ze.push(t,e);if(t){for(let e=0;e<Ze.length;e+=2)Ze[e][0](Ze[e+1]);Ze.length=0}}}function a(t){i(t(e))}function o(o,s=d){let c=[o,s];return r.add(c),r.size===1&&(n=t(i,a)||d),o(e),()=>{r.delete(c),r.size===0&&n&&(n(),n=null)}}return{set:i,update:a,subscribe:o}}function $e(e){return{subscribe:e.subscribe.bind(e)}}function et(e){let t;return Xe(e,e=>t=e)(),t}var tt=!1,nt=Symbol(`unmounted`);function rt(e,t,n){let r=n[t]??={store:null,source:It(void 0),unsubscribe:d};if(r.store!==e&&!(nt in n))if(r.unsubscribe(),r.store=e??null,e==null)r.source.v=void 0,r.unsubscribe=d;else{var i=!0;r.unsubscribe=Xe(e,e=>{i?r.source.v=e:F(r.source,e)}),i=!1}return e&&nt in n?et(e):Z(r.source)}function it(){let e={};function t(){tn(()=>{for(var t in e)e[t].unsubscribe();a(e,nt,{enumerable:!1,value:!0})})}return[e,t]}function at(e){var t=tt;try{return tt=!1,[e(),tt]}finally{tt=t}}function ot(e){var t=B,n=U;H(null),W(null);try{return e()}finally{H(t),W(n)}}function st(e){let t=0,n=Ft(0),r;return()=>{en()&&(Z(n),on(()=>(t===0&&(r=Pn(()=>e(()=>zt(n)))),t+=1,()=>{T(()=>{--t,t===0&&(r?.(),r=void 0,zt(n))})})))}}var ct=te|ne;function lt(e,t,n,r){new ut(e,t,n,r)}var ut=class{parent;is_pending=!1;transform_error;#e;#t=x?S:null;#n;#r;#i;#a=null;#o=null;#s=null;#c=null;#l=0;#u=0;#d=!1;#f=new Set;#p=new Set;#m=null;#h=st(()=>(this.#m=Ft(this.#l),()=>{this.#m=null}));constructor(e,t,n,r){this.#e=e,this.#n=t,this.#r=e=>{var t=U;t.b=this,t.f|=128,n(e)},this.parent=U.b,this.transform_error=r??this.parent?.transform_error??(e=>e),this.#i=sn(()=>{if(x){let e=this.#t;Ae();let t=e.data===`[!`;if(e.data.startsWith(`[?`)){let t=JSON.parse(e.data.slice(2));this.#_(t)}else t?this.#y():this.#g()}else this.#b()},ct),x&&(this.#e=S)}#g(){try{this.#a=L(()=>this.#r(this.#e))}catch(e){this.error(e)}}#_(e){let t=this.#n.failed,{reset:n,invoke_onerror:r}=this.#v(e);T(r),t&&(this.#s=L(()=>{t(this.#e,()=>e,()=>n)}))}#v(e){var t=!1,n=!1;let r=()=>{if(t){De();return}t=!0,n&&Ce(),this.#s!==null&&pn(this.#s,()=>{this.#s=null}),this.#S(()=>{this.#b()})};return{reset:r,invoke_onerror:()=>{try{n=!0,this.#n.onerror?.(e,r),n=!1}catch(e){E(e,this.#i&&this.#i.parent)}}}}#y(){let e=this.#n.pending;e&&(this.is_pending=!0,this.#o=L(()=>e(this.#e)),T(()=>{var e=this.#c=document.createDocumentFragment(),t=Gt();e.append(t),this.#a=this.#S(()=>L(()=>this.#r(t))),this.#u===0&&(this.#e.before(e),this.#c=null,pn(this.#o,()=>{this.#o=null}),this.#x(k))}))}#b(){try{if(this.is_pending=this.has_pending_snippet(),this.#u=0,this.#l=0,this.#a=L(()=>{this.#r(this.#e)}),this.#u>0){var e=this.#c=document.createDocumentFragment();_n(this.#a,e);let t=this.#n.pending;this.#o=L(()=>t(this.#e))}else this.#x(k)}catch(e){this.error(e)}}#x(e){this.is_pending=!1,e.transfer_effects(this.#f,this.#p)}defer_effect(e){Ye(e,this.#f,this.#p)}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!this.#n.pending}#S(e){var t=U,n=B,r=C;W(this.#i),H(this.#i),Le(this.#i.ctx);try{return Dt.ensure(),e()}catch(e){return Ge(e),null}finally{W(t),H(n),Le(r)}}#C(e,t){if(!this.has_pending_snippet()){this.parent&&this.parent.#C(e,t);return}this.#u+=e,this.#u===0&&(this.#x(t),this.#o&&pn(this.#o,()=>{this.#o=null}),this.#c&&=(this.#e.before(this.#c),null))}update_pending_count(e,t){this.#C(e,t),this.#l+=e,!(!this.#m||this.#d)&&(this.#d=!0,T(()=>{this.#d=!1,this.#m&&Lt(this.#m,this.#l)}))}get_effect_pending(){return this.#h(),Z(this.#m)}error(e){if(!this.#n.onerror&&!this.#n.failed)throw e;k?.is_fork?(this.#a&&k.skip_effect(this.#a),this.#o&&k.skip_effect(this.#o),this.#s&&k.skip_effect(this.#s),k.oncommit(()=>{this.#w(e)})):this.#w(e)}#w(e){this.#a&&=(R(this.#a),null),this.#o&&=(R(this.#o),null),this.#s&&=(R(this.#s),null),x&&(ke(this.#t),je(),ke(Me()));let t=this.#n.failed,n=e=>{let{reset:n,invoke_onerror:r}=this.#v(e);r(),t&&(this.#s=this.#S(()=>{try{return L(()=>{var r=U;r.b=this,r.f|=128,t(this.#e,()=>e,()=>n)})}catch(e){return E(e,this.#i.parent),null}}))};T(()=>{var t;try{t=this.transform_error(e)}catch(e){E(e,this.#i&&this.#i.parent);return}typeof t==`object`&&t&&typeof t.then==`function`?t.then(n,e=>E(e,this.#i&&this.#i.parent)):n(t)})}};function dt(e){var t=2|h;return U!==null&&(U.f|=ne),{ctx:C,deps:null,effects:null,equals:Pe,f:t,fn:e,reactions:null,rv:0,v:b,wv:0,parent:U,ac:null}}var ft=Symbol(`obsolete`);function pt(e){let t=dt(e);return xn(t),t}function mt(e){let t=dt(e);return t.equals=Ie,t}function ht(e){var t=e.effects;if(t!==null){e.effects=null;for(var n=0;n<t.length;n+=1)R(t[n])}}function gt(e){var t,n=U,r=e.parent;if(!z&&r!==null&&e.v!==b&&r.f&24576)return Te(),e.v;W(r);try{e.f&=~ie,ht(e),t=On(e)}finally{W(n)}return t}function _t(e){var t=gt(e);if(!e.equals(t)&&(e.wv=Tn(),(!k?.is_fork||e.deps===null)&&(k===null?e.v=t:(k.capture(e,t,!0),bt?.capture(e,t,!0)),e.deps===null))){D(e,m);return}z||(A===null?qe(e):(en()||k?.is_fork)&&A.set(e,t))}function vt(e){if(e.effects!==null)for(let t of e.effects)(t.teardown||t.ac)&&(t.teardown?.(),t.ac!==null&&ot(()=>{t.ac.abort(pe),t.ac=null}),t.fn!==null&&(t.teardown=d),An(t,0),ln(t))}function yt(e){if(e.effects!==null)for(let t of e.effects)t.teardown&&t.fn!==null&&jn(t)}var O=null,k=null,bt=null,A=null,xt=null,St=!1,Ct=!1,j=null,wt=null,Tt=0,Et=1,Dt=class e{id=Et++;#e=!1;linked=!0;#t=null;#n=null;async_deriveds=new Map;current=new Map;previous=new Map;#r=new Set;#i=new Set;#a=0;#o=new Map;#s=null;#c=[];#l=[];#u=new Set;#d=new Set;#f=new Map;#p=new Set;is_fork=!1;#m=!1;constructor(){O===null?O=this:(O.#n=this,this.#t=O),O=this}#h(){if(this.is_fork)return!0;for(let n of this.#o.keys()){for(var e=n,t=!1;e.parent!==null;){if(this.#f.has(e)){t=!0;break}e=e.parent}if(!t)return!0}return!1}skip_effect(e){this.#f.has(e)||this.#f.set(e,{d:[],m:[]}),this.#p.delete(e)}unskip_effect(e,t=e=>this.schedule(e)){var n=this.#f.get(e);if(n){this.#f.delete(e);for(var r of n.d)D(r,h),t(r);for(r of n.m)D(r,g),t(r)}this.#p.add(e)}#g(){this.#e=!0,Tt++>1e3&&(this.#x(),Ot());for(let e of this.#u)this.#d.delete(e),D(e,h),this.schedule(e);for(let e of this.#d)D(e,g),this.schedule(e);let t=this.#c;this.#c=[],this.apply();var n=j=[],r=[],i=wt=[];for(let e of t)try{this.#_(e,n,r)}catch(t){throw Mt(e),this.#h()||this.discard(),t}if(k=null,i.length>0){var a=e.ensure();for(let e of i)a.schedule(e)}if(j=null,wt=null,this.#h()){this.#b(r),this.#b(n);for(let[e,t]of this.#f)jt(e,t);i.length>0&&k.#g();return}let o=this.#v();if(o){this.#b(r),this.#b(n),o.#y(this);return}this.#u.clear(),this.#d.clear();for(let e of this.#r)e(this);this.#r.clear(),bt=this,kt(r),kt(n),bt=null,this.#s?.resolve();var s=k;if(this.#a===0&&(this.#c.length===0||s!==null)&&this.#x(),this.#c.length>0)if(s!==null){let e=s;e.#c.push(...this.#c.filter(t=>!e.#c.includes(t)))}else s=this;s!==null&&s.#g()}#_(e,t,n){e.f^=m;for(var r=e.first;r!==null;){var i=r.f,a=!!(i&96);if(!(a&&i&1024||i&8192||this.#f.has(r))&&r.fn!==null){a?r.f^=m:i&4?t.push(r):En(r)&&(i&16&&this.#d.add(r),jn(r));var o=r.first;if(o!==null){r=o;continue}}for(;r!==null;){var s=r.next;if(s!==null){r=s;break}r=r.parent}}}#v(){for(var e=this.#t;e!==null;){if(!e.is_fork){for(let[t,[,n]]of this.current)if(e.current.has(t)&&!n)return e}e=e.#t}return null}#y(e){for(let[t,n]of e.current)!this.previous.has(t)&&e.previous.has(t)&&this.previous.set(t,e.previous.get(t)),this.current.set(t,n);for(let[t,n]of e.async_deriveds){let e=this.async_deriveds.get(t);e&&n.promise.then(e.resolve).catch(e.reject)}e.async_deriveds.clear(),this.transfer_effects(e.#u,e.#d);let t=e=>{var n=e.reactions;if(n!==null&&!(e.f&2&&!(e.f&6144)))for(let e of n){var r=e.f;if(r&2)t(e);else{var i=e;r&4194320&&!this.async_deriveds.has(i)&&(this.#d.delete(i),D(i,h),this.schedule(i))}}};for(let e of this.current.keys())t(e);this.oncommit(()=>e.discard()),e.#x(),k=this,this.#g()}#b(e){for(var t=0;t<e.length;t+=1)Ye(e[t],this.#u,this.#d)}capture(e,t,n=!1){e.v!==b&&!this.previous.has(e)&&this.previous.set(e,e.v),e.f&8388608||(this.current.set(e,[t,n]),A?.set(e,t)),this.is_fork||(e.v=t)}activate(){k=this}deactivate(){k=null,A=null}flush(){try{Ct=!0,k=this,this.#g()}finally{Tt=0,xt=null,j=null,wt=null,Ct=!1,k=null,A=null,N.clear()}}discard(){for(let e of this.#i)e(this);this.#i.clear();for(let e of this.async_deriveds.values())e.reject(ft);this.#x(),this.#s?.resolve()}register_created_effect(e){this.#l.push(e)}increment(e,t){if(this.#a+=1,e){let e=this.#o.get(t)??0;this.#o.set(t,e+1)}}decrement(e,t){if(--this.#a,e){let e=this.#o.get(t)??0;e===1?this.#o.delete(t):this.#o.set(t,e-1)}this.#m||(this.#m=!0,T(()=>{this.#m=!1,this.linked&&this.flush()}))}transfer_effects(e,t){for(let t of e)this.#u.add(t);for(let e of t)this.#d.add(e);e.clear(),t.clear()}oncommit(e){this.#r.add(e)}ondiscard(e){this.#i.add(e)}settled(){return(this.#s??=p()).promise}static ensure(){if(k===null){let t=k=new e;!Ct&&T(()=>{t.#e||t.flush()})}return k}apply(){A=null}schedule(e){if(xt=e,e.b?.is_pending&&e.f&16777228&&!(e.f&32768)){e.b.defer_effect(e);return}for(var t=e;t.parent!==null;){t=t.parent;var n=t.f;if(j!==null&&t===U&&(B===null||!(B.f&2)))return;if(n&96){if(!(n&1024))return;t.f^=m}}this.#c.push(t)}#x(){if(this.linked){var e=this.#t,t=this.#n;e===null||(e.#n=t),t===null?O=e:t.#t=e,this.linked=!1}}};function Ot(){try{ve()}catch(e){E(e,xt)}}var M=null;function kt(e){var t=e.length;if(t!==0){for(var n=0;n<t;){var r=e[n++];if(!(r.f&24576)&&En(r)&&(M=new Set,jn(r),r.deps===null&&r.first===null&&r.nodes===null&&r.teardown===null&&r.ac===null&&fn(r),M?.size>0)){N.clear();for(let e of M){if(e.f&24576)continue;let t=[e],n=e.parent;for(;n!==null;)M.has(n)&&(M.delete(n),t.push(n)),n=n.parent;for(let e=t.length-1;e>=0;e--){let n=t[e];n.f&24576||jn(n)}}M.clear()}}M=null}}function At(e){k.schedule(e)}function jt(e,t){if(!(e.f&32&&e.f&1024)){e.f&2048?t.d.push(e):e.f&4096&&t.m.push(e),D(e,m);for(var n=e.first;n!==null;)jt(n,t),n=n.next}}function Mt(e){D(e,m);for(var t=e.first;t!==null;)Mt(t),t=t.next}var Nt=new Set,N=new Map,Pt=!1;function Ft(e,t){return{f:0,v:e,reactions:null,equals:Pe,rv:0,wv:0}}function P(e,t){let n=Ft(e,t);return xn(n),n}function It(e,t=!1,n=!0){let r=Ft(e);return t||(r.equals=Ie),r}function F(e,t,n=!1){return B!==null&&(!V||B.f&131072)&&Ve()&&B.f&4325394&&(G===null||!G.has(e))&&Se(),Lt(e,n?I(t):t,wt)}function Lt(e,t,n=null){if(!e.equals(t)){N.set(e,z?t:e.v);var r=Dt.ensure();if(r.capture(e,t),e.f&2){let t=e;e.f&2048&&gt(t),A===null&&qe(t)}e.wv=Tn(),Bt(e,h,n),Ve()&&U!==null&&U.f&1024&&!(U.f&96)&&(J===null?Sn([e]):J.push(e)),!r.is_fork&&Nt.size>0&&!Pt&&Rt()}return t}function Rt(){Pt=!1;for(let e of Nt){e.f&1024&&D(e,g);let t;try{t=En(e)}catch{t=!0}t&&jn(e)}Nt.clear()}function zt(e){F(e,e.v+1)}function Bt(e,t,n){var r=e.reactions;if(r!==null)for(var i=Ve(),a=r.length,o=0;o<a;o++){var s=r[o],c=s.f;if(!(!i&&s===U)){var l=(c&h)===0;if(l&&D(s,t),c&131072)Nt.add(s);else if(c&2){var u=s;A?.delete(u),c&65536||(c&512&&(U===null||!(U.f&2097152))&&(s.f|=ie),Bt(u,g,n))}else if(l){var d=s;c&16&&M!==null&&M.add(d),n===null?At(d):n.push(d)}}}}function I(e){if(typeof e!=`object`||!e||se in e)return e;let n=l(e);if(n!==s&&n!==c)return e;var r=new Map,i=t(e),a=P(0),u=null,d=X,f=e=>{if(X===d)return e();var t=B,n=X;H(null),wn(d);var r=e();return H(t),wn(n),r};return i&&r.set(`length`,P(e.length,u)),new Proxy(e,{defineProperty(e,t,n){(!(`value`in n)||n.configurable===!1||n.enumerable===!1||n.writable===!1)&&be();var i=r.get(t);return i===void 0?f(()=>{var e=P(n.value,u);return r.set(t,e),e}):F(i,n.value,!0),!0},deleteProperty(e,t){var n=r.get(t);if(n===void 0){if(t in e){let e=f(()=>P(b,u));r.set(t,e),zt(a)}}else F(n,b),zt(a);return!0},get(t,n,i){if(n===se)return e;var a=r.get(n),s=n in t;if(a===void 0&&(!s||o(t,n)?.writable)&&(a=f(()=>P(I(s?t[n]:b),u)),r.set(n,a)),a!==void 0){var c=Z(a);return c===b?void 0:c}return Reflect.get(t,n,i)},getOwnPropertyDescriptor(e,t){var n=Reflect.getOwnPropertyDescriptor(e,t);if(n&&`value`in n){var i=r.get(t);i&&(n.value=Z(i))}else if(n===void 0){var a=r.get(t),o=a?.v;if(a!==void 0&&o!==b)return{enumerable:!0,configurable:!0,value:o,writable:!0}}return n},has(e,t){if(t===se)return!0;var n=r.get(t),i=n!==void 0&&n.v!==b||Reflect.has(e,t);return(n!==void 0||U!==null&&(!i||o(e,t)?.writable))&&(n===void 0&&(n=f(()=>P(i?I(e[t]):b,u)),r.set(t,n)),Z(n)===b)?!1:i},set(e,t,n,s){var c=r.get(t),l=t in e;if(i&&t===`length`)for(var d=n;d<c.v;d+=1){var p=r.get(d+``);p===void 0?d in e&&(p=f(()=>P(b,u)),r.set(d+``,p)):F(p,b)}if(c===void 0)(!l||o(e,t)?.writable)&&(c=f(()=>P(void 0,u)),F(c,I(n)),r.set(t,c));else{l=c.v!==b;var m=f(()=>I(n));F(c,m)}var h=Reflect.getOwnPropertyDescriptor(e,t);if(h?.set&&h.set.call(s,n),!l){if(i&&typeof t==`string`){var g=r.get(`length`),_=Number(t);Number.isInteger(_)&&_>=g.v&&F(g,_+1)}zt(a)}return!0},ownKeys(e){Z(a);var t=Reflect.ownKeys(e).filter(e=>{var t=r.get(e);return t===void 0||t.v!==b});for(var[n,i]of r)i.v!==b&&!(n in e)&&t.push(n);return t},setPrototypeOf(){xe()}})}var Vt,Ht,Ut;function Wt(){if(Vt===void 0){Vt=window,/Firefox/.test(navigator.userAgent);var e=Element.prototype,t=Node.prototype,n=Text.prototype;Ht=o(t,`firstChild`).get,Ut=o(t,`nextSibling`).get,u(e)&&(e[ue]=void 0,e[le]=null,e[de]=void 0,e.__e=void 0),u(n)&&(n[fe]=void 0)}}function Gt(e=``){return document.createTextNode(e)}function Kt(e){return Ht.call(e)}function qt(e){return Ut.call(e)}function Jt(e,t=!1){if(!x){var n=Kt(e);return n instanceof Comment&&n.data===``?qt(n):n}if(t){if(S?.nodeType!==3){var r=Gt();return S?.before(r),ke(r),r}Xt(S)}return S}function Yt(){return!1}function Xt(e){if(e.nodeValue.length<65536)return;let t=e.nextSibling;for(;t!==null&&t.nodeType===3;)t.remove(),e.nodeValue+=t.nodeValue,t=e.nextSibling}function Zt(e){U===null&&(B===null&&_e(e),ge()),z&&he(e)}function Qt(e,t){var n=t.last;n===null?t.last=t.first=e:(n.next=e,e.prev=n,t.last=e)}function $t(e,t){var n=U;n!==null&&n.f&8192&&(e|=_);var r={ctx:C,deps:null,nodes:null,f:e|h|512,first:null,fn:t,last:null,next:null,parent:n,b:n&&n.b,prev:null,teardown:null,wv:0,ac:null};k?.register_created_effect(r);var i=r;if(e&4)j===null?Dt.ensure().schedule(r):j.push(r);else if(t!==null){try{jn(r)}catch(e){throw R(r),e}i.deps===null&&i.teardown===null&&i.nodes===null&&i.first===i.last&&!(i.f&524288)&&(i=i.first,e&16&&e&65536&&i!==null&&(i.f|=te))}if(i!==null&&(i.parent=n,n!==null&&Qt(i,n),B!==null&&B.f&2&&!(e&64))){var a=B;(a.effects??=[]).push(i)}return r}function en(){return B!==null&&!V}function tn(e){let t=$t(8,null);return D(t,m),t.teardown=e,t}function nn(e){Zt(`$effect`);var t=U.f;if(!B&&t&32&&C!==null&&!C.i){var n=C;(n.e??=[]).push(e)}else return rn(e)}function rn(e){return $t(4|re,e)}function an(e){Dt.ensure();let t=$t(64|ne,e);return(e={})=>new Promise(n=>{e.outro?pn(t,()=>{R(t),n(void 0)}):(R(t),n(void 0))})}function on(e,t=0){return $t(8|t,e)}function sn(e,t=0){return $t(16|t,e)}function L(e){return $t(32|ne,e)}function cn(e){var t=e.teardown;if(t!==null){let e=z,n=B;bn(!0),H(null);try{t.call(null)}finally{bn(e),H(n)}}}function ln(e,t=!1){var n=e.first;for(e.first=e.last=null;n!==null;){let e=n.ac;e!==null&&ot(()=>{e.abort(pe)});var r=n.next;n.f&64?n.parent=null:R(n,t),n=r}}function un(e){for(var t=e.first;t!==null;){var n=t.next;t.f&32||R(t),t=n}}function R(e,t=!0){var n=!1;(t||e.f&262144)&&e.nodes!==null&&e.nodes.end!==null&&(dn(e.nodes.start,e.nodes.end),n=!0),e.f|=ee,ln(e,t&&!n),An(e,0);var r=e.nodes&&e.nodes.t;if(r!==null)for(let e of r)e.stop();cn(e),e.f^=ee,e.f|=v;var i=e.parent;i!==null&&i.first!==null&&fn(e),e.next=e.prev=e.teardown=e.ctx=e.deps=e.fn=e.nodes=e.ac=e.b=null}function dn(e,t){for(;e!==null;){var n=e===t?null:qt(e);e.remove(),e=n}}function fn(e){var t=e.parent,n=e.prev,r=e.next;n!==null&&(n.next=r),r!==null&&(r.prev=n),t!==null&&(t.first===e&&(t.first=r),t.last===e&&(t.last=n))}function pn(e,t,n=!0){var r=[];mn(e,r,!0);var i=()=>{n&&R(e),t&&t()},a=r.length;if(a>0){var o=()=>--a||i();for(var s of r)s.out(o)}else i()}function mn(e,t,n){if(!(e.f&8192)){e.f^=_;var r=e.nodes&&e.nodes.t;if(r!==null)for(let e of r)(e.is_global||n)&&t.push(e);for(var i=e.first;i!==null;){var a=i.next;if(!(i.f&64)){var o=!!(i.f&65536)||!!(i.f&32)&&!!(e.f&16);mn(i,t,o?n:!1)}i=a}}}function hn(e){gn(e,!0)}function gn(e,t){if(e.f&8192){e.f^=_,e.f&1024||(D(e,h),Dt.ensure().schedule(e));for(var n=e.first;n!==null;){var r=n.next,i=!!(n.f&65536)||!!(n.f&32);gn(n,i?t:!1),n=r}var a=e.nodes&&e.nodes.t;if(a!==null)for(let e of a)(e.is_global||t)&&e.in()}}function _n(e,t){if(e.nodes)for(var n=e.nodes.start,r=e.nodes.end;n!==null;){var i=n===r?null:qt(n);t.append(n),n=i}}var vn=null,yn=!1,z=!1;function bn(e){z=e}var B=null,V=!1;function H(e){B=e}var U=null;function W(e){U=e}var G=null;function xn(e){B!==null&&(G??=new Set).add(e)}var K=null,q=0,J=null;function Sn(e){J=e}var Cn=1,Y=0,X=Y;function wn(e){X=e}function Tn(){return++Cn}function En(e){var t=e.f;if(t&2048)return!0;if(t&2&&(e.f&=~ie),t&4096){for(var n=e.deps,r=n.length,i=0;i<r;i++){var a=n[i];if(En(a)&&_t(a),a.wv>e.wv)return!0}t&512&&A===null&&D(e,m)}return!1}function Dn(e,t,n=!0){var r=e.reactions;if(r!==null&&!(G!==null&&G.has(e)))for(var i=0;i<r.length;i++){var a=r[i];a.f&2?Dn(a,t,!1):t===a&&(n?D(a,h):a.f&1024&&D(a,g),At(a))}}function On(e){var t=K,n=q,r=J,i=B,a=G,o=C,s=V,c=X,l=e.f;K=null,q=0,J=null,B=l&96?null:e,G=null,Le(e.ctx),V=!1,X=++Y,e.ac!==null&&(ot(()=>{e.ac.abort(pe)}),e.ac=null);try{e.f|=ae;var u=e.fn,d=u();e.f|=y;var f=e.deps,p=k?.is_fork;if(K!==null){var m;if(p||An(e,q),f!==null&&q>0)for(f.length=q+K.length,m=0;m<K.length;m++)f[q+m]=K[m];else e.deps=f=K;if(en()&&e.f&512)for(m=q;m<f.length;m++)(f[m].reactions??=[]).push(e)}else!p&&f!==null&&q<f.length&&(An(e,q),f.length=q);if(Ve()&&J!==null&&!V&&f!==null&&!(e.f&6146))for(m=0;m<J.length;m++)Dn(J[m],e);if(i!==null&&i!==e){if(Y++,i.deps!==null)for(let e=0;e<n;e+=1)i.deps[e].rv=Y;if(t!==null)for(let e of t)e.rv=Y;J!==null&&(r===null?r=J:r.push(...J))}return e.f&8388608&&(e.f^=oe),d}catch(e){return Ge(e)}finally{e.f^=ae,K=t,q=n,J=r,B=i,G=a,Le(o),V=s,X=c}}function kn(e,t){let i=t.reactions;if(i!==null){var a=n.call(i,e);if(a!==-1){var o=i.length-1;o===0?i=t.reactions=null:(i[a]=i[o],i.pop())}}if(i===null&&t.f&2&&(K===null||!r.call(K,t))){var s=t;s.f&512&&(s.f^=512,s.f&=~ie),s.v!==b&&qe(s),s.ac!==null&&ot(()=>{s.ac.abort(pe),s.ac=null,D(s,h)}),vt(s),An(s,0)}}function An(e,t){var n=e.deps;if(n!==null)for(var r=t;r<n.length;r++)kn(e,n[r])}function jn(e){var t=e.f;if(!(t&16384)){D(e,m);var n=U,r=yn;U=e,yn=!(t&96);try{t&16777232?un(e):ln(e),cn(e);var i=On(e);e.teardown=typeof i==`function`?i:null,e.wv=Cn}finally{yn=r,U=n}}}function Z(e){var t=!!(e.f&2);if(vn?.add(e),B!==null&&!V&&!(U!==null&&U.f&16384)&&(G===null||!G.has(e))){var n=B.deps;if(B.f&2097152)e.rv<Y&&(e.rv=Y,K===null&&n!==null&&n[q]===e?q++:K===null?K=[e]:K.push(e));else{B.deps??=[],r.call(B.deps,e)||B.deps.push(e);var i=e.reactions;i===null?e.reactions=[B]:r.call(i,B)||i.push(B)}}if(z&&N.has(e))return N.get(e);if(t){var a=e;if(z){var o=a.v;return(!(a.f&1024)&&a.reactions!==null||Nn(a))&&(o=gt(a)),N.set(a,o),o}var s=!(a.f&512)&&!V&&B!==null&&(yn||!!(B.f&512)),c=(a.f&y)===0;En(a)&&(s&&(a.f|=512),_t(a)),s&&!c&&(yt(a),Mn(a))}if(A?.has(e))return A.get(e);if(e.f&8388608)throw e.v;return e.v}function Mn(e){if(e.f|=512,e.deps!==null)for(let t of e.deps)(t.reactions??=[]).push(e),t.f&2&&!(t.f&512)&&(yt(t),Mn(t))}function Nn(e){if(e.v===b)return!0;if(e.deps===null)return!1;for(let t of e.deps)if(N.has(t)||t.f&2&&Nn(t))return!0;return!1}function Pn(e){var t=V;try{return V=!0,e()}finally{V=t}}[...`allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback`.split(`.`)];var Fn=[`touchstart`,`touchmove`];function In(e){return Fn.includes(e)}var Ln=Symbol(`events`),Rn=new Set,zn=new Set,Bn=null;function Vn(e){var t=this,n=t.ownerDocument,r=e.type,i=e.composedPath?.()||[],o=i[0]||e.target;Bn=e;var s=0,c=Bn===e&&e[Ln];if(c){var l=i.indexOf(c);if(l!==-1&&(t===document||t===window)){e[Ln]=t;return}var u=i.indexOf(t);if(u===-1)return;l<=u&&(s=l)}if(o=i[s]||e.target,o!==t){a(e,`currentTarget`,{configurable:!0,get(){return o||n}});var d=B,f=U;H(null),W(null);try{for(var p,m=[];o!==null&&o!==t;){try{var h=o[Ln]?.[r];h!=null&&(!o.disabled||e.target===o)&&h.call(o,e)}catch(e){p?m.push(e):p=e}if(e.cancelBubble)break;s++,o=s<i.length?i[s]:null}if(p){for(let e of m)queueMicrotask(()=>{throw e});throw p}}finally{e[Ln]=t,delete e.currentTarget,H(d),W(f)}}}globalThis?.window?.trustedTypes;function Hn(e,t){var n=U;n.nodes===null&&(n.nodes={start:e,end:t,a:null,t:null})}function Un(){if(x)return Hn(S,null),S;var e=document.createDocumentFragment(),t=document.createComment(``),n=Gt();return e.append(t,n),Hn(t,n),e}function Wn(e,t){if(x){var n=U;(!(n.f&32768)||n.nodes.end===null)&&(n.nodes.end=S),Ae();return}e!==null&&e.before(t)}function Gn(e,t){return qn(e,t)}var Kn=new Map;function qn(e,{target:t,anchor:n,props:r={},events:a,context:o,intro:s=!0,transformError:c}){Wt();var l=void 0,u=an(()=>{var s=n??t.appendChild(Gt());lt(s,{pending:()=>{}},t=>{ze({});var n=C;if(o&&(n.c=o),a&&(r.$$events=a),x&&Hn(t,null),l=e(t,r)||{},x&&(U.nodes.end=S,S===null||S.nodeType!==8||S.data!==`]`))throw Ee(),we;Be()},c);var u=new Set,d=e=>{for(var n=0;n<e.length;n++){var r=e[n];if(!u.has(r)){u.add(r);var i=In(r);for(let e of[t,document]){var a=Kn.get(e);a===void 0&&(a=new Map,Kn.set(e,a));var o=a.get(r);o===void 0?(e.addEventListener(r,Vn,{passive:i}),a.set(r,1)):a.set(r,o+1)}}}};return d(i(Rn)),zn.add(d),()=>{for(var e of u)for(let n of[t,document]){var r=Kn.get(n),i=r.get(e);--i==0?(n.removeEventListener(e,Vn),r.delete(e),r.size===0&&Kn.delete(n)):r.set(e,i)}zn.delete(d),s!==n&&s.parentNode?.removeChild(s)}});return Jn.set(l,u),l}var Jn=new WeakMap,Yn=class{anchor;#e=new Map;#t=new Map;#n=new Map;#r=new Set;#i=!0;constructor(e,t=!0){this.anchor=e,this.#i=t}#a=e=>{if(this.#e.has(e)){var t=this.#e.get(e),n=this.#t.get(t);if(n)hn(n),this.#r.delete(t);else{var r=this.#n.get(t);r&&(hn(r.effect),this.#t.set(t,r.effect),this.#n.delete(t),r.fragment.lastChild.remove(),this.anchor.before(r.fragment),n=r.effect)}for(let[t,n]of this.#e){if(this.#e.delete(t),t===e)break;let r=this.#n.get(n);r&&(R(r.effect),this.#n.delete(n))}for(let[e,r]of this.#t){if(e===t||this.#r.has(e))continue;let i=()=>{if(Array.from(this.#e.values()).includes(e)){var t=document.createDocumentFragment();_n(r,t),t.append(Gt()),this.#n.set(e,{effect:r,fragment:t})}else R(r);this.#r.delete(e),this.#t.delete(e)};this.#i||!n?(this.#r.add(e),pn(r,i,!1)):i()}}};#o=e=>{this.#e.delete(e);let t=Array.from(this.#e.values());for(let[e,n]of this.#n)t.includes(e)||(R(n.effect),this.#n.delete(e))};ensure(e,t){var n=k,r=Yt();if(t&&!this.#t.has(e)&&!this.#n.has(e))if(r){var i=document.createDocumentFragment(),a=Gt();i.append(a),this.#n.set(e,{effect:L(()=>t(a)),fragment:i})}else this.#t.set(e,L(()=>t(this.anchor)));if(this.#e.set(n,e),r){for(let[t,r]of this.#t)t===e?n.unskip_effect(r):n.skip_effect(r);for(let[t,r]of this.#n)t===e?n.unskip_effect(r.effect):n.skip_effect(r.effect);n.oncommit(this.#a),n.ondiscard(this.#o)}else x&&(this.anchor=S),this.#a(n)}};function Xn(e,t,n=!1){var r;x&&(r=S,Ae());var i=new Yn(e),a=n?te:0;function o(e,t){if(x){var n=Ne(r);if(e!==parseInt(n.substring(1))){var a=Me();ke(a),i.anchor=a,Oe(!1),i.ensure(e,t),Oe(!0);return}}i.ensure(e,t)}sn(()=>{var e=!1;t((t,n=0)=>{e=!0,o(n,t)}),e||o(-1,null)},a)}function Zn(e,t,...n){var r=new Yn(e);sn(()=>{let e=t()??null;r.ensure(e,e&&(t=>e(t,...n)))},te)}var Qn={get(e,t){if(!e.exclude.has(t))return e.props[t]},set(e,t){return!1},getOwnPropertyDescriptor(e,t){if(!e.exclude.has(t)&&t in e.props)return{enumerable:!0,configurable:!0,value:e.props[t]}},has(e,t){return!e.exclude.has(t)&&t in e.props},ownKeys(e){return Reflect.ownKeys(e.props).filter(t=>!e.exclude.has(t))}};function $n(e,t,n){return new Proxy({props:e,exclude:t},Qn)}function er(e,t,n,r){var i=!0,a=!!(n&8),s=!!(n&16),c=r,l=!0,u=void 0,d=()=>s&&i?(u??=dt(r),Z(u)):(l&&(l=!1,c=s?Pn(r):r),c);let f;if(a){var p=se in e||ce in e;f=o(e,t)?.set??(p&&t in e?n=>e[t]=n:void 0)}var m,h=!1;a?[m,h]=at(()=>e[t]):m=e[t],m===void 0&&r!==void 0&&(m=d(),f&&(i&&ye(t),f(m)));var g=i?()=>{var n=e[t];return n===void 0?d():(l=!0,n)}:()=>{var n=e[t];return n!==void 0&&(c=void 0),n===void 0?c:n};if(i&&!(n&4))return g;if(f){var _=e.$$legacy;return(function(e,t){return arguments.length>0?((!i||!t||_||h)&&f(t?g():e),e):g()})}var v=!1,y=(n&1?dt:mt)(()=>(v=!1,g()));a&&Z(y);var ee=U;return(function(e,t){if(arguments.length>0){let n=t?Z(y):i&&a?I(e):e;return F(y,n),v=!0,c!==void 0&&(c=n),e}return z&&v||ee.f&16384?y.v:Z(y)})}function tr(e){C===null&&me(`onMount`),nn(()=>{let t=Pn(e);if(typeof t==`function`)return t})}function nr(e){C===null&&me(`onDestroy`),tr(()=>()=>Pn(e))}typeof window<`u`&&((window.__svelte??={}).v??=new Set).add(`5`);var rr=`phaser/game`;function ir(e){let t={};for(let n of Object.keys(e))e[n]!==void 0&&(t[n]=e[n]);return t}function ar(t={}){let{instance:n,onpreboot:r,onpostboot:i,...a}=t,o=n??new e.Game({...ir(a),callbacks:{preBoot:e=>r?.(e),postBoot:e=>i?.(e)}});Re(rr,o);let s=Qe(o.isRunning);return o.isRunning||o.events.once(`ready`,()=>s.set(!0)),nr(()=>{o.destroy(!0)}),{game:o,booted:$e(s)}}var or=new Set([`$$slots`,`$$events`,`$$legacy`,`instance`,`booting`,`children`]);function sr(e,t){ze(t,!0);let n=()=>rt(s,`$booted`,r),[r,i]=it(),a=er(t,`instance`,15),{game:o,booted:s}=ar({...$n(t,or),instance:a()});a(o);var c=Un(),l=Jt(c),u=e=>{var n=Un();Zn(Jt(n),()=>t.children??d),Wn(e,n)},f=e=>{var n=Un();Zn(Jt(n),()=>t.booting??d),Wn(e,n)};Xn(l,e=>{n()?e(u):e(f,-1)}),Wn(e,c),Be(),i()}var cr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAYklEQVQYlYWP0QkFMQgEZ8NrwC5SSsqxFMtJV5bgfRwegYN3+yXMKKuqCgAzuwcgMwUgiV/DiGiOmVVL44RrLQAi4rk4equhu3Nm8JFH2Hsz5+TsAqCqepV0dzJTkm7h35sXu9EsBow6d7wAAAAASUVORK5CYII=`,lr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAdklEQVQoka2PwQ3FMAhDSdUByBYZiUyYlTICN0ZwDxWV27Sn/5EsgUE8KABERKT3fiYUY4ySea116UdEEQBiZnB3qOold4eZAYCwl0pv541zzifkFq21xSt/eYGVZ39JVW/9nelMZC/pEbFc9PML29vwW810rg8seYyvTD9v+QAAAABJRU5ErkJggg==`,ur=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAYUlEQVQYlYWPwQ3AMAwCcSYgm2aUjOAxMlJ+jEBfrhpVVf2CexgAfi5so/duAJAUpcuDpPfezkyTdGbemqTb892c8xXRAGCt9dmhSYoxxgHLSwrYhm1UfmUXD/sufawpdgFYDkGH3xyeGAAAAABJRU5ErkJggg==`,dr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAV0lEQVQYlYXPwQnAMAxDUbl0AGuLjJdRMl620AjqoQ0ktDT/ZHgG47ANACB5D0+SAgDOga212UHSkiIy84WjWiuOT5mKzPTvgm2QdO99gVIKJMX+xO7NCwVcJEVDaP+mAAAAAElFTkSuQmCC`,fr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAYElEQVQokaWQwQ3AMAgDgQ2YkNVgQkZIP6WySKhU1b9LwBbmtRb9kSBExKubqm7/chr8Inb3MdXM+JRaykwWM+NpuYamZaL7hG7SuZsgC9FeXud+BvLTAaaWAXaAqfh2ATH7NvESpjclAAAAAElFTkSuQmCC`,pr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABwCAYAAACZ8XsCAAAHMElEQVR4nO2dvZazIBCGZ/ek8NIsU1pa5pJSWlpa5tLs9iv2GzNhQQHBAX2fc3JMjCCGNzP8DPpFRD8EgBLf2gUA1+bW9712GcCF+ZrnGS4YqHGbpkm7DODCwAICVYqwgPf7nZqmWT7P80wllAvkpwgL2DQNzfPs/AzOS5ZhmKZpPl5r+1lspgWUn0EaHo/HsuX35me5/whuuTLm4Z3n8/khJjnsYxMZC5JFCEuYhsfjQc/nc9nyPiL6+MzH8H7zmNQkd8FN03yIjAVoG28chmF5bxMcBJgGKbrYdLF5bJF9JoSt3DAM1LYttW1LwzDQMAx/xMUihPtNh004soNn6+zxvufz+fE+h3vOKkBp4YiIuq4jIvpwsQyElw8W0TRNVvGZW/N7biPmsIBJXTALqO/7RXzjOFLXdYu142PGcVzSSWGa+cEF7+fxeFDbtn/2v14v637zmFztP6KEnRBbO0+KjI+x7ZffS8sI8aVBuk8WHAvLtr9tW3q9XkvanCSzgCxA0+2aFtDW5ui67k9aiC8Prl6t2fPNLTwmuQtm69Z13SI+0+LJfex+2XraOifgvGQbB7S18SRyXykhYUd1gvAHe5NUgNx+k5aP3xPRx3vbZ03rJ613Lvha0bl6k2UgWiIr9X6/L++naVrafoyWAOWfJtf5bW1kiDCxBbT9s2XPV37P1qCkCsk5Bz2O49KzBG+SDsPYptG4UqX7YWRHRFt8ktRlwQC7m+QzIa7ZDW4PEv12Ovq+/2gbopKuSVAbcEskZkABRHVNQjyItwve6iXK6bStGQ9wTmJ6+V4W0LeXiCm06xLbyw/qhPj2EuF6r0dsLz+qFwwLByR7DE70MAwHFZQwhBLyA2iX9QykrPtsc8FHYC5kCjkelEG0AG0BBhqshXm5sAlxrX0bMkNiDsb7ponJX4uUdR8tQO0fgissdgG7SyiuqUTbd7YymUMQPmn25K9ByvNX7YL3jDO6hLsm6C2xy0VVMZY5Jv/aqVqALo5oHphhZUS/AlpzpyHlism/Rk4nQNcCpxzYxOBjxXLmXxtV3yHVZlHkPHSJlsK8PUmJZTySagXosiTspkoU4jiOS9lkGa9M9S5YhnQx7KZMEZZQ4WdzoXupWoBSYFtCLEGEoZ0jm+UuZfw1FdW6YIl0Z13Xfaw9IXq75TVi3HRMGtMFu8pl+/7IDtZRVGEBU7Th1lyfrFBfF+lKs2WhXLMwJmY5zig+okoESOT/w5s34PFNE4rrDg9E7rKO4/jHOvuMGXLnpYRmRGqqEWBpjXeXpdsSR8h1yHFAOQh9JhGeog3ogykYn8b81jG+7blUyLZsKUNLezm9ALuu++MazbXJrnTy2FLw6VDVRDUueM/wg63CzPXKPuliyhA7/7v3vLWQXYCxMXYhIU2xhM7LauR/JmtnI6sAXavk5PSY7Qc+W0MbuMkmQLk22Oz5ybto2XqFrt6ez8J432N908Se3yc/GxrXuJUmJ1ktoCtgdJqm1WBSW9zb1prj2GjktTR7z7+WnyuP0HPkitI+ygMV2wmRlnHNmjIx0ci+aWLP71OGvefIEaV95HjjYQK0Rfiu7TfZShMSjRwTYbz3/D5oXKN25PWh44Ape3o+86cp0hyRV8pzaP8uoZx+IBqUDQQIVIEAgSrVCvCoAFJNaitvDFUKMCb6xJWm1HnWqyxcKnYccI2jAkjXiLVOsRHROdG0tFVaQA6xCo00MdPwuFdoBcRap5BlmTHXGIO2pa3SAhLFPdPDlsZ8WpMPe6xTbER0LrQjzaMtIK+9uEJDmShNBHVNrF1Lyrqv0gUfTc0R1DEcei3zPP9svYjoZxzH5T1v+eVKY75C95eSZu2a1n6HreNLuUafa3Fdl9RH3/feefAr2w0qQ+d91/LTTuP7/Z7jS7lGH1JaxigBXqXdB/ITJECOYgbAxHz0ri/eT0oiKufJ5qBM5FOSiPxcdZAAAQjBR4BewzBnGFoAx+KrGe9xQIgQ+BKileCHFZ4R7lzd7/csC3E4/9frFfw0ybODmRCgym1rLeoeQp/lBs6FT/3f+IuUQrTllVPooCxC6n9pA0oh2hLaErtObjsuVf6gbELr/5voHRNmLkjmg/m19cwN18lT5Q/KJqb+nQPRa71B23ehvcfQ/HOCXvB+Yuvf2Qtei8Y1v3PdD2XrzvSx9w4EZbGn/leHYXxEYlM+3wnevCN8TP6gbPbW/xf9Bg8CoAIGooEq32w+scVWY0sk4vqxxfbwbRGFwPayW6+AVABygU4IUAUCBKpAgEAVCBCoAgECVSBAoAoECFSBAIEqECBQBQIEqkCAQBUIEKgCAQJVIECgCgQIVIEAgSoQIFAFAgSqFPOsOHMR+nyi21YAN0UI0Pb4h6PvDwN0UHfBrmePjOOIW3NcAHUBgmujvixzy8rBDZ8b9Tbg/P8uWKbQ0Aa8BnDBQBV1C0hkvxcgrN81+Af6cjNm2bpEowAAAABJRU5ErkJggg==`,mr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAXElEQVQokWP8//8/g6Ig538GLOD++++MDAwMeOVZFAU5/6MrROc7BERg08+gKMj5nwmZc//9d8b7778z4rIRG4AbQMi5BA1A1gwzjBjAgswhRSNOF5DqBUZKoxEAQqs2oyIc1lkAAAAASUVORK5CYII=`,hr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAS0lEQVQYlXWPwQ3AUAhCofkD4KaO4qaMYG+NaS1H8UFgdyMiGotsk5K6qj5mZgIAzvsAABM4A8KWdG3d68OkZx0lrQueBNv8M23zBjYrGbkXzQ+wAAAAAElFTkSuQmCC`,gr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAEZJREFUGJWNj0EOgEAIA6f7SXgivBIvK6Ix0Z5KpiStuFTD62kqIpq6e7M1oZkBsO86Aze4v1uLD3UgM5HE7PKrpEb4deYB2bcXAzyI908AAAAASUVORK5CYII=`,_r=`data:image/png;base64,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`,vr=`/games/ps2-mario/assets/font-DD2UNu94.png`,yr=`/games/ps2-mario/assets/goomba-UWN_nZom.png`,br=`data:image/png;base64,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`,xr=`data:image/png;base64,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`,Sr=`data:image/png;base64,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`,Cr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAFCAYAAABfPyy9AAAAPElEQVQYlbWRMQrAQAzD5L4yT8wv1e0oNFtaTwYNMjgqSWSIGmDFA9jdL1hVp2/4NZm/zCh4rtvy/P3BDQgnKxl7It68AAAAAElFTkSuQmCC`,wr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAATklEQVQokc2Ryw2AQAgFh+2ALui/mtcFJeCJBPXgRi/OieR9EsAAqgp3LwaZaVxoz9TWFCQh6WR+YvXQwYjYyd0L3vKjgt69b7GLwbc3HkYHI32srJkjAAAAAElFTkSuQmCC`,Tr=`data:image/png;base64,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`,Er=`data:image/png;base64,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`,Dr=`/games/ps2-mario/assets/smb_tiles-CGP8-lqP.png`,Or=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAwCAYAAABE1blzAAAAAXNSR0IArs4c6QAAA2VJREFUaIHVWjGS6yAMVTIUHM2lS5cuOZJLSkqXPhpdttgvf4UISQaS3X0znhiDQQ8JJBTfcs4PeCO8913v55ybx8g5gwshiC9v2wa1Ntu26RIWA2oIIUCM8aksIcYIOWfY9x0AAJZlOcvee3CSoLTzso02cAkkh4LUME3TKfgIOLwpBeZIY5tWzSG54ziqbadpeiKJ9zXEGF9MlJYdrUDBJZO8qjkEJSdpJ8YIKaWzPM+z2jeaJDVPgG9zfSIYQjCZays0chw0k9ZwEpTM7qpJjoRFgxIcgKydEZrrgUWDdM2V69Ft28b6Edx+uZdoGwkWt6BhWZau9533HtZ1ZSspsavCeu+7nXzr2Dg+QLGLSgNcFXZd12G+DKB9s7kPk+ADmOdZNFmu/k8R1KyIqzeZ6G8BDQCs9SaCIYTqRlTDyPXXs1k5aQPBulHC0jjzY8g5P/Ba1/X8xfuyTJ9bLwBgL0v9MIIcAY4oR1giDQCPlNLLJREtyv0EW7TCTYZEkBLiCJbERhG8cycI6lQ5B4vPtm17utfi1pRSdSfUwsJW3AH+C7zvO0uu/C3rQwjiUcsKJDcihkXccs6PEAK7ux3Hoe56x3GIxLz3L1oro40aoX+Eb6IACm64U6F5ISEUnHs+TdOZdtC0ZjG50jyL8hiCiFrehT6/ao6Sn9Xqvff9BDVHL8G6XqSjF2fGHNBqMPCwyOe899WZxHJtcFxLFg3RPuiYIyBNjpMEpKC5ESpwbfaXZXmZoHmeYd93SCkNJ1nDGYumlE4BUMDSBHp8FE7QsiwvE9JyoLZOzluOS1fzKC1r0GoBDmeOE8qiPctpBADOxKyFyFVIE+pQEADZBCXBpJmkSwD7QPMfAdo/B9N5sDd1V47xic0F4SStWSIJg5988bPviDk5JeScwaFq6T8+o9MNlAgN2Ee4Cs1NfSzp1PsnSit+LG3Yu66tfX9Eg5Z4ttXRa5vkDfS0QFc0rwXzAH3BtgZHO26J1i34pFso8adS9y04z4PvMpF3QzsQd28y2qcmtQ8bpLZc39w7VlQzy5ZLShJbMuW0bGlT5mE1cjf4TsSqs1CLdPBPGS4vSp/V7rm22vsUMUbRRIcR/CloBIc6eu1DIq2t5UMkrMd7LW4eRrDVHGka8uo7FlgiGRG/3US/AIkrI0hFn+UQAAAAAElFTkSuQmCC`,kr=`{
  "frames": {
    "k_00610074006c00610073005f00730030": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730031": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 16,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310030": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 160,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310031": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 176,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310032": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 192,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310033": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 208,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310034": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 224,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310035": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 240,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310036": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 256,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310037": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 272,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310038": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 288,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310039": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 304,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730032": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 32,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300320030": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 320,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300320031": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 336,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300320032": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 352,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730033": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 48,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730034": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 64,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730035": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 80,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730036": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 96,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730037": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 112,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730038": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 128,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730039": {
      "frame": {
        "h": 16,
        "w": 16,
        "x": 144,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 16,
        "w": 16
      },
      "spriteSourceSize": {
        "h": 16,
        "w": 16,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    }
  },
  "meta": {
    "app": "Evil Invaders Atlas Builder",
    "format": "RGBA8888",
    "image": "atlas.png",
    "scale": "1",
    "size": {
      "h": 16,
      "w": 368
    },
    "version": "1.0"
  }
}`,Ar=`{
  "frames": {
    "k_00610074006c00610073005f00730030": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 0,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 22,
        "w": 19,
        "x": 1,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730031": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 21,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 15,
        "w": 21,
        "x": 0,
        "y": 3
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310030": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 210,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 21,
        "w": 21,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f007300310031": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 231,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 20,
        "w": 21,
        "x": 0,
        "y": 1
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730032": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 42,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 20,
        "w": 19,
        "x": 1,
        "y": 1
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730033": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 63,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 22,
        "w": 19,
        "x": 1,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730034": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 84,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 22,
        "w": 20,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730035": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 105,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 22,
        "w": 17,
        "x": 2,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730036": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 126,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 20,
        "w": 21,
        "x": 0,
        "y": 1
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730037": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 147,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 20,
        "w": 19,
        "x": 1,
        "y": 1
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730038": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 168,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 21,
        "w": 19,
        "x": 1,
        "y": 0
      },
      "trimmed": false
    },
    "k_00610074006c00610073005f00730039": {
      "frame": {
        "h": 22,
        "w": 21,
        "x": 189,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 22,
        "w": 21
      },
      "spriteSourceSize": {
        "h": 22,
        "w": 21,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    }
  },
  "meta": {
    "app": "Evil Invaders Atlas Builder",
    "format": "RGBA8888",
    "image": "atlas.png",
    "scale": "1",
    "size": {
      "h": 22,
      "w": 252
    },
    "version": "1.0"
  }
}`,jr=`{
  "frames": {
    "atlas_s0": {
      "frame": {
        "h": 32,
        "w": 32,
        "x": 0,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 32,
        "w": 32
      },
      "spriteSourceSize": {
        "h": 32,
        "w": 32,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "atlas_s1": {
      "frame": {
        "h": 32,
        "w": 32,
        "x": 32,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 32,
        "w": 32
      },
      "spriteSourceSize": {
        "h": 32,
        "w": 32,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "atlas_s2": {
      "frame": {
        "h": 32,
        "w": 32,
        "x": 64,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 32,
        "w": 32
      },
      "spriteSourceSize": {
        "h": 32,
        "w": 32,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "atlas_s3": {
      "frame": {
        "h": 32,
        "w": 32,
        "x": 96,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 32,
        "w": 32
      },
      "spriteSourceSize": {
        "h": 32,
        "w": 32,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "atlas_s4": {
      "frame": {
        "h": 32,
        "w": 32,
        "x": 128,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 32,
        "w": 32
      },
      "spriteSourceSize": {
        "h": 32,
        "w": 32,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "atlas_s5": {
      "frame": {
        "h": 32,
        "w": 32,
        "x": 160,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 32,
        "w": 32
      },
      "spriteSourceSize": {
        "h": 32,
        "w": 32,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "atlas_s6": {
      "frame": {
        "h": 32,
        "w": 32,
        "x": 192,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 32,
        "w": 32
      },
      "spriteSourceSize": {
        "h": 32,
        "w": 32,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "atlas_s7": {
      "frame": {
        "h": 32,
        "w": 32,
        "x": 224,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 32,
        "w": 32
      },
      "spriteSourceSize": {
        "h": 32,
        "w": 32,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "atlas_s8": {
      "frame": {
        "h": 32,
        "w": 32,
        "x": 256,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 32,
        "w": 32
      },
      "spriteSourceSize": {
        "h": 32,
        "w": 32,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    },
    "atlas_s9": {
      "frame": {
        "h": 32,
        "w": 32,
        "x": 288,
        "y": 0
      },
      "rotated": false,
      "sourceSize": {
        "h": 32,
        "w": 32
      },
      "spriteSourceSize": {
        "h": 32,
        "w": 32,
        "x": 0,
        "y": 0
      },
      "trimmed": false
    }
  },
  "meta": {
    "app": "Evil Invaders Atlas Builder",
    "format": "RGBA8888",
    "image": "atlas.png",
    "scale": "1",
    "size": {
      "h": 32,
      "w": 320
    },
    "version": "1.0"
  }
}
`,Mr=`{
  "height": 18,
  "infinite": false,
  "layers": [
    {
      "draworder": "topdown",
      "name": "objects",
      "objects": [
        {
          "height": 8,
          "id": 133,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 40,
          "y": 88
        },
        {
          "height": 8,
          "id": 135,
          "name": "box",
          "properties": {
            "content": "coin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 272,
          "y": 64
        },
        {
          "height": 8,
          "id": 136,
          "name": "box",
          "properties": {
            "content": "coin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 360,
          "y": 88
        },
        {
          "height": 8,
          "id": 176,
          "name": "box",
          "properties": {
            "content": "mushroom"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 176,
          "y": 88
        },
        {
          "height": 14,
          "id": 129,
          "name": "player",
          "rotation": 0,
          "type": "player",
          "visible": true,
          "width": 8,
          "x": 12,
          "y": 44
        },
        {
          "height": 8,
          "id": 180,
          "name": "box",
          "properties": {
            "content": "coin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 528,
          "y": 72
        },
        {
          "height": 8,
          "id": 181,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 544,
          "y": 72
        },
        {
          "height": 8,
          "id": 182,
          "name": "box",
          "properties": {
            "content": "coin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 560,
          "y": 72
        },
        {
          "height": 8,
          "id": 183,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 536,
          "y": 72
        },
        {
          "height": 8,
          "id": 185,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 552,
          "y": 72
        },
        {
          "height": 8,
          "id": 192,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 648,
          "y": 96
        },
        {
          "height": 8,
          "id": 193,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 632,
          "y": 56
        },
        {
          "height": 8,
          "id": 194,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 640,
          "y": 56
        },
        {
          "height": 8,
          "id": 195,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 648,
          "y": 56
        },
        {
          "height": 8,
          "id": 196,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 664,
          "y": 56
        },
        {
          "height": 8,
          "id": 197,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 656,
          "y": 56
        },
        {
          "height": 8,
          "id": 198,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 672,
          "y": 56
        },
        {
          "height": 8,
          "id": 199,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 744,
          "y": 96
        },
        {
          "height": 8,
          "id": 200,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 752,
          "y": 96
        },
        {
          "height": 8,
          "id": 201,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 760,
          "y": 96
        },
        {
          "height": 8,
          "id": 202,
          "name": "box",
          "properties": {
            "content": "mushroom"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 752,
          "y": 64
        },
        {
          "height": 8,
          "id": 204,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 832,
          "y": 88
        },
        {
          "height": 8,
          "id": 218,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1000,
          "y": 64
        },
        {
          "height": 8,
          "id": 219,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1008,
          "y": 64
        },
        {
          "height": 8,
          "id": 220,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1016,
          "y": 64
        },
        {
          "height": 8,
          "id": 221,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1024,
          "y": 64
        },
        {
          "height": 8,
          "id": 222,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1032,
          "y": 64
        },
        {
          "height": 8,
          "id": 223,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1040,
          "y": 64
        },
        {
          "height": 8,
          "id": 224,
          "name": "box",
          "properties": {
            "content": "coin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1016,
          "y": 32
        },
        {
          "height": 8,
          "id": 225,
          "name": "box",
          "properties": {
            "content": "coin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1024,
          "y": 32
        },
        {
          "height": 8,
          "id": 226,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1152,
          "y": 88
        },
        {
          "height": 8,
          "id": 227,
          "name": "box",
          "properties": {
            "content": "coin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1384,
          "y": 64
        },
        {
          "height": 8,
          "id": 228,
          "name": "box",
          "properties": {
            "content": "coin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1288,
          "y": 88
        },
        {
          "height": 8,
          "id": 230,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1488,
          "y": 72
        },
        {
          "height": 8,
          "id": 231,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1504,
          "y": 72
        },
        {
          "height": 8,
          "id": 232,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1520,
          "y": 72
        },
        {
          "height": 8,
          "id": 233,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 1496,
          "y": 72
        },
        {
          "height": 8,
          "id": 234,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 1512,
          "y": 72
        },
        {
          "height": 8,
          "id": 235,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1608,
          "y": 88
        },
        {
          "height": 8,
          "id": 242,
          "name": "box",
          "properties": {
            "content": "coin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1712,
          "y": 64
        },
        {
          "height": 8,
          "id": 243,
          "name": "box",
          "properties": {
            "content": "rotatingCoin"
          },
          "propertytypes": {
            "content": "string"
          },
          "rotation": 0,
          "type": "box",
          "visible": true,
          "width": 8,
          "x": 1800,
          "y": 88
        },
        {
          "height": 8,
          "id": 244,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 2056,
          "y": 72
        },
        {
          "height": 8,
          "id": 245,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 2064,
          "y": 72
        },
        {
          "height": 8,
          "id": 246,
          "name": "brick",
          "rotation": 0,
          "type": "brick",
          "visible": true,
          "width": 8,
          "x": 2072,
          "y": 72
        },
        {
          "height": 5,
          "id": 249,
          "name": "platformMovingUpAndDown",
          "properties": {
            "distance": 80
          },
          "propertytypes": {
            "distance": "int"
          },
          "rotation": 0,
          "type": "platformMovingUpAndDown",
          "visible": true,
          "width": 24,
          "x": 2280,
          "y": 48
        },
        {
          "height": 5,
          "id": 251,
          "name": "platformMovingLeftAndRight",
          "properties": {
            "distance": 50
          },
          "propertytypes": {
            "distance": "int"
          },
          "rotation": 0,
          "type": "platformMovingLeftAndRight",
          "visible": true,
          "width": 24,
          "x": 2292,
          "y": 32
        },
        {
          "height": 8,
          "id": 256,
          "name": "goomba",
          "rotation": 0,
          "type": "goomba",
          "visible": true,
          "width": 8,
          "x": 200,
          "y": 96
        },
        {
          "height": 8,
          "id": 258,
          "name": "goomba",
          "rotation": 0,
          "type": "goomba",
          "visible": true,
          "width": 8,
          "x": 504,
          "y": 80
        },
        {
          "height": 8,
          "id": 259,
          "name": "goomba",
          "rotation": 0,
          "type": "goomba",
          "visible": true,
          "width": 8,
          "x": 632,
          "y": 32
        },
        {
          "height": 8,
          "id": 260,
          "name": "goomba",
          "rotation": 0,
          "type": "goomba",
          "visible": true,
          "width": 8,
          "x": 664,
          "y": 32
        },
        {
          "height": 8,
          "id": 261,
          "name": "koopa",
          "rotation": 0,
          "type": "koopa",
          "visible": true,
          "width": 8,
          "x": 882,
          "y": 110
        },
        {
          "height": 8,
          "id": 262,
          "name": "goomba",
          "rotation": 0,
          "type": "goomba",
          "visible": true,
          "width": 8,
          "x": 1176,
          "y": 104
        },
        {
          "height": 8,
          "id": 263,
          "name": "goomba",
          "rotation": 0,
          "type": "goomba",
          "visible": true,
          "width": 8,
          "x": 1360,
          "y": 104
        },
        {
          "height": 8,
          "id": 264,
          "name": "goomba",
          "rotation": 0,
          "type": "goomba",
          "visible": true,
          "width": 8,
          "x": 1472,
          "y": 88
        },
        {
          "height": 8,
          "id": 265,
          "name": "goomba",
          "rotation": 0,
          "type": "goomba",
          "visible": true,
          "width": 8,
          "x": 1560,
          "y": 88
        },
        {
          "height": 8,
          "id": 266,
          "name": "goomba",
          "rotation": 0,
          "type": "goomba",
          "visible": true,
          "width": 8,
          "x": 1632,
          "y": 104
        },
        {
          "height": 8,
          "id": 267,
          "name": "goomba",
          "rotation": 0,
          "type": "goomba",
          "visible": true,
          "width": 8,
          "x": 1688,
          "y": 104
        },
        {
          "height": 8,
          "id": 268,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 688,
          "y": 56
        },
        {
          "height": 8,
          "id": 270,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 688,
          "y": 48
        },
        {
          "height": 8,
          "id": 271,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 688,
          "y": 40
        },
        {
          "height": 8,
          "id": 272,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 688,
          "y": 64
        },
        {
          "height": 8,
          "id": 273,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 688,
          "y": 72
        },
        {
          "height": 8,
          "id": 274,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 688,
          "y": 80
        },
        {
          "height": 8,
          "id": 275,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 688,
          "y": 88
        },
        {
          "height": 8,
          "id": 276,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 2144,
          "y": 104
        },
        {
          "height": 8,
          "id": 277,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 2128,
          "y": 104
        },
        {
          "height": 8,
          "id": 278,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 2160,
          "y": 104
        },
        {
          "height": 8,
          "id": 279,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 2160,
          "y": 80
        },
        {
          "height": 8,
          "id": 280,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 2176,
          "y": 80
        },
        {
          "height": 8,
          "id": 281,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 2192,
          "y": 80
        },
        {
          "height": 8,
          "id": 282,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 2216,
          "y": 88
        },
        {
          "height": 8,
          "id": 283,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 2216,
          "y": 104
        },
        {
          "height": 8,
          "id": 284,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 2216,
          "y": 72
        },
        {
          "height": 8,
          "id": 285,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 2216,
          "y": 56
        },
        {
          "height": 8,
          "id": 286,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 2216,
          "y": 40
        },
        {
          "height": 6,
          "id": 289,
          "name": "level1room1",
          "properties": {
            "direction": "down",
            "marioSpawnX": 16,
            "marioSpawnY": 16
          },
          "propertytypes": {
            "direction": "string",
            "marioSpawnX": "int",
            "marioSpawnY": "int"
          },
          "rotation": 0,
          "type": "portal",
          "visible": true,
          "width": 12,
          "x": 330,
          "y": 110
        },
        {
          "height": 6,
          "id": 293,
          "name": "level1room2",
          "properties": {
            "direction": "down",
            "marioSpawnX": 16,
            "marioSpawnY": 16
          },
          "propertytypes": {
            "direction": "string",
            "marioSpawnX": "int",
            "marioSpawnY": "int"
          },
          "rotation": 0,
          "type": "portal",
          "visible": true,
          "width": 12,
          "x": 1122,
          "y": 110
        },
        {
          "height": 32,
          "id": 294,
          "name": "exit",
          "properties": {
            "direction": "none",
            "marioSpawnX": 0,
            "marioSpawnY": 0
          },
          "propertytypes": {
            "direction": "string",
            "marioSpawnX": "int",
            "marioSpawnY": "int"
          },
          "rotation": 0,
          "type": "portal",
          "visible": true,
          "width": 16,
          "x": 2384,
          "y": 0
        },
        {
          "height": 16,
          "id": 295,
          "name": "exit",
          "properties": {
            "direction": "none",
            "marioSpawnX": 0,
            "marioSpawnY": 0
          },
          "propertytypes": {
            "direction": "string",
            "marioSpawnX": "int",
            "marioSpawnY": "int"
          },
          "rotation": 0,
          "type": "portal",
          "visible": true,
          "width": 16,
          "x": 2384,
          "y": 120
        }
      ],
      "opacity": 1,
      "type": "objectgroup",
      "visible": true,
      "x": 0,
      "y": 0
    },
    {
      "data": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADEAAAAyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEEAAABCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIQAAACIAAAAhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEQAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARAAAAEQAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAARAAAAEQAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA3AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA3AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbAAAAGwAAABsAAAAbAAAAGwAAABsAAAAbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAJAAAAAAAAAAAAAAAJAAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAACQAAAAAAAAAAAAAACQAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAJAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAACQAAAAAAAAAAAAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbAAAAGwAAABsAAAAbAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEAAAAiAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAChAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAJcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARAAAAEQAAAAAAAAAAAAAAAAAAAAAAAAChAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAJcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAARAAAAEQAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEAAAAiAAAAAAAAADcAAAA4AAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANwAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA3AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAChAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAJcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADcAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA3AAAAOAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADcAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARAAAAEQAAAAAAAAAAAAAAAAAAAAAAAAChAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAJcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANwAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA3AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAARAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAAAAAAAAAAAAAAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEAAAAiAAAAAAAAAEcAAABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARwAAAEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAChAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAJcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAAABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAAABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARAAAAEQAAAAAAAAAAAAAAAAAAAAAAAAChAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAJcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARwAAAEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAARAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAAAAAAAAAAAARAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAEQAAABEAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADEAAAAyAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAJcAAAChAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAACXAAAAAAAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAGUAAABlAAAAZQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAJcAAAAAAAAAAAAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAlwAAAKEAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAFUAAABVAAAAVQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEEAAABCAAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAJcAAAChAAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAACXAAAAAAAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAJcAAAAAAAAAAAAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAlwAAAKEAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAAHUAAAB1AAAAdQAAACEAAAAiAAAAIQAAACIAAAAhAAAAIgAAACEAAAAiAAAAIQAAACIAAAAhAAAAIgAAACEAAAAiAAAAIQAAACIAAAAhAAAAIgAAACEAAAAiAAAA",
      "encoding": "base64",
      "height": 18,
      "name": "foregroundLayer",
      "opacity": 1,
      "type": "tilelayer",
      "visible": true,
      "width": 300,
      "x": 0,
      "y": 0
    },
    {
      "data": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAFkAAABZAAAAWQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAGkAAABpAAAAaQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD9AAAA/gAAAP8AAAD+AAAA/wAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/QAAAP4AAAD/AAAA/gAAAP8AAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD9AAAA/gAAAP8AAAD+AAAA/wAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/QAAAP4AAAD/AAAA/gAAAP8AAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/QAAAP4AAAD/AAAA/gAAAP8AAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANAQAADgEAAA8BAAAPAQAADwEAABABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/QAAAP4AAAD/AAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQEAAA4BAAAPAQAADgEAAA8BAAAQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANAQAADgEAAA8BAAAOAQAADwEAABABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQEAAA4BAAAPAQAADwEAAA8BAAAQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0AAAD+AAAA/wAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/QAAAP4AAAD/AAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQEAAA4BAAAPAQAADgEAAA8BAAAQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQEAAA4BAAAPAQAAEAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0BAAAOAQAADwEAABABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQEAAA4BAAAPAQAAEAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkQAAAJIAAACiAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJEAAACSAAAAogAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkQAAAJIAAACiAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoQAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKMAAAAAAAAAogAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKEAAACiAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKMAAAAAAAAAogAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoQAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACRAAAAkgAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAJQAAACVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAowAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAkQAAAJIAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKMAAACiAAAAAAAAAAAAAAAAAAAAAAAAAJEAAACSAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJEAAACSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAowAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAkQAAAJIAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACjAAAAkQAAAJIAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKMAAACiAAAAAAAAAAAAAAAAAAAAAAAAAJEAAACSAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKMAAACiAAAAAAAAAAAAAAAAAAAAAAAAAJEAAACSAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkQAAAJIAAAChAAAAogAAAKMAAACiAAAAAAAAAAAAAAAAAAAAAAAAAKQAAAClAAAApgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAJEAAACSAAAAoQAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAoQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAACRAAAAkgAAAKEAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACRAAAAkgAAAKEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAJEAAACSAAAAoQAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJEAAACSAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAACRAAAAkgAAAKEAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAKEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiAAAAoQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAAAAAACRAAAAkgAAAKEAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoQAAAAAAAACTAAAAAAAAAAAAAACjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAKEAAAAAAAAAoQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAowAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAChAAAAAAAAAKEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAChAAAAAAAAAKEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAogAAAAAAAAAAAAAAAAAAAAAAAACjAAAAAAAAAKEAAAAAAAAAoQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAACiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKEAAAAAAAAAoQAAAKMAAAAAAAAAAAAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAChAAAAAAAAAKEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAowAAAKIAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAChAAAAAAAAAKEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKMAAAAAAAAAAAAAAAAAAAAAAAAAoQAAAKIAAAChAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "encoding": "base64",
      "height": 18,
      "name": "backgroundLayer",
      "opacity": 1,
      "type": "tilelayer",
      "visible": true,
      "width": 300,
      "x": 0,
      "y": 0
    }
  ],
  "nextobjectid": 296,
  "orientation": "orthogonal",
  "renderorder": "right-down",
  "tiledversion": "1.1.6",
  "tileheight": 8,
  "tilesets": [
    {
      "columns": 16,
      "firstgid": 1,
      "image": "../tiles/smb_tiles.png",
      "imageheight": 256,
      "imagewidth": 128,
      "margin": 0,
      "name": "tiles",
      "spacing": 0,
      "tilecount": 352,
      "tileheight": 8,
      "tileproperties": {
        "100": {
          "collide": true
        },
        "143": {
          "collide": true
        },
        "16": {
          "collide": true
        },
        "24": {
          "collide": true
        },
        "32": {
          "collide": true
        },
        "33": {
          "collide": true
        },
        "54": {
          "collide": true
        },
        "55": {
          "collide": true
        },
        "70": {
          "collide": true
        },
        "71": {
          "collide": true
        },
        "84": {
          "collide": true
        }
      },
      "tilepropertytypes": {
        "100": {
          "collide": "bool"
        },
        "143": {
          "collide": "bool"
        },
        "16": {
          "collide": "bool"
        },
        "24": {
          "collide": "bool"
        },
        "32": {
          "collide": "bool"
        },
        "33": {
          "collide": "bool"
        },
        "54": {
          "collide": "bool"
        },
        "55": {
          "collide": "bool"
        },
        "70": {
          "collide": "bool"
        },
        "71": {
          "collide": "bool"
        },
        "84": {
          "collide": "bool"
        }
      },
      "tilewidth": 8
    }
  ],
  "tilewidth": 8,
  "type": "map",
  "version": 1,
  "width": 300
}
`,Nr=`{
  "height": 18,
  "infinite": false,
  "layers": [
    {
      "draworder": "topdown",
      "name": "objects",
      "objects": [
        {
          "height": 14,
          "id": 129,
          "name": "player",
          "rotation": 0,
          "type": "player",
          "visible": true,
          "width": 8,
          "x": 16,
          "y": 16
        },
        {
          "height": 8,
          "id": 291,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 48,
          "y": 104
        },
        {
          "height": 8,
          "id": 292,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 56,
          "y": 104
        },
        {
          "height": 8,
          "id": 293,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 64,
          "y": 104
        },
        {
          "height": 8,
          "id": 294,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 72,
          "y": 104
        },
        {
          "height": 8,
          "id": 295,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 80,
          "y": 104
        },
        {
          "height": 8,
          "id": 296,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 48,
          "y": 88
        },
        {
          "height": 8,
          "id": 297,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 56,
          "y": 88
        },
        {
          "height": 8,
          "id": 298,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 64,
          "y": 88
        },
        {
          "height": 8,
          "id": 299,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 72,
          "y": 88
        },
        {
          "height": 8,
          "id": 300,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 80,
          "y": 88
        },
        {
          "height": 8,
          "id": 301,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 48,
          "y": 72
        },
        {
          "height": 8,
          "id": 302,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 56,
          "y": 72
        },
        {
          "height": 8,
          "id": 303,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 64,
          "y": 72
        },
        {
          "height": 8,
          "id": 304,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 72,
          "y": 72
        },
        {
          "height": 8,
          "id": 305,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 80,
          "y": 72
        },
        {
          "height": 8,
          "id": 311,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 88,
          "y": 104
        },
        {
          "height": 8,
          "id": 312,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 88,
          "y": 88
        },
        {
          "height": 8,
          "id": 313,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 88,
          "y": 72
        },
        {
          "height": 16,
          "id": 314,
          "name": "level1",
          "properties": {
            "direction": "right",
            "marioSpawnX": 332,
            "marioSpawnY": 98
          },
          "propertytypes": {
            "direction": "string",
            "marioSpawnX": "int",
            "marioSpawnY": "int"
          },
          "rotation": 0,
          "type": "portal",
          "visible": true,
          "width": 8,
          "x": 124,
          "y": 112
        }
      ],
      "opacity": 1,
      "type": "objectgroup",
      "visible": true,
      "x": 0,
      "y": 0
    },
    {
      "data": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkAAAAAAAAAAAAAAAAAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAAAAAAAAAAAAAAAAAAEcAAABIAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARwAAAEgAAAAZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAABkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAAABIAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARwAAAEgAAAAZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAABkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAAABIAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARwAAAEgAAAAZAAAAAAAAAAAAAAAAAAAACQAAAAkAAAAAAAAAAAAAAAkAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAABkAAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAkAAAAJAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAAABIAAAAGQAAAAAAAAAAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARwAAAEgAAAAZAAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAABkAAAAAAAAAAAAAAAAAAAAAAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAAAAAAAAAAAAAAAAA5AAAAOgAAAD0AAABIAAAAGQAAAAkAAAAAAAAAAAAAAAAAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAAAAAAAAAAAAAAAAAAEkAAABKAAAATQAAAEgAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAA",
      "encoding": "base64",
      "height": 18,
      "name": "foregroundLayer",
      "opacity": 1,
      "type": "tilelayer",
      "visible": true,
      "width": 20,
      "x": 0,
      "y": 0
    },
    {
      "data": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "encoding": "base64",
      "height": 18,
      "name": "backgroundLayer",
      "opacity": 1,
      "type": "tilelayer",
      "visible": true,
      "width": 20,
      "x": 0,
      "y": 0
    }
  ],
  "nextobjectid": 315,
  "orientation": "orthogonal",
  "renderorder": "right-down",
  "tiledversion": "1.1.6",
  "tileheight": 8,
  "tilesets": [
    {
      "columns": 16,
      "firstgid": 1,
      "image": "../tiles/smb_tiles.png",
      "imageheight": 176,
      "imagewidth": 128,
      "margin": 0,
      "name": "tiles",
      "spacing": 0,
      "tilecount": 352,
      "tileheight": 8,
      "tileproperties": {
        "100": {
          "collide": true
        },
        "143": {
          "collide": true
        },
        "16": {
          "collide": true
        },
        "24": {
          "collide": true
        },
        "32": {
          "collide": true
        },
        "33": {
          "collide": true
        },
        "54": {
          "collide": true
        },
        "55": {
          "collide": true
        },
        "56": {
          "collide": true
        },
        "57": {
          "collide": true
        },
        "58": {
          "collide": true
        },
        "59": {
          "collide": true
        },
        "60": {
          "collide": true
        },
        "61": {
          "collide": true
        },
        "70": {
          "collide": true
        },
        "71": {
          "collide": true
        },
        "72": {
          "collide": true
        },
        "73": {
          "collide": true
        },
        "74": {
          "collide": true
        },
        "75": {
          "collide": true
        },
        "76": {
          "collide": true
        },
        "77": {
          "collide": true
        },
        "84": {
          "collide": true
        }
      },
      "tilepropertytypes": {
        "100": {
          "collide": "bool"
        },
        "143": {
          "collide": "bool"
        },
        "16": {
          "collide": "bool"
        },
        "24": {
          "collide": "bool"
        },
        "32": {
          "collide": "bool"
        },
        "33": {
          "collide": "bool"
        },
        "54": {
          "collide": "bool"
        },
        "55": {
          "collide": "bool"
        },
        "56": {
          "collide": "bool"
        },
        "57": {
          "collide": "bool"
        },
        "58": {
          "collide": "bool"
        },
        "59": {
          "collide": "bool"
        },
        "60": {
          "collide": "bool"
        },
        "61": {
          "collide": "bool"
        },
        "70": {
          "collide": "bool"
        },
        "71": {
          "collide": "bool"
        },
        "72": {
          "collide": "bool"
        },
        "73": {
          "collide": "bool"
        },
        "74": {
          "collide": "bool"
        },
        "75": {
          "collide": "bool"
        },
        "76": {
          "collide": "bool"
        },
        "77": {
          "collide": "bool"
        },
        "84": {
          "collide": "bool"
        }
      },
      "tilewidth": 8
    }
  ],
  "tilewidth": 8,
  "type": "map",
  "version": 1,
  "width": 20
}
`,Pr=`{
  "height": 18,
  "infinite": false,
  "layers": [
    {
      "draworder": "topdown",
      "name": "objects",
      "objects": [
        {
          "height": 14,
          "id": 129,
          "name": "player",
          "rotation": 0,
          "type": "player",
          "visible": true,
          "width": 8,
          "x": 16,
          "y": 16
        },
        {
          "height": 8,
          "id": 291,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 16,
          "y": 112
        },
        {
          "height": 16,
          "id": 314,
          "name": "level1",
          "properties": {
            "direction": "right",
            "marioSpawnX": 1124,
            "marioSpawnY": 96
          },
          "propertytypes": {
            "direction": "string",
            "marioSpawnX": "int",
            "marioSpawnY": "int"
          },
          "rotation": 0,
          "type": "portal",
          "visible": true,
          "width": 8,
          "x": 126,
          "y": 40
        },
        {
          "height": 8,
          "id": 316,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 32,
          "y": 112
        },
        {
          "height": 8,
          "id": 317,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 48,
          "y": 112
        },
        {
          "height": 8,
          "id": 318,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 64,
          "y": 112
        },
        {
          "height": 8,
          "id": 319,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 80,
          "y": 112
        },
        {
          "height": 8,
          "id": 320,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 96,
          "y": 112
        },
        {
          "height": 8,
          "id": 321,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 112,
          "y": 112
        },
        {
          "height": 8,
          "id": 322,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 128,
          "y": 112
        },
        {
          "height": 8,
          "id": 323,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 144,
          "y": 112
        },
        {
          "height": 8,
          "id": 324,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 128,
          "y": 80
        },
        {
          "height": 8,
          "id": 325,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 112,
          "y": 80
        },
        {
          "height": 8,
          "id": 326,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 96,
          "y": 80
        },
        {
          "height": 8,
          "id": 327,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 64,
          "y": 80
        },
        {
          "height": 8,
          "id": 328,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 80,
          "y": 80
        },
        {
          "height": 8,
          "id": 329,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 48,
          "y": 80
        },
        {
          "height": 8,
          "id": 330,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 40,
          "y": 40
        },
        {
          "height": 8,
          "id": 331,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 56,
          "y": 40
        },
        {
          "height": 8,
          "id": 332,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 72,
          "y": 40
        },
        {
          "height": 8,
          "id": 333,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 88,
          "y": 40
        },
        {
          "height": 8,
          "id": 334,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 104,
          "y": 40
        },
        {
          "height": 8,
          "id": 335,
          "name": "collectible",
          "properties": {
            "kindOfCollectible": "coin2"
          },
          "propertytypes": {
            "kindOfCollectible": "string"
          },
          "rotation": 0,
          "type": "collectible",
          "visible": true,
          "width": 8,
          "x": 122,
          "y": 40
        }
      ],
      "opacity": 1,
      "type": "objectgroup",
      "visible": true,
      "x": 0,
      "y": 0
    },
    {
      "data": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkAAAAAAAAAAAAAAAAAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAAEcAAABIAAAAGQAAAAAAAAAAAAAAAAAAABkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARwAAAEgAAAAZAAAAAAAAAAAAAAAAAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHAAAASAAAABkAAAAAAAAAAAAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5AAAAOgAAAD0AAABIAAAAGQAAAAAAAAAAAAAAAAAAABkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEkAAABKAAAATQAAAEgAAAAZAAAAAAAAAAAAAAAAAAAAGQAAAAAAAAAAAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAAAAAAAAAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZAAAAGQAAAAAAAAAAAAAAAAAAABkAAAAZAAAACQAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkAAAAZAAAAAAAAAAAAAAAAAAAACQAAABkAAAAAAAAAAAAAAAkAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAABkAAAAAAAAAAAAAAAAAAAAJAAAAGQAAAAAAAAAJAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZAAAAGQAAAAAAAAAAAAAAAAAAAAkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAAAAAAAAAAABkAAAAZAAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAABkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZAAAAGQAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAAGQAAABkAAAAZAAAA",
      "encoding": "base64",
      "height": 18,
      "name": "foregroundLayer",
      "opacity": 1,
      "type": "tilelayer",
      "visible": true,
      "width": 20,
      "x": 0,
      "y": 0
    },
    {
      "data": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "encoding": "base64",
      "height": 18,
      "name": "backgroundLayer",
      "opacity": 1,
      "type": "tilelayer",
      "visible": true,
      "width": 20,
      "x": 0,
      "y": 0
    }
  ],
  "nextobjectid": 336,
  "orientation": "orthogonal",
  "renderorder": "right-down",
  "tiledversion": "1.1.6",
  "tileheight": 8,
  "tilesets": [
    {
      "columns": 16,
      "firstgid": 1,
      "image": "../tiles/smb_tiles.png",
      "imageheight": 176,
      "imagewidth": 128,
      "margin": 0,
      "name": "tiles",
      "spacing": 0,
      "tilecount": 352,
      "tileheight": 8,
      "tileproperties": {
        "100": {
          "collide": true
        },
        "143": {
          "collide": true
        },
        "16": {
          "collide": true
        },
        "24": {
          "collide": true
        },
        "32": {
          "collide": true
        },
        "33": {
          "collide": true
        },
        "54": {
          "collide": true
        },
        "55": {
          "collide": true
        },
        "56": {
          "collide": true
        },
        "57": {
          "collide": true
        },
        "58": {
          "collide": true
        },
        "59": {
          "collide": true
        },
        "60": {
          "collide": true
        },
        "61": {
          "collide": true
        },
        "70": {
          "collide": true
        },
        "71": {
          "collide": true
        },
        "72": {
          "collide": true
        },
        "73": {
          "collide": true
        },
        "74": {
          "collide": true
        },
        "75": {
          "collide": true
        },
        "76": {
          "collide": true
        },
        "77": {
          "collide": true
        },
        "84": {
          "collide": true
        }
      },
      "tilepropertytypes": {
        "100": {
          "collide": "bool"
        },
        "143": {
          "collide": "bool"
        },
        "16": {
          "collide": "bool"
        },
        "24": {
          "collide": "bool"
        },
        "32": {
          "collide": "bool"
        },
        "33": {
          "collide": "bool"
        },
        "54": {
          "collide": "bool"
        },
        "55": {
          "collide": "bool"
        },
        "56": {
          "collide": "bool"
        },
        "57": {
          "collide": "bool"
        },
        "58": {
          "collide": "bool"
        },
        "59": {
          "collide": "bool"
        },
        "60": {
          "collide": "bool"
        },
        "61": {
          "collide": "bool"
        },
        "70": {
          "collide": "bool"
        },
        "71": {
          "collide": "bool"
        },
        "72": {
          "collide": "bool"
        },
        "73": {
          "collide": "bool"
        },
        "74": {
          "collide": "bool"
        },
        "75": {
          "collide": "bool"
        },
        "76": {
          "collide": "bool"
        },
        "77": {
          "collide": "bool"
        },
        "84": {
          "collide": "bool"
        }
      },
      "tilewidth": 8
    }
  ],
  "tilewidth": 8,
  "type": "map",
  "version": 1,
  "width": 20
}
`,Fr=`{ "compressionlevel":-1,\r
 "height":18,\r
 "infinite":false,\r
 "layers":[\r
        {\r
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\r
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\r
            1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 5,\r
            6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 11, 12,\r
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 8, 3, 8, 3, 8, 3, 8, 3, 8, 3, 13, 14, 13,\r
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 15, 16, 17, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 15, 16, 17, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 15, 16, 17, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 13, 14,\r
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 18, 3, 3, 3, 18, 19, 18, 19, 18, 19, 18, 19, 18, 19, 18, 19, 18, 19, 18, 3, 18, 3, 3, 3, 18, 19, 18, 19, 18, 19, 18, 19, 18, 19, 18, 19, 18, 19, 18, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 9, 10, 9, 10, 3, 3, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 9, 10, 9, 10, 3, 3, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 3, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 22, 9, 10, 3, 3, 3, 3, 3, 3, 22, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 13, 14,\r
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 15, 16, 17, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 15, 16, 17, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 18, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 18, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 15, 16, 17, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 3, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 13, 14,\r
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 18, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 18, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 3, 24, 24, 3, 3, 3, 3, 3, 3, 3, 8, 3, 9, 10, 3, 3, 3, 3, 3, 22, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 13, 14,\r
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 19, 19, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 19, 19, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 18, 7, 7, 7, 25, 3, 25, 3, 25, 3, 25, 3, 25, 3, 25, 3, 7, 7, 3, 3, 18, 7, 7, 7, 25, 3, 25, 3, 25, 3, 25, 3, 25, 3, 25, 3, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 19, 19, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 25, 25, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 25, 25, 3, 3, 3, 3, 3, 3, 3, 3, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 13, 14,\r
            3, 15, 16, 17, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 7, 7, 7, 7, 3, 3, 3, 3, 7, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 7, 7, 7, 7, 3, 3, 3, 3, 15, 16, 17, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 15, 16, 17, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 3, 3, 3, 3, 3, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 3, 3, 7, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 13, 14,\r
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 26, 27, 3, 3, 3, 3, 26, 27, 3, 3, 3, 3, 26, 27, 3, 3, 3, 3, 3, 3, 26, 27, 3, 3, 3, 3, 26, 27, 3, 3, 3, 3, 26, 27, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 28, 29, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 28, 29, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 28, 29, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 3, 9, 10, 3, 3, 3, 3, 22, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 13, 14,\r
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 32, 32, 32, 32, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 32, 32, 32, 32, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 32, 32, 32, 32, 7, 7, 3, 3, 3, 26, 27, 3, 3, 3, 3, 26, 27, 3, 3, 3, 3, 26, 27, 3, 7, 7, 3, 3, 3, 26, 27, 3, 3, 3, 3, 26, 27, 3, 3, 3, 3, 26, 27, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 33, 34, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 33, 34, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 19, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 35, 35, 35, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 19, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 35, 35, 35, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 33, 34, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 26, 27, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 13, 14,\r
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 15, 16, 17, 3, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 15, 16, 17, 3, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 7, 3, 3, 3, 26, 27, 3, 3, 3, 3, 26, 27, 3, 3, 3, 3, 36, 37, 3, 7, 7, 3, 3, 3, 26, 27, 3, 3, 3, 3, 26, 27, 3, 3, 3, 3, 36, 37, 3, 3, 3, 3, 3, 15, 16, 17, 3, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 33, 34, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 33, 34, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 33, 34, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 36, 37, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 13, 14,\r
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 32, 32, 32, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 32, 32, 32, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 32, 32, 32, 3, 3, 3, 3, 3, 3, 3, 7, 7, 3, 3, 3, 36, 37, 3, 3, 3, 3, 36, 37, 3, 3, 3, 3, 3, 3, 3, 7, 7, 3, 3, 3, 36, 37, 3, 3, 3, 3, 36, 37, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 28, 29, 33, 34, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 28, 29, 33, 34, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 35, 35, 35, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 35, 35, 35, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 3, 28, 29, 33, 34, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 3, 3, 3, 3, 3, 3, 22, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 13, 14,\r
            3, 3, 28, 29, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 28, 29, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 28, 29, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 7, 3, 3, 3, 3, 3, 3, 28, 29, 3, 3, 3, 3, 28, 29, 3, 3, 3, 3, 7, 7, 3, 3, 3, 3, 3, 3, 28, 29, 3, 3, 3, 3, 28, 29, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 33, 34, 33, 34, 3, 3, 3, 3, 3, 23, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 33, 34, 33, 34, 3, 3, 3, 3, 3, 23, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 8, 23, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 8, 23, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 9, 10, 9, 10, 3, 3, 3, 3, 23, 3, 3, 33, 34, 33, 34, 3, 3, 3, 3, 3, 23, 3, 3, 3, 3, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 3, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 5,\r
            3, 3, 33, 34, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 3, 3, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 3, 3, 3, 3, 33, 34, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 33, 34, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 7, 3, 3, 3, 3, 3, 3, 33, 34, 3, 3, 3, 3, 26, 27, 7, 7, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 33, 34, 3, 3, 3, 3, 26, 27, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 10, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 3, 3, 3, 9, 10, 9, 10, 3, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 3, 3, 9, 10, 9, 10, 9, 10, 9, 10, 3, 3, 3, 9, 10, 9, 10, 3, 9, 10, 9, 10, 9, 10, 3, 8, 3, 8, 3, 8, 3, 8, 3, 8, 3, 9, 10, 9, 10, 9, 10, 9, 10, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 11, 12,\r
            38, 38, 7, 7, 7, 7, 7, 7, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 38, 38, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 39, 39, 39, 39, 7, 7, 7, 7, 7, 7, 39, 39, 39, 39, 39, 39, 39, 39, 38, 38, 38, 38, 38, 38, 7, 7, 7, 7, 7, 7, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 38, 38, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 38, 38, 38, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 40, 38, 38, 38, 38, 38, 38, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 39, 39, 39, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 41, 9, 10, 39, 39, 9, 10, 9, 10, 9, 10, 9, 10, 39, 39, 39, 9, 10, 9, 10, 39, 8, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 8, 9, 10, 39, 39, 9, 10, 9, 10, 9, 10, 9, 10, 39, 39, 39, 9, 10, 9, 10, 39, 9, 10, 9, 10, 9, 10, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 41, 9, 10, 9, 10, 9, 10, 9, 10, 38, 38, 38, 38, 38, 38, 38, 38, 38, 8, 3, 3, 9, 10, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14],\r
         "height":18,\r
         "id":1,\r
         "name":"foregroundLayer",\r
         "opacity":1,\r
         "type":"tilelayer",\r
         "visible":true,\r
         "width":400,\r
         "x":0,\r
         "y":0\r
        }],\r
 "nextlayerid":2,\r
 "nextobjectid":1,\r
 "orientation":"orthogonal",\r
 "renderorder":"right-down",\r
 "tiledversion":"1.11.1",\r
 "tileheight":8,\r
 "tilesets":[\r
        {\r
         "columns":7,\r
         "firstgid":1,\r
         "image":"tiles.png",\r
         "imageheight":48,\r
         "imagewidth":56,\r
         "margin":0,\r
         "name":"tiles",\r
         "spacing":0,\r
         "tilecount":42,\r
         "tileheight":8,\r
         "tiles":[\r
                {\r
                 "id":0,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":1,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":2,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":3,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":4,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":5,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":6,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":7,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":8,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":9,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":10,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":11,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":12,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":13,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":14,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":15,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":16,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":17,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":18,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":19,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":20,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":21,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":22,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":23,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":24,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":25,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":26,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":27,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":28,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":29,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":30,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":31,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":32,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":33,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":34,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":35,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":36,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":true\r
                        }]\r
                }, \r
                {\r
                 "id":37,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":38,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":39,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":40,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }, \r
                {\r
                 "id":41,\r
                 "properties":[\r
                        {\r
                         "name":"collide",\r
                         "type":"bool",\r
                         "value":false\r
                        }]\r
                }],\r
         "tilewidth":8\r
        }],\r
 "tilewidth":8,\r
 "type":"map",\r
 "version":"1.10",\r
 "width":400\r
}`,Ir=`{
    "columns": 16,
    "image": "tiles.png",
    "imageheight": 224,
    "imagewidth": 128,
    "margin": 0,
    "name": "tiles",
    "spacing": 0,
    "tilecount": 448,
    "tileheight": 8,
    "tilewidth": 8,
    "type": "tileset"
   }
`,Lr=`/games/ps2-mario/assets/mania-Cf7edEDr.ttf`,Q=(e,t,n)=>Math.min(n,Math.max(t,Math.round(e))),Rr={new(e,t,n,r=128){return((Q(r,0,255)&255)<<24|(Q(n,0,255)&255)<<16|(Q(t,0,255)&255)<<8|Q(e,0,255)&255)>>>0},getR(e){return e&255},getG(e){return e>>>8&255},getB(e){return e>>>16&255},getA(e){return e>>>24&255},setR(e,t){return(e&4294967040|Q(t,0,255)&255)>>>0},setG(e,t){return(e&4294902015|(Q(t,0,255)&255)<<8)>>>0},setB(e,t){return(e&4278255615|(Q(t,0,255)&255)<<16)>>>0},setA(e,t){return(e&16777215|(Q(t,0,255)&255)<<24)>>>0}};function zr(e){return{r:e&255,g:e>>>8&255,b:e>>>16&255,a:Math.min(1,(e>>>24&255)/128)}}var $={SELECT:1,L3:2,R3:4,START:8,UP:16,RIGHT:32,DOWN:64,LEFT:128,L2:256,R2:512,L1:1024,R1:2048,TRIANGLE:4096,CIRCLE:8192,CROSS:16384,SQUARE:32768};function Br(e){let t=()=>{let t={},n=n=>t[n]??e.padAxis?.(n)??0;return{btns:0,old_btns:0,get lx(){return n(`lx`)},set lx(e){t.lx=e},get ly(){return n(`ly`)},set ly(e){t.ly=e},get rx(){return n(`rx`)},set rx(e){t.rx=e},get ry(){return n(`ry`)},set ry(e){t.ry=e},update(){this.old_btns=this.btns,delete t.lx,delete t.ly,delete t.rx,delete t.ry},pressed(t){return e.padHeld(t)},justPressed(t){return e.padFresh(t)}}};return{...$,get(e=0){return t()},getConnected(){return[0]},getConnectedCount(){return 1},isActive(e){return e===0}}}function Vr(e){return class{width;height;startx;starty;endx;endy;filter=0;color=Rr.new(255,255,255,128);#e;constructor(t){this.#e=e.createImage(t),this.width=this.#e.width,this.height=this.#e.height,this.startx=0,this.starty=0,this.endx=this.#e.width,this.endy=this.#e.height}draw(t,n,r,i){let a=this.endx<this.startx,o=this.endy<this.starty,s=a?this.endx:this.startx,c=o?this.endy:this.starty,l=Math.abs(this.endx-this.startx),u=Math.abs(this.endy-this.starty);l<=0||u<=0||e.drawImage(this.#e,s,c,l,u,t,n,r??this.width,i??this.height,{nearest:this.filter===1,flipX:a,flipY:o,color:zr(this.color)})}}}function Hr(e){return class{scale=1;color=void 0;#e;constructor(t){this.#e=e.createFont(t)}print(t,n,r,i){let a=i===void 0?this.color:i;e.drawText(this.#e,t,n,String(r),a===void 0?void 0:zr(a),this.scale)}getTextSize(t){return e.measureText(this.#e,String(t),this.scale)}}}function Ur(e){return{loadFile(t){return e.loadFile(t)},open(t,n){if(!/w/.test(n))throw Error(`5velte-ps2 std.open: only write modes are shimmed (got "${n}")`);let r=``;return{puts(e){r+=e},close(){e.writeFile(t,r)}}}}}var Wr=()=>typeof performance<`u`?performance.now():Date.now(),Gr={new(){return{base:Wr(),pausedAt:null}},getTime(e){let t=e.pausedAt??Wr();return Math.round((t-e.base)*1e3)},setTime(e,t){e.base=(e.pausedAt??Wr())-t/1e3},pause(e){e.pausedAt===null&&(e.pausedAt=Wr())},resume(e){e.pausedAt!==null&&(e.base+=Wr()-e.pausedAt,e.pausedAt=null)},reset(e){e.base=Wr(),e.pausedAt=null},destroy(e){}};function Kr(e){let t=null;return{Screen:{setVSync(t){e.setVSync?.(t)},getMode(){return{width:e.screen.width,height:e.screen.height}},display(e){t=e}},Draw:{rect(t,n,r,i,a){e.drawRect(t,n,r,i,zr(a))}},Color:Rr,Pads:Br(e),Image:Vr(e),Font:Hr(e),Timer:Gr,std:Ur(e),NEAREST:1,LINEAR:0,tick(){e.beginFrame(),t?.(),e.endFrame()}}}function qr(t,n,r){if(t.cache.bitmapFont.exists(n))return;let i=r?.fontFamily??`monospace`,a=r?.fontSize??16,o=r?.color??`#ffffff`,s=r?.chars??e.GameObjects.RetroFont.TEXT_SET1;if(s.length===0)throw Error(`5velte-ps2: registerCanvasBitmapFont needs at least one character`);t.textures.exists(n)&&t.textures.remove(n);let c=t.textures.createCanvas(n,1,1);if(!c)throw Error(`5velte-ps2: could not create canvas texture "${n}"`);let l=`${a}px ${i}`,u=c.context;u.font=l;let d=1;for(let e of s)d=Math.max(d,Math.ceil(u.measureText(e).width));let f=u.measureText(`Mg(|]q`),p=Math.ceil(f.fontBoundingBoxAscent??f.actualBoundingBoxAscent??a*.8),m=p+Math.ceil(f.fontBoundingBoxDescent??f.actualBoundingBoxDescent??a*.25),h=Math.ceil(Math.sqrt(s.length)),g=Math.ceil(s.length/h);c.setSize(h*d,g*m),u.font=l,u.fillStyle=o,u.textAlign=`center`,u.textBaseline=`alphabetic`;for(let e=0;e<s.length;e++){let t=e%h,n=Math.floor(e/h);u.fillText(s[e],t*d+d/2,n*m+p)}c.refresh();let _=e.GameObjects.RetroFont.Parse(t,{image:n,"offset.x":0,"offset.y":0,width:d,height:m,chars:s,charsPerRow:h,"spacing.x":0,"spacing.y":0,lineSpacing:0});t.cache.bitmapFont.add(n,_)}var Jr=t=>e.Display.Color.GetColor(t.r,t.g,t.b);function Yr(e){let t=e.scene,n=e.screen??{width:640,height:448},r=[],i=[],a=[],o=0,s=0,c=0,l=0,u=null,d=e.storage??{loadFile(e){return localStorage.getItem(`5velte-ps2:${e}`)},writeFile(e,t){localStorage.setItem(`5velte-ps2:${e}`,t)}},f=(e,t)=>{for(let n=t;n<e.length&&e[n].visible;n++)e[n].setVisible(!1)},p=e.clear===!1?null:{a:1,...e.clear??{r:0,g:0,b:0}};return{host:{screen:n,beginFrame(){o=0,s=0,c=0,l=0,p&&this.drawRect(0,0,n.width,n.height,p)},endFrame(){f(r,o),f(i,s),f(a,c)},drawRect(e,n,i,a,s){let c=r[o];c||(c=t.add.graphics(),r.push(c)),o++,c.clear(),c.fillStyle(Jr(s),s.a),c.fillRect(e,n,i,a),c.setDepth(l++),c.setVisible(!0)},createImage(n){let r=e.resolveTexture(n);if(!t.textures.exists(r))throw Error(`5velte-ps2: texture "${r}" (for "${n}") is not loaded`);let i=t.textures.get(r).getSourceImage();return{key:r,width:i.width,height:i.height}},drawImage(e,n,r,a,o,c,u,d,f,p){let{key:m}=e,h=`5vps2:${n},${r},${a},${o}`,g=t.textures.get(m);g.has(h)||g.add(h,0,n,r,a,o);let _=i[s];_||(_=t.add.image(0,0,m,h).setOrigin(0,0),i.push(_)),s++,_.setTexture(m,h),_.setFlip(p.flipX,p.flipY),_.setPosition(c,u),_.setDisplaySize(d,f);let v=p.color;_.setAlpha(v?.a??1),v&&(v.r!==255||v.g!==255||v.b!==255)?_.setTint(Jr(v)):_.clearTint(),_.setDepth(l++),_.setVisible(!0)},createFont(t){let n=e.resolveFont(t);return{key:n.key,size:n.size,scale:n.scale??1}},drawText(e,n,r,i,o,s){let u=e,d=a[c];d||(d=t.add.bitmapText(0,0,u.key,``,u.size),a.push(d)),c++,d.font!==u.key&&d.setFont(u.key,u.size),d.setText(i),d.setScale(u.scale*(s??1)),d.setPosition(n,r),o?(d.setTint(Jr(o)),d.setAlpha(o.a)):(d.clearTint(),d.setAlpha(1)),d.setDepth(l++),d.setVisible(!0)},measureText(e,n,r){let i=e;u||=t.add.bitmapText(0,0,i.key,``,i.size).setVisible(!1),u.font!==i.key&&u.setFont(i.key,i.size),u.setText(n);let a=i.scale*(r??1);return{width:u.width*a,height:u.height*a}},padHeld(t){return e.pads.held(t)},padFresh(t){return e.pads.fresh(t)},padAxis(t){let n=e.pads.axis?.(t)??0;return Math.round(n<0?n*127:n*128)},loadFile(e){return d.loadFile(e)},writeFile(e,t){d.writeFile(e,t)}},destroy:()=>{for(let e of r)e.destroy();for(let e of i)e.destroy();for(let e of a)e.destroy();u?.destroy(),r.length=0,i.length=0,a.length=0,u=null}}}var Xr=[$.CROSS,$.CIRCLE,$.SQUARE,$.TRIANGLE,$.L1,$.R1,$.L2,$.R2,$.SELECT,$.START,$.L3,$.R3,$.UP,$.DOWN,$.LEFT,$.RIGHT];function Zr(e){let t=[];return t[e.bottom]=$.CROSS,t[e.right]=$.CIRCLE,t[e.left]=$.SQUARE,t[e.top]=$.TRIANGLE,e.l1!==void 0&&(t[e.l1]=$.L1),e.r1!==void 0&&(t[e.r1]=$.R1),e.select!==void 0&&(t[e.select]=$.SELECT),e.start!==void 0&&(t[e.start]=$.START),t}var Qr={name:`standard`,buttons:Xr},$r={name:`retro`,buttons:Zr({bottom:2,right:1,left:3,top:0,l1:4,r1:5,select:8,start:9})},ei=[{name:`8bitdo`,match:/2dc8|c82d|8bitdo/i,buttons:Zr({bottom:1,right:0,left:4,top:3,l1:6,r1:7,select:10,start:11})},$r],ti=typeof location<`u`?(new URLSearchParams(location.search).get(`pad`)??``).toLowerCase():``;function ni(e){return[Qr,...ei].find(e=>e.name===ti)||(e.mapping===`standard`?Qr:ei.find(t=>t.match?.test(e.id))||(e.buttons.length<14?$r:Qr))}var ri=16;function ii(e){let t=/vendor:\s*([0-9a-f]{4})\s+product:\s*([0-9a-f]{4})/i.exec(e),n=/^([0-9a-f]{4})-([0-9a-f]{4})/i.exec(e),r=t??n;return r?`${r[1]}:${r[2]}`.toLowerCase():``}var ai={"054c:0268":`DUAL SHOCK 3`,"054c:05c4":`DUAL SHOCK 4`,"054c:09cc":`DUAL SHOCK 4`,"054c:0ba0":`DUAL SHOCK 4`,"054c:0ce6":`DUALSENSE`,"054c:0df2":`DUALSENSE`,"057e:2006":`JOY-CON L`,"057e:2007":`JOY-CON R`,"057e:2009":`SWITCH PRO`,"057e:200e":`JOY-CON`,"057e:2017":`SNES CONTROLLER`,"057e:2019":`N64 CONTROLLER`,"18d1:9400":`STADIA`,"1949:0402":`LUNA`},oi=[[/dualsense/i,`DUALSENSE`],[/dual\s*shock|playstation|\bps[2345]\b/i,`DUAL SHOCK`],[/xbox|x-?input/i,`XBOX PAD`],[/stadia/i,`STADIA`],[/luna/i,`LUNA`],[/steam/i,`STEAM PAD`],[/joy-?con/i,`JOY-CON`],[/pro controller/i,`SWITCH PRO`],[/8bitdo/i,`8BITDO PAD`],[/super nintendo|\bsnes\b|\bsfc\b/i,`SNES CONTROLLER`],[/famicom|\bnes\b/i,`NES CONTROLLER`],[/nintendo 64|\bn64\b/i,`N64 CONTROLLER`],[/mega ?drive|genesis/i,`GENESIS PAD`],[/saturn/i,`SATURN PAD`],[/logitech/i,`LOGITECH PAD`]],si={"0079":`SNES CONTROLLER`,"0e8f":`SNES CONTROLLER`,"0810":`SNES CONTROLLER`,"2dc8":`8BITDO PAD`,"054c":`PLAYSTATION`,"045e":`XBOX PAD`,"057e":`NINTENDO PAD`,"18d1":`STADIA`,1949:`LUNA`,"28de":`STEAM PAD`,"046d":`LOGITECH PAD`};function ci(e){let t=e.replace(/\([^)]*\)/g,` `).replace(/^[0-9a-f]{4}-[0-9a-f]{4}-/i,` `).replace(/[_-]+/g,` `).replace(/\s+/g,` `).trim().toUpperCase();if(!t)return`GAMEPAD`;if(t.length<=ri)return t;let n=t.slice(0,ri),r=n.lastIndexOf(` `);return(r>ri/2?n.slice(0,r):n).trim()}function li(e){let t=ii(e.id),n=ai[t];if(n)return n;let r=oi.find(([t])=>t.test(e.id));return r?r[1]:si[t.slice(0,4)]||ci(e.id)}var ui={ArrowUp:$.UP,ArrowDown:$.DOWN,ArrowLeft:$.LEFT,ArrowRight:$.RIGHT,KeyW:$.UP,KeyS:$.DOWN,KeyA:$.LEFT,KeyD:$.RIGHT,Space:$.CROSS,KeyX:$.CROSS,ShiftLeft:$.SQUARE,KeyZ:$.SQUARE,KeyC:$.CIRCLE,KeyV:$.TRIANGLE,Enter:$.START,Backspace:$.SELECT},di=.5,fi=9,pi=[$.UP,$.UP|$.RIGHT,$.RIGHT,$.DOWN|$.RIGHT,$.DOWN,$.DOWN|$.LEFT,$.LEFT,$.UP|$.LEFT];function mi(e){return e===void 0||!Number.isFinite(e)||e===0||Math.abs(e)>1.05?0:pi[Math.round((e+1)*3.5)]??0}var hi=class{keysDown=new Set;cur=[,,,,].fill(0);prev=[,,,,].fill(0);axes=Array.from({length:4},()=>({lx:0,ly:0,rx:0,ry:0}));profiles=new Map;names=[,,,,].fill(``);nameCache=new Map;onKeyDown=e=>{ui[e.code]!==void 0&&(e.preventDefault(),this.keysDown.add(e.code))};onKeyUp=e=>{this.keysDown.delete(e.code)};constructor(){window.addEventListener(`keydown`,this.onKeyDown),window.addEventListener(`keyup`,this.onKeyUp)}destroy(){window.removeEventListener(`keydown`,this.onKeyDown),window.removeEventListener(`keyup`,this.onKeyUp)}refresh(){let e=typeof navigator<`u`&&navigator.getGamepads?navigator.getGamepads():[],t=Array.prototype.filter.call(e,e=>e&&e.connected);for(let e=0;e<4;e++){this.prev[e]=this.cur[e];let n=0;if(e===0)for(let e of this.keysDown)n|=ui[e]??0;let r=this.axes[e];r.lx=r.ly=r.rx=r.ry=0;let i=t[e];if(this.names[e]=i?this.nameFor(i):``,i){let e=this.profileFor(i);i.buttons.forEach((t,r)=>{t.pressed&&e.buttons[r]!==void 0&&(n|=e.buttons[r])}),r.lx=i.axes[0]??0,r.ly=i.axes[1]??0,r.rx=i.axes[2]??0,r.ry=i.axes[3]??0,r.lx<=-.5&&(n|=$.LEFT),r.lx>=di&&(n|=$.RIGHT),r.ly<=-.5&&(n|=$.UP),r.ly>=di&&(n|=$.DOWN),e!==Qr&&i.axes.length>fi&&(n|=mi(i.axes[fi]))}this.cur[e]=n}}profileFor(e){let t=`${e.index}:${e.id}`,n=this.profiles.get(t);if(n)return n;let r=ni(e);return this.profiles.set(t,r),console.info(`[ps2-mario] pad ${e.index} "${e.id}" (mapping "${e.mapping||`none`}") -> ${this.nameFor(e)}, ${r.name} buttons. Wrong? try ?pad=retro, ?pad=8bitdo or ?pad=standard`),r}nameFor(e){let t=this.nameCache.get(e.id);if(t!==void 0)return t;let n=li(e);return this.nameCache.set(e.id,n),n}portName(e){return this.names[e]??``}portHeld(e,t){return((this.cur[e]??0)&t)!==0}portFresh(e,t){return((this.cur[e]??0)&t)!==0&&((this.prev[e]??0)&t)===0}held(e){return this.portHeld(0,e)}fresh(e){return this.portFresh(0,e)}axis(e){return this.axes[0][e]??0}},gi=`modulepreload`,_i=function(e){return`/games/ps2-mario/`+e},vi={},yi=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=_i(t,n),t=s(t),t in vi)return;vi[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:gi,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},bi=Object.assign({"../../ps2/assets/collectibles/coin2.png":cr,"../../ps2/assets/collectibles/flower.png":lr,"../../ps2/assets/collectibles/heart.png":ur,"../../ps2/assets/collectibles/mushroom.png":dr,"../../ps2/assets/collectibles/star.png":fr,"../../ps2/assets/images/title.png":pr,"../../ps2/assets/sprites/box.png":mr,"../../ps2/assets/sprites/brick.png":hr,"../../ps2/assets/sprites/coin.png":gr,"../../ps2/assets/sprites/dk.png":_r,"../../ps2/assets/sprites/font.png":vr,"../../ps2/assets/sprites/goomba.png":yr,"../../ps2/assets/sprites/luigi.png":br,"../../ps2/assets/sprites/mario.png":xr,"../../ps2/assets/sprites/nabbit.png":Sr,"../../ps2/assets/sprites/platform.png":Cr,"../../ps2/assets/sprites/rotatingCoin.png":wr,"../../ps2/assets/sprites/space_mario.png":Tr,"../../ps2/assets/sprites/yoshi.png":Er,"../../ps2/assets/tiles/smb_tiles.png":Dr,"../../ps2/assets/tiles/tiles.png":Or}),xi=Object.assign({"../../ps2/assets/sprites/luigi.json":kr,"../../ps2/assets/sprites/nabbit.json":Ar,"../../ps2/assets/sprites/space_mario.json":jr,"../../ps2/assets/tiles/level1.json":Mr,"../../ps2/assets/tiles/level1room1.json":Nr,"../../ps2/assets/tiles/level1room2.json":Pr,"../../ps2/assets/tiles/level4_2.json":Fr,"../../ps2/assets/tiles/tiles.json":Ir}),Si=Object.assign({"../../ps2/assets/fonts/mania.ttf":Lr}),Ci=e=>e.replace(/^.*\/ps2\//,``),wi=new Map(Object.entries(bi).map(([e,t])=>[Ci(e),t])),Ti=new Map(Object.entries(xi).map(([e,t])=>[Ci(e),t])),Ei=new Map(Object.entries(Si).map(([e,t])=>[Ci(e),t])),Di=new Map([...wi.keys()].map(e=>[e,e]));function Oi(e,t,n){let r=e.get(t);if(r!==void 0)return r;let i=t.toLowerCase();for(let[r,a]of e)if(r.toLowerCase()===i)return console.warn(`[ps2-mario] ${n} "${t}" only matches "${r}" ignoring case — fix the path`),a}var ki=`ps2:missing`,Ai=`ps2:font`,ji=24,Mi=class extends e.Scene{runtime;pads=new hi;destroyHost;ready=!1;constructor(){super({key:`Ps2Scene`})}preload(){for(let[e,t]of wi)this.load.image(e,t)}create(){this.textures.createCanvas(ki,1,1)?.refresh();let{host:t,destroy:n}=Yr({scene:this,pads:this.pads,resolveTexture:e=>this.textures.exists(e)?e:Oi(Di,e,`texture`)??ki,resolveFont:()=>({key:Ai}),storage:{loadFile:e=>localStorage.getItem(`ps2-mario:${e}`)??Oi(Ti,e,`file`)??null,writeFile:(e,t)=>localStorage.setItem(`ps2-mario:${e}`,t)}});this.destroyHost=n,this.runtime=Kr(t);let r=globalThis,i=this.runtime;r.Screen=i.Screen,r.Draw=i.Draw,r.Color=i.Color;let a=this.pads;r.Pads={...i.Pads,get:(e=0)=>({pressed:t=>a.portHeld(e,t),justPressed:t=>a.portFresh(e,t)}),getName:(e=0)=>a.portName(e)},r.Image=i.Image,r.Font=i.Font,r.Timer=i.Timer,r.std=i.std,r.NEAREST=i.NEAREST,r.LINEAR=i.LINEAR,r.__DEBUG=new URLSearchParams(location.search).has(`debug`),this.boot(),this.events.once(e.Scenes.Events.DESTROY,()=>{this.destroyHost?.(),this.pads.destroy()})}async boot(){await this.loadBitmapFont(),await yi(()=>import(`./main-Cl1mEkoD.js`),[]),this.ready=!0}async loadBitmapFont(){let e=`ps2-mario-font`,t=Ei.values().next().value;if(t)try{let n=new FontFace(e,`url(${t})`);await n.load(),document.fonts.add(n)}catch(e){console.warn(`[ps2-mario] could not load the game font, falling back to monospace`,e)}qr(this,Ai,{fontFamily:`"${e}", monospace`,fontSize:ji})}update(){!this.ready||!this.runtime||(this.pads.refresh(),this.runtime.tick())}};function Ni(t,n){ze(n,!0);let r=P(void 0);function i(t,n){if(!t||!n)return e.Scale.FIT;let r=640/448,i=t/n;return Math.max(r/i,i/r)<=1.02?e.Scale.ENVELOP:e.Scale.FIT}let a=i(typeof window>`u`?0:window.innerWidth,typeof window>`u`?0:window.innerHeight);function o(){let e=Z(r)?.scale;if(!e)return;let t=i(window.innerWidth,window.innerHeight);e.scaleMode!==t&&(e.scaleMode=t),e.refresh()}nn(()=>{if(Z(r))return window.game=Z(r),o(),window.addEventListener(`resize`,o),window.addEventListener(`orientationchange`,o),()=>{window.removeEventListener(`resize`,o),window.removeEventListener(`orientationchange`,o)}});{let n=pt(()=>({mode:a,autoCenter:e.Scale.CENTER_BOTH,width:640,height:448,expandParent:!0})),i=pt(()=>[Mi]);sr(t,{backgroundColor:`#000000`,get scale(){return Z(n)},render:{pixelArt:!0},get scene(){return Z(i)},get instance(){return Z(r)},set instance(e){F(r,e,!0)}})}Be()}Gn(Ni,{target:document.body});