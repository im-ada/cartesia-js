// src/react/utils.ts
async function pingServer(url) {
  const start = (/* @__PURE__ */ new Date()).getTime();
  await fetch(url);
  const end = (/* @__PURE__ */ new Date()).getTime();
  return end - start;
}

export {
  pingServer
};
