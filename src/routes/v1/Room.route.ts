import { Router } from "express";
import CRMController from "../../controllers/Room.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import uploadMiddleware from "../../middlewares/upload.middleware";

const router = Router();
const roomController = new CRMController();

// Rooms
router.post("/rooms", authMiddleware, roomController.createRoom);
router.get("/rooms/:id", authMiddleware, roomController.getRoom);
router.get("/rooms", authMiddleware, roomController.getUserRooms);
router.post("/rooms/:id/users", authMiddleware, roomController.addUsersToRoom);
router.delete("/rooms/:roomId/users/:userId", authMiddleware, roomController.removeUserFromRoom);

// Messages
router.post("/rooms/:roomId/messages", authMiddleware, uploadMiddleware, roomController.sendMessage);
router.get("/rooms/:roomId/messages", authMiddleware, roomController.getRoomMessages);
router.put("/messages/:id/delivered", authMiddleware, roomController.markMessageAsDelivered);
router.put("/messages/:id/seen", authMiddleware, roomController.markMessageAsSeen);
router.put("/messages/:id", authMiddleware, roomController.editMessage);
router.delete("/messages/:id", authMiddleware, roomController.deleteMessage);

// Calls
router.post("/rooms/:roomId/calls", authMiddleware, roomController.startCall);
router.put("/calls/:id", authMiddleware, roomController.endCall);
router.get("/rooms/:roomId/calls", authMiddleware, roomController.getRoomCallHistory);

export default router;