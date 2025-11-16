import { h } from "@webtaku/h";

const scripts = (search: string) => {
  const params = new URLSearchParams(search);
  const accessKey = params.get('access_key');

  const bundleUrl = accessKey
    ? `/bundle.js?access_key=${encodeURIComponent(accessKey)}`
    : '/bundle.js';

  return [
    h('script', `
      function handleScriptError() {
          fetch("${bundleUrl}", { method: "HEAD" }).then((response) => {
            if (response.status === 403) {
              document.body.innerHTML =
                "This service is not available in your current location.";
            }
          });
        }
    `),
    h('script', { src: bundleUrl }),
  ];
};

export { scripts };
