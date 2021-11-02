const operations = new Map();

const parseSale = (str) => {
    return str.concat('!');
}

const parseLimitedEdition = (str) => {
    return str.replace("limited edition", "LIMITED EDITION");
};

const parseNew = (str) => {
    const tildas = "~~";
    return tildas.concat(str,tildas);
}

operations.set("sale", parseSale);
operations.set("limited edition", parseLimitedEdition);
operations.set("new", parseNew);

export {
    operations
}

