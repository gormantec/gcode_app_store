
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
            onclick: () => { console.log("click"); window.location.href = params.appLocation; },
            color: "#222222",
            margin: "5px",
            padding: "5px",
            fontSize: "small",
            innerHTML: "<center><img src=\"" + params.app192Logo + "\" width=100 height=100></center><p><b>" + params.appName + "</b>: " + params.appDescription + "</p><div style=\"position:absolute;bottom:5px;left:5px;background-color:blue;border-radius:8px;padding:4px;padding-left:8px;padding-right:8px;color:white\">Open</div><div style=\"position:absolute;bottom:5px;left:25px;background-color:blue;border-radius:8px;padding:4px;padding-left:8px;padding-right:8px;color:white\">APK</div><div style=\"position:absolute;bottom:5px;right:5px\">" + params.appStars + "</div>",
            display: "inline-block",
            position: "relative"
        });
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
                let appName="no app name";
                let appDescription = "no description";
                if (jsn.data[i].root_uri && jsn.data[i].start_url && jsn.data[i].start_url.startsWith("/")) {
                    appLocation = jsn.data[i].root_uri.substring(0, jsn.data[i].root_uri.indexOf("/", 8)) + jsn.data[i].start_url;

                }
                else if (jsn.data[i].root_uri && jsn.data[i].start_url) {
                    appLocation = jsn.data[i].root_uri.substring(0, jsn.data[i].root_uri.lastIndexOf("/")) + "/" + jsn.data[i].start_url;
                }

                for (let k = 0; app192Logo == null && jsn.data[i].icons && k < jsn.data[i].icons.length; k++) {
                    if (jsn.data[i].icons[k].sizes == "192x192" && jsn.data[i].icons[k].src.startsWith("//")) {
                        app192Logo = "https:"+jsn.data[i].icons[k].src;
                    }
                    else if (jsn.data[i].icons[k].sizes == "192x192" && jsn.data[i].icons[k].src.startsWith("/")) {
                        app192Logo = jsn.data[i].root_uri.substring(0, jsn.data[i].root_uri.indexOf("/", 8)) + jsn.data[i].icons[k].src;
                    }
                    else if (jsn.data[i].icons[k].sizes == "192x192" && jsn.data[i].icons[k].src.startsWith("http")) {
                        app192Logo = jsn.data[i].icons[k].src;
                    }
                    else if (jsn.data[i].icons[k].sizes == "192x192"){
                        app192Logo = jsn.data[i].root_uri.substring(0, jsn.data[i].root_uri.lastIndexOf("/"))+"/" + jsn.data[i].icons[k].src;
                    }
                }

                if(jsn.data[i].description)
                {
                    appDescription=jsn.data[i].description;
                }
                if(jsn.data[i].short_name)
                {
                    appName=jsn.data[i].short_name;
                }
                else if(jsn.data[i].name)
                {
                    appName=jsn.data[i].name;
                }
                if (appLocation && app192Logo && !isProbablyArabic(appName) && !isProbablyArabic(appDescription)) {
                    this.appendChild(new App({
                        appLocation: appLocation,
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
