
import {
    Div,
    Page,
    AuthButtons,
    PWA
} from 'https://gcode.com.au/modules/pwa.mjs';



export class LoginButton extends AuthButtons {
    constructor() {
        super({
            facebookkey: "1240916769304778",
            appearance: "list",
            nextPage: "AppsPage",
            skip: "true",
            rememberSkip: "true"
        });
    }
}

const MIN_SUPPLEMENTARY_CODE_POINT = 0x010000;
function charCount(codePoint) {
    return codePoint >= MIN_SUPPLEMENTARY_CODE_POINT ? 2 : 1;
}

async function refreshGcodeApps() {
    let manifests = [];
    try{
    let res2 = await fetch("https://gcode.com.au/apps/gcode_manifests.json");
    let jsonM = await res2.json();
    manifests=jsonM.data;

}catch(e){
    console.log("error: refreshGcodeApps: "+e)
}

    return manifests;

}

function isProbablyArabic(s) {
    for (let i = 0; i < s.length;) {
        let c = s.codePointAt(i);
        if (c >= 0x0600 && c <= 0x06E0)
            return true;
        i += charCount(c);
    }
    return false;
}

class App extends Div {
    constructor(params) {
        super({
            width: "150px",
            height: "200px",
            textAlign: "left",
            backgroundColor: "white",
            class: "floatingActionButton",
            borderRadius: "5px",

            color: "#222222",
            margin: "5px",
            padding: "5px",
            fontSize: "x-small",
            children: [
                new Div({
                    "tagName": "center", "position": "static", "child": new Div({
                        "tagName": "img",
                        "onclick": () => {
                          	let aNewPage=new Page({
                                "navigateBackPage": Page.getPage("AppsPage"),
                                children: [
                                    new Div({
                                        "tagName": "center", "position": "static", "child": new Div({
                                            "tagName": "img",
                                            "position": "static", "src": params.app192Logo, "width": "200px", "height": "200px"
                                        })
                                    }),
                                    new Div({ 
                                      "tagName": "p", 
                                      "position": "static", 
                                      "overflow": "hidden", 
                                      "height": "80px", 
                                      "margin": "0px", 
                                      color:"balck",
                                      innerHTML: "<b>" + params.appName + "</b>: " + params.appDescription }),
                                    new Div({ 
                                      "id": "open", 
                                      "onclick": () => { 
                                        console.log("click"); 
                                        window.location.href = params.appLocation; 
                                      }, 
                                      "position": "absolute", 
                                      "bottom": "2px", 
                                      "left": "2px", 
                                      "backgroundColor": "blue", 
                                      "borderRadius": "4px", 
                                      "width": "26px", 
                                      "height": "12px", 
                                      "padding": "2px", 
                                      "paddingLeft": "4px", 
                                      "paddingRight": "4px", 
                                      "color": "white", 
                                      "textAlign": "center", 
                                      "innerText": "PWA" 
                                    })
                                ],

                            });
                          if (params.apkLocation) {
                              console.log("ADD APK: " + params.apkLocation);
                              this.appendChild(new Div({ "id": "apk", "onclick": () => { console.log("click"); window.location.href = params.apkLocation; }, "position": "absolute", "bottom": "2px", "left": "40px", "backgroundColor": "orange", "borderRadius": "4px", "width": "26px", "height": "12px", "padding": "2px", "paddingLeft": "4px", "paddingRight": "4px", "color": "white", "textAlign": "center", "innerText": "APK" }));
                          }
                            PWA.getPWA().setPage(aNewPage)
                        },
                        "position": "static", "src": params.app192Logo, "width": "100px", "height": "100px"
                    })
                }),
                new Div({ "tagName": "p", "position": "static", "overflow": "hidden", "height": "80px", "margin": "0px", "innerHTML": "<b>" + params.appName + "</b>: " + params.appDescription }),
                new Div({ "id": "open", "onclick": () => { console.log("click"); window.location.href = params.appLocation; }, "position": "absolute", "bottom": "2px", "left": "2px", "backgroundColor": "blue", "borderRadius": "4px", "width": "26px", "height": "12px", "padding": "2px", "paddingLeft": "4px", "paddingRight": "4px", "color": "white", "textAlign": "center", "innerText": "PWA" })
            ],
            display: "inline-block",
            position: "relative"
        });
        if (params.apkLocation) {
            console.log("ADD APK: " + params.apkLocation);
            this.appendChild(new Div({ "id": "apk", "onclick": () => { console.log("click"); window.location.href = params.apkLocation; }, "position": "absolute", "bottom": "2px", "left": "40px", "backgroundColor": "orange", "borderRadius": "4px", "width": "26px", "height": "12px", "padding": "2px", "paddingLeft": "4px", "paddingRight": "4px", "color": "white", "textAlign": "center", "innerText": "APK" }));
        }
        else {
            console.log("!DID NOT ADD APK: " + params.appLocation);
        }
    }
}
export class AppsList extends Div {
    constructor() {
        super({
            textAlign: "center",
            backgroundColor: "rgb(19, 138, 114,0.05)"
        });

        (async () => {

            let rawdataPromise = fetch("/lib/applist.json",{ mode: 'cors'});
            let manifests = await refreshGcodeApps();


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
                        if (apkLocation.indexOf("gcode.com.au") < 0) apkLocation = null;
                        if (apkLocation && apkLocation != null) {
                            const apkLocation2 = apkLocation;
                            try {
                                let res3 = await fetch(apkLocation2, { method: 'HEAD' });
                                if (res3.ok && res3.headers.get('content-type').indexOf("application") >= 0) {
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


            let rawdata= await rawdataPromise.then((r)=>{console.log("rawdata done");return r;},(e)=>{console.log("rawdara error:"+e);});            

            let jsn=await rawdata.json();

            for(let i2=0;i2<xxx.data.length;i2++)
            {
                let found=false;
                for (let i3 = 0; i3 < jsn.data.length; i3++) {
                    if(xxx.data[i2].file_md5==jsn.data[i3].file_md5)
                    {
                        jsn.data[i3]=xxx.data[i2];
                        found==true;
                    }
                }
                if(!found)
                {
                    jsn.data.unshift(xxx.data[i2]);
                }
            }

            console.log("jsn:"+jsn.data.length);
            for (let i = 0; i < jsn.data.length; i++) {
                let appLocation = null;
                let app192Logo = null;
                let appName = "no app name";
                let appDescription = "no description";
                if (jsn.data[i].root_uri && jsn.data[i].start_url && jsn.data[i].start_url.startsWith("/")) {
                    appLocation = jsn.data[i].root_uri.substring(0, jsn.data[i].root_uri.indexOf("/", 8)) + jsn.data[i].start_url;

                }
                else if (jsn.data[i].root_uri && jsn.data[i].start_url) {
                    appLocation = jsn.data[i].root_uri.substring(0, jsn.data[i].root_uri.lastIndexOf("/")) + "/" + jsn.data[i].start_url;
                }

                for (let k = 0; app192Logo == null && jsn.data[i].icons && k < jsn.data[i].icons.length; k++) {
                    if (jsn.data[i].icons[k].sizes == "192x192" && jsn.data[i].icons[k].src.startsWith("//")) {
                        app192Logo = "https:" + jsn.data[i].icons[k].src;
                    }
                    else if (jsn.data[i].icons[k].sizes == "192x192" && jsn.data[i].icons[k].src.startsWith("/")) {
                        app192Logo = jsn.data[i].root_uri.substring(0, jsn.data[i].root_uri.indexOf("/", 8)) + jsn.data[i].icons[k].src;
                    }
                    else if (jsn.data[i].icons[k].sizes == "192x192" && jsn.data[i].icons[k].src.startsWith("http")) {
                        app192Logo = jsn.data[i].icons[k].src;
                    }
                    else if (jsn.data[i].icons[k].sizes == "192x192") {
                        app192Logo = jsn.data[i].root_uri.substring(0, jsn.data[i].root_uri.lastIndexOf("/")) + "/" + jsn.data[i].icons[k].src;
                    }
                }

                if (jsn.data[i].description) {
                    appDescription = jsn.data[i].description;
                }
                if (jsn.data[i].short_name) {
                    appName = jsn.data[i].short_name;
                }
                else if (jsn.data[i].name) {
                    appName = jsn.data[i].name;
                }
                console.log("apk_location:" + jsn.data[i].apk_location);
                if (appLocation && app192Logo && !isProbablyArabic(appName) && !isProbablyArabic(appDescription)) {
                    this.appendChild(new App({
                        appLocation: appLocation,
                        apkLocation: jsn.data[i].apk_location,
                        app192Logo: app192Logo,
                        appName: appName,
                        appDescription: appDescription,
                        appStars: "*****"
                    }));
                }
            }


        })();

    }
}
