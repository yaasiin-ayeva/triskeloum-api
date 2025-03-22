import { Room } from "../models/crm/Room.model";
import { Level } from "../models/Level.model";
import BaseService from "./Base.service";

export default class RoomService extends BaseService<Room> {

    private static instance: RoomService;

    constructor() {
        if (RoomService.instance) {
            return RoomService.instance;
        }
        super(Room);
        RoomService.instance = this;
    }
}