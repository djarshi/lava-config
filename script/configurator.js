let loadOrdered = ["base", "economy", "maps-tides", "extremebelow", "air", "lrpc", "commanders", "nukes", "specialboss", "stealth"]
let defaultWhere = "#configColRight"
let settingCodeWhere = new Map([
  ["base", "#configColLeft"],
  ["economy", "#configColLeft"],
  ["maps-tides", "#configColLeft"],
  ["extremebelow", "#configColLeft"],
  ["air", "#configColLeft"],
  ["lrpc", "#configColLeft"],
  ["commanders", "#configColRight"],
  ["nukes", "#configColRight"],
  ["specialboss", "#configColRight"],
  ["stealth", "#configColRight"]
]);

$(document).ready(function(){
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
});

async function initializeApp() {
//    const parsedConfigs = await Promise.all([
//        parseModesFile('settings/air.md'),
//        parseModesFile('settings/economy.md'),
//    ]);
    const parsedConfigs = await Promise.all(
      loadOrdered.map(name => parseModesFile("settings/"+name+".md"))
    );

    console.log("Modes file loaded and parsed:", parsedConfigs);



    for (let config of parsedConfigs) {
         $("#" + config.key + "Modal .modal-body").html(config.html);
         let $select = $("#select-" + config.key + "");
         $select.empty();
         for (let [value, label] of config.options) {
             $select.append($("<option>").val(value).text(label.title));
         }
    }
}
// get plain text from commonmark AST-node
function astNode2text(astNode) {
  var walker = astNode.walker();
  var acc = [];
  var event, node;
  while (event = walker.next()) {
    node = event.node;
    if (node.literal) {
      acc.push(node.literal);
    }
  }

  return acc.join(' ');
}

async function parseModesFile(filePath) {
    const configs = { key: "", title: "", markdown: "", modes: [] };
    configs.options = new Map();
    try {
        const response = await fetch(`${filePath}?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`Could not load ${filePath}: ${response.statusText}`);
        }
        const text = await response.text();

        const categoryBlocks = text.split('# CATEGORY:').slice(1);
        configs.markdown = text;
        configs.key = baseName( filePath );
        var reader = new commonmark.Parser();
        var writer = new commonmark.HtmlRenderer();
        var parsed = reader.parse( text ); // parsed is a 'Node' tree
        console.log( "PARSED: " + parsed );
        configs.html = writer.render(parsed);

        var currentOptionCode = "";
        var currentOptionTitle = "";
        var walker = parsed.walker();
        var event, node;
        while (event = walker.next()) {
            node = event.node;
            console.log( "stapje " + node.type );
            if (event.entering && node.type === 'heading' && node.level === 1) {
                configs.title = astNode2text(node);
            }
            if (event.entering && node.type === 'heading' && node.level === 2) {
              currentOptionTitle = astNode2text(node);
              currentOptionCode = seoFriendly(currentOptionTitle);
              configs.options.set( currentOptionCode, { title: currentOptionTitle } );
              console.log( "option: " + currentOptionCode );
            }
            if (event.entering && node.type === 'code_block') {
              var tweaks = astNode2text(node);
              configs.options.get( currentOptionCode ).tweaks = tweaks;
              console.log( "tweaks: " + tweaks );
            }
        }

        // get the options.

        return configs;
    } catch (error) {
        console.error("Failed to parse game configs:", error);
        return configs;
    }
}

function seoFriendly(str) {
  return str
    .toLowerCase()                 // lowercase everything
    .trim()                        // remove spaces at ends
    .replace(/[^a-z0-9]+/g, '-')   // replace anything not a-z or 0-9 with '-'
    .replace(/^-+|-+$/g, '');      // remove leading/trailing '-'
}
function baseName( url ) {
    let base = url.split('/').pop();
    base = base.split('?')[0];
    base = base.split('#')[0];
    base = base.replace(/\.[^.]+$/, '');
    return base;
}

document.addEventListener('DOMContentLoaded', initializeApp);