import fetch from 'node-fetch';

import fs from 'fs';
import crypto from 'crypto';




let oldBeenthere = JSON.parse(fs.readFileSync('beenthere.json'));
let beenthere = oldBeenthere.data;
let oldFile = JSON.parse(fs.readFileSync('applist.json'));
let manifesthits = {};

let manifests = ["https://gcode.com.au/manifest.webmanifest", "https://store.gcode.com.au/manifest.json", "https://gcode.com.au/apps/37790665-gps/manifest.json", "https://gcode.com.au/apps/37790665-calculator/manifest.json", "https://gcode.com.au/apps/37790665-boatcrew/manifest.json", "https://gcode.com.au/apps/37790665-screen%20time/manifest.json", "https://www.google.com/maps/preview/pwa/manifest?source=ttpwa&hl=en", "https://www.pinterest.com.au/manifest.json", "https://flipboard.com/manifest.webmanifest"];
for (let i = 0; i < oldFile.data.length; i++) {
    if (!manifests.includes(oldFile.data[i].root_uri && oldFile.data[i].lang != "fa-IR" && oldFile.data[i].lang != "fa")) {
        manifests.push(oldFile.data[i].root_uri);
    }
}
async function getDescription(url) {
    let res = "";
    let resText = "";
    let result = "no description";
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 20000)
        res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        resText = await res.text();
        let dList = resText.match(/<meta name=['"][dD]escription['"].*?>/g);
        if (!dList || dList.length == 0) {
            dList = resText.match(/<meta[a-zA-Z0-9"=\s]*name="description".*?>/g);
        }
        if (dList && dList.length > 0) {
            result = dList[0].replace(/^.*?content.*?"(.*?)".*$/g, "$1");
            if (result == null || result.trim().length == 0) result = "no description";
            result = result.trim();
        }
    } catch (e) { }
    return result;
}

async function recurseCrawler(url, deep) {
    if (beenthere.includes(url)) {
        //console.log("been there "+url);
        return;
    }
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

        if (!manifests.includes(manFile)) {
            console.log("adding --> { url:\"" + url + "\", manifest:\'" + manFile + "\", sw:\'" + sw + "\"");
            manifests.push(manFile);
            manifesthits["man" + crypto.createHash('md5').update(manFile).digest('hex')] = 1;
        }
        else {
            var old = manifesthits["man" + crypto.createHash('md5').update(manFile).digest('hex')];
            if (!old) old = 1;
            manifesthits["man" + crypto.createHash('md5').update(manFile).digest('hex')] = old + 1;
        }
    }


}
function contain_persian_char(str) {
    var p = /^[\u0600-\u06FF\s]+$/;

    if (p.test(str))
        return true;
    return false;
}
async function refreshApplist() {
    let xxx = { data: [] };
    let fileMD5z = {};
    for (let k = 0; k < manifests.length; k++) {
        try {
            let res2 = await fetch(manifests[k]);
            let resText2 = await res2.json();
            let fileMD5 = "man" + crypto.createHash('md5').update(JSON.stringify(resText2)).digest('hex');
            if (fileMD5z[fileMD5] == null && resText2 != null && resText2.lang != "fa-IR" && resText2.lang != "fa" && !contain_persian_char(resText2.name)) {
                fileMD5z[fileMD5] = "true";
                resText2.root_uri = manifests[k];
                resText2.file_md5 = fileMD5;
                resText2.manifest_hits = 0;
                var mmm = manifesthits["man" + crypto.createHash('md5').update(manifests[k]).digest('hex')];
                if (mmm) resText2.manifest_hits = mmm;
                if (!resText2.description) {

                    let appLocation = null;
                    if (resText2.root_uri && resText2.start_url && resText2.start_url.startsWith("/")) {
                        appLocation = resText2.root_uri.substring(0, resText2.root_uri.indexOf("/", 8)) + resText2.start_url;

                    }
                    else if (resText2.root_uri && resText2.start_url) {
                        appLocation = resText2.root_uri.substring(0, resText2.root_uri.lastIndexOf("/")) + "/" + resText2.start_url;
                    }
                    if (appLocation) resText2.description = await getDescription(appLocation);
                }
                let apkLocation = resText2.root_uri.replace("/manifest.json", "/apk/app-release-signed.apk");
                if (!apkLocation.endsWith("app-release-signed.apk")) apkLocation = null;
                //if (apkLocation.indexOf("gcode.com.au")<0) apkLocation = null;
                if (apkLocation && apkLocation != null) {
                    const apkLocation2 = apkLocation;
                    try {
                        let res3 = await fetch(apkLocation2, { method: 'HEAD' });
                        if (res3.ok && res3.headers.get('content-type').indexOf("application")>=0) {
                            console.log("Add APK: " + apkLocation2);
                            resText2.apk_location = apkLocation2;
                            xxx.data.push(resText2);
                        }
                        else {
                            xxx.data.push(resText2);
                        }
                    }
                    catch (e) {
                        console.log("e: " + e);
                        xxx.data.push(resText2);
                    }
                }
                else {
                    xxx.data.push(resText2);
                }


            }
        } catch (e) { }
    }

    try {
        fs.writeFileSync('applist.json', JSON.stringify(xxx, null, 4));
        fs.writeFileSync('beenthere.json', JSON.stringify({ data: beenthere }, null, 4));

        //file written successfully
    } catch (err) {
        console.error(err);
    }
    console.log("done");
    return true;
}

async function seachGoogle(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                //console.log(data);
                (async () => {
                    let list = data.match(/https:\/\/[a-zA-Z0-9\-/_\.]*/g);
                    let asyncRes = 0;
                    let asynCalls = 0;
                    let loopsDone = false;
                    let maxJ = 0;
                    let maxI = 0;
                    for (let i = 0; i < list.length && i < 200; i++) {
                        if (i > maxI) maxI = i;
                        let element = list[i];
                        let res = "";
                        let resText = "";
                        await recurseCrawler(element, 1);
                        try {
                            res = await fetch(element);
                            resText = await res.text();
                        } catch (e) { }
                        let list2 = resText.match(/https:\/\/[a-zA-Z0-9\-/_\.]*/g);
                        //console.log(list2);

                        if (list2 && list2.length > 0) {
                            for (let j = 0; j < list2.length && j < 1000; j++) {
                                if (j > maxJ) maxJ = j;
                                asynCalls++;
                                recurseCrawler(list2[j], 1).finally(() => {
                                    asyncRes++;
                                    if (loopsDone) {
                                        //console.log(asyncRes+"<"+asynCalls+" i="+i+" j="+maxJ);
                                    }
                                    if (loopsDone && asynCalls == asyncRes) {
                                        console.log("Loops done");
                                        (async () => {
                                            await refreshApplist();
                                            console.log("done...");
                                            resolve();
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
    });

}

await refreshApplist();
await seachGoogle("https://www.google.com/search?q=the+best+pwa+apps");
await seachGoogle("https://www.google.com/search?q=list+of+pwa+apps");
await seachGoogle("https://www.google.com/search?q=PWA+apps+cataloug");
await seachGoogle("https://www.findpwa.com/");
await seachGoogle("https://www.findpwa.com/list/top-performing-apps");
await seachGoogle("https://www.findpwa.com/list/verified-apps");
await seachGoogle("https://github.com/hemanth/awesome-pwa");
await seachGoogle("https://onilab.com/blog/20-progressive-web-apps-examples/");
await seachGoogle("http://progressivewebapproom.com/");












