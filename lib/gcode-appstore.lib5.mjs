
import {
    Div,
    AuthButtons
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
            width: "120px",
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
                new Div({ "tagName": "center", "position": "static", "child": new Div({ "tagName": "img", "position": "static", "src": params.app192Logo, "width": "100px", "height": "100px" }) }),
                new Div({ "tagName": "p", "position": "static","overflow": "hidden", "innerHTML": "<b>" + params.appName + "</b>: " + params.appDescription }),
                new Div({ "id": "open", onclick: () => { console.log("click"); window.location.href = params.appLocation; }, "position": "absolute", "bottom": "2px", "left": "2px", "backgroundColor": "blue", "borderRadius": "4px", "width": "26px", "height": "12px", "padding": "2px", "paddingLeft": "4px", "paddingRight": "4px", "color": "white", "textAlign": "center", "innerText": "Open" })
            ],
            display: "inline-block",
            position: "relative"
        });
        if (params.apkLocation) {
            fetch(params.apkLocation,
                { method: "HEAD" }
            ).then((res) => {
                if (res.ok) {
                    this.appendChild(new Div({ "id": "apk", onclick: () => { console.log("click"); window.location.href = params.appLocation; }, "position": "absolute", "bottom": "2px", "left": "40px", "backgroundColor": "orange", "borderRadius": "4px", "width": "26px", "height": "12px", "padding": "2px", "paddingLeft": "4px", "paddingRight": "4px", "color": "white", "textAlign": "center", "innerText": "APK" }));
                } else {
                    // file is not present at URL
                    console.log("could not find: "+params.apkLocation);
                }
            });
        }
    }
}
export class AppsList extends Div {
    constructor() {
        super({
            textAlign: "center",
            backgroundColor: "rgb(19, 138, 114,0.05)"
        });

        fetch("/lib/applist.json").then(rawdata => rawdata.json()).then(jsn => {
            console.log(jsn.data.length);
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
                if (appLocation && app192Logo && !isProbablyArabic(appName) && !isProbablyArabic(appDescription)) {
                    var apkLocation = appLocation.replace("/manifest.json", "/apk/app-release-signed.apk");

                    console.log("apkLocation: "+apkLocation);

                    this.appendChild(new App({
                        appLocation: appLocation,
                        appLocation: apkLocation,
                        app192Logo: app192Logo,
                        appName: appName,
                        appDescription: appDescription,
                        appStars: "*****"
                    }));
                }
            }
        });
    }
}
