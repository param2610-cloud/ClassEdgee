import { PrismaClient } from '@prisma/client';


const prismaClient = new PrismaClient();

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { 
      floor_number, 
      room_number, 
      room_type, 
      capacity, 
      wing,
      area_sqft,
      features
    } = req.body;

    // Validate room type
    const validRoomTypes = ['classroom', 'lab', 'seminar_hall', 'auditorium'];
    if (!validRoomTypes.includes(room_type)) {
      return res.status(400).send({ 
        success: false,
        message: 'Invalid room type',
        validTypes: validRoomTypes
      });
    }

    
    

    // Check if room number is unique
    const existingRoom = await prismaClient.rooms.findUnique({
      where: { room_number }
    });

    if (existingRoom) {
      return res.status(400).send({ 
        success: false,
        message: `Room number ${room_number} already exists`
      });
    }

    // Create the room
    const newRoom = await prismaClient.rooms.create({
      data: {
       
        room_number,
        room_type,
        capacity,
        floor_number,
        wing,
        area_sqft: area_sqft ? parseFloat(area_sqft.toString()) : null,
        features: features ? JSON.parse(JSON.stringify(features)) : null,
        status: 'available'
      }
    });

    return res.status(201).send({
      success: true,
      message: "Room created successfully",
      data: newRoom
    });
  } catch (error) {
    console.error('Error creating room:', error);

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta.target[0];
      return res.status(400).send({
        success: false,
        message: `${field} is already in use`,
        field: field,
        errorCode: error.code
      });
    }

    return res.status(500).send({ 
      success: false,
      message: 'Failed to create room',
      error: error.message
    });
  }
};

  // Get rooms on a specific floor
const getRoomsOnFloor = async (req, res) => {
  try {
    const { floor_number } = req.params;
    const mainBuildingId = 1;
    const rooms = await prismaClient.rooms.findMany({
      where: {
       
        floor_number: parseInt(floor_number)
      },
      orderBy: {
        room_number: 'asc'
      }
    });
    return res.status(200).send({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).send({ 
      success: false,
      message: 'Failed to fetch rooms',
      error: error.message
    });
  }
};
// Get room details
const getRoomDetails = async (req, res) => {
  try {
    const { room_number } = req.params;
    const room = await prismaClient.rooms.findUnique({
      where: { room_number: room_number },
      include: {
        buildings: true,
        classes: true
      }
    });
    if (!room) {
      return res.status(404).send({ 
        success: false,
        message: 'Room not found'
      });
    }
    return res.status(200).send({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error fetching room details:', error);
    return res.status(500).send({ 
      success: false,
      message: 'Failed to fetch room details',
      error: error.message
    });
  }
};


// Update room details
const updateRoom = async (req, res) => {
  try {
    const { room_number} = req.params;
    const updateData = req.body;

    // Validate room type if provided
    const validRoomTypes = ['classroom', 'lab', 'seminar_hall', 'auditorium'];
    if (updateData.room_type && !validRoomTypes.includes(updateData.room_type)) {
      return res.status(400).send({ 
        success: false,
        message: 'Invalid room type',
        validTypes: validRoomTypes
      });
    }

    const updatedRoom = await prismaClient.rooms.update({
      where: { room_number: room_number },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return res.status(200).send({
      success: true,
      message: "Room updated successfully",
      data: updatedRoom
    });
  } catch (error) {
    console.error('Error updating room:', error);

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta.target[0];
      return res.status(400).send({
        success: false,
        message: `${field} is already in use`,
        field: field,
        errorCode: error.code
      });
    }

    return res.status(500).send({ 
      success: false,
      message: 'Failed to update room',
      error: error.message
    });
  }
};


// The rest of the methods remain the same
// Delete room
const deleteRoom = async (req, res) => {
  try {
    const { room_number } = req.params;
    // First find the room
    const room = await prismaClient.rooms.findUnique({
      where: { room_number: room_number },
    });
    if (!room) {
      return res.status(404).send({
        success: false,
        message: "Room not found",
      });
    }
    // Delete room record
    await prismaClient.rooms.delete({
      where: { room_number: room_number },
    });
    res.status(200).send({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).send({
      success: false,
      message: "Failed to delete room",
      error: error.message,
    });
  }
};
export {
  createRoom,
  getRoomsOnFloor,
  getRoomDetails,
  updateRoom,
  deleteRoom
};
























// import { PrismaClient } from '@prisma/client';

// // Enum for Room Types
// const RoomType = {
//   NORMAL_CLASS: 'normal_class',
//   LABORATORY: 'laboratory',
//   SEMINAR_ROOM: 'seminar_room',
//   WORKSHOP: 'workshop',
//   COMPUTER_LAB: 'computer_lab',
//   SCIENCE_LAB: 'science_lab'
// };

// const prismaClient = new PrismaClient();

// // Create a new room
// const createRoom = async (req, res) => {
//   try {
//     const { 
//       floor_number, 
//       room_number, 
//       room_type, 
//       capacity, 
//       wing,
//       area_sqft,
//       features
//     } = req.body;

//     // Validate room type
//     if (!Object.values(RoomType).includes(room_type)) {
//       return res.status(400).send({ 
//         success: false,
//         message: 'Invalid room type',
//         validTypes: Object.values(RoomType)
//       });
//     }

//     // Assuming we have a main building with ID 1
//     const mainBuildingId = 1;

//     // Check if room number is unique
//     const existingRoom = await prismaClient.rooms.findUnique({
//       where: { room_number }
//     });

//     if (existingRoom) {
//       return res.status(400).send({ 
//         success: false,
//         message: `Room number ${room_number} already exists`
//       });
//     }

//     // Create the room
//     const newRoom = await prismaClient.rooms.create({
//       data: {
//         building_id: mainBuildingId,
//         room_number,
//         room_type,
//         capacity,
//         floor_number,
//         wing: wing || null,
//         area_sqft: area_sqft ? parseFloat(area_sqft.toString()) : null,
//         features: features ? JSON.parse(JSON.stringify(features)) : null,
//         status: 'available'
//       }
//     });

//     return res.status(201).send({
//       success: true,
//       message: "Room created successfully",
//       data: newRoom
//     });
//   } catch (error) {
//     console.error('Error creating room:', error);

//     // Handle Prisma unique constraint errors
//     if (error.code === 'P2002') {
//       const field = error.meta.target[0];
//       return res.status(400).send({
//         success: false,
//         message: `${field} is already in use`,
//         field: field,
//         errorCode: error.code
//       });
//     }

//     return res.status(500).send({ 
//       success: false,
//       message: 'Failed to create room',
//       error: error.message
//     });
//   }
// };

// // Get rooms on a specific floor
// const getRoomsOnFloor = async (req, res) => {
//   try {
//     const { floor_number } = req.params;
//     const mainBuildingId = 1;

//     const rooms = await prismaClient.rooms.findMany({
//       where: {
//         building_id: mainBuildingId,
//         floor_number: parseInt(floor_number)
//       },
//       orderBy: {
//         room_number: 'asc'
//       }
//     });

//     return res.status(200).send({
//       success: true,
//       data: rooms
//     });
//   } catch (error) {
//     console.error('Error fetching rooms:', error);
//     return res.status(500).send({ 
//       success: false,
//       message: 'Failed to fetch rooms',
//       error: error.message
//     });
//   }
// };

// // Get room details
// const getRoomDetails = async (req, res) => {
//   try {
//     const { room_id } = req.params;

//     const room = await prismaClient.rooms.findUnique({
//       where: { room_id: parseInt(room_id) },
//       include: {
//         buildings: true,
//         classes: true
//       }
//     });

//     if (!room) {
//       return res.status(404).send({ 
//         success: false,
//         message: 'Room not found'
//       });
//     }

//     return res.status(200).send({
//       success: true,
//       data: room
//     });
//   } catch (error) {
//     console.error('Error fetching room details:', error);
//     return res.status(500).send({ 
//       success: false,
//       message: 'Failed to fetch room details',
//       error: error.message
//     });
//   }
// };

// // Update room details
// const updateRoom = async (req, res) => {
//   try {
//     const { room_id } = req.params;
//     const updateData = req.body;

//     // Validate room type if provided
//     if (updateData.room_type && !Object.values(RoomType).includes(updateData.room_type)) {
//       return res.status(400).send({ 
//         success: false,
//         message: 'Invalid room type',
//         validTypes: Object.values(RoomType)
//       });
//     }

//     const updatedRoom = await prismaClient.rooms.update({
//       where: { room_id: parseInt(room_id) },
//       data: {
//         ...updateData,
//         updated_at: new Date()
//       }
//     });

//     return res.status(200).send({
//       success: true,
//       message: "Room updated successfully",
//       data: updatedRoom
//     });
//   } catch (error) {
//     console.error('Error updating room:', error);

//     // Handle Prisma unique constraint errors
//     if (error.code === 'P2002') {
//       const field = error.meta.target[0];
//       return res.status(400).send({
//         success: false,
//         message: `${field} is already in use`,
//         field: field,
//         errorCode: error.code
//       });
//     }

//     return res.status(500).send({ 
//       success: false,
//       message: 'Failed to update room',
//       error: error.message
//     });
//   }
// };

// // Delete room
// const deleteRoom = async (req, res) => {
//   try {
//     const { room_id } = req.params;

//     // First find the room
//     const room = await prismaClient.rooms.findUnique({
//       where: { room_id: parseInt(room_id) },
//     });

//     if (!room) {
//       return res.status(404).send({
//         success: false,
//         message: "Room not found",
//       });
//     }

//     // Delete room record
//     await prismaClient.rooms.delete({
//       where: { room_id: parseInt(room_id) },
//     });

//     res.status(200).send({
//       success: true,
//       message: "Room deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting room:", error);
//     res.status(500).send({
//       success: false,
//       message: "Failed to delete room",
//       error: error.message,
//     });
//   }
// };

// export {
//   createRoom,
//   getRoomsOnFloor,
//   getRoomDetails,
//   updateRoom,
//   deleteRoom,
//   RoomType
// };