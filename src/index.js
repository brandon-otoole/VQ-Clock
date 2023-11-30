import "./main.scss";

import Alpha from "./clocks/alpha.js";
import Easy from "./clocks/easy.js";

export default function run(room) {
    if (room == "alpha") {
        Alpha.run();
    } else if (room == "easy") {
        Easy.run();
    } else if (room == "quad") {
        Alpha.run();
    } else {
        Easy.run();
    }
}
