import { h } from "@webtaku/h";

const scripts = [
  h('script', `
    function handleScriptError() {
        fetch("/bundle.js", { method: "HEAD" }).then((response) => {
          if (response.status === 403) {
            document.body.innerHTML =
              "This service is not available in your current location.";
          }
        });
      }
`),
  h('script', { src: '/bundle.js' }),
];

export { scripts };
