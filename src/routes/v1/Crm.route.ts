import { Router } from "express";
import CRMController from "../../controllers/Room.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import uploadMiddleware from "../../middlewares/upload.middleware";

const crmRouter = Router();
const crmController = new CRMController();

// Rooms
crmRouter.post("/rooms", authMiddleware, crmController.createRoom);
crmRouter.get("/rooms/:id", authMiddleware, crmController.getRoom);
crmRouter.get("/rooms", authMiddleware, crmController.getUserRooms);
crmRouter.get('/direct/:targetUserId', authMiddleware, crmController.getOrCreateDirectRoom);
// crmRouter.post("/rooms/:id/users", authMiddleware, crmController.addUsersToRoom);
// crmRouter.delete("/rooms/:roomId/users/:userId", authMiddleware, crmController.removeUserFromRoom);

// Messages
crmRouter.post("/rooms/:roomId/messages", authMiddleware, uploadMiddleware(
    {
        allowedFormats: ["image/png", "image/jpeg", "image/jpg"],
        fieldname: "files",
        multi: true,
        isFileRequired: false,
        fileSizeLimit: 1024 * 1024 * 1024 * 1 // 1GB
    }
), crmController.sendMessage);

crmRouter.get("/rooms/:roomId/messages", authMiddleware, crmController.getRoomMessages);
crmRouter.put("/messages/:id/delivered", authMiddleware, crmController.markMessageAsDelivered);
crmRouter.put("/messages/:id/seen", authMiddleware, crmController.markMessageAsSeen);
crmRouter.put("/messages/:id", authMiddleware, crmController.editMessage);
crmRouter.delete("/messages/:id", authMiddleware, crmController.deleteMessage);

// Calls
crmRouter.post("/rooms/:roomId/calls", authMiddleware, crmController.startCall);
crmRouter.put("/calls/:id", authMiddleware, crmController.endCall);
crmRouter.get("/rooms/:roomId/calls", authMiddleware, crmController.getRoomCallHistory);

export default crmRouter;