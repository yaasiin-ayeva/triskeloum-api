import { Level } from "../models/Level.model";
import BaseService from "./Base.service";

export default class LevelService extends BaseService<Level> {

    private static instance: LevelService;

    constructor() {
        if (LevelService.instance) {
            return LevelService.instance;
        } else {
            super(Level);
            LevelService.instance = this;
        }
    }
}