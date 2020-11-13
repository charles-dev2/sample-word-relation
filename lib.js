((global) => {
  const lib = (global.lib = global.lib || {});
  const func = (lib.func = lib.func || {});
  const createDataSet = (func.createDataSet = (dataset) => ({
    ...dataset,
  }));

  const createNode = (func.createNode = ({
    id = 0,
    identity,
    word,
    count,
    zone = 1,
  }) => ({
    id,
    identity,
    word,
    count,
    zone,
  }));

  const createNodeFromNeo4jNode = (func.createNodeFromNeo4jNode = ({
    id = 0,
    identity,
    properties,
  }) =>
    createNode({
      id,
      identity,
      word: properties.word,
      count: properties.count,
      zone: 1,
    }));

  const createLink = (func.createLink = ({
    source,
    target,
    relation,
    weight = 0,
  }) => ({
    source,
    target,
    weight,
    relation,
  }));

  const createLinkFromNeo4jRelation = (func.createLinkFromNeo4jRelation = ({
    identity,
    start,
    end,
    properties,
  }) =>
    createLink({
      source: start,
      target: end,
      weight: 0,
      relation: properties.count,
    }));

  const findIdFromNodes = (func.findIdFromNodes = (nodes) => (word) =>
    (nodes.find((e) => e.word === word) || { id: 0 }).id);

  const convertDataSetFromRelation = (func.convertDataSetFromRelation = (d) =>
    d.reduce((accum, current, idx, arr) => {
      let next = createDataSet(accum);

      const { from, to, relation } = current;

      const srcNode = createNode(from);
      if (next.nodes.every((e) => e.word !== srcNode.word)) {
        next = createDataSet({
          ...next,
          nodes: [
            ...next.nodes,
            createNode({ ...srcNode, id: next.nodes.length }),
          ],
        });
      }

      const dstNode = createNode(to);
      if (next.nodes.every((e) => e.word !== dstNode.word)) {
        next = createDataSet({
          ...next,
          nodes: [
            ...next.nodes,
            createNode({ ...dstNode, id: next.nodes.length }),
          ],
        });
      }

      let link = createLink(relation);
      link = createLink({
        ...link,
        source: findIdFromNodes(next.nodes)(link.source),
        target: findIdFromNodes(next.nodes)(link.target),
      });

      if (
        !next.links.some(
          ({ source, target }) =>
            source === link.source && target === link.target
        )
      ) {
        next = createDataSet({ ...next, links: [...next.links, link] });
      }

      return next;
    }, createDataSet({ nodes: [], links: [] })));

  const getElementById = (func.getElementById = (id) =>
    document.getElementById(id) || document.createElement("div"));
})(this);
