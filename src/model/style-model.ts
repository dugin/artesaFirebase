import { ColorModel } from './color-model';
import { GlassModel } from './glass-model';


export class StyleModel {


    constructor(
        public style: string,
        public color_range: ColorModel[],
        public SRM_range: string,
        public IBU_range: string,
        public alcoholPerc_range: string,
        public glass: GlassModel,
        public description: string,
        public temperature_range: string
   

    ) { }
}