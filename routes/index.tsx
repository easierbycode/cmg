import { Head } from "fresh/runtime";
import { define } from "../utils.ts";

export default define.page(function Home() {
  return (
    <>
      <Head>
        <title>code monkey — dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin="anonymous"
        />
        <link
          key="fonts"
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
        <link key="dashboard-css" rel="stylesheet" href="/dashboard.css" />
      </Head>
      <div id="app-root"></div>
      <script type="module" src="/dashboard.bundle.js"></script>
      <script src="/gamepad-support.js" defer></script>
    </>
  );
});
