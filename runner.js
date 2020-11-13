((global) => {
  const lib = global.lib;
  const api = lib.api;
  const func = lib.func;
  const d3lib = lib.d3lib;

  const { createNode, createLink, convertDataSetFromRelation } = func;
  const { draw } = d3lib;

  window.addEventListener("unhandledrejection", (event) => alert(event.reason));
  window.addEventListener("error", (event) => alert(event.message));

  window.addEventListener("DOMContentLoaded", () => {
    let caches = {
      words: [],
    };

    const createFromToRelation = (baseNode) => ({
      _id,
      relationCount,
      wordCount,
    }) => ({
      from: createNode(baseNode),
      to: createNode({
        id: 0,
        identity: _id,
        word: _id,
        count: Number.parseInt(wordCount, 10),
        zone: 1,
      }),
      relation: createLink({
        source: baseNode.identity,
        target: _id,
        relation: Number.parseInt(relationCount, 10),
        weight: Number.parseInt(relationCount, 10),
      }),
    });

    const updateCached = async (w) => {
      const baseNode = (
        caches.words.find(({ from }) => from.word === w) || {
          from: createNode({
            id: 0,
            identity: w,
            word: w,
            count: 500,
            zone: 1,
          }),
        }
      ).from;

      const result = await api.queryRelationByKeyword(baseNode.word);

      const foundNodes = result.map(createFromToRelation(baseNode));

      const related = await Promise.all(
        foundNodes.map(async ({ to }) => {
          const r = await api.queryRelationByKeyword(
            to.word,
            foundNodes
              .map(({ to }) => to.word)
              .concat([w])
              .filter((e) => e !== to.word)
          );
          return r.map(createFromToRelation(to));
        })
      );

      const mergeThis = R.flatten([].concat([foundNodes]).concat(related));

      caches.words = mergeThis.reduce(
        (accum, current) => {
          const foundIndex = accum.findIndex(
            ({ from, to, relation }) =>
              from.word === current.from.word && to.word === current.to.word
          );
          if (foundIndex < 0) {
            return [...accum, current];
          } else {
            return accum
              .splice(0, foundIndex)
              .concat([current])
              .concat(accum.splice(1));
          }
        },
        caches.words.map(({ from, to, relation }) => ({
          from: createNode(from),
          to: createNode(to),
          relation: createLink(relation),
        }))
      );
    };

    const queryingWord = async (w) => {
      await updateCached(w);

      const p0set = caches.words.filter(({ from }) => from.word === w);
      if (p0set.length < 1) {
        throw new Error("could not found first set");
      }
      const p1set = caches.words.filter(({ from }) =>
        p0set.map(({ to }) => to.word).includes(from.word)
      );

      d3lib.draw(
        convertDataSetFromRelation([].concat(p0set).concat(p1set)),
        w,
        queryingWord
      );
    };

    (async () => {
      await api.auth();
      queryingWord("맥도날드");
    })();
  });
  /*
    var queryingWord = async (w) => {
      const response = await fetch(reqMap.find(({ q }) => q === w).url);
      const json = await response.json();

      var c = []
        .concat(cache)
        .concat(json)
        .reduce((accum, current, idx, arr) => {
          var foundIndex = accum.findIndex(
            ({ from, to, relation }) =>
              from.identity === current.from.identity &&
              to.identity === current.to.identity
          );
          if (foundIndex >= 0) {
            var next = [...accum];
            return next
              .splice(0, foundIndex)
              .concat([current])
              .concat(next.splice(1));
          }
          return [...accum, current];
        }, []);
      cache = c;

      var p0set = c.filter(({ from }) => from.properties.word === w);
      var p1set = c.filter(({ from }) =>
        p0set.map(({ to }) => to.properties.word).includes(from.properties.word)
      );

      var p2set = c.filter(({ to }) => to.properties.word === w);
      var p3set = c.filter(({ from }) =>
        p2set
          .map(({ from }) => from.properties.word)
          .includes(from.properties.word)
      );

      return [].concat(p0set).concat(p1set).concat(p2set).concat(p3set);
    };
  });
  */
})(this);
