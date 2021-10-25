import { IColor } from "./Graphics/Color";

interface IConfig {
    typography: {
        fontFamily: string;
        defaultColor: string;
    };

    hud: {
        fontSize: number;
        lineHeight: number;
    };

    radar: {
        margin: number;
        circleOpacity: number;
        dotRadius: number;
        labelOffset: number;
        fontSize: number;
        fuelColor: IColor;
    }
}

export const Config: IConfig = {
    typography: {
        fontFamily: "Nunito",
        defaultColor: "#f0f0f0"
    },
    hud: {
        fontSize: 14,
        lineHeight: 18
    },
    radar: {
        margin: 20,
        circleOpacity: 0.25,
        dotRadius: 4,
        labelOffset: 20,
        fontSize: 10,
        fuelColor: { R: 0, G: 1, B: 0, A: 0.5 }
    }
};
