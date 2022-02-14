
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
            skip: "true"
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
            width: "180px",
            height: "300px",
            textAlign: "left",
            backgroundColor: "white",
            class: "floatingActionButton",
            borderRadius: "5px",
            onclick: () => { console.log("click"); window.location.href = params.appLocation; },
            color: "#222222",
            margin: "5px",
            padding: "5px",
            fontSize: "small",
            innerHTML: "<center><img src=\"" + params.app192Logo + "\" width=160 height=160></center><p><b>" + params.appName + "</b>: " + params.appDescription + "</p><div style=\"position:absolute;bottom:5px;left:5px;background-color:rgb(19, 138, 114,0.5);border-radius:8px;padding:4px;padding-left:8px;padding-right:8px;color:white\">Install</div><div style=\"position:absolute;bottom:5px;right:5px\">" + params.appStars + "</div>",
            display: "inline-block",
            position: "relative"
        });
    }
}
export class AppsList extends Div {
    constructor() {
        super({
            textAlign: "center",
            backgroundColor: "rgb(19, 138, 114,0.1)",
            children: [
                new App(
                    {
                        appLocation: "https://gcode.com.au/apps/37790665-boatcrew/index.html",
                        app192Logo: "https://gcode.com.au/images/boatcrew/boat-logo-blue-icon192x192.png",
                        appName: "boat crew",
                        appDescription: "Invite or meet new freinds. Pubich a trip and find a boat crew. Or search for a trip that needs a crew in your area.",
                        appStars: "*****"
                    }
                ),
                new App({
                    appLocation: "https://www.google.com/maps",
                    app192Logo: "https://maps.gstatic.com/mapfiles/maps_lite/pwa/icons/maps15_bnuw3a_round_192x192.png",
                    appName: "Google Maps",
                    appDescription: "Find local businesses, view maps and get driving directions in Google Maps.",
                    appStars: "*****"
                }),
                new App({
                    appLocation: "https://www.pinterest.com.au/?utm_source=homescreen_icon",
                    app192Logo: "https://s.pinimg.com/images/favicon_red_192.png",
                    appName: "Pinterest",
                    appDescription: "Discover recipes, home ideas, style inspiration and other ideas to try.",
                    appStars: "*****"
                }),
                new App({
                    appLocation: "https://flipboard.com",
                    app192Logo: "https://s.flipboard.com/webu/images/meta/flipboard-192.png",
                    appName: "Flipboard",
                    appDescription: "Discover top news & lifestyle.",
                    appStars: "*****"
                })]
        });

        fetch("/lib/applist.json").then(rawdata => rawdata.json()).then(jsn => {
            console.log(jsn.data.lengh);
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

                for (let k = 0; app192Logo == null && k < jsn.data[i].icons.length; k++) {
                    if (jsn.data[i].icons[k].sizes == "192x192" && jsn.data[i].icons[k].src.startsWith("//")) {
                        app192Logo = "https:"+jsn.data[i].icons[k].src;
                    }
                    else if (jsn.data[i].icons[k].sizes == "192x192" && jsn.data[i].icons[k].src.startsWith("/")) {
                        app192Logo = jsn.data[i].root_uri.substring(0, jsn.data[i].root_uri.indexOf("/", 8)) + jsn.data[i].icons[k].src;
                    }
                    else if (jsn.data[i].icons[k].sizes == "192x192" && jsn.data[i].icons[k].src.startsWith("http")) {
                        app192Logo = jsn.data[i].icons[k].src;
                    }
                    else{
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
