let configs = new Map();
let loadOrdered = ["base", "economy", "maps-tides", "extremebelow", "air", "lrpc", "commanders", "nukes", "specialunits", "stealth"]
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
  ["specialunits", "#configColRight"],
  ["stealth", "#configColRight"]
]);


$(document).ready(function(){
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
});

async function initializeApp() {


    let parsedConfigs = await Promise.all(
      loadOrdered.map(name => parseModesFile("settings/"+name+".md"))
    );

    console.log("Modes file loaded and parsed:", parsedConfigs);

    for ( let configCode of loadOrdered ) {
        parsedConfigs.forEach(config => {
            if ( config.key != configCode ) {
                return;
            }
            configs.set( config.key, config );
            let where = settingCodeWhere.get(config.key);
            let $targetNode = $(where);
            $targetNode.append(`
                <div class="input-group input-group-smx mb-2">
                    <label class="input-group-text" for="inputGroupSelect01">${config.title}</label>
                    <select class="form-select" id="select-${config.key}">
                    </select>
                    <a type="button" href="#" class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#${config.key}Modal">?</a>
                </div>
            `);

            $( "#select-" + config.key ).on( "change", function() {
                fillOutput();
            } );
            // modal
            $targetNode.append(`
                <div class="modal fade" id="${config.key}Modal"  data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="staticBackdropLabel">${config.title}</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                ... ${config.html}
                            </div>

                        </div>
                    </div>
                </div>
            `);
        });
    }

    // Add the options per select.
    for (let config of parsedConfigs) {
         // wordt al geregeld. $("#" + config.key + "Modal .modal-body").html(config.html);
         let $select = $("#select-" + config.key + "");
         $select.data("config",config.key);
         $select.empty();
         for (let [value, label] of config.options) {
             //$select.append($("<option bd->").val(value).text(label.title));
             $select.append($("<option>").val(value).text(label.title).data("config",label.tweaks));
         }
    }

    fillOutput();
}

function fillOutput()
{
    let totalStr = "";
    $('select').each( function( index ) {
        let select = $( this );
        //configs.get(config.key);
          console.log( index + ": " + select.data("config")  + ".." + select.find(":selected").data("config") );
          totalStr += select.find(":selected").data("config");
          totalStr += "\n";
     });
     $("#command-output-1").val(totalStr);

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
            //console.log( "stapje " + node.type );
            if (event.entering && node.type === 'heading' && node.level === 1) {
                configs.title = astNode2text(node);
            }
            if (event.entering && node.type === 'heading' && node.level === 2) {
              currentOptionTitle = astNode2text(node);
              currentOptionCode = seoFriendly(currentOptionTitle);
              configs.options.set( currentOptionCode, { title: currentOptionTitle } );
              //console.log( "option: " + currentOptionCode );
            }
            if (event.entering && node.type === 'code_block') {

              checkOption = configs.options.get( currentOptionCode );
              if ( checkOption!=null ) {
                var tweaks = astNode2text(node);
                checkOption.tweaks = tweaks;
                //console.log( "tweaks: " + tweaks );
              }
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