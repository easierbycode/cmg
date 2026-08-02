import{t as e}from"./phaser-CFG0dBPV.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t=Array.isArray,n=Array.prototype.indexOf,r=Array.prototype.includes,i=Array.from,a=Object.defineProperty,o=Object.getOwnPropertyDescriptor,s=Object.prototype,c=Array.prototype,l=Object.getPrototypeOf,u=Object.isExtensible,d=()=>{};function f(e){for(var t=0;t<e.length;t++)e[t]()}function p(){var e,t;return{promise:new Promise((n,r)=>{e=n,t=r}),resolve:e,reject:t}}var m=1024,h=2048,g=4096,_=8192,v=16384,y=32768,ee=1<<25,te=65536,ne=1<<19,re=1<<20,ie=65536,ae=1<<21,oe=1<<23,se=Symbol(`$state`),ce=Symbol(`legacy props`),le=Symbol(`attributes`),ue=Symbol(`class`),de=Symbol(`style`),fe=Symbol(`text`),pe=new class extends Error{name=`StaleReactionError`;message="The reaction that called `getAbortSignal()` was re-run or destroyed"};globalThis.document?.contentType;function me(e){throw Error(`https://svelte.dev/e/lifecycle_outside_component`)}function he(e){throw Error(`https://svelte.dev/e/effect_in_teardown`)}function ge(){throw Error(`https://svelte.dev/e/effect_in_unowned_derived`)}function _e(e){throw Error(`https://svelte.dev/e/effect_orphan`)}function ve(){throw Error(`https://svelte.dev/e/effect_update_depth_exceeded`)}function ye(e){throw Error(`https://svelte.dev/e/props_invalid_value`)}function be(){throw Error(`https://svelte.dev/e/state_descriptors_fixed`)}function xe(){throw Error(`https://svelte.dev/e/state_prototype_fixed`)}function Se(){throw Error(`https://svelte.dev/e/state_unsafe_mutation`)}function Ce(){throw Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`)}var we={},b=Symbol(`uninitialized`);function Te(){console.warn(`https://svelte.dev/e/derived_inert`)}function Ee(e){console.warn(`https://svelte.dev/e/hydration_mismatch`)}function De(){console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`)}var x=!1;function Oe(e){x=e}var S;function ke(e){if(e===null)throw Ee(),we;return S=e}function Ae(){return ke(Yt(S))}function je(e=1){if(x){for(var t=e,n=S;t--;)n=Yt(n);S=n}}function Me(e=!0){for(var t=0,n=S;;){if(n.nodeType===8){var r=n.data;if(r===`]`){if(t===0)return n;--t}else(r===`[`||r===`[!`||r[0]===`[`&&!isNaN(Number(r.slice(1))))&&(t+=1)}var i=Yt(n);e&&n.remove(),n=i}}function Ne(e){if(!e||e.nodeType!==8)throw Ee(),we;return e.data}function Pe(e){return e===this.v}function Fe(e,t){return e==e?e!==t||typeof e==`object`&&!!e||typeof e==`function`:t==t}function Ie(e){return!Fe(e,this.v)}var C=null;function Le(e){C=e}function Re(e,t){return He(`setContext`).set(e,t),t}function ze(e,t=!1,n){C={p:C,i:!1,c:null,e:null,s:e,x:null,r:H,l:null}}function Be(e){var t=C,n=t.e;if(n!==null){t.e=null;for(var r of n)an(r)}return e!==void 0&&(t.x=e),t.i=!0,C=t.p,e??{}}function Ve(){return!0}function He(e){return C===null&&me(e),C.c??=new Map(Ue(C)||void 0)}function Ue(e){let t=e.p;for(;t!==null;){let e=t.c;if(e!==null)return e;t=t.p}return null}var w=[];function We(){var e=w;w=[],f(e)}function T(e){if(w.length===0&&!Ct){var t=w;queueMicrotask(()=>{t===w&&We()})}w.push(e)}function Ge(e){var t=H;if(t===null)return z.f|=oe,e;if(!(t.f&32768)&&!(t.f&4))throw e;E(e,t)}function E(e,t){if(!(t!==null&&t.f&16384)){for(;t!==null;){if(t.f&128){if(!(t.f&32768))throw e;try{t.b.error(e);return}catch(t){e=t}}t=t.parent}throw e}}var Ke=~(h|g|m);function D(e,t){e.f=e.f&Ke|t}function qe(e){e.f&512||e.deps===null?D(e,m):D(e,g)}function Je(e){if(e!==null)for(let t of e)!(t.f&2)||!(t.f&65536)||(t.f^=ie,Je(t.deps))}function Ye(e,t,n){e.f&2048?t.add(e):e.f&4096&&n.add(e),Je(e.deps),D(e,m)}function Xe(e,t,n){if(e==null)return t(void 0),n&&n(void 0),d;let r=Fn(()=>e.subscribe(t,n));return r.unsubscribe?()=>r.unsubscribe():r}var Ze=[];function Qe(e,t=d){let n=null,r=new Set;function i(t){if(Fe(e,t)&&(e=t,n)){let t=!Ze.length;for(let t of r)t[1](),Ze.push(t,e);if(t){for(let e=0;e<Ze.length;e+=2)Ze[e][0](Ze[e+1]);Ze.length=0}}}function a(t){i(t(e))}function o(o,s=d){let c=[o,s];return r.add(c),r.size===1&&(n=t(i,a)||d),o(e),()=>{r.delete(c),r.size===0&&n&&(n(),n=null)}}return{set:i,update:a,subscribe:o}}function $e(e){return{subscribe:e.subscribe.bind(e)}}function et(e){let t;return Xe(e,e=>t=e)(),t}var tt=!1,nt=Symbol(`unmounted`);function rt(e,t,n){let r=n[t]??={store:null,source:Lt(void 0),unsubscribe:d};if(r.store!==e&&!(nt in n))if(r.unsubscribe(),r.store=e??null,e==null)r.source.v=void 0,r.unsubscribe=d;else{var i=!0;r.unsubscribe=Xe(e,e=>{i?r.source.v=e:P(r.source,e)}),i=!1}return e&&nt in n?et(e):X(r.source)}function it(){let e={};function t(){nn(()=>{for(var t in e)e[t].unsubscribe();a(e,nt,{enumerable:!1,value:!0})})}return[e,t]}function at(e){var t=tt;try{return tt=!1,[e(),tt]}finally{tt=t}}function ot(e){var t=z,n=H;V(null),U(null);try{return e()}finally{V(t),U(n)}}function st(e){let t=0,n=It(0),r;return()=>{tn()&&(X(n),sn(()=>(t===0&&(r=Fn(()=>e(()=>Bt(n)))),t+=1,()=>{T(()=>{--t,t===0&&(r?.(),r=void 0,Bt(n))})})))}}var ct=te|ne;function lt(e,t,n,r){new ut(e,t,n,r)}var ut=class{parent;is_pending=!1;transform_error;#e;#t=x?S:null;#n;#r;#i;#a=null;#o=null;#s=null;#c=null;#l=0;#u=0;#d=!1;#f=new Set;#p=new Set;#m=null;#h=st(()=>(this.#m=It(this.#l),()=>{this.#m=null}));constructor(e,t,n,r){this.#e=e,this.#n=t,this.#r=e=>{var t=H;t.b=this,t.f|=128,n(e)},this.parent=H.b,this.transform_error=r??this.parent?.transform_error??(e=>e),this.#i=cn(()=>{if(x){let e=this.#t;Ae();let t=e.data===`[!`;if(e.data.startsWith(`[?`)){let t=JSON.parse(e.data.slice(2));this.#_(t)}else t?this.#y():this.#g()}else this.#b()},ct),x&&(this.#e=S)}#g(){try{this.#a=I(()=>this.#r(this.#e))}catch(e){this.error(e)}}#_(e){let t=this.#n.failed,{reset:n,invoke_onerror:r}=this.#v(e);T(r),t&&(this.#s=I(()=>{t(this.#e,()=>e,()=>n)}))}#v(e){var t=!1,n=!1;let r=()=>{if(t){De();return}t=!0,n&&Ce(),this.#s!==null&&mn(this.#s,()=>{this.#s=null}),this.#S(()=>{this.#b()})};return{reset:r,invoke_onerror:()=>{try{n=!0,this.#n.onerror?.(e,r),n=!1}catch(e){E(e,this.#i&&this.#i.parent)}}}}#y(){let e=this.#n.pending;e&&(this.is_pending=!0,this.#o=I(()=>e(this.#e)),T(()=>{var e=this.#c=document.createDocumentFragment(),t=qt();e.append(t),this.#a=this.#S(()=>I(()=>this.#r(t))),this.#u===0&&(this.#e.before(e),this.#c=null,mn(this.#o,()=>{this.#o=null}),this.#x(O))}))}#b(){try{if(this.is_pending=this.has_pending_snippet(),this.#u=0,this.#l=0,this.#a=I(()=>{this.#r(this.#e)}),this.#u>0){var e=this.#c=document.createDocumentFragment();vn(this.#a,e);let t=this.#n.pending;this.#o=I(()=>t(this.#e))}else this.#x(O)}catch(e){this.error(e)}}#x(e){this.is_pending=!1,e.transfer_effects(this.#f,this.#p)}defer_effect(e){Ye(e,this.#f,this.#p)}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!this.#n.pending}#S(e){var t=H,n=z,r=C;U(this.#i),V(this.#i),Le(this.#i.ctx);try{return Ot.ensure(),e()}catch(e){return Ge(e),null}finally{U(t),V(n),Le(r)}}#C(e,t){if(!this.has_pending_snippet()){this.parent&&this.parent.#C(e,t);return}this.#u+=e,this.#u===0&&(this.#x(t),this.#o&&mn(this.#o,()=>{this.#o=null}),this.#c&&=(this.#e.before(this.#c),null))}update_pending_count(e,t){this.#C(e,t),this.#l+=e,!(!this.#m||this.#d)&&(this.#d=!0,T(()=>{this.#d=!1,this.#m&&Rt(this.#m,this.#l)}))}get_effect_pending(){return this.#h(),X(this.#m)}error(e){if(!this.#n.onerror&&!this.#n.failed)throw e;O?.is_fork?(this.#a&&O.skip_effect(this.#a),this.#o&&O.skip_effect(this.#o),this.#s&&O.skip_effect(this.#s),O.oncommit(()=>{this.#w(e)})):this.#w(e)}#w(e){this.#a&&=(L(this.#a),null),this.#o&&=(L(this.#o),null),this.#s&&=(L(this.#s),null),x&&(ke(this.#t),je(),ke(Me()));let t=this.#n.failed,n=e=>{let{reset:n,invoke_onerror:r}=this.#v(e);r(),t&&(this.#s=this.#S(()=>{try{return I(()=>{var r=H;r.b=this,r.f|=128,t(this.#e,()=>e,()=>n)})}catch(e){return E(e,this.#i.parent),null}}))};T(()=>{var t;try{t=this.transform_error(e)}catch(e){E(e,this.#i&&this.#i.parent);return}typeof t==`object`&&t&&typeof t.then==`function`?t.then(n,e=>E(e,this.#i&&this.#i.parent)):n(t)})}};function dt(e){var t=2|h;return H!==null&&(H.f|=ne),{ctx:C,deps:null,effects:null,equals:Pe,f:t,fn:e,reactions:null,rv:0,v:b,wv:0,parent:H,ac:null}}var ft=Symbol(`obsolete`);function pt(e){let t=dt(e);return Sn(t),t}function mt(e){let t=dt(e);return t.equals=Ie,t}function ht(e){var t=e.effects;if(t!==null){e.effects=null;for(var n=0;n<t.length;n+=1)L(t[n])}}function gt(e){var t,n=H,r=e.parent;if(!R&&r!==null&&e.v!==b&&r.f&24576)return Te(),e.v;U(r);try{e.f&=~ie,ht(e),t=kn(e)}finally{U(n)}return t}function _t(e){var t=gt(e);if(!e.equals(t)&&(e.wv=En(),(!O?.is_fork||e.deps===null)&&(O===null?e.v=t:(O.capture(e,t,!0),xt?.capture(e,t,!0)),e.deps===null))){D(e,m);return}R||(k===null?qe(e):(tn()||O?.is_fork)&&k.set(e,t))}function vt(e){if(e.effects!==null)for(let t of e.effects)(t.teardown||t.ac)&&(t.teardown?.(),t.ac!==null&&ot(()=>{t.ac.abort(pe),t.ac=null}),t.fn!==null&&(t.teardown=d),jn(t,0),un(t))}function yt(e){if(e.effects!==null)for(let t of e.effects)t.teardown&&t.fn!==null&&Mn(t)}var bt=null,O=null,xt=null,k=null,St=null,Ct=!1,wt=!1,A=null,Tt=null,Et=0,Dt=1,Ot=class e{id=Dt++;#e=!1;linked=!0;#t=null;#n=null;async_deriveds=new Map;current=new Map;previous=new Map;#r=new Set;#i=new Set;#a=0;#o=new Map;#s=null;#c=[];#l=[];#u=new Set;#d=new Set;#f=new Map;#p=new Set;is_fork=!1;#m=!1;constructor(){bt===null?bt=this:(bt.#n=this,this.#t=bt),bt=this}#h(){if(this.is_fork)return!0;for(let n of this.#o.keys()){for(var e=n,t=!1;e.parent!==null;){if(this.#f.has(e)){t=!0;break}e=e.parent}if(!t)return!0}return!1}skip_effect(e){this.#f.has(e)||this.#f.set(e,{d:[],m:[]}),this.#p.delete(e)}unskip_effect(e,t=e=>this.schedule(e)){var n=this.#f.get(e);if(n){this.#f.delete(e);for(var r of n.d)D(r,h),t(r);for(r of n.m)D(r,g),t(r)}this.#p.add(e)}#g(){this.#e=!0,Et++>1e3&&(this.#x(),kt());for(let e of this.#u)this.#d.delete(e),D(e,h),this.schedule(e);for(let e of this.#d)D(e,g),this.schedule(e);let t=this.#c;this.#c=[],this.apply();var n=A=[],r=[],i=Tt=[];for(let e of t)try{this.#_(e,n,r)}catch(t){throw Nt(e),this.#h()||this.discard(),t}if(O=null,i.length>0){var a=e.ensure();for(let e of i)a.schedule(e)}if(A=null,Tt=null,this.#h()){this.#b(r),this.#b(n);for(let[e,t]of this.#f)Mt(e,t);i.length>0&&O.#g();return}let o=this.#v();if(o){this.#b(r),this.#b(n),o.#y(this);return}this.#u.clear(),this.#d.clear();for(let e of this.#r)e(this);this.#r.clear(),xt=this,At(r),At(n),xt=null,this.#s?.resolve();var s=O;if(this.#a===0&&(this.#c.length===0||s!==null)&&this.#x(),this.#c.length>0)if(s!==null){let e=s;e.#c.push(...this.#c.filter(t=>!e.#c.includes(t)))}else s=this;s!==null&&s.#g()}#_(e,t,n){e.f^=m;for(var r=e.first;r!==null;){var i=r.f,a=!!(i&96);if(!(a&&i&1024||i&8192||this.#f.has(r))&&r.fn!==null){a?r.f^=m:i&4?t.push(r):Dn(r)&&(i&16&&this.#d.add(r),Mn(r));var o=r.first;if(o!==null){r=o;continue}}for(;r!==null;){var s=r.next;if(s!==null){r=s;break}r=r.parent}}}#v(){for(var e=this.#t;e!==null;){if(!e.is_fork){for(let[t,[,n]]of this.current)if(e.current.has(t)&&!n)return e}e=e.#t}return null}#y(e){for(let[t,n]of e.current)!this.previous.has(t)&&e.previous.has(t)&&this.previous.set(t,e.previous.get(t)),this.current.set(t,n);for(let[t,n]of e.async_deriveds){let e=this.async_deriveds.get(t);e&&n.promise.then(e.resolve).catch(e.reject)}e.async_deriveds.clear(),this.transfer_effects(e.#u,e.#d);let t=e=>{var n=e.reactions;if(n!==null&&!(e.f&2&&!(e.f&6144)))for(let e of n){var r=e.f;if(r&2)t(e);else{var i=e;r&4194320&&!this.async_deriveds.has(i)&&(this.#d.delete(i),D(i,h),this.schedule(i))}}};for(let e of this.current.keys())t(e);this.oncommit(()=>e.discard()),e.#x(),O=this,this.#g()}#b(e){for(var t=0;t<e.length;t+=1)Ye(e[t],this.#u,this.#d)}capture(e,t,n=!1){e.v!==b&&!this.previous.has(e)&&this.previous.set(e,e.v),e.f&8388608||(this.current.set(e,[t,n]),k?.set(e,t)),this.is_fork||(e.v=t)}activate(){O=this}deactivate(){O=null,k=null}flush(){try{wt=!0,O=this,this.#g()}finally{Et=0,St=null,A=null,Tt=null,wt=!1,O=null,k=null,M.clear()}}discard(){for(let e of this.#i)e(this);this.#i.clear();for(let e of this.async_deriveds.values())e.reject(ft);this.#x(),this.#s?.resolve()}register_created_effect(e){this.#l.push(e)}increment(e,t){if(this.#a+=1,e){let e=this.#o.get(t)??0;this.#o.set(t,e+1)}}decrement(e,t){if(--this.#a,e){let e=this.#o.get(t)??0;e===1?this.#o.delete(t):this.#o.set(t,e-1)}this.#m||(this.#m=!0,T(()=>{this.#m=!1,this.linked&&this.flush()}))}transfer_effects(e,t){for(let t of e)this.#u.add(t);for(let e of t)this.#d.add(e);e.clear(),t.clear()}oncommit(e){this.#r.add(e)}ondiscard(e){this.#i.add(e)}settled(){return(this.#s??=p()).promise}static ensure(){if(O===null){let t=O=new e;!wt&&T(()=>{t.#e||t.flush()})}return O}apply(){k=null}schedule(e){if(St=e,e.b?.is_pending&&e.f&16777228&&!(e.f&32768)){e.b.defer_effect(e);return}for(var t=e;t.parent!==null;){t=t.parent;var n=t.f;if(A!==null&&t===H&&(z===null||!(z.f&2)))return;if(n&96){if(!(n&1024))return;t.f^=m}}this.#c.push(t)}#x(){if(this.linked){var e=this.#t,t=this.#n;e===null||(e.#n=t),t===null?bt=e:t.#t=e,this.linked=!1}}};function kt(){try{ve()}catch(e){E(e,St)}}var j=null;function At(e){var t=e.length;if(t!==0){for(var n=0;n<t;){var r=e[n++];if(!(r.f&24576)&&Dn(r)&&(j=new Set,Mn(r),r.deps===null&&r.first===null&&r.nodes===null&&r.teardown===null&&r.ac===null&&pn(r),j?.size>0)){M.clear();for(let e of j){if(e.f&24576)continue;let t=[e],n=e.parent;for(;n!==null;)j.has(n)&&(j.delete(n),t.push(n)),n=n.parent;for(let e=t.length-1;e>=0;e--){let n=t[e];n.f&24576||Mn(n)}}j.clear()}}j=null}}function jt(e){O.schedule(e)}function Mt(e,t){if(!(e.f&32&&e.f&1024)){e.f&2048?t.d.push(e):e.f&4096&&t.m.push(e),D(e,m);for(var n=e.first;n!==null;)Mt(n,t),n=n.next}}function Nt(e){D(e,m);for(var t=e.first;t!==null;)Nt(t),t=t.next}var Pt=new Set,M=new Map,Ft=!1;function It(e,t){return{f:0,v:e,reactions:null,equals:Pe,rv:0,wv:0}}function N(e,t){let n=It(e,t);return Sn(n),n}function Lt(e,t=!1,n=!0){let r=It(e);return t||(r.equals=Ie),r}function P(e,t,n=!1){return z!==null&&(!B||z.f&131072)&&Ve()&&z.f&4325394&&(W===null||!W.has(e))&&Se(),Rt(e,n?Ht(t):t,Tt)}function Rt(e,t,n=null){if(!e.equals(t)){M.set(e,R?t:e.v);var r=Ot.ensure();if(r.capture(e,t),e.f&2){let t=e;e.f&2048&&gt(t),k===null&&qe(t)}e.wv=En(),Vt(e,h,n),Ve()&&H!==null&&H.f&1024&&!(H.f&96)&&(q===null?Cn([e]):q.push(e)),!r.is_fork&&Pt.size>0&&!Ft&&zt()}return t}function zt(){Ft=!1;for(let e of Pt){e.f&1024&&D(e,g);let t;try{t=Dn(e)}catch{t=!0}t&&Mn(e)}Pt.clear()}function Bt(e){P(e,e.v+1)}function Vt(e,t,n){var r=e.reactions;if(r!==null)for(var i=Ve(),a=r.length,o=0;o<a;o++){var s=r[o],c=s.f;if(!(!i&&s===H)){var l=(c&h)===0;if(l&&D(s,t),c&131072)Pt.add(s);else if(c&2){var u=s;k?.delete(u),c&65536||(c&512&&(H===null||!(H.f&2097152))&&(s.f|=ie),Vt(u,g,n))}else if(l){var d=s;c&16&&j!==null&&j.add(d),n===null?jt(d):n.push(d)}}}}function Ht(e){if(typeof e!=`object`||!e||se in e)return e;let n=l(e);if(n!==s&&n!==c)return e;var r=new Map,i=t(e),a=N(0),u=null,d=Y,f=e=>{if(Y===d)return e();var t=z,n=Y;V(null),Tn(d);var r=e();return V(t),Tn(n),r};return i&&r.set(`length`,N(e.length,u)),new Proxy(e,{defineProperty(e,t,n){(!(`value`in n)||n.configurable===!1||n.enumerable===!1||n.writable===!1)&&be();var i=r.get(t);return i===void 0?f(()=>{var e=N(n.value,u);return r.set(t,e),e}):P(i,n.value,!0),!0},deleteProperty(e,t){var n=r.get(t);if(n===void 0){if(t in e){let e=f(()=>N(b,u));r.set(t,e),Bt(a)}}else P(n,b),Bt(a);return!0},get(t,n,i){if(n===se)return e;var a=r.get(n),s=n in t;if(a===void 0&&(!s||o(t,n)?.writable)&&(a=f(()=>N(Ht(s?t[n]:b),u)),r.set(n,a)),a!==void 0){var c=X(a);return c===b?void 0:c}return Reflect.get(t,n,i)},getOwnPropertyDescriptor(e,t){var n=Reflect.getOwnPropertyDescriptor(e,t);if(n&&`value`in n){var i=r.get(t);i&&(n.value=X(i))}else if(n===void 0){var a=r.get(t),o=a?.v;if(a!==void 0&&o!==b)return{enumerable:!0,configurable:!0,value:o,writable:!0}}return n},has(e,t){if(t===se)return!0;var n=r.get(t),i=n!==void 0&&n.v!==b||Reflect.has(e,t);return(n!==void 0||H!==null&&(!i||o(e,t)?.writable))&&(n===void 0&&(n=f(()=>N(i?Ht(e[t]):b,u)),r.set(t,n)),X(n)===b)?!1:i},set(e,t,n,s){var c=r.get(t),l=t in e;if(i&&t===`length`)for(var d=n;d<c.v;d+=1){var p=r.get(d+``);p===void 0?d in e&&(p=f(()=>N(b,u)),r.set(d+``,p)):P(p,b)}if(c===void 0)(!l||o(e,t)?.writable)&&(c=f(()=>N(void 0,u)),P(c,Ht(n)),r.set(t,c));else{l=c.v!==b;var m=f(()=>Ht(n));P(c,m)}var h=Reflect.getOwnPropertyDescriptor(e,t);if(h?.set&&h.set.call(s,n),!l){if(i&&typeof t==`string`){var g=r.get(`length`),_=Number(t);Number.isInteger(_)&&_>=g.v&&P(g,_+1)}Bt(a)}return!0},ownKeys(e){X(a);var t=Reflect.ownKeys(e).filter(e=>{var t=r.get(e);return t===void 0||t.v!==b});for(var[n,i]of r)i.v!==b&&!(n in e)&&t.push(n);return t},setPrototypeOf(){xe()}})}var Ut,Wt,Gt;function Kt(){if(Ut===void 0){Ut=window,/Firefox/.test(navigator.userAgent);var e=Element.prototype,t=Node.prototype,n=Text.prototype;Wt=o(t,`firstChild`).get,Gt=o(t,`nextSibling`).get,u(e)&&(e[ue]=void 0,e[le]=null,e[de]=void 0,e.__e=void 0),u(n)&&(n[fe]=void 0)}}function qt(e=``){return document.createTextNode(e)}function Jt(e){return Wt.call(e)}function Yt(e){return Gt.call(e)}function Xt(e,t=!1){if(!x){var n=Jt(e);return n instanceof Comment&&n.data===``?Yt(n):n}if(t){if(S?.nodeType!==3){var r=qt();return S?.before(r),ke(r),r}Qt(S)}return S}function Zt(){return!1}function Qt(e){if(e.nodeValue.length<65536)return;let t=e.nextSibling;for(;t!==null&&t.nodeType===3;)t.remove(),e.nodeValue+=t.nodeValue,t=e.nextSibling}function $t(e){H===null&&(z===null&&_e(e),ge()),R&&he(e)}function en(e,t){var n=t.last;n===null?t.last=t.first=e:(n.next=e,e.prev=n,t.last=e)}function F(e,t){var n=H;n!==null&&n.f&8192&&(e|=_);var r={ctx:C,deps:null,nodes:null,f:e|h|512,first:null,fn:t,last:null,next:null,parent:n,b:n&&n.b,prev:null,teardown:null,wv:0,ac:null};O?.register_created_effect(r);var i=r;if(e&4)A===null?Ot.ensure().schedule(r):A.push(r);else if(t!==null){try{Mn(r)}catch(e){throw L(r),e}i.deps===null&&i.teardown===null&&i.nodes===null&&i.first===i.last&&!(i.f&524288)&&(i=i.first,e&16&&e&65536&&i!==null&&(i.f|=te))}if(i!==null&&(i.parent=n,n!==null&&en(i,n),z!==null&&z.f&2&&!(e&64))){var a=z;(a.effects??=[]).push(i)}return r}function tn(){return z!==null&&!B}function nn(e){let t=F(8,null);return D(t,m),t.teardown=e,t}function rn(e){$t(`$effect`);var t=H.f;if(!z&&t&32&&C!==null&&!C.i){var n=C;(n.e??=[]).push(e)}else return an(e)}function an(e){return F(4|re,e)}function on(e){Ot.ensure();let t=F(64|ne,e);return(e={})=>new Promise(n=>{e.outro?mn(t,()=>{L(t),n(void 0)}):(L(t),n(void 0))})}function sn(e,t=0){return F(8|t,e)}function cn(e,t=0){return F(16|t,e)}function I(e){return F(32|ne,e)}function ln(e){var t=e.teardown;if(t!==null){let e=R,n=z;xn(!0),V(null);try{t.call(null)}finally{xn(e),V(n)}}}function un(e,t=!1){var n=e.first;for(e.first=e.last=null;n!==null;){let e=n.ac;e!==null&&ot(()=>{e.abort(pe)});var r=n.next;n.f&64?n.parent=null:L(n,t),n=r}}function dn(e){for(var t=e.first;t!==null;){var n=t.next;t.f&32||L(t),t=n}}function L(e,t=!0){var n=!1;(t||e.f&262144)&&e.nodes!==null&&e.nodes.end!==null&&(fn(e.nodes.start,e.nodes.end),n=!0),e.f|=ee,un(e,t&&!n),jn(e,0);var r=e.nodes&&e.nodes.t;if(r!==null)for(let e of r)e.stop();ln(e),e.f^=ee,e.f|=v;var i=e.parent;i!==null&&i.first!==null&&pn(e),e.next=e.prev=e.teardown=e.ctx=e.deps=e.fn=e.nodes=e.ac=e.b=null}function fn(e,t){for(;e!==null;){var n=e===t?null:Yt(e);e.remove(),e=n}}function pn(e){var t=e.parent,n=e.prev,r=e.next;n!==null&&(n.next=r),r!==null&&(r.prev=n),t!==null&&(t.first===e&&(t.first=r),t.last===e&&(t.last=n))}function mn(e,t,n=!0){var r=[];hn(e,r,!0);var i=()=>{n&&L(e),t&&t()},a=r.length;if(a>0){var o=()=>--a||i();for(var s of r)s.out(o)}else i()}function hn(e,t,n){if(!(e.f&8192)){e.f^=_;var r=e.nodes&&e.nodes.t;if(r!==null)for(let e of r)(e.is_global||n)&&t.push(e);for(var i=e.first;i!==null;){var a=i.next;if(!(i.f&64)){var o=!!(i.f&65536)||!!(i.f&32)&&!!(e.f&16);hn(i,t,o?n:!1)}i=a}}}function gn(e){_n(e,!0)}function _n(e,t){if(e.f&8192){e.f^=_,e.f&1024||(D(e,h),Ot.ensure().schedule(e));for(var n=e.first;n!==null;){var r=n.next,i=!!(n.f&65536)||!!(n.f&32);_n(n,i?t:!1),n=r}var a=e.nodes&&e.nodes.t;if(a!==null)for(let e of a)(e.is_global||t)&&e.in()}}function vn(e,t){if(e.nodes)for(var n=e.nodes.start,r=e.nodes.end;n!==null;){var i=n===r?null:Yt(n);t.append(n),n=i}}var yn=null,bn=!1,R=!1;function xn(e){R=e}var z=null,B=!1;function V(e){z=e}var H=null;function U(e){H=e}var W=null;function Sn(e){z!==null&&(W??=new Set).add(e)}var G=null,K=0,q=null;function Cn(e){q=e}var wn=1,J=0,Y=J;function Tn(e){Y=e}function En(){return++wn}function Dn(e){var t=e.f;if(t&2048)return!0;if(t&2&&(e.f&=~ie),t&4096){for(var n=e.deps,r=n.length,i=0;i<r;i++){var a=n[i];if(Dn(a)&&_t(a),a.wv>e.wv)return!0}t&512&&k===null&&D(e,m)}return!1}function On(e,t,n=!0){var r=e.reactions;if(r!==null&&!(W!==null&&W.has(e)))for(var i=0;i<r.length;i++){var a=r[i];a.f&2?On(a,t,!1):t===a&&(n?D(a,h):a.f&1024&&D(a,g),jt(a))}}function kn(e){var t=G,n=K,r=q,i=z,a=W,o=C,s=B,c=Y,l=e.f;G=null,K=0,q=null,z=l&96?null:e,W=null,Le(e.ctx),B=!1,Y=++J,e.ac!==null&&(ot(()=>{e.ac.abort(pe)}),e.ac=null);try{e.f|=ae;var u=e.fn,d=u();e.f|=y;var f=e.deps,p=O?.is_fork;if(G!==null){var m;if(p||jn(e,K),f!==null&&K>0)for(f.length=K+G.length,m=0;m<G.length;m++)f[K+m]=G[m];else e.deps=f=G;if(tn()&&e.f&512)for(m=K;m<f.length;m++)(f[m].reactions??=[]).push(e)}else!p&&f!==null&&K<f.length&&(jn(e,K),f.length=K);if(Ve()&&q!==null&&!B&&f!==null&&!(e.f&6146))for(m=0;m<q.length;m++)On(q[m],e);if(i!==null&&i!==e){if(J++,i.deps!==null)for(let e=0;e<n;e+=1)i.deps[e].rv=J;if(t!==null)for(let e of t)e.rv=J;q!==null&&(r===null?r=q:r.push(...q))}return e.f&8388608&&(e.f^=oe),d}catch(e){return Ge(e)}finally{e.f^=ae,G=t,K=n,q=r,z=i,W=a,Le(o),B=s,Y=c}}function An(e,t){let i=t.reactions;if(i!==null){var a=n.call(i,e);if(a!==-1){var o=i.length-1;o===0?i=t.reactions=null:(i[a]=i[o],i.pop())}}if(i===null&&t.f&2&&(G===null||!r.call(G,t))){var s=t;s.f&512&&(s.f^=512,s.f&=~ie),s.v!==b&&qe(s),s.ac!==null&&ot(()=>{s.ac.abort(pe),s.ac=null,D(s,h)}),vt(s),jn(s,0)}}function jn(e,t){var n=e.deps;if(n!==null)for(var r=t;r<n.length;r++)An(e,n[r])}function Mn(e){var t=e.f;if(!(t&16384)){D(e,m);var n=H,r=bn;H=e,bn=!(t&96);try{t&16777232?dn(e):un(e),ln(e);var i=kn(e);e.teardown=typeof i==`function`?i:null,e.wv=wn}finally{bn=r,H=n}}}function X(e){var t=!!(e.f&2);if(yn?.add(e),z!==null&&!B&&!(H!==null&&H.f&16384)&&(W===null||!W.has(e))){var n=z.deps;if(z.f&2097152)e.rv<J&&(e.rv=J,G===null&&n!==null&&n[K]===e?K++:G===null?G=[e]:G.push(e));else{z.deps??=[],r.call(z.deps,e)||z.deps.push(e);var i=e.reactions;i===null?e.reactions=[z]:r.call(i,z)||i.push(z)}}if(R&&M.has(e))return M.get(e);if(t){var a=e;if(R){var o=a.v;return(!(a.f&1024)&&a.reactions!==null||Pn(a))&&(o=gt(a)),M.set(a,o),o}var s=!(a.f&512)&&!B&&z!==null&&(bn||!!(z.f&512)),c=(a.f&y)===0;Dn(a)&&(s&&(a.f|=512),_t(a)),s&&!c&&(yt(a),Nn(a))}if(k?.has(e))return k.get(e);if(e.f&8388608)throw e.v;return e.v}function Nn(e){if(e.f|=512,e.deps!==null)for(let t of e.deps)(t.reactions??=[]).push(e),t.f&2&&!(t.f&512)&&(yt(t),Nn(t))}function Pn(e){if(e.v===b)return!0;if(e.deps===null)return!1;for(let t of e.deps)if(M.has(t)||t.f&2&&Pn(t))return!0;return!1}function Fn(e){var t=B;try{return B=!0,e()}finally{B=t}}[...`allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback`.split(`.`)];var In=[`touchstart`,`touchmove`];function Ln(e){return In.includes(e)}var Rn=Symbol(`events`),zn=new Set,Bn=new Set,Vn=null;function Hn(e){var t=this,n=t.ownerDocument,r=e.type,i=e.composedPath?.()||[],o=i[0]||e.target;Vn=e;var s=0,c=Vn===e&&e[Rn];if(c){var l=i.indexOf(c);if(l!==-1&&(t===document||t===window)){e[Rn]=t;return}var u=i.indexOf(t);if(u===-1)return;l<=u&&(s=l)}if(o=i[s]||e.target,o!==t){a(e,`currentTarget`,{configurable:!0,get(){return o||n}});var d=z,f=H;V(null),U(null);try{for(var p,m=[];o!==null&&o!==t;){try{var h=o[Rn]?.[r];h!=null&&(!o.disabled||e.target===o)&&h.call(o,e)}catch(e){p?m.push(e):p=e}if(e.cancelBubble)break;s++,o=s<i.length?i[s]:null}if(p){for(let e of m)queueMicrotask(()=>{throw e});throw p}}finally{e[Rn]=t,delete e.currentTarget,V(d),U(f)}}}globalThis?.window?.trustedTypes;function Un(e,t){var n=H;n.nodes===null&&(n.nodes={start:e,end:t,a:null,t:null})}function Wn(){if(x)return Un(S,null),S;var e=document.createDocumentFragment(),t=document.createComment(``),n=qt();return e.append(t,n),Un(t,n),e}function Gn(e,t){if(x){var n=H;(!(n.f&32768)||n.nodes.end===null)&&(n.nodes.end=S),Ae();return}e!==null&&e.before(t)}function Kn(e,t){return Jn(e,t)}var qn=new Map;function Jn(e,{target:t,anchor:n,props:r={},events:a,context:o,intro:s=!0,transformError:c}){Kt();var l=void 0,u=on(()=>{var s=n??t.appendChild(qt());lt(s,{pending:()=>{}},t=>{ze({});var n=C;if(o&&(n.c=o),a&&(r.$$events=a),x&&Un(t,null),l=e(t,r)||{},x&&(H.nodes.end=S,S===null||S.nodeType!==8||S.data!==`]`))throw Ee(),we;Be()},c);var u=new Set,d=e=>{for(var n=0;n<e.length;n++){var r=e[n];if(!u.has(r)){u.add(r);var i=Ln(r);for(let e of[t,document]){var a=qn.get(e);a===void 0&&(a=new Map,qn.set(e,a));var o=a.get(r);o===void 0?(e.addEventListener(r,Hn,{passive:i}),a.set(r,1)):a.set(r,o+1)}}}};return d(i(zn)),Bn.add(d),()=>{for(var e of u)for(let n of[t,document]){var r=qn.get(n),i=r.get(e);--i==0?(n.removeEventListener(e,Hn),r.delete(e),r.size===0&&qn.delete(n)):r.set(e,i)}Bn.delete(d),s!==n&&s.parentNode?.removeChild(s)}});return Yn.set(l,u),l}var Yn=new WeakMap,Xn=class{anchor;#e=new Map;#t=new Map;#n=new Map;#r=new Set;#i=!0;constructor(e,t=!0){this.anchor=e,this.#i=t}#a=e=>{if(this.#e.has(e)){var t=this.#e.get(e),n=this.#t.get(t);if(n)gn(n),this.#r.delete(t);else{var r=this.#n.get(t);r&&(gn(r.effect),this.#t.set(t,r.effect),this.#n.delete(t),r.fragment.lastChild.remove(),this.anchor.before(r.fragment),n=r.effect)}for(let[t,n]of this.#e){if(this.#e.delete(t),t===e)break;let r=this.#n.get(n);r&&(L(r.effect),this.#n.delete(n))}for(let[e,r]of this.#t){if(e===t||this.#r.has(e))continue;let i=()=>{if(Array.from(this.#e.values()).includes(e)){var t=document.createDocumentFragment();vn(r,t),t.append(qt()),this.#n.set(e,{effect:r,fragment:t})}else L(r);this.#r.delete(e),this.#t.delete(e)};this.#i||!n?(this.#r.add(e),mn(r,i,!1)):i()}}};#o=e=>{this.#e.delete(e);let t=Array.from(this.#e.values());for(let[e,n]of this.#n)t.includes(e)||(L(n.effect),this.#n.delete(e))};ensure(e,t){var n=O,r=Zt();if(t&&!this.#t.has(e)&&!this.#n.has(e))if(r){var i=document.createDocumentFragment(),a=qt();i.append(a),this.#n.set(e,{effect:I(()=>t(a)),fragment:i})}else this.#t.set(e,I(()=>t(this.anchor)));if(this.#e.set(n,e),r){for(let[t,r]of this.#t)t===e?n.unskip_effect(r):n.skip_effect(r);for(let[t,r]of this.#n)t===e?n.unskip_effect(r.effect):n.skip_effect(r.effect);n.oncommit(this.#a),n.ondiscard(this.#o)}else x&&(this.anchor=S),this.#a(n)}};function Zn(e,t,n=!1){var r;x&&(r=S,Ae());var i=new Xn(e),a=n?te:0;function o(e,t){if(x){var n=Ne(r);if(e!==parseInt(n.substring(1))){var a=Me();ke(a),i.anchor=a,Oe(!1),i.ensure(e,t),Oe(!0);return}}i.ensure(e,t)}cn(()=>{var e=!1;t((t,n=0)=>{e=!0,o(n,t)}),e||o(-1,null)},a)}function Qn(e,t,...n){var r=new Xn(e);cn(()=>{let e=t()??null;r.ensure(e,e&&(t=>e(t,...n)))},te)}var $n={get(e,t){if(!e.exclude.has(t))return e.props[t]},set(e,t){return!1},getOwnPropertyDescriptor(e,t){if(!e.exclude.has(t)&&t in e.props)return{enumerable:!0,configurable:!0,value:e.props[t]}},has(e,t){return!e.exclude.has(t)&&t in e.props},ownKeys(e){return Reflect.ownKeys(e.props).filter(t=>!e.exclude.has(t))}};function er(e,t,n){return new Proxy({props:e,exclude:t},$n)}function tr(e,t,n,r){var i=!0,a=!!(n&8),s=!!(n&16),c=r,l=!0,u=void 0,d=()=>s&&i?(u??=dt(r),X(u)):(l&&(l=!1,c=s?Fn(r):r),c);let f;if(a){var p=se in e||ce in e;f=o(e,t)?.set??(p&&t in e?n=>e[t]=n:void 0)}var m,h=!1;a?[m,h]=at(()=>e[t]):m=e[t],m===void 0&&r!==void 0&&(m=d(),f&&(i&&ye(t),f(m)));var g=i?()=>{var n=e[t];return n===void 0?d():(l=!0,n)}:()=>{var n=e[t];return n!==void 0&&(c=void 0),n===void 0?c:n};if(i&&!(n&4))return g;if(f){var _=e.$$legacy;return(function(e,t){return arguments.length>0?((!i||!t||_||h)&&f(t?g():e),e):g()})}var v=!1,y=(n&1?dt:mt)(()=>(v=!1,g()));a&&X(y);var ee=H;return(function(e,t){if(arguments.length>0){let n=t?X(y):i&&a?Ht(e):e;return P(y,n),v=!0,c!==void 0&&(c=n),e}return R&&v||ee.f&16384?y.v:X(y)})}function nr(e){C===null&&me(`onMount`),rn(()=>{let t=Fn(e);if(typeof t==`function`)return t})}function rr(e){C===null&&me(`onDestroy`),nr(()=>()=>Fn(e))}typeof window<`u`&&((window.__svelte??={}).v??=new Set).add(`5`);var ir=`phaser/game`;function ar(e){let t={};for(let n of Object.keys(e))e[n]!==void 0&&(t[n]=e[n]);return t}function or(t={}){let{instance:n,onpreboot:r,onpostboot:i,...a}=t,o=n??new e.Game({...ar(a),callbacks:{preBoot:e=>r?.(e),postBoot:e=>i?.(e)}});Re(ir,o);let s=Qe(o.isRunning);return o.isRunning||o.events.once(`ready`,()=>s.set(!0)),rr(()=>{o.destroy(!0)}),{game:o,booted:$e(s)}}var sr=new Set([`$$slots`,`$$events`,`$$legacy`,`instance`,`booting`,`children`]);function cr(e,t){ze(t,!0);let n=()=>rt(s,`$booted`,r),[r,i]=it(),a=tr(t,`instance`,15),{game:o,booted:s}=or({...er(t,sr),instance:a()});a(o);var c=Wn(),l=Xt(c),u=e=>{var n=Wn();Qn(Xt(n),()=>t.children??d),Gn(e,n)},f=e=>{var n=Wn();Qn(Xt(n),()=>t.booting??d),Gn(e,n)};Zn(l,e=>{n()?e(u):e(f,-1)}),Gn(e,c),Be(),i()}var lr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAYklEQVQYlYWP0QkFMQgEZ8NrwC5SSsqxFMtJV5bgfRwegYN3+yXMKKuqCgAzuwcgMwUgiV/DiGiOmVVL44RrLQAi4rk4equhu3Nm8JFH2Hsz5+TsAqCqepV0dzJTkm7h35sXu9EsBow6d7wAAAAASUVORK5CYII=`,ur=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAdklEQVQoka2PwQ3FMAhDSdUByBYZiUyYlTICN0ZwDxWV27Sn/5EsgUE8KABERKT3fiYUY4ySea116UdEEQBiZnB3qOold4eZAYCwl0pv541zzifkFq21xSt/eYGVZ39JVW/9nelMZC/pEbFc9PML29vwW810rg8seYyvTD9v+QAAAABJRU5ErkJggg==`,dr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAYUlEQVQYlYWPwQ3AMAwCcSYgm2aUjOAxMlJ+jEBfrhpVVf2CexgAfi5so/duAJAUpcuDpPfezkyTdGbemqTb892c8xXRAGCt9dmhSYoxxgHLSwrYhm1UfmUXD/sufawpdgFYDkGH3xyeGAAAAABJRU5ErkJggg==`,fr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAV0lEQVQYlYXPwQnAMAxDUbl0AGuLjJdRMl620AjqoQ0ktDT/ZHgG47ANACB5D0+SAgDOga212UHSkiIy84WjWiuOT5mKzPTvgm2QdO99gVIKJMX+xO7NCwVcJEVDaP+mAAAAAElFTkSuQmCC`,pr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAYElEQVQokaWQwQ3AMAgDgQ2YkNVgQkZIP6WySKhU1b9LwBbmtRb9kSBExKubqm7/chr8Inb3MdXM+JRaykwWM+NpuYamZaL7hG7SuZsgC9FeXud+BvLTAaaWAXaAqfh2ATH7NvESpjclAAAAAElFTkSuQmCC`,mr=`data:image/png;base64,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`,hr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAXElEQVQokWP8//8/g6Ig538GLOD++++MDAwMeOVZFAU5/6MrROc7BERg08+gKMj5nwmZc//9d8b7778z4rIRG4AbQMi5BA1A1gwzjBjAgswhRSNOF5DqBUZKoxEAQqs2oyIc1lkAAAAASUVORK5CYII=`,gr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAS0lEQVQYlXWPwQ3AUAhCofkD4KaO4qaMYG+NaS1H8UFgdyMiGotsk5K6qj5mZgIAzvsAABM4A8KWdG3d68OkZx0lrQueBNv8M23zBjYrGbkXzQ+wAAAAAElFTkSuQmCC`,_r=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAEZJREFUGJWNj0EOgEAIA6f7SXgivBIvK6Ix0Z5KpiStuFTD62kqIpq6e7M1oZkBsO86Aze4v1uLD3UgM5HE7PKrpEb4deYB2bcXAzyI908AAAAASUVORK5CYII=`,vr=`data:image/png;base64,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`,yr=`/games/ps2-mario/assets/font-DD2UNu94.png`,br=`/games/ps2-mario/assets/goomba-UWN_nZom.png`,xr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABACAYAAADS1n9/AAAAAXNSR0IArs4c6QAABiFJREFUeJztXNGR6joMFXdeAUkXlOISli8oIaWkBPIFJaQUuoAOfD/2KqMIyZaTsJh9OjM7EyCyZetYdiRlARwOh8PxP8UOL2KMmzfetu3U6P1+36Xu3VL2lRiGYdLreDyqeln03+3eP6z/tB/WGoDKl7a3RnaNzJZ9St/XRGSE6AG0gQDYBkHl+74HAICu66Dv++SqWSsrtcFRqn9pO8MwRNQX4Ft3Ta4GD/CHf8ENgAPp+75o8vgE4GfqQreU3Vp/Sf7xeCTlUb++72eGp21YxvCTmHkAagA++QjrCuZytD2tjTWyXH6J/hZ5/F4jU2oM+B3qUIMHUAlAYTUAhcZ0i/xS2S0JJMkjSow/juN0fblcZnLVEQCxxnh8/wwhwDiOiw5SpbKINfqn5LuuS+oinR2QDEgESoIaCPD0FICDwMnHa85ejtze1rZtpCtDMkbqFL30JI7j+Ld/R61vLsvHv4SICOoFasPsEJg6/bZtGy2nY35Q6vseQggA8OxKNeDhC2VvtxscDods3xIJcfLP57MqPwyDODbUexzH6RpAnydOkBACdF0H4zhWS4LZFoAT2HUd3G632d653++n65Qr1Qx1vV53AABN06irGWXp6qNIeSHUPTXRmjzKnk6n3dfX1+wpgM4BGhMg/zh5OBwi1UXyojVsASIBtEnEVZByoXSlcFgmjxPIOuG5/nPkOZ1Ou6ZpkvqX6EMJQLcQup1VRwAEujh0503TmCJZ9PxAJxyNap08q4vV+gb4NnhJBI7v/xy5M5AG7gmoPlUSgE4EJwBAmfGWHpo4AawG5PeVhp/xHiTsUqNLbUt6VEkAAHkF/mQc+939p2BJBlkJXAMBkqFg/r3lKYDfT/+scu/sPyWLcf6cXKq9qkPBAHI8nocwc8hNtmUvf3f/GnKxDPokpeU0ULYGD/AUCk7FwRGlIVmrEd/df042FxKWVjfK0ycC1KMqAuBBT5p0OgkArzGiFof/qf5LZKWEEDW+JD+OY5VxALUgBIGDyWXBAORcPm1Hm9Aa+i+V1fTgxsfPIQQ4HA5xqyeLrSCeAbZyvQhrNu2d/VtlU20APHsCSgQaowCowwOIBOChWEsyiGKpEbV4fGki5hUkArDXAlC9pdRwTQSYbQG5ZFBJOJa6PgB7UIWTj0+ipX+AuevFZE4IYVqh2hkEgSsWZUtC0qi39Lm2LWAigOU5OUcCKRZPJ0KbfEQqDj8MQyypJ1wKXs5FkcsTSPfTTGAtwSwK8RAo1bRhNjBFgtQEUbecM2bpRGObvPgCdcexYMJH05/W7mEbmBXlOknzgMkeTf8aq4MnRWi+XMoG0kGlijlSHsDyKJfK+1vSwTylK+mRO8BJBpfayqW16b30MFhTMmjyAMfjcWcJU1qjcRS5NLIGHjzJ6dW2baSJKysk8vIikBJcLpcdJQElPhr/X59vZ8BsC+Arnw4Efzsej6aGcbVaKnm4HHeja8qxaJvW+/nevYQIfPzYVtd19eYCtLSlJa2aOhuUpmX5vSVPIJY+NDlu6K1O7FpNQA1bwFMoGKERgP9mQan8mpqCJSQoKTpdCmlMVRHgFS+HOtKogQDZXMA7UHNByG9DdR5gTS7/01C1B1i776/FmoIQhx2zkjCMA2hlTfSeV4BGC6Wc+jAM1ZVUfTomAlDj05AovbaSYEk9Hs/HU8Nb3yhylGMWCpbeaUfw36wVsRxLXqumsFYGfQJqOANMiDFC0zSxaZp4Pp8jXkvfxRhB+6P3owxep+SoPJWV9LC2VftfDSiqCLK8Hr22qFMqSEH8picAgDo8wNN7AQAwewkS4DuOXbIPr9nDMRxLw7IhhF9n/FowCwXf7/edlMqkxsDEirWurqQecGkq+FNRnQdo2zbS/DWWUdFCi9SbOwDPCRX6rj+9rwTjOBZnFR02qIEgunJLXXgIYaogAviuqtnv92q5lUYegHV5eUceEwGoa9ZWW24flkqg+eeSAs/r9SpW9zi2w6a5gNQ79qmSLJR7PB6TwfE/igCUvZ7+SajhDLAZAfjezv9XUK7eIPVPGFOyn4waCOBwOBwOh8PhcDgcDofD4XA4HA6Hw+FwOBwOh+P34S9E16Ugkq5gJwAAAABJRU5ErkJggg==`,Sr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAFCAYAAABfPyy9AAAAPElEQVQYlbWRMQrAQAzD5L4yT8wv1e0oNFtaTwYNMjgqSWSIGmDFA9jdL1hVp2/4NZm/zCh4rtvy/P3BDQgnKxl7It68AAAAAElFTkSuQmCC`,Cr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAATklEQVQokc2Ryw2AQAgFh+2ALui/mtcFJeCJBPXgRi/OieR9EsAAqgp3LwaZaVxoz9TWFCQh6WR+YvXQwYjYyd0L3vKjgt69b7GLwbc3HkYHI32srJkjAAAAAElFTkSuQmCC`,wr=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAYCAYAAABurXSEAAAAAXNSR0IArs4c6QAACHZJREFUWIWtV01vHMUWPf3d1d/tcWwJtl6xRSARJIREFAnxR0CEKMYaYycKcUKEbM842M7MODZEiDW/ACIrJMjGNk4kWPAfQBAyxOOe/qrDIm9ansSBvKd3V73oU/fUrVvn3AL+zxFFET3PIwC4rkvf9/nfYKMoqrCDdZ4rbNumbdscLOQ4znOBgyDg4uIiO50OTdPkjRs32Ol0GATBv+KDIGCz2eS1a9cohGCr1eLKyspzYRFFEZvNJj/77DO6rsuNjQ1ev379uSomhOD29jYNw+De3h7DMOT29jaFEFUFnxW2bXNnZ4eu63J/f5+WZfG7776j4zh0XfefcwshuLu7y1qtxvv37zMIAv70008Mw/CZu47jmEIIGoZB27Y5MjLCu3fv0vM8bm1tUQjBtbW1Y4lHUUQhBHVdp+M4PHHiBPf29qjrOre2thgEAVdXVxmGYYXVBx9BEDBNU5RlibfeegtFUYAkdF2HoihwHAf1eh2XLl3io0ePlKO4ixcvwrZtqKqKsixhGAbefvttbG5uot/vQ9d1nDlzBqZpDhH2fZ+XLl2CbdvQNA1FUSDPc5w8eRJbW1tQVRVSSly9ehW6rg9hMdjN+vo6P//8c3Y6HXY6Hbquy729Pd65c4ejo6OMomioTYIgqNqo1WoxDEO+8MIL/Oqrr/jFF1/Qtm1++eWXXFtboxCCrutWRx0EAZeXl+n7PtvtNqMo4osvvsiNjQ2ur68zjmO2Wi2ur6/TdV2GYVhh1TAMefnyZVy8eBFSSkxPT+Pq1aswTRMLCws4deoUfvnlF1y5cgV5nkPTNAyIl2UJ0zShKAo8z0Ov18PHH3+MXq+HJEnQbreRJAlUVUWj0YBpmrAsC2NjY5RSQtd1kISqqiiKAleuXEGaptA0Dc1mEyRRFAWWl5eRpimklBgfH6c6SFwURdUK58+fR5IkME0TS0tL0HUdmqZhYWGhSjI2NkbycdGbzSbSNEWr1QIAJEkCy7JQliWKogAAaJoGAJBS4rffflOklCCJRqMBkmg2mwAAx3EwaFPHcQAAiqJAVVXouo5ff/1VUaWUUFUVy8vLAID5+XkYhoGiKJCmKUzTrKqlqipIVolt20ZRFJBSoizL6p84jqseff311zExMQHDMJBlGR4+fKgAwADb6/Uw2ECWZdB1HZ7nIc9zvPTSS3j11VeRpil0XcfgLqmDagGoqlKWJeI4hqqqyLIMr732GiYmJmCaJrIsq8BFUcDzPBiGAcMwkCQJDg8Pkec5kiTBhQsXkKYpxsfHUZYlSCKO46q1fN/H6Ogo0jStipEkCQ4ODjAzMwNN06CqKjRNQ57nFVbVdR1SSkgpqwpLKXFwcABd13Hu3DmUZYnx8XEURQFN01Cr1QgAf/31lzI5OVnd8oGCpGmKmZkZFEUBRVFw8uRJTE1NwbIs/PnnnwoAdLtd5cMPP0SapnBdtyqQpmmYmZlBmqZQFAWnTp3C1NQUNE2rsJUKtFotrq6u8ubNm9zY2ODa2hrjOGYURdzZ2aHjOKzVakN6OQjXdWlZFh3Hoed5dF2X9+7d448//sharcZ2u/1Mgxg4ruM4FEIwjmPu7e1xZ2eHQRBU6nEcFmEYUghBx3FoWRZHRkb4888/8/79+zxx4gRXVlYohHimMxmGQUVRODIyQiEEVVVlFEW8ceMGoyji0dHguBBC0PM8hmHIsbExBkHAmzdvstPp0HEcjo6OVljlSbDruiRZ9WgQBJifn0e328Xc3BxM08Qff/wxhIvjmJcvX4brujg8PMTU1BTu3LkDXdexu7sL27aRZRnKssTs7CwODg6eyjsonJQSeZ5je3sb+/v7mJqaAgAcNTT1SWCv11MGhH/44QfcunULeZ7jk08+gZTyKcIAkGUZPM8DANTrdXz//ffVHSGJsiyhKAoMw8DKygqOs3PXdZkkCebn57G+vo433ngDWZZV6nI0niLt+z6zLMP29jaEENA0DWVZVnp6XOi6jjzPUa/XsbGxAQCwLAv9fh+2bWNycrKy6DzPj11DSonV1VWUZYl+v49GowFFUSCEQKPRGNroEOk4jqkoCpaWlgAADx48wJtvvllVUwiB4y5it9tV6vU6kiTBxMQELMuCbdvQdb0yLNd1EQQBzp49WxnNkxsXQkAIgSzLYJomPvroo8ob0jSt/h06at/3KaXEN998Aykl3nnnHSwuLsKyLDx48AC2beM/5I7tSdd1+e233+L06dPQNA2DAmRZhnq9XklrmqYVPo5jJkkCwzCgaVplcmfOnMH8/DxM08T09HSl448ePVKGKq2qKhRFgW3bsCwLQghIKaueHfTpsySIJE6fPo3bt2+j2Wyi1+vh3Xffhe/7aDQa+PTTT7G0tISBEgRBwLm5OQCP2+nWrVs4e/Ys3n//fWxubla+sbCwgDzPkaYpgiDgEOlut6tIKbG7uwuS+Prrr3HhwoVqpJydncXCwsJQ4qNhmiY0TQNJvPzyy5BSIggCvPfee7AsC47j4Pz58/j9998VAMjzHK+88gra7TYePnyIe/fuYXNzE7dv365OKkkSnDt3DpZlVaPvU8fsOA5J4tq1a7AsC7Ozs+j3+yCJPM8rRTgqQUdjMDValgVN0/DBBx/AsqxKAY7KXRiGnJubg+d5mJ6ermaMxcVF9Pt9eJ6HyclJlGUJAMfeBYRhyLW1NXqexyiKGAQBr1+/ziAI6LouTdN8rjeb53nc399np9OhrutDc/ST4fs+7969y0ajQcuyaNt2ZTJHzS6O44rXU6SFEJXz+b5fER0AnveRG4YhB0+pf3JS4LGVh2FI3/c5mGuORhAEbLfb1XNs6IhrtRrzPEdRFDg8PFQ8z6OiKCBZzdG6rg8PLv9CXFEe/zoYSf/X8H2fqqqi2+0qfwOdNrO0fVV/rAAAAABJRU5ErkJggg==`,Tr=`/games/ps2-mario/assets/smb_tiles-CGP8-lqP.png`,Er=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAwCAYAAABE1blzAAAAAXNSR0IArs4c6QAAA2VJREFUaIHVWjGS6yAMVTIUHM2lS5cuOZJLSkqXPhpdttgvf4UISQaS3X0znhiDQQ8JJBTfcs4PeCO8913v55ybx8g5gwshiC9v2wa1Ntu26RIWA2oIIUCM8aksIcYIOWfY9x0AAJZlOcvee3CSoLTzso02cAkkh4LUME3TKfgIOLwpBeZIY5tWzSG54ziqbadpeiKJ9zXEGF9MlJYdrUDBJZO8qjkEJSdpJ8YIKaWzPM+z2jeaJDVPgG9zfSIYQjCZays0chw0k9ZwEpTM7qpJjoRFgxIcgKydEZrrgUWDdM2V69Ft28b6Edx+uZdoGwkWt6BhWZau9533HtZ1ZSspsavCeu+7nXzr2Dg+QLGLSgNcFXZd12G+DKB9s7kPk+ADmOdZNFmu/k8R1KyIqzeZ6G8BDQCs9SaCIYTqRlTDyPXXs1k5aQPBulHC0jjzY8g5P/Ba1/X8xfuyTJ9bLwBgL0v9MIIcAY4oR1giDQCPlNLLJREtyv0EW7TCTYZEkBLiCJbERhG8cycI6lQ5B4vPtm17utfi1pRSdSfUwsJW3AH+C7zvO0uu/C3rQwjiUcsKJDcihkXccs6PEAK7ux3Hoe56x3GIxLz3L1oro40aoX+Eb6IACm64U6F5ISEUnHs+TdOZdtC0ZjG50jyL8hiCiFrehT6/ao6Sn9Xqvff9BDVHL8G6XqSjF2fGHNBqMPCwyOe899WZxHJtcFxLFg3RPuiYIyBNjpMEpKC5ESpwbfaXZXmZoHmeYd93SCkNJ1nDGYumlE4BUMDSBHp8FE7QsiwvE9JyoLZOzluOS1fzKC1r0GoBDmeOE8qiPctpBADOxKyFyFVIE+pQEADZBCXBpJmkSwD7QPMfAdo/B9N5sDd1V47xic0F4SStWSIJg5988bPviDk5JeScwaFq6T8+o9MNlAgN2Ee4Cs1NfSzp1PsnSit+LG3Yu66tfX9Eg5Z4ttXRa5vkDfS0QFc0rwXzAH3BtgZHO26J1i34pFso8adS9y04z4PvMpF3QzsQd28y2qcmtQ8bpLZc39w7VlQzy5ZLShJbMuW0bGlT5mE1cjf4TsSqs1CLdPBPGS4vSp/V7rm22vsUMUbRRIcR/CloBIc6eu1DIq2t5UMkrMd7LW4eRrDVHGka8uo7FlgiGRG/3US/AIkrI0hFn+UQAAAAAElFTkSuQmCC`,Dr=`{
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
`,Or=`{
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
`,kr=`{
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
`,Ar=`{ "compressionlevel":-1,\r
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
}`,jr=`{
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
`,Mr=`/games/ps2-mario/assets/mania-Cf7edEDr.ttf`,Z=(e,t,n)=>Math.min(n,Math.max(t,Math.round(e))),Nr={new(e,t,n,r=128){return((Z(r,0,255)&255)<<24|(Z(n,0,255)&255)<<16|(Z(t,0,255)&255)<<8|Z(e,0,255)&255)>>>0},getR(e){return e&255},getG(e){return e>>>8&255},getB(e){return e>>>16&255},getA(e){return e>>>24&255},setR(e,t){return(e&4294967040|Z(t,0,255)&255)>>>0},setG(e,t){return(e&4294902015|(Z(t,0,255)&255)<<8)>>>0},setB(e,t){return(e&4278255615|(Z(t,0,255)&255)<<16)>>>0},setA(e,t){return(e&16777215|(Z(t,0,255)&255)<<24)>>>0}};function Pr(e){return{r:e&255,g:e>>>8&255,b:e>>>16&255,a:Math.min(1,(e>>>24&255)/128)}}var Q={SELECT:1,L3:2,R3:4,START:8,UP:16,RIGHT:32,DOWN:64,LEFT:128,L2:256,R2:512,L1:1024,R1:2048,TRIANGLE:4096,CIRCLE:8192,CROSS:16384,SQUARE:32768};function Fr(e){let t=()=>{let t={},n=n=>t[n]??e.padAxis?.(n)??0;return{btns:0,old_btns:0,get lx(){return n(`lx`)},set lx(e){t.lx=e},get ly(){return n(`ly`)},set ly(e){t.ly=e},get rx(){return n(`rx`)},set rx(e){t.rx=e},get ry(){return n(`ry`)},set ry(e){t.ry=e},update(){this.old_btns=this.btns,delete t.lx,delete t.ly,delete t.rx,delete t.ry},pressed(t){return e.padHeld(t)},justPressed(t){return e.padFresh(t)}}};return{...Q,get(e=0){return t()},getConnected(){return[0]},getConnectedCount(){return 1},isActive(e){return e===0}}}function Ir(e){return class{width;height;startx;starty;endx;endy;filter=0;color=Nr.new(255,255,255,128);#e;constructor(t){this.#e=e.createImage(t),this.width=this.#e.width,this.height=this.#e.height,this.startx=0,this.starty=0,this.endx=this.#e.width,this.endy=this.#e.height}draw(t,n,r,i){let a=this.endx<this.startx,o=this.endy<this.starty,s=a?this.endx:this.startx,c=o?this.endy:this.starty,l=Math.abs(this.endx-this.startx),u=Math.abs(this.endy-this.starty);l<=0||u<=0||e.drawImage(this.#e,s,c,l,u,t,n,r??this.width,i??this.height,{nearest:this.filter===1,flipX:a,flipY:o,color:Pr(this.color)})}}}function Lr(e){return class{scale=1;color=void 0;#e;constructor(t){this.#e=e.createFont(t)}print(t,n,r,i){let a=i===void 0?this.color:i;e.drawText(this.#e,t,n,String(r),a===void 0?void 0:Pr(a),this.scale)}getTextSize(t){return e.measureText(this.#e,String(t),this.scale)}}}function Rr(e){return{loadFile(t){return e.loadFile(t)},open(t,n){if(!/w/.test(n))throw Error(`5velte-ps2 std.open: only write modes are shimmed (got "${n}")`);let r=``;return{puts(e){r+=e},close(){e.writeFile(t,r)}}}}}var $=()=>typeof performance<`u`?performance.now():Date.now(),zr={new(){return{base:$(),pausedAt:null}},getTime(e){let t=e.pausedAt??$();return Math.round((t-e.base)*1e3)},setTime(e,t){e.base=(e.pausedAt??$())-t/1e3},pause(e){e.pausedAt===null&&(e.pausedAt=$())},resume(e){e.pausedAt!==null&&(e.base+=$()-e.pausedAt,e.pausedAt=null)},reset(e){e.base=$(),e.pausedAt=null},destroy(e){}};function Br(e){let t=null;return{Screen:{setVSync(t){e.setVSync?.(t)},getMode(){return{width:e.screen.width,height:e.screen.height}},display(e){t=e}},Draw:{rect(t,n,r,i,a){e.drawRect(t,n,r,i,Pr(a))}},Color:Nr,Pads:Fr(e),Image:Ir(e),Font:Lr(e),Timer:zr,std:Rr(e),NEAREST:1,LINEAR:0,tick(){e.beginFrame(),t?.(),e.endFrame()}}}function Vr(t,n,r){if(t.cache.bitmapFont.exists(n))return;let i=r?.fontFamily??`monospace`,a=r?.fontSize??16,o=r?.color??`#ffffff`,s=r?.chars??e.GameObjects.RetroFont.TEXT_SET1;if(s.length===0)throw Error(`5velte-ps2: registerCanvasBitmapFont needs at least one character`);t.textures.exists(n)&&t.textures.remove(n);let c=t.textures.createCanvas(n,1,1);if(!c)throw Error(`5velte-ps2: could not create canvas texture "${n}"`);let l=`${a}px ${i}`,u=c.context;u.font=l;let d=1;for(let e of s)d=Math.max(d,Math.ceil(u.measureText(e).width));let f=u.measureText(`Mg(|]q`),p=Math.ceil(f.fontBoundingBoxAscent??f.actualBoundingBoxAscent??a*.8),m=p+Math.ceil(f.fontBoundingBoxDescent??f.actualBoundingBoxDescent??a*.25),h=Math.ceil(Math.sqrt(s.length)),g=Math.ceil(s.length/h);c.setSize(h*d,g*m),u.font=l,u.fillStyle=o,u.textAlign=`center`,u.textBaseline=`alphabetic`;for(let e=0;e<s.length;e++){let t=e%h,n=Math.floor(e/h);u.fillText(s[e],t*d+d/2,n*m+p)}c.refresh();let _=e.GameObjects.RetroFont.Parse(t,{image:n,"offset.x":0,"offset.y":0,width:d,height:m,chars:s,charsPerRow:h,"spacing.x":0,"spacing.y":0,lineSpacing:0});t.cache.bitmapFont.add(n,_)}var Hr=t=>e.Display.Color.GetColor(t.r,t.g,t.b);function Ur(e){let t=e.scene,n=e.screen??{width:640,height:448},r=[],i=[],a=[],o=0,s=0,c=0,l=0,u=null,d=e.storage??{loadFile(e){return localStorage.getItem(`5velte-ps2:${e}`)},writeFile(e,t){localStorage.setItem(`5velte-ps2:${e}`,t)}},f=(e,t)=>{for(let n=t;n<e.length&&e[n].visible;n++)e[n].setVisible(!1)},p=e.clear===!1?null:{a:1,...e.clear??{r:0,g:0,b:0}};return{host:{screen:n,beginFrame(){o=0,s=0,c=0,l=0,p&&this.drawRect(0,0,n.width,n.height,p)},endFrame(){f(r,o),f(i,s),f(a,c)},drawRect(e,n,i,a,s){let c=r[o];c||(c=t.add.graphics(),r.push(c)),o++,c.clear(),c.fillStyle(Hr(s),s.a),c.fillRect(e,n,i,a),c.setDepth(l++),c.setVisible(!0)},createImage(n){let r=e.resolveTexture(n);if(!t.textures.exists(r))throw Error(`5velte-ps2: texture "${r}" (for "${n}") is not loaded`);let i=t.textures.get(r).getSourceImage();return{key:r,width:i.width,height:i.height}},drawImage(e,n,r,a,o,c,u,d,f,p){let{key:m}=e,h=`5vps2:${n},${r},${a},${o}`,g=t.textures.get(m);g.has(h)||g.add(h,0,n,r,a,o);let _=i[s];_||(_=t.add.image(0,0,m,h).setOrigin(0,0),i.push(_)),s++,_.setTexture(m,h),_.setFlip(p.flipX,p.flipY),_.setPosition(c,u),_.setDisplaySize(d,f);let v=p.color;_.setAlpha(v?.a??1),v&&(v.r!==255||v.g!==255||v.b!==255)?_.setTint(Hr(v)):_.clearTint(),_.setDepth(l++),_.setVisible(!0)},createFont(t){let n=e.resolveFont(t);return{key:n.key,size:n.size,scale:n.scale??1}},drawText(e,n,r,i,o,s){let u=e,d=a[c];d||(d=t.add.bitmapText(0,0,u.key,``,u.size),a.push(d)),c++,d.font!==u.key&&d.setFont(u.key,u.size),d.setText(i),d.setScale(u.scale*(s??1)),d.setPosition(n,r),o?(d.setTint(Hr(o)),d.setAlpha(o.a)):(d.clearTint(),d.setAlpha(1)),d.setDepth(l++),d.setVisible(!0)},measureText(e,n,r){let i=e;u||=t.add.bitmapText(0,0,i.key,``,i.size).setVisible(!1),u.font!==i.key&&u.setFont(i.key,i.size),u.setText(n);let a=i.scale*(r??1);return{width:u.width*a,height:u.height*a}},padHeld(t){return e.pads.held(t)},padFresh(t){return e.pads.fresh(t)},padAxis(t){let n=e.pads.axis?.(t)??0;return Math.round(n<0?n*127:n*128)},loadFile(e){return d.loadFile(e)},writeFile(e,t){d.writeFile(e,t)}},destroy:()=>{for(let e of r)e.destroy();for(let e of i)e.destroy();for(let e of a)e.destroy();u?.destroy(),r.length=0,i.length=0,a.length=0,u=null}}}var Wr=[Q.CROSS,Q.CIRCLE,Q.SQUARE,Q.TRIANGLE,Q.L1,Q.R1,Q.L2,Q.R2,Q.SELECT,Q.START,Q.L3,Q.R3,Q.UP,Q.DOWN,Q.LEFT,Q.RIGHT],Gr={ArrowUp:Q.UP,ArrowDown:Q.DOWN,ArrowLeft:Q.LEFT,ArrowRight:Q.RIGHT,KeyW:Q.UP,KeyS:Q.DOWN,KeyA:Q.LEFT,KeyD:Q.RIGHT,Space:Q.CROSS,KeyX:Q.CROSS,ShiftLeft:Q.SQUARE,KeyZ:Q.SQUARE,KeyC:Q.CIRCLE,KeyV:Q.TRIANGLE,Enter:Q.START,Backspace:Q.SELECT},Kr=.5,qr=class{keysDown=new Set;cur=0;prev=0;axes={lx:0,ly:0,rx:0,ry:0};onKeyDown=e=>{Gr[e.code]!==void 0&&(e.preventDefault(),this.keysDown.add(e.code))};onKeyUp=e=>{this.keysDown.delete(e.code)};constructor(){window.addEventListener(`keydown`,this.onKeyDown),window.addEventListener(`keyup`,this.onKeyUp)}destroy(){window.removeEventListener(`keydown`,this.onKeyDown),window.removeEventListener(`keyup`,this.onKeyUp)}refresh(){this.prev=this.cur;let e=0;for(let t of this.keysDown)e|=Gr[t]??0;this.axes.lx=this.axes.ly=this.axes.rx=this.axes.ry=0;let t=typeof navigator<`u`&&navigator.getGamepads?navigator.getGamepads():[],n=Array.prototype.find.call(t,e=>e&&e.connected);n&&(n.buttons.forEach((t,n)=>{t.pressed&&Wr[n]!==void 0&&(e|=Wr[n])}),this.axes.lx=n.axes[0]??0,this.axes.ly=n.axes[1]??0,this.axes.rx=n.axes[2]??0,this.axes.ry=n.axes[3]??0,this.axes.lx<=-.5&&(e|=Q.LEFT),this.axes.lx>=Kr&&(e|=Q.RIGHT),this.axes.ly<=-.5&&(e|=Q.UP),this.axes.ly>=Kr&&(e|=Q.DOWN)),this.cur=e}held(e){return(this.cur&e)!==0}fresh(e){return(this.cur&e)!==0&&(this.prev&e)===0}axis(e){return this.axes[e]??0}},Jr=`modulepreload`,Yr=function(e){return`/games/ps2-mario/`+e},Xr={},Zr=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=Yr(t,n),t=s(t),t in Xr)return;Xr[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:Jr,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Qr=Object.assign({"../../ps2/assets/collectibles/coin2.png":lr,"../../ps2/assets/collectibles/flower.png":ur,"../../ps2/assets/collectibles/heart.png":dr,"../../ps2/assets/collectibles/mushroom.png":fr,"../../ps2/assets/collectibles/star.png":pr,"../../ps2/assets/images/title.png":mr,"../../ps2/assets/sprites/box.png":hr,"../../ps2/assets/sprites/brick.png":gr,"../../ps2/assets/sprites/coin.png":_r,"../../ps2/assets/sprites/dk.png":vr,"../../ps2/assets/sprites/font.png":yr,"../../ps2/assets/sprites/goomba.png":br,"../../ps2/assets/sprites/mario.png":xr,"../../ps2/assets/sprites/platform.png":Sr,"../../ps2/assets/sprites/rotatingCoin.png":Cr,"../../ps2/assets/sprites/yoshi.png":wr,"../../ps2/assets/tiles/smb_tiles.png":Tr,"../../ps2/assets/tiles/tiles.png":Er}),$r=Object.assign({"../../ps2/assets/tiles/level1.json":Dr,"../../ps2/assets/tiles/level1room1.json":Or,"../../ps2/assets/tiles/level1room2.json":kr,"../../ps2/assets/tiles/level4_2.json":Ar,"../../ps2/assets/tiles/tiles.json":jr}),ei=Object.assign({"../../ps2/assets/fonts/mania.ttf":Mr}),ti=e=>e.replace(/^.*\/ps2\//,``),ni=new Map(Object.entries(Qr).map(([e,t])=>[ti(e),t])),ri=new Map(Object.entries($r).map(([e,t])=>[ti(e),t])),ii=new Map(Object.entries(ei).map(([e,t])=>[ti(e),t])),ai=new Map([...ni.keys()].map(e=>[e,e]));function oi(e,t,n){let r=e.get(t);if(r!==void 0)return r;let i=t.toLowerCase();for(let[r,a]of e)if(r.toLowerCase()===i)return console.warn(`[ps2-mario] ${n} "${t}" only matches "${r}" ignoring case — fix the path`),a}var si=`ps2:missing`,ci=`ps2:font`,li=24,ui=class extends e.Scene{runtime;pads=new qr;destroyHost;ready=!1;constructor(){super({key:`Ps2Scene`})}preload(){for(let[e,t]of ni)this.load.image(e,t)}create(){this.textures.createCanvas(si,1,1)?.refresh();let{host:t,destroy:n}=Ur({scene:this,pads:this.pads,resolveTexture:e=>this.textures.exists(e)?e:oi(ai,e,`texture`)??si,resolveFont:()=>({key:ci}),storage:{loadFile:e=>localStorage.getItem(`ps2-mario:${e}`)??oi(ri,e,`file`)??null,writeFile:(e,t)=>localStorage.setItem(`ps2-mario:${e}`,t)}});this.destroyHost=n,this.runtime=Br(t);let r=globalThis,i=this.runtime;r.Screen=i.Screen,r.Draw=i.Draw,r.Color=i.Color,r.Pads=i.Pads,r.Image=i.Image,r.Font=i.Font,r.Timer=i.Timer,r.std=i.std,r.NEAREST=i.NEAREST,r.LINEAR=i.LINEAR,r.__DEBUG=new URLSearchParams(location.search).has(`debug`),this.boot(),this.events.once(e.Scenes.Events.DESTROY,()=>{this.destroyHost?.(),this.pads.destroy()})}async boot(){await this.loadBitmapFont(),await Zr(()=>import(`./main-B_OhB1v3.js`),[]),this.ready=!0}async loadBitmapFont(){let e=`ps2-mario-font`,t=ii.values().next().value;if(t)try{let n=new FontFace(e,`url(${t})`);await n.load(),document.fonts.add(n)}catch(e){console.warn(`[ps2-mario] could not load the game font, falling back to monospace`,e)}Vr(this,ci,{fontFamily:`"${e}", monospace`,fontSize:li})}update(){!this.ready||!this.runtime||(this.pads.refresh(),this.runtime.tick())}};function di(t,n){ze(n,!0);let r=N(void 0);function i(t,n){if(!t||!n)return e.Scale.FIT;let r=640/448,i=t/n;return Math.max(r/i,i/r)<=1.02?e.Scale.ENVELOP:e.Scale.FIT}let a=i(typeof window>`u`?0:window.innerWidth,typeof window>`u`?0:window.innerHeight);function o(){let e=X(r)?.scale;if(!e)return;let t=i(window.innerWidth,window.innerHeight);e.scaleMode!==t&&(e.scaleMode=t),e.refresh()}rn(()=>{if(X(r))return window.game=X(r),o(),window.addEventListener(`resize`,o),window.addEventListener(`orientationchange`,o),()=>{window.removeEventListener(`resize`,o),window.removeEventListener(`orientationchange`,o)}});{let n=pt(()=>({mode:a,autoCenter:e.Scale.CENTER_BOTH,width:640,height:448,expandParent:!0})),i=pt(()=>[ui]);cr(t,{backgroundColor:`#000000`,get scale(){return X(n)},render:{pixelArt:!0},get scene(){return X(i)},get instance(){return X(r)},set instance(e){P(r,e,!0)}})}Be()}Kn(di,{target:document.body});