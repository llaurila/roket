import Polygon from "./Polygon";

export default {
    Ship: Polygon.Make([
         0,  2,
        +1, -1,
        -1, -1
    ]),
    
    Ammo: Polygon.Make([
        0,  2,
       +1, -1,
       -1, -1
   ])
}