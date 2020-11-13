((global) => {
  var lib = (global.lib = global.lib || {});
  var api = (lib.api = lib.api || {});

  const auth = (api.auth = async () => {
    const params = new URLSearchParams();
    params.append("brandId", "mcdonald");
    params.append("userId", "mysterico");
    params.append("userPW", "aiground2017");

    const response = await fetch(`/auth/sign/in?${params.toString()}`, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "include", // include, *same-origin, omit
      redirect: "follow", // manual, *follow, error
      referrer: "client", // no-referrer, *client
    });
    const json = await response.json();
    return json;
  });

  const queryRelationByKeyword = (api.queryRelationByKeyword = async (
    keyword,
    excludeKeywords = [],
    limit = 5
  ) => {
    const data = {
      word: String(keyword),
      previousWords: [...excludeKeywords],
      limit,
    };
    const response = await fetch(`/analytics/keyword/graph`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "include", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrer: "client", // no-referrer, *client
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json; charset=utf-8",
      },
    });
    const json = await response.json();
    return json;
  });
})(this);
