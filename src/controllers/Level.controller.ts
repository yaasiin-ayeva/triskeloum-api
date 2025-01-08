import LevelService from "../services/Level.service";
import { BaseController } from "./Base.controller";

export default class LevelController extends BaseController<LevelService> {

    constructor() {
        super(new LevelService(), 'level');
    }

    public getLevels = async (req, res, next) => {
        try {

            const data = await this.service.findAll();
            return this.apiResponse(res, 200, "Levels fetched successfully", data);

        } catch (e) {
            next(e);
        }
    }

}