// Level subdomains (lib/level-subdomain.ts, wired in main.ts): the root of
// `<name>.<site>` goes to the game with that level, or to the level editor's
// NEW GAME named for the label when no game has the name. Pure functions and
// injected fetchers — no server, no network.
// node:assert (not @std/assert) so the file runs with zero remote deps.
//
// Run with: deno test -A tests/level_subdomain_test.ts

import assert from "node:assert/strict";
import {
  cloudLevelAliases,
  cloudLevelKeys,
  hostnameOf,
  isAliasName,
  levelSlug,
  matchLevelKey,
  planAliases,
  resetLevelKeysCache,
  siteHosts,
  subdomainOf,
  subdomainRedirect,
  subdomainRootLabel,
  subdomainTarget,
} from "../lib/level-subdomain.ts";

// A slice of the real catalog: mixed case, a case-only pair, and names no
// hostname could spell.
const KEYS = [
  "2019-PS2",
  "2028",
  "Ramsie",
  "ramsie",
  "Choh Parody Spirit Twin Ex_Sound ver",
  "Master Arena Mod",
  "SummerCarnival'99 LECCA",
];

// What a deployment with CMG_SITE_HOSTS=cmg.test serves.
const SITES = siteHosts("cmg.test");

const req = (
  url: string,
  host: string,
  extra: Record<string, string> = {},
  method = "GET",
) => new Request(url, { method, headers: { host, ...extra } });

const location = (res: Response | null) => res && res.headers.get("location");

Deno.test("the sites are what CMG_SITE_HOSTS lists, tidied, plus localhost", () => {
  assert.deepEqual(siteHosts(null), ["localhost"]);
  assert.deepEqual(siteHosts(""), ["localhost"]);
  assert.deepEqual(siteHosts("cmg.test"), ["cmg.test", "localhost"]);
  // Commas or spaces, a wildcard spelling, a port, a case, a repeat.
  assert.deepEqual(
    siteHosts(" *.CMG.test:443, play.example.com  cmg.test ,localhost"),
    ["cmg.test", "play.example.com", "localhost"],
  );
  // Left out, the list is read from the environment each time it is asked.
  const before = Deno.env.get("CMG_SITE_HOSTS");
  try {
    Deno.env.set("CMG_SITE_HOSTS", "env.test");
    assert.deepEqual(siteHosts(), ["env.test", "localhost"]);
    assert.equal(subdomainOf("gs.env.test"), "gs");
    Deno.env.delete("CMG_SITE_HOSTS");
    assert.deepEqual(siteHosts(), ["localhost"]);
    assert.equal(subdomainOf("gs.env.test"), null);
  } finally {
    if (before === undefined) Deno.env.delete("CMG_SITE_HOSTS");
    else Deno.env.set("CMG_SITE_HOSTS", before);
  }
});

Deno.test("the label is read off the Host, without port, case or a www", () => {
  assert.equal(hostnameOf("2019-PS2.cmg.test:443"), "2019-ps2.cmg.test");
  assert.equal(hostnameOf("[::1]:5173"), "::1");
  assert.equal(hostnameOf("a.cmg.test, proxy"), "a.cmg.test");
  assert.equal(hostnameOf("a.cmg.test."), "a.cmg.test");
  assert.equal(hostnameOf(null), "");
  assert.equal(subdomainOf("2019-ps2.cmg.test", SITES), "2019-ps2");
  assert.equal(subdomainOf("2019-PS2.cmg.test:443", SITES), "2019-ps2");
  assert.equal(subdomainOf("daioh.localhost:5173", SITES), "daioh");
  assert.equal(subdomainOf("cmg.test", SITES), null);
  assert.equal(subdomainOf("www.cmg.test", SITES), null);
  assert.equal(subdomainOf("a.b.cmg.test", SITES), null);
  assert.equal(subdomainOf("-bad.cmg.test", SITES), null);
  assert.equal(subdomainOf("notcmg.test", SITES), null);
  assert.equal(subdomainOf(null, SITES), null);
});

Deno.test("no host that is not a listed site has subdomains: the deploy URL, a LAN address, a launcher", () => {
  for (
    const host of [
      "cmg.easierbycode.deno.net",
      "192.168.1.20:8000",
      "127.0.0.1:5173",
      "localhost:5173",
      "gs.cmg.test",
    ]
  ) {
    assert.equal(subdomainOf(host, siteHosts(null)), null, host);
  }
  // ...and *.localhost always does, so a checkout needs nothing set.
  assert.equal(subdomainOf("gs.localhost:5173", siteHosts(null)), "gs");
});

Deno.test("a site that is itself under another site is still an apex", () => {
  const sites = siteHosts("example.com, play.example.com");
  assert.equal(subdomainOf("play.example.com", sites), null);
  assert.equal(subdomainOf("gs.play.example.com", sites), "gs");
  assert.equal(subdomainOf("gs.example.com", sites), "gs");
  // The order they were listed in does not matter.
  const flipped = siteHosts("play.example.com, example.com");
  assert.equal(subdomainOf("play.example.com", flipped), null);
  assert.equal(subdomainOf("gs.play.example.com", flipped), "gs");
});

Deno.test("a label finds its game exactly, then by case, ties resolved the same way every time", () => {
  assert.equal(matchLevelKey("2028", KEYS), "2028");
  assert.equal(matchLevelKey("2019-ps2", KEYS), "2019-PS2");
  assert.equal(matchLevelKey("ramsie", KEYS), "ramsie");
  assert.equal(matchLevelKey("RAMSIE", KEYS), "Ramsie");
  assert.equal(matchLevelKey("nobody", KEYS), null);
});

Deno.test("a key a hostname cannot spell is reached by its slug: master-arena-mod is `Master Arena Mod`", () => {
  assert.equal(levelSlug("Master Arena Mod"), "master-arena-mod");
  assert.equal(
    levelSlug("Choh Parody Spirit Twin Ex_Sound ver"),
    "choh-parody-spirit-twin-ex-sound-ver",
  );
  assert.equal(
    levelSlug("SummerCarnival'99 LECCA"),
    "summercarnival-99-lecca",
  );
  assert.equal(levelSlug("  --a.b__c--  "), "a-b-c");
  assert.equal(levelSlug("___"), "");
  assert.equal(matchLevelKey("master-arena-mod", KEYS), "Master Arena Mod");
  assert.equal(
    matchLevelKey("summercarnival-99-lecca", KEYS),
    "SummerCarnival'99 LECCA",
  );
  // The empty slug is no label: a key of only punctuation answers to nothing.
  assert.equal(matchLevelKey("", ["___"]), null);
  // A game's own name beats an alias spelled like another game's slug.
  assert.equal(
    matchLevelKey("master-arena-mod", KEYS, { "master-arena-mod": "2028" }),
    "Master Arena Mod",
  );
  // Two keys that slug alike resolve the same way every time.
  assert.equal(matchLevelKey("a-b", ["a_b", "A B", "a b"]), "A B");
  // The game gets the stored key, spaces and all, never the slug.
  assert.equal(
    subdomainTarget("master-arena-mod", KEYS),
    "/games/2028-ai?level=Master+Arena+Mod",
  );
  assert.equal(
    subdomainTarget("summercarnival-99-lecca", KEYS),
    "/games/2028-ai?level=SummerCarnival%2799+LECCA",
  );
  // Still a NEW GAME when no game has the name, slug or not.
  assert.equal(
    subdomainTarget("master-arena", KEYS),
    "/editor/?new=master-arena",
  );
});

Deno.test("a known game goes to the game, an unknown one to NEW GAME under its name, no listing to the game", () => {
  assert.equal(
    subdomainTarget("2019-ps2", KEYS),
    "/games/2028-ai?level=2019-PS2",
  );
  assert.equal(
    subdomainTarget("my-first-level", KEYS),
    "/editor/?new=my-first-level",
  );
  // An empty catalog is a readable one: every name is new.
  assert.equal(subdomainTarget("2019-ps2", []), "/editor/?new=2019-ps2");
  // An unreadable one is not: a link to a real game must not open an editor.
  assert.equal(
    subdomainTarget("2019-ps2", null),
    "/games/2028-ai?level=2019-ps2",
  );
});

Deno.test("the visitor's own query rides along — all of it but the name the label decides", () => {
  assert.equal(
    subdomainTarget("2019-ps2", KEYS, {}, "?god=1&stage=1"),
    "/games/2028-ai?level=2019-PS2&god=1&stage=1",
  );
  assert.equal(
    subdomainTarget("2019-ps2", KEYS, {}, "?level=other&god=1&new=x"),
    "/games/2028-ai?level=2019-PS2&god=1",
  );
  assert.equal(
    subdomainTarget(
      "my-first-level",
      KEYS,
      {},
      "?new=x&level=2028&game=2028-ai",
    ),
    "/editor/?new=my-first-level&game=2028-ai",
  );
  assert.equal(
    subdomainTarget("2019-ps2", null, {}, "?god=1"),
    "/games/2028-ai?level=2019-ps2&god=1",
  );
  assert.equal(
    location(
      subdomainRedirect(
        req("http://x/?god=1", "master-arena-mod.cmg.test"),
        KEYS,
        {},
        SITES,
      ),
    ),
    "/games/2028-ai?level=Master+Arena+Mod&god=1",
  );
});

Deno.test("only a subdomain's root is redirected, on GET and HEAD, honouring X-Forwarded-Host", () => {
  const r = subdomainRedirect(
    req("http://x/", "2019-ps2.cmg.test"),
    KEYS,
    {},
    SITES,
  )!;
  assert.equal(r.status, 302);
  assert.equal(location(r), "/games/2028-ai?level=2019-PS2");
  assert.equal(r.headers.get("cache-control"), "no-store");
  // main.ts's CORS middleware stamps every response on its way out.
  r.headers.set("Access-Control-Allow-Origin", "*");
  assert.equal(
    location(
      subdomainRedirect(
        req("http://x/index.html", "new-one.cmg.test"),
        KEYS,
        {},
        SITES,
      ),
    ),
    "/editor/?new=new-one",
  );
  assert.equal(
    subdomainRedirect(
      req("http://x/", "x.cmg.test", {}, "HEAD"),
      KEYS,
      {},
      SITES,
    )!
      .status,
    302,
  );
  for (
    const other of [
      req("http://x/", "x.cmg.test", {}, "POST"),
      req("http://x/editor/", "x.cmg.test"),
      req("http://x/games/2028-ai", "x.cmg.test"),
      req("http://x/games.manifest.json", "x.cmg.test"),
      req("http://x/", "cmg.test"),
      req("http://x/", "www.cmg.test"),
      req("http://x/", "cmg.easierbycode.deno.net"),
      req("http://127.0.0.1:5173/", "127.0.0.1:5173"),
    ]
  ) {
    assert.equal(subdomainRootLabel(other, SITES), null, other.url);
    assert.equal(subdomainRedirect(other, KEYS, {}, SITES), null, other.url);
  }
  // The dev tunnel rewrites Host and keeps the browser's in X-Forwarded-Host
  // (scripts/tunnel-proxy.ts).
  const tunneled = req("http://x/", "127.0.0.1:5173", {
    "x-forwarded-host": "2028.cmg.test",
  });
  assert.equal(subdomainRootLabel(tunneled, SITES), "2028");
  assert.equal(
    location(subdomainRedirect(tunneled, KEYS, {}, SITES)),
    "/games/2028-ai?level=2028",
  );
  // With no Host header at all, the URL's own host is the host.
  assert.equal(
    subdomainRootLabel(new Request("http://gs.localhost:5173/"), SITES),
    "gs",
  );
});

Deno.test("the game listing is one shallow read, cached for a minute, and survives an outage once warm", async () => {
  resetLevelKeysCache();
  const calls: string[] = [];
  let clock = 1_000;
  let fail = false;
  const fetcher = ((input: string | URL | Request) => {
    calls.push(String(input));
    if (fail) return Promise.resolve(new Response("boom", { status: 500 }));
    return Promise.resolve(
      new Response(JSON.stringify({ "2019-PS2": true, Daioh: true })),
    );
  }) as typeof fetch;
  const now = () => clock;
  assert.deepEqual(await cloudLevelKeys("https://db.test", fetcher, now), [
    "2019-PS2",
    "Daioh",
  ]);
  // cmg's catalog is the database's root-level `levels`.
  assert.deepEqual(calls, ["https://db.test/levels.json?shallow=true"]);
  clock += 30_000;
  await cloudLevelKeys("https://db.test", fetcher, now);
  assert.equal(calls.length, 1, "served from the cache inside a minute");
  clock += 31_000;
  fail = true;
  assert.deepEqual(await cloudLevelKeys("https://db.test", fetcher, now), [
    "2019-PS2",
    "Daioh",
  ]);
  assert.equal(
    calls.length,
    2,
    "re-read after a minute, stale copy kept on failure",
  );
  resetLevelKeysCache();
  assert.equal(await cloudLevelKeys("https://db.test", fetcher, now), null);
  // An empty catalog is an empty list, not a failure.
  resetLevelKeysCache();
  assert.deepEqual(
    await cloudLevelKeys(
      "https://db.test",
      (() => Promise.resolve(new Response("null"))) as typeof fetch,
      now,
    ),
    [],
  );
  resetLevelKeysCache();
});

// ---- aliases ------------------------------------------------------------------

const ALIASES = { "2019": "2019-PS2", streetfighter: "2019-PS2", gone: "Nope" };

Deno.test("an alias names its game after every key has had its chance", () => {
  assert.equal(matchLevelKey("2019", KEYS, ALIASES), "2019-PS2");
  assert.equal(matchLevelKey("StreetFighter", KEYS, ALIASES), "2019-PS2");
  // A game's own name always wins over an alias spelled the same.
  assert.equal(matchLevelKey("2028", KEYS, { "2028": "2019-PS2" }), "2028");
  // An alias whose game is gone names nothing.
  assert.equal(matchLevelKey("gone", KEYS, ALIASES), null);
  assert.equal(matchLevelKey("toString", KEYS, ALIASES), null);
  assert.equal(matchLevelKey("constructor", KEYS, ALIASES), null);
});

Deno.test("an alias subdomain opens its game, even with the listing down", () => {
  assert.equal(
    subdomainTarget("streetfighter", KEYS, ALIASES),
    "/games/2028-ai?level=2019-PS2",
  );
  assert.equal(
    subdomainTarget("2019", null, ALIASES),
    "/games/2028-ai?level=2019-PS2",
  );
  assert.equal(
    location(
      subdomainRedirect(
        req("http://x/", "2019.cmg.test"),
        KEYS,
        ALIASES,
        SITES,
      ),
    ),
    "/games/2028-ai?level=2019-PS2",
  );
});

Deno.test("the alias index is one read, cached, and keeps only well-formed names", async () => {
  resetLevelKeysCache();
  const calls: string[] = [];
  let clock = 0;
  const fetcher = ((input: string | URL | Request) => {
    calls.push(String(input));
    return Promise.resolve(
      new Response(
        JSON.stringify({
          "2019": "2019-PS2",
          "Bad Name": "2019-PS2",
          numeric: 7,
          streetfighter: "2019-PS2",
        }),
      ),
    );
  }) as typeof fetch;
  const now = () => clock;
  assert.deepEqual(await cloudLevelAliases("https://db.test", fetcher, now), {
    "2019": "2019-PS2",
    streetfighter: "2019-PS2",
  });
  assert.deepEqual(calls, ["https://db.test/levelAliases.json"]);
  clock += 30_000;
  await cloudLevelAliases("https://db.test", fetcher, now);
  assert.equal(calls.length, 1, "served from the cache inside a minute");
  // No index yet is no aliases, not a failure.
  resetLevelKeysCache();
  assert.deepEqual(
    await cloudLevelAliases(
      "https://db.test",
      (() => Promise.resolve(new Response("null"))) as typeof fetch,
      now,
    ),
    {},
  );
  resetLevelKeysCache();
  assert.equal(
    await cloudLevelAliases(
      "https://db.test",
      (() => Promise.reject(new Error("offline"))) as typeof fetch,
      now,
    ),
    null,
  );
  resetLevelKeysCache();
});

Deno.test("planAliases adds labels no game owns and refuses the rest", () => {
  assert.equal(isAliasName("2019"), true);
  assert.equal(isAliasName("www"), false);
  assert.equal(isAliasName("street fighter"), false);
  assert.deepEqual(
    planAliases("2019-ps2", ["2019", "StreetFighter"], KEYS, {}),
    {
      key: "2019-PS2",
      set: { "2019": "2019-PS2", streetfighter: "2019-PS2" },
      errors: [],
    },
  );
  // Already its own: nothing to write, nothing wrong.
  assert.deepEqual(planAliases("2019-PS2", ["2019"], KEYS, ALIASES).set, {});
  const bad = planAliases("2019-PS2", ["2028", "gone", "a_b"], KEYS, ALIASES);
  assert.deepEqual(bad.set, {});
  assert.equal(bad.errors.length, 3);
  assert.deepEqual(planAliases("nobody", ["x"], KEYS, {}).errors, [
    'no game is called "nobody"',
  ]);
  // An alias cannot shadow a game's slug: the game would always win it.
  const shadow = planAliases("2028", ["master-arena-mod"], KEYS, {});
  assert.deepEqual(shadow.set, {});
  assert.equal(shadow.errors.length, 1);
  // A name every object has is still just a free label.
  assert.deepEqual(planAliases("2028", ["constructor"], KEYS, {}).set, {
    constructor: "2028",
  });
});

// The editor's half of the NEW GAME hand-off lives in a classic <script>, so
// it is pinned by its text: /editor/?new=<name> must reach startNewGameNamed,
// and a ?level= beside it must win.
Deno.test("the editor opens a blank game named for ?new=", async () => {
  const html = await Deno.readTextFile(
    new URL("../static/editor/index.html", import.meta.url),
  );
  assert.match(html, /async function startNewGameNamed\(rawName\)/);
  assert.match(html, /const urlNew = urlParams\.get\('new'\);/);
  assert.match(html, /if \(urlNew && !urlLevel\) startNewGameNamed\(urlNew\);/);
});
