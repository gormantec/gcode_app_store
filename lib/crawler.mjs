import fetch from 'node-fetch';

import fs from 'fs';

let beenthere = [];
let manifests = ["https://gcode.com.au/apps/37790665-boatcrew/manifest.json", "https://www.google.com/maps/preview/pwa/manifest?source=ttpwa&hl=en", "https://www.pinterest.com.au/manifest.json", "https://flipboard.com/manifest.webmanifest"];



async function recurseCrawler(url, deep) {
    if (beenthere.includes(url)) return;
    beenthere.push(url);
    //console.log(url);
    let res = "";
    let resText = "";
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10000)
        res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        resText = await res.text();
    } catch (e) { }
    let allURLs = resText.match(/https:\/\/[a-zA-Z0-9\-/_\.]*/g);
    if (allURLs && allURLs.length > 0 && deep < 3 && false) {
        for (let i = 0; i < allURLs.length; i++) {
            let u = allURLs[i];
            if (!u.startsWith("https://www.microsoft.com/") && !u.startsWith("https://blog.mozilla.org/") && !u.startsWith("https://www.mozilla.org/") && !u.startsWith("https://www.apple.com/") && u.indexOf("facebook.com") < 0 && u.indexOf("linkedin.com") < 0 && !u.endsWith(".js") && !u.endsWith(".mjs") && !u.endsWith(".css") && !u.endsWith(".font") && !u.endsWith(".txt") && !u.endsWith(".json") && !u.endsWith(".png") && !u.endsWith(".svg") && !u.endsWith(".jpg") && !u.endsWith(".jpeg")) {
                await recurseCrawler(u, deep + 1);
            }
        }
    }

    let manifest = resText.match(/<html[\s\S]*?<head[\s\S]*?<link rel="manifest".*?>/g);//<link rel="manifest" href="/manifest.json">
    let serviceWorker = resText.match(/service[wW]orker\.register[\s\S]*?\([\s\S]*?\)/g);
    var sw = "";
    var manFile = "";
    if (manifest && manifest.length > 0) {
        //console.log(manifest[0].match(/<link rel="manifest".*?>/g)[0]);
        manFile = manifest[0].match(/<link rel="manifest".*?>/g)[0];
        manFile = manFile.replace(/<link rel="manifest".*?href.*?['"](.*?)['"].*?>/g, "$1");
    }
    if (serviceWorker && serviceWorker.length > 0) {
        //console.log("serviceWorker="+serviceWorker[0]);
        sw = serviceWorker[0];
        sw = sw.replace(/service[wW]orker\.register[\s\S]*?\([\s\S]*?['"]([\s\S]*?)['"][\s\S]*?\)/g, "$1");
    }
    if (manFile != "" && sw == "") {
        let list2 = resText.match(/https:\/\/[a-zA-Z0-9\-/_\.]*\.m?js/g);
        for (var i = 0; list2 != null && i < list2.length && sw == ""; i++) {
            let jfile = list2[i];
            try {
                res = await fetch(jfile);
                resText = await res.text();
                serviceWorker = resText.match(/service[wW]orker\.register[\s\S]*?\([\s\S]*?\)/g);
                if (serviceWorker && serviceWorker.length > 0) {
                    sw = serviceWorker[0];
                    sw = sw.replace(/service[wW]orker\.register[\s\S]*?\([\s\S]*?['"]([\s\S]*?)['"][\s\S]*?\)/g, "$1");
                }
            } catch (e) { }
        }
    }

    if (sw != "" && manFile != "") {
        if (url.indexOf("/", 8) > 0 && manFile.startsWith("/")) {
            manFile = url.substring(0, url.indexOf("/", 8)) + manFile;
        }
        else if (url.indexOf("/", 8) > 0 && !manFile.startsWith("/") && !manFile.startsWith("http")) {
            manFile = url.substring(0, url.lastIndexOf("/")) + "/" + manFile;
        }
        else if (url.indexOf("/", 8) < 0 && manFile.startsWith("/")) {
            manFile = url + manFile;
        }
        else if (url.indexOf("/", 8) < 0 && !manFile.startsWith("/") && !manFile.startsWith("http")) {
            manFile = url + "/" + manFile;
        }
        //console.log("{ url:\""+url+"\", manifest:\'"+manFile+"\", sw:\'"+sw+"\"");
        if (!manifests.includes(manFile)) {
            manifests.push(manFile);
            console.log(manFile + ":: " + url);
        }
    }


}

fetch("https://www.google.com/search?q=the+best+pwa+apps&sxsrf=APq-WBtxDFwYgjseN6vffxVeD8oo0VJkpg%3A1644808274472&ei=UsgJYq2eHOWZmgfzhpGABQ&ved=0ahUKEwitj7GnnP71AhXljOYKHXNDBFAQ4dUDCA8&uact=5&oq=the+best+pwa+apps&gs_lcp=Cgdnd3Mtd2l6EAMyCAghEBYQHRAeMggIIRAWEB0QHjIICCEQFhAdEB46BAgjECc6BQgAEJECOgQIABBDOhAILhCxAxCDARDHARDRAxBDOgoIABCxAxCDARBDOgYIABAKEEM6CwgAEIAEELEDEIMBOggIABCABBCxAzoKCC4QgAQQhwIQFDoOCC4QgAQQsQMQgwEQ1AI6DgguEIAEELEDEMcBEKMCOgsILhCABBCxAxCDAToFCAAQgAQ6CwguEIAEELEDENQCOggILhCABBDUAjoFCC4QgAQ6DgguEIAEELEDEMcBEK8BOgoIABCABBCHAhAUOggILhCABBCxAzoGCAAQFhAeOggIABAWEAoQHkoECEEYAEoECEYYAFAAWI1FYNNGaABwAXgAgAHsAYgBuBWSAQYwLjE2LjGYAQCgAQHAAQE&sclient=gws-wiz")
    .then(response => response.text())
    .then(data => {
        //console.log(data);
        (async () => {
            let list = data.match(/https:\/\/[a-zA-Z0-9\-/_\.]*/g);
            let asyncRes = 0;
            let asynCalls = 0;
            let loopsDone = false;
            for (let i = 0; i < list.length; i++) {
                let element = list[i];
                let res = "";
                let resText = "";
                try {
                    res = await fetch(element);
                    resText = await res.text();
                } catch (e) { }
                let list2 = resText.match(/https:\/\/[a-zA-Z0-9\-/_\.]*/g);
                //console.log(list2);
                if (list2 && list2.length > 0) {
                    for (let j = 0; j < list2.length; j++) {
                        asynCalls++;
                        recurseCrawler(list2[j], 1).finally(() => {
                            asyncRes++;
                            if (loopsDone && asynCalls == asyncRes) {
                                
                                (async () => {
                                    let xxx = { data: [] };
                                    for (let k = 0; k < manifests.length; k++) {
                                        try {
                                            let res2 = await fetch(manifests[k]);
                                            let resText2 = await res2.json();
                                            resText2.root_uri = manifests[k];
                                            xxx.data.push(resText2);
                                        } catch (e) { }
                                    }
      
                                    try {
                                        fs.writeFileSync('applist.json', JSON.stringify(xxx, null, 4));
                                        console.log("done");
                                        //file written successfully
                                    } catch (err) {
                                        console.error(err);
                                    }
                                })()

                            }
                            //console.log("asynCalls="+asynCalls +" asyncRes=" +asyncRes);
                        });
                    }
                }
            }
            loopsDone = true;

        })();

    });



