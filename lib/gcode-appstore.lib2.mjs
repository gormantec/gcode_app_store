
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

        fetch("/lib/applist.json").then(rawdata=>rawdata.json()).then(rawdata=>{
            console.log(rawdata.data.lengh);
        });
    }
}
